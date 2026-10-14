import { LitElement, html, css } from 'lit';
import { LISTS, entityId, migrateConfig } from './model.js';

const entity = (name, domains, multiple = false) => ({ name, selector: { entity: { filter: name === 'activity' ? [{ domain: 'sensor', device_class: 'timestamp' }, { domain: 'input_datetime' }] : { domain: domains, ...(['temperature', 'humidity'].includes(name) ? { device_class: name } : {}) }, ...(multiple ? { multiple: true } : {}) } } });
const bool = name => ({ name, selector: { boolean: {} } });
const text = name => ({ name, selector: { text: {} } });
const labels = {
  name: 'Room name', subtitle: 'Subtitle (optional)', icon: 'Room icon', compact: 'Compact layout', show_labels: 'Show icon labels',
  climate: 'Thermostat', temperature: 'Temperature sensor (optional override)', humidity: 'Humidity sensor', presence: 'Presence / motion sensor', activity: 'Last activity timestamp entity (optional)',
  temperature_step: 'Temperature adjustment step (default 0.5; respects device step)', lights: 'Lights (maximum 5)', scenes: 'Scenes', devices: 'Devices / switches / fans', automations: 'Automations', windows: 'Window contact sensors', doors: 'Door contact sensors',
  show_thermostat: 'Show temperature & thermostat', show_humidity: 'Show humidity', show_presence: 'Show presence & activity', show_contacts: 'Show window & door contacts', show_lights: 'Show lights', show_scenes: 'Show scenes', show_devices: 'Show devices', show_automations: 'Show automations',
};

export class RoomCardEditor extends LitElement {
  static properties = { hass: { attribute: false, hasChanged: () => true }, _config: { state: true } };
  static styles = css`
    :host{display:block;color:var(--primary-text-color);font:inherit}details{border-top:1px solid var(--divider-color,#ddd);padding:6px 0}summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-size:14px;font-weight:500;gap:8px}summary::before{content:'›';font-size:20px}details[open]>summary::before{transform:rotate(90deg)}summary:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}ha-form{display:block;margin:8px 0 12px}.hint{font-size:12px;line-height:1.6;color:var(--secondary-text-color);margin:0 0 12px}.item{padding:8px 0;border-top:1px solid var(--divider-color,#ddd)}.item strong{display:block;font-size:12px;overflow-wrap:anywhere}.item small{display:block;font-size:11px;color:var(--secondary-text-color);margin-top:4px}.customize{margin:0 0 10px}.customize summary{font-size:12px;font-weight:400}
  `;
  setConfig(value) { this._config = migrateConfig(value || {}); }
  _emit(next) {
    this._config = next;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...next, type: 'custom:ha-room-card' } }, bubbles: true, composed: true }));
  }
  _changed(event) {
    event.stopPropagation();
    const value = event.detail.value;
    const next = { ...this._config, ...value };
    for (const key of ['name', 'subtitle', 'icon', 'climate', 'temperature', 'humidity', 'presence', 'activity', 'temperature_step']) if (next[key] === '' || next[key] === null || next[key] === undefined) delete next[key];
    for (const key of Object.keys(LISTS)) if (key in value && (Array.isArray(value[key]) || value[key] == null)) {
      next[key] = (value[key] || []).map(selection => {
        const id = entityId(selection);
        const existing = (this._config[key] || []).find(item => entityId(item) === id);
        return existing && typeof existing === 'object' ? { ...existing, entity: id } : id;
      });
    }
    this._emit(next);
  }
  _form(schema) {
    const data = { compact: this._config.layout !== 'wide', show_labels: true, ...Object.fromEntries(['thermostat', 'humidity', 'presence', 'contacts', 'lights', 'scenes', 'devices', 'automations'].map(key => [`show_${key}`, true])), ...this._config };
    for (const key of Object.keys(LISTS)) data[key] = (this._config[key] || []).map(entityId);
    return html`<ha-form .hass=${this.hass} .data=${data} .schema=${schema} .computeLabel=${field => labels[field.name] || field.name} @value-changed=${this._changed}></ha-form>`;
  }
  _itemForms(key) {
    if (!this._config[key]?.length) return html``;
    return html`<details class="customize"><summary>Customize selected entities</summary><p class="hint">Include or hide individual entities, and optionally override their label or icon. Hidden entities are excluded from group actions.</p>${this._config[key].map((entry, index) => {
      const item = typeof entry === 'string' ? { entity: entry } : entry;
      const state = this.hass?.states?.[item.entity];
      return html`<div class="item"><strong>${state?.attributes?.friendly_name || item.entity}</strong><small>${item.entity}</small><ha-form .hass=${this.hass} .data=${{ enabled: true, ...item }} .schema=${[bool('enabled'), text('name'), { name: 'icon', selector: { icon: {} } }]} .computeLabel=${field => ({ enabled: 'Include this entity', name: 'Label (optional)', icon: 'Icon (optional)' })[field.name]} @value-changed=${event => {
        event.stopPropagation();
        const items = [...this._config[key]];
        items[index] = { ...item, ...event.detail.value, entity: item.entity };
        this._emit({ ...this._config, [key]: items });
      }}></ha-form></div>`;
    })}</details>`;
  }
  render() {
    if (!this.hass || !this._config) return html``;
    return html`
      <p class="hint">One card per room. Choose real Home Assistant entities below. Empty sections disappear automatically; no YAML is required.</p>
      <details open><summary>Room & layout</summary>${this._form([text('name'), text('subtitle'), { name: 'icon', selector: { icon: {} } }, bool('compact'), bool('show_labels')])}</details>
      <details open><summary>Temperature & presence</summary>${this._form([bool('show_thermostat'), entity('climate', ['climate']), entity('temperature', ['sensor']), { name: 'temperature_step', selector: { number: { min: 0.1, max: 10, step: 0.1, mode: 'box' } } }, bool('show_humidity'), entity('humidity', ['sensor']), bool('show_presence'), entity('presence', ['binary_sensor']), entity('activity', ['sensor', 'input_datetime'])])}<p class="hint">The thermostat supplies current temperature when no separate sensor is selected. Activity uses a timestamp entity; otherwise the card shows when presence last changed. Range thermostats open native HA details instead of sending an unsupported single target.</p></details>
      <details open><summary>Lights · ${this._config.lights?.length || 0}</summary>${this._form([bool('show_lights'), entity('lights', LISTS.lights, true)])}${this._itemForms('lights')}</details>
      <details><summary>Window & door contacts</summary>${this._form([bool('show_contacts'), entity('windows', LISTS.windows, true), entity('doors', LISTS.doors, true)])}${this._itemForms('windows')}${this._itemForms('doors')}</details>
      ${['scenes', 'devices', 'automations'].map(key => html`<details><summary>${labels[key]} · ${this._config[key]?.length || 0}</summary>${this._form([bool(`show_${key}`), entity(key, LISTS[key], true)])}${this._itemForms(key)}</details>`)}
    `;
  }
}
if (!customElements.get('ha-room-card-editor')) customElements.define('ha-room-card-editor', RoomCardEditor);
