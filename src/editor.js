import { LitElement, html, css } from 'lit';
import { LISTS, entityId, migrateConfig, areaEntityIds, areaSuggestions } from './model.js';

const entity = (name, domains, multiple = false) => ({ name, selector: { entity: { filter: name === 'activity' ? [{ domain: 'sensor', device_class: 'timestamp' }, { domain: 'input_datetime' }] : { domain: domains, ...(['temperature', 'humidity'].includes(name) ? { device_class: name } : {}) }, ...(multiple ? { multiple: true } : {}) } } });
const bool = name => ({ name, selector: { boolean: {} } });
const text = name => ({ name, selector: { text: {} } });
const labels = {
  name: 'Room name', subtitle: 'Subtitle (optional)', icon: 'Room icon', compact: 'Compact layout', show_labels: 'Show icon labels',
  climate: 'Thermostat', temperature: 'Temperature sensor (optional override)', humidity: 'Humidity sensor', presence: 'Presence / motion sensor', activity: 'Last activity timestamp entity (optional)',
  temperature_step: 'Temperature adjustment step (default 0.5; respects device step)', lights: 'Lights (maximum 5)', scenes: 'Scenes', devices: 'Devices / switches / fans', automations: 'Automations', windows: 'Window contact sensors', doors: 'Door contact sensors',
  area: 'Home Assistant room / area', presence_hold_minutes: 'Recent-activity hold after sensor clears (minutes; default 0)',
  show_thermostat: 'Show temperature & thermostat', show_humidity: 'Show humidity', show_presence: 'Show presence & activity', show_contacts: 'Show window & door contacts', show_lights: 'Show lights', show_scenes: 'Show scenes', show_devices: 'Show devices', show_automations: 'Show automations',
};

export class RoomCardEditor extends LitElement {
  static properties = { hass: { attribute: false, hasChanged: () => true }, _config: { state: true }, _search: { state: true }, _allRooms: { state: true } };
  static styles = css`
    :host{display:block;color:var(--primary-text-color);font:inherit}details{border-top:1px solid var(--divider-color,#ddd);padding:6px 0}summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-size:14px;font-weight:500;gap:8px}summary::before{content:'›';font-size:20px}details[open]>summary::before{transform:rotate(90deg)}summary:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}ha-form{display:block;margin:8px 0 12px}.hint{font-size:12px;line-height:1.6;color:var(--secondary-text-color);margin:0 0 12px}.item{padding:8px 0;border-top:1px solid var(--divider-color,#ddd)}.item strong{display:block;font-size:12px;overflow-wrap:anywhere}.item small{display:block;font-size:11px;color:var(--secondary-text-color);margin-top:4px}.customize{margin:0 0 10px}.customize summary{font-size:12px;font-weight:400}
.scope{display:grid;gap:10px;margin-bottom:12px}.scope>label{display:grid;gap:6px;font-size:12px}.scope input[type=search]{min-height:44px;border:1px solid var(--divider-color,#ddd);border-radius:8px;background:var(--card-background-color,#fff);color:var(--primary-text-color);font:inherit;padding:0 10px;width:100%;box-sizing:border-box}.scope .scope-toggle{display:flex;align-items:center;gap:8px;min-height:44px}.scope input[type=checkbox]{width:18px;height:18px;accent-color:var(--primary-color)}.scope button{min-height:44px;border:1px solid var(--divider-color,#ddd);border-radius:8px;background:transparent;color:var(--primary-text-color);font:inherit;cursor:pointer}.scope button:disabled{opacity:.45;cursor:default}
  `;

  setConfig(value) { this._config = migrateConfig(value || {}); }
  _fillSuggestions(config) {
    const suggestions = areaSuggestions(this.hass, config.area);
    const next = { ...config };
    for (const [key, value] of Object.entries(suggestions)) if ((!next[key] || (Array.isArray(next[key]) && !next[key].length)) && value !== undefined) next[key] = value;
    if (!next.name || next.name === 'Room') next.name = this.hass?.areas?.[config.area]?.name || next.name;
    return next;
  }
  _emit(next) {
    this._config = next;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: { ...next, type: 'custom:ha-room-card' } }, bubbles: true, composed: true }));
  }
  _changed(event) {
    event.stopPropagation();
    const value = event.detail.value;
    const next = { ...this._config, ...value };
    for (const key of ['name', 'subtitle', 'icon', 'area', 'climate', 'temperature', 'humidity', 'presence', 'activity', 'temperature_step', 'presence_hold_minutes']) if (next[key] === '' || next[key] === null || next[key] === undefined) delete next[key];
    for (const key of Object.keys(LISTS)) if (key in value && (Array.isArray(value[key]) || value[key] == null)) {
      next[key] = (value[key] || []).map(selection => {
        const id = entityId(selection);
        const existing = (this._config[key] || []).find(item => entityId(item) === id);
        return existing && typeof existing === 'object' ? { ...existing, entity: id } : id;
      });
    }
    this._emit(next.area && next.area !== this._config.area ? this._fillSuggestions(next) : next);
  }
  _form(schema) {
    const data = { compact: this._config.layout !== 'wide', show_labels: true, ...Object.fromEntries(['thermostat', 'humidity', 'presence', 'contacts', 'lights', 'scenes', 'devices', 'automations'].map(key => [`show_${key}`, true])), ...this._config };
    for (const key of Object.keys(LISTS)) data[key] = (this._config[key] || []).map(entityId);
    const query = (this._search || '').trim().toLowerCase();
    const allIds = Object.keys(this.hass?.states || {});
    const scopedIds = query ? allIds.filter(id => `${id} ${this.hass.states[id].attributes?.friendly_name || ''}`.toLowerCase().includes(query)) : this._config.area && !this._allRooms ? areaEntityIds(this.hass, this._config.area) : null;
    const scopedSchema = schema.map(field => {
      if (!field.selector?.entity || scopedIds === null) return field;
      const selected = field.name in LISTS ? (this._config[field.name] || []).map(entityId) : [this._config[field.name]].filter(Boolean);
      const included = [...new Set([...scopedIds, ...selected])];
      return { ...field, selector: { entity: { ...field.selector.entity, include_entities: included, exclude_entities: allIds.filter(id => !included.includes(id)) } } };
    });
    return html`<ha-form .hass=${this.hass} .data=${data} .schema=${scopedSchema} .computeLabel=${field => labels[field.name] || field.name} @value-changed=${this._changed}></ha-form>`;
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
      ${this._form([{ name: 'area', selector: { area: {} } }])}
      <div class="scope"><label>Search all entities<input type="search" placeholder="Search names or IDs across all rooms…" .value=${this._search || ''} @input=${event => { this._search = event.target.value; }}></label><label class="scope-toggle"><input type="checkbox" .checked=${!!this._allRooms} @change=${event => { this._allRooms = event.target.checked; }}> Browse all rooms</label><button @click=${() => this._emit(this._fillSuggestions(this._config))} ?disabled=${!this._config.area}>Fill empty fields from room</button></div>
      <p class="hint">${this._config.area ? `${areaEntityIds(this.hass, this._config.area).length} room entities found. Room selection fills empty fields; existing selections and custom overrides are kept. Search above to select from any room. Up to five lights are suggested.` : 'Select a room for automatic suggestions and room-only pickers. You can always search across all rooms.'}${this._config.area && !this.hass.entities ? ' HA registries are not loaded yet; browse all rooms to choose manually.' : ''}</p>
      <details open><summary>Room & layout</summary>${this._form([text('name'), text('subtitle'), { name: 'icon', selector: { icon: {} } }, bool('compact'), bool('show_labels')])}</details>
      <details open><summary>Temperature & presence</summary>${this._form([bool('show_thermostat'), entity('climate', ['climate']), entity('temperature', ['sensor']), { name: 'temperature_step', selector: { number: { min: 0.1, max: 10, step: 0.1, mode: 'box' } } }, bool('show_humidity'), entity('humidity', ['sensor']), bool('show_presence'), entity('presence', ['binary_sensor']), { name: 'presence_hold_minutes', selector: { number: { min: 0, max: 120, step: 1, mode: 'box' } } }, entity('activity', ['sensor', 'input_datetime'])])}<p class="hint">Occupancy uses the binary sensor state and last_changed. An optional hold after off is labeled Recent activity, not confirmed occupancy. The thermostat supplies temperature when no separate sensor is selected. Range thermostats open native HA details.</p></details>
      <details open><summary>Lights · ${this._config.lights?.length || 0}</summary>${this._form([bool('show_lights'), entity('lights', LISTS.lights, true)])}${this._itemForms('lights')}</details>
      <details><summary>Window & door contacts</summary>${this._form([bool('show_contacts'), entity('windows', LISTS.windows, true), entity('doors', LISTS.doors, true)])}${this._itemForms('windows')}${this._itemForms('doors')}</details>
      ${['scenes', 'devices', 'automations'].map(key => html`<details><summary>${labels[key]} · ${this._config[key]?.length || 0}</summary>${this._form([bool(`show_${key}`), entity(key, LISTS[key], true)])}${this._itemForms(key)}</details>`)}
    `;
  }
}
if (!customElements.get('ha-room-card-editor')) customElements.define('ha-room-card-editor', RoomCardEditor);
