import { LitElement, html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { validateConfig, enabledItems, available, number, domainOf, targetTemperature, supportsBrightness, relativeTime, contactState, activityTimestamp } from './model.js';
import { cardStyles } from './styles.js';
import './editor.js';
export { validateConfig } from './model.js';

const mdi = (name) => html`<ha-icon .icon=${name}></ha-icon>`;
const defaultIcons = { lights: 'mdi:lightbulb-outline', scenes: 'mdi:palette-outline', devices: 'mdi:power-plug-outline', automations: 'mdi:lightning-bolt-outline' };
export class RoomCard extends LitElement {
  static properties = { hass: { attribute: false, hasChanged: () => true }, _states: { state: true, hasChanged: () => true }, _config: { state: true }, _busy: { state: true }, _error: { state: true }, _message: { state: true }, _scenePulse: { state: true }, _details: { state: true } };
  static styles = cardStyles;
  constructor() {
    super(); this._waiters = new Set(); this._busy = false; this._generation = 0;
    this._stateTimeout = 5000; this._serviceTimeout = 15000;
  }
  connectedCallback() {
    super.connectedCallback();
    const request = new CustomEvent('context-request', { bubbles: true, composed: true, cancelable: true });
    request.context = 'states'; request.subscribe = true;
    request.callback = (states, unsubscribe) => { this._states = states; this._unsubscribe = unsubscribe; };
    this.dispatchEvent(request);
    this._clock = setInterval(() => this.requestUpdate(), 30000);
  }
  disconnectedCallback() {
    clearInterval(this._clock); clearTimeout(this._messageTimer); clearTimeout(this._pulseTimer);
    this._unsubscribe?.(); this._unsubscribe = undefined; this._states = undefined;
    for (const waiter of this._waiters) waiter.finish(false);
    this._generation++; this._busy = false;
    this.renderRoot?.querySelector('dialog')?.close();
    super.disconnectedCallback();
  }
  updated() { for (const waiter of this._waiters) if (waiter.predicate()) waiter.finish(true); }
  setConfig(value) {
    this._config = validateConfig(value); this._generation++; this._busy = false; this._error = ''; this._message = '';
    clearTimeout(this._pulseTimer); this._scenePulse = undefined;
    for (const waiter of this._waiters) waiter.finish(false);
  }
  static getStubConfig() { return { name: 'Room', compact: true }; }
  static async getConfigElement() {
    if (!customElements.get('ha-form')) {
      if (!window.loadCardHelpers) throw new Error('Home Assistant card helpers are not available. Reload the dashboard.');
      const helpers = await window.loadCardHelpers();
      await helpers.createCardElement({ type: 'entities', entities: [] }).constructor.getConfigElement();
    }
    return document.createElement('ha-room-card-editor');
  }
  getCardSize() { return this._config?.compact ? 7 : 9; }
  getGridOptions() { return { columns: 12, min_columns: 6 }; }
  _state(id) { return (this._states ?? this.hass?.states)?.[id]; }
  _items(key) { return enabledItems(this._config, key); }
  _shown(key) { return this._config[`show_${key}`] !== false; }
  _name(item) { return item.name || this._state(item.entity)?.attributes?.friendly_name || item.entity; }
  _icon(item, group) { return item.icon || this._state(item.entity)?.attributes?.icon || (domainOf(item.entity) === 'fan' ? 'mdi:fan' : defaultIcons[group]); }
  _format(value) {
    if (number(value) === null) return '—';
    try { return new Intl.NumberFormat(this.hass?.locale?.language || 'en', { maximumFractionDigits: 1 }).format(Number(value)); }
    catch { return String(value); }
  }
  _unit(state) { return state?.attributes?.unit_of_measurement || this.hass?.config?.unit_system?.temperature || '°C'; }
  _changedAt(state) {
    const date = new Date(state?.last_changed);
    if (!Number.isFinite(date.getTime())) return 'Unknown';
    try { return date.toLocaleTimeString(this.hass?.locale?.language || 'en', { hour: '2-digit', minute: '2-digit', timeZone: this.hass?.config?.time_zone }); }
    catch { return `${date.toISOString().slice(11, 16)} UTC`; }
  }
  _serviceAvailable(domain, service) { return typeof this.hass?.callService === 'function' && (!this.hass.services || !!this.hass.services[domain]?.[service]); }
  _canToggle(item) {
    const state = this._state(item.entity);
    return available(state) && ['on', 'off'].includes(state.state) && this._serviceAvailable(domainOf(item.entity), state.state === 'on' ? 'turn_off' : 'turn_on');
  }
  _moreInfo(id) {
    if (!id) return;
    const dialog = this.renderRoot.querySelector('dialog');
    if (dialog?.open) { this._openingNative = true; dialog.close(); }
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: id }, bubbles: true, composed: true }));
  }
  async _openDetails() {
    this._details = true; await this.updateComplete;
    const dialog = this.renderRoot.querySelector('dialog');
    if (dialog && !dialog.open) dialog.showModal();
  }
  _notify(message) {
    this._message = message; clearTimeout(this._messageTimer);
    this._messageTimer = setTimeout(() => { this._message = ''; }, 5000);
  }
  _waitForState(predicate) {
    if (predicate()) return Promise.resolve(true);
    return new Promise(resolve => {
      const waiter = { predicate, finish: result => { clearTimeout(timer); this._waiters.delete(waiter); resolve(result); } };
      const timer = setTimeout(() => waiter.finish(false), this._stateTimeout);
      this._waiters.add(waiter);
    });
  }
  async _execute(operations, expected, sceneId) {
    if (this._busy) return;
    const generation = this._generation;
    this._busy = true; this._error = ''; this._message = '';
    let serviceTimer;
    try {
      // The backend remains authoritative: no local optimistic state changes.
      await Promise.race([
        Promise.all(operations.map(({ domain, service, data }) => {
          if (!this._serviceAvailable(domain, service)) throw new Error(`Action ${domain}.${service} is unavailable.`);
          return this.hass.callService(domain, service, data);
        })),
        new Promise((_, reject) => { serviceTimer = setTimeout(() => reject(new Error('Home Assistant did not confirm the command. Check the entity before retrying.')), this._serviceTimeout); }),
      ]);
      clearTimeout(serviceTimer);
      if (generation !== this._generation || !this.isConnected) return;
      if (sceneId) {
        this._scenePulse = sceneId; clearTimeout(this._pulseTimer);
        this._pulseTimer = setTimeout(() => { this._scenePulse = undefined; }, 1200);
        this._notify('Scene activated.');
      } else {
        const confirmed = await this._waitForState(expected);
        if (generation === this._generation && this.isConnected) this._notify(confirmed ? 'State updated.' : 'Command sent; device state not yet confirmed.');
      }
    } catch (error) {
      if (generation === this._generation && this.isConnected) this._error = String(error?.message || 'Command failed. Please try again.').slice(0, 240);
    } finally {
      clearTimeout(serviceTimer);
      if (generation === this._generation) this._busy = false;
    }
  }
  async _toggle(item) {
    if (!this._canToggle(item)) return;
    const on = this._state(item.entity).state !== 'on';
    const domain = domainOf(item.entity);
    const data = { entity_id: item.entity, ...(domain === 'automation' && !on ? { stop_actions: false } : {}) };
    await this._execute([{ domain, service: on ? 'turn_on' : 'turn_off', data }], () => this._state(item.entity)?.state === (on ? 'on' : 'off'));
  }
  async _temperature(direction) {
    const id = this._config.climate;
    const target = targetTemperature(this._state(id), direction, this._config.temperature_step ?? 0.5);
    if (target === null || target === number(this._state(id)?.attributes?.temperature)) return;
    await this._execute([{ domain: 'climate', service: 'set_temperature', data: { entity_id: id, temperature: target } }], () => number(this._state(id)?.attributes?.temperature) === target);
  }
  async _allOff() {
    const ids = this._items('lights').filter(item => available(this._state(item.entity)) && this._state(item.entity).state === 'on').map(item => item.entity);
    if (!ids.length) return;
    await this._execute([{ domain: 'light', service: 'turn_off', data: { entity_id: ids } }], () => ids.every(id => this._state(id)?.state === 'off'));
  }
  async _brightness(item, value) {
    if (!supportsBrightness(this._state(item.entity))) return;
    const pct = Math.max(0, Math.min(100, Math.round(Number(value))));
    if (!Number.isFinite(pct)) return;
    await this._execute([{ domain: 'light', service: pct ? 'turn_on' : 'turn_off', data: { entity_id: item.entity, ...(pct ? { brightness_pct: pct } : {}) } }], () => {
      const state = this._state(item.entity);
      return pct ? state?.state === 'on' && Math.abs((number(state.attributes?.brightness) ?? -255) / 255 * 100 - pct) <= 2 : state?.state === 'off';
    });
  }
  _tile(item, group) {
    const state = this._state(item.entity);
    const scene = group === 'scenes';
    const offline = !available(state) || (!scene && !['on', 'off'].includes(state.state));
    const active = scene ? this._scenePulse === item.entity : state?.state === 'on' && !offline;
    const title = `${this._name(item)} · ${offline ? 'Unavailable' : scene ? 'Activate scene' : active ? 'On' : 'Off'}`;
    const disabled = this._busy || offline || (scene ? !this._serviceAvailable('scene', 'turn_on') : !this._canToggle(item));
    return html`<button class="tile ${group === 'lights' ? 'light' : ''} ${active ? 'active' : ''} ${offline ? 'unavailable' : ''}" title=${title} aria-label=${title} aria-pressed=${scene ? nothing : String(active)} ?disabled=${disabled} @click=${() => scene ? this._execute([{ domain: 'scene', service: 'turn_on', data: { entity_id: item.entity } }], null, item.entity) : this._toggle(item)}>${mdi(this._icon(item, group))}<span>${offline ? `${this._name(item)} · Offline` : this._name(item)}</span></button>`;
  }
  _group(key, title) {
    const items = this._items(key);
    if (!this._shown(key) || !items.length) return nothing;
    const on = items.filter(item => this._state(item.entity)?.state === 'on').length;
    return html`<section class="group ${key}-group" aria-label=${title}><div class="group-heading"><span>${title}${key === 'lights' ? ` · ${on}/${items.length}` : ''}</span>${key === 'lights' ? html`<button class="all-off" ?disabled=${this._busy || !on || !this._serviceAvailable('light', 'turn_off')} @click=${this._allOff}>All off</button>` : key === 'automations' ? html`<span>${on} enabled</span>` : nothing}</div><div class="tiles">${repeat(items, item => item.entity, item => this._tile(item, key))}</div></section>`;
  }
  _contactRows() {
    return ['windows', 'doors'].flatMap(key => this._items(key).map(item => ({ item, type: key === 'windows' ? 'window' : 'door', state: this._state(item.entity) })));
  }
  _renderContacts() {
    if (!this._shown('contacts')) return nothing;
    return html`<div class="contacts">${this._contactRows().map(({ item, type, state }) => html`<span class="contact ${contactState(state) === 'Open' ? 'open' : ''}" title=${`${this._name(item)} · ${contactState(state)} · ${state?.last_changed || 'change time unknown'}`}>${mdi(type === 'window' ? 'mdi:window-closed-variant' : 'mdi:door')}<span>${this._name(item)} ${contactState(state).toLowerCase()}</span>${available(state) ? html`<time datetime=${state.last_changed || ''}>${relativeTime(state.last_changed)}</time>` : nothing}</span>`)}</div>`;
  }
  _renderTemperature() {
    if (!this._shown('thermostat') || (!this._config.climate && !this._config.temperature)) return nothing;
    const climate = this._state(this._config.climate);
    const sensor = this._state(this._config.temperature);
    const current = this._config.temperature ? available(sensor) ? number(sensor.state) : null : available(climate) ? number(climate.attributes?.current_temperature) : null;
    const unit = this._unit(this._config.temperature ? sensor : climate);
    const target = available(climate) ? number(climate.attributes?.temperature) : null;
    const heating = available(climate) && climate.attributes?.hvac_action === 'heating';
    const windowOpen = this._items('windows').some(item => this._state(item.entity)?.state === 'on');
    const action = available(climate) ? climate.attributes?.hvac_action || climate.state : 'Unavailable';
    const step = this._config.temperature_step ?? 0.5;
    const next = direction => targetTemperature(climate, direction, step);
    const supported = target !== null && next(1) !== null;
    return html`<div class="thermostat"><div><div class="current" aria-label=${`Current temperature ${this._format(current)} ${unit}`}>${this._format(current)}<span class="unit">${unit}</span></div>${this._config.climate ? html`<div class="hvac ${heating ? 'heating' : ''}">${mdi(heating ? 'mdi:fire' : 'mdi:thermostat')}${action}${heating && windowOpen ? ' · window open' : ''}</div>` : nothing}</div>${this._config.climate ? supported ? html`<div class="target"><button aria-label="Decrease target temperature" ?disabled=${this._busy || next(-1) === target || !this._serviceAvailable('climate', 'set_temperature')} @click=${() => this._temperature(-1)}>−</button><div class="target-center"><small>SET TO</small>${this._format(target)}<small>${this._unit(climate)}</small></div><button aria-label="Increase target temperature" ?disabled=${this._busy || next(1) === target || !this._serviceAvailable('climate', 'set_temperature')} @click=${() => this._temperature(1)}>+</button></div>` : html`<button class="target-readonly" @click=${() => this._moreInfo(this._config.climate)}>${!available(climate) ? 'Thermostat unavailable' : climate.state === 'heat_cool' ? `${this._format(climate.attributes?.target_temp_low)}–${this._format(climate.attributes?.target_temp_high)} ${this._unit(climate)} · Details` : 'Thermostat details'}</button>` : nothing}</div>`;
  }
  _feedback() {
    return html`${this._error ? html`<div class="message error" role="alert">${this._error}<button aria-label="Dismiss error" @click=${() => { this._error = ''; }}>×</button></div>` : nothing}<div class="message status" role="status" aria-live="polite">${this._busy ? 'Sending command · waiting for Home Assistant…' : this._message || nothing}</div>`;
  }
  _renderDetails() {
    return html`<dialog aria-label="Room details" @close=${() => { this._details = false; if (!this._openingNative) this.renderRoot.querySelector('.title button')?.focus({ preventScroll: true }); this._openingNative = false; }}><header><h2>${this._config.name || 'Room'}</h2><button class="close" aria-label="Close room details" @click=${() => this.renderRoot.querySelector('dialog').close()}>×</button></header>${this._details ? this._feedback() : nothing}${this._details ? html`
      <h3>Window & door contacts</h3>${this._contactRows().length ? this._contactRows().map(({ item, type, state }) => html`<div class="detail-row">${mdi(type === 'window' ? 'mdi:window-closed-variant' : 'mdi:door')}<div><strong>${this._name(item)}</strong><small>${contactState(state)}${available(state) ? ` · ${relativeTime(state.last_changed)}` : ''}</small></div><time datetime=${state?.last_changed || ''} title=${state?.last_changed || ''}>${this._changedAt(state)}</time><button class="info-button" aria-label=${`Open ${this._name(item)} details`} @click=${() => this._moreInfo(item.entity)}>${mdi('mdi:information-outline')}</button></div>`) : html`<p class="hint">No contacts configured.</p>`}
      <h3>Lights</h3>${this._items('lights').map(item => {
        const state = this._state(item.entity);
        const pct = state?.state === 'on' ? Math.round((number(state.attributes?.brightness) ?? 0) / 255 * 100) : 0;
        return html`<div class="detail-row"><div><strong>${this._name(item)}</strong><small>${available(state) ? state.state : 'Unavailable'}</small></div><button class="info-button" aria-label=${`Open ${this._name(item)} details`} @click=${() => this._moreInfo(item.entity)}>${mdi('mdi:information-outline')}</button></div>${supportsBrightness(state) ? html`<label class="dimmer"><span>Brightness</span><output>${pct}%</output><input type="range" min="0" max="100" step="1" .value=${String(pct)} aria-label=${`${this._name(item)} brightness`} ?disabled=${this._busy || !this._serviceAvailable('light', 'turn_on')} @change=${event => this._brightness(item, event.target.value)}></label>` : nothing}`;
      })}
      ${this._config.climate || this._config.temperature ? html`<h3>Temperature history</h3><button class="history" @click=${() => this._moreInfo(this._config.climate || this._config.temperature)}>Open Home Assistant details & history ↗</button>` : nothing}
      ${['devices', 'automations', 'scenes'].map(key => this._items(key).length ? html`<h3>${key[0].toUpperCase() + key.slice(1)}</h3>${this._items(key).map(item => html`<div class="detail-row"><div><strong>${this._name(item)}</strong><small>${available(this._state(item.entity)) ? key === 'scenes' ? 'Scene' : this._state(item.entity).state : 'Unavailable'}</small></div><button class="info-button" aria-label=${`Open ${this._name(item)} details`} @click=${() => this._moreInfo(item.entity)}>${mdi('mdi:information-outline')}</button></div>`)}` : nothing)}
    ` : nothing}</dialog>`;
  }
  render() {
    if (!this._config) return nothing;
    const config = this._config;
    const climate = this._state(config.climate);
    const presence = this._state(config.presence);
    const humidityState = this._state(config.humidity);
    const humidity = config.humidity ? available(humidityState) ? number(humidityState.state) : null : available(climate) ? number(climate.attributes?.current_humidity) : null;
    const activity = this._state(config.activity);
    const timestamp = activityTimestamp(activity);
    const hasEntities = ['climate', 'temperature', 'humidity', 'presence', 'activity'].some(key => config[key]) || ['lights', 'scenes', 'devices', 'automations', 'windows', 'doors'].some(key => config[key]?.length);
    return html`<ha-card class="${config.compact ? 'compact' : ''} ${config.show_labels === false ? 'labels-off' : ''}"><header class="header"><span class="room-icon">${mdi(config.icon || 'mdi:home-outline')}</span><div class="title"><h2><button @click=${this._openDetails}>${config.name || 'Room'} <span aria-hidden="true">↗</span></button></h2>${config.subtitle ? html`<p class="subtitle">${config.subtitle}</p>` : nothing}</div>${this._shown('presence') && config.presence ? html`<span class="presence ${presence?.state === 'on' ? 'on' : ''}">${!available(presence) ? 'Unavailable' : presence.state === 'on' ? 'Occupied' : 'Clear'}</span>` : nothing}</header>
      <div class="meta"><span>${this._shown('presence') ? config.activity ? html`Last activity · ${timestamp ? relativeTime(timestamp) : 'unavailable'}` : config.presence && available(presence) ? presence.state === 'on' ? 'Occupied now' : html`Presence changed · ${relativeTime(presence.last_changed)}` : nothing : nothing}</span>${this._shown('humidity') && (config.humidity || humidity !== null) ? html`<span class="humidity">${mdi('mdi:water-percent')}${this._format(humidity)}%</span>` : nothing}</div>
      ${this._renderContacts()}${this._renderTemperature()}${this._group('lights', 'Lights')}<div class="secondary">${this._group('scenes', 'Scenes')}${this._group('devices', 'Devices')}${this._group('automations', 'Automations')}</div>
      ${!hasEntities ? html`<p class="empty">Choose room entities in the visual card editor. Add a thermostat, lights, contacts or other controls to get started.</p>` : nothing}
      ${!this._details ? this._feedback() : nothing}
      ${this._renderDetails()}</ha-card>`;
  }
}
if (!customElements.get('ha-room-card')) customElements.define('ha-room-card', RoomCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'ha-room-card')) window.customCards.push({ type: 'ha-room-card', name: 'HA Room Card', preview: true, description: 'Compact room controls: thermostat, lights, scenes, contacts and automations' });
console.info(`HA Room Card ${__VERSION__}`);
