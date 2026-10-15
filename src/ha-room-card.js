import { LitElement, html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { validateConfig, enabledItems, itemDisplay, available, number, domainOf, targetTemperature, supportsBrightness, relativeTime, contactState, activityTimestamp, climateAppearance, presenceStatus } from './model.js';
import { cardStyles } from './styles.js';
import './editor.js';
export { validateConfig } from './model.js';

const mdi = (name) => html`<ha-icon .icon=${name}></ha-icon>`;
const defaultIcons = { lights: 'mdi:lightbulb-outline', scenes: 'mdi:palette-outline', devices: 'mdi:power-plug-outline', automations: 'mdi:lightning-bolt-outline' };
export class RoomCard extends LitElement {
  static properties = { hass: { attribute: false, hasChanged: () => true }, _states: { state: true, hasChanged: () => true }, _config: { state: true }, _busy: { state: true }, _error: { state: true }, _message: { state: true }, _scenePulse: { state: true }, _details: { state: true }, _sceneVisible: { state: true }, _pageHidden: { state: true }, _reducedMotion: { state: true } };
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
    this._startSceneObservers();
  }
  disconnectedCallback() {
    clearInterval(this._clock); clearTimeout(this._messageTimer); clearTimeout(this._pulseTimer);
    this._stopSceneObservers();
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
    if (this.isConnected) this._startSceneObservers();
  }
  _stopSceneObservers() {
    this._sceneObserver?.disconnect(); this._sceneObserver = undefined;
    if (this._visibilityHandler) document.removeEventListener('visibilitychange', this._visibilityHandler);
    this._motionQuery?.removeEventListener?.('change', this._motionHandler);
    this._motionQuery = undefined; this._visibilityHandler = undefined; this._motionHandler = undefined;
    this._sceneVisible = false;
  }
  _startSceneObservers() {
    this._stopSceneObservers();
    if (this._config?.show_scene === false || this._config?.animate_scene === false) return;
    this._pageHidden = document.hidden;
    this._visibilityHandler = () => { this._pageHidden = document.hidden; };
    document.addEventListener('visibilitychange', this._visibilityHandler);
    this._motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    this._reducedMotion = this._motionQuery?.matches ?? false;
    this._motionHandler = event => { this._reducedMotion = event.matches; };
    this._motionQuery?.addEventListener?.('change', this._motionHandler);
    // Without an observer, keep a complete static scene rather than animate offscreen.
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(entries => {
        if (this._sceneObserver !== observer || !this.isConnected) return;
        this._sceneVisible = entries.some(entry => entry.target === this && entry.isIntersecting);
      });
      this._sceneObserver = observer;
      observer.observe(this);
    }
  }
  _renderScene(appearance) {
    if (this._config.show_scene === false) return nothing;
    const moving = ['heating', 'cooling'].includes(appearance) && this._config.animate_scene !== false && this._sceneVisible && !this._pageHidden && !this._reducedMotion && !this._details;
    return html`<div class="room-scene ${appearance} ${moving ? 'moving' : 'still'}" aria-hidden="true">
      <div class="scene-light"></div>
      <svg class="scene-volume" viewBox="0 0 480 300" focusable="false">
        <path class="scene-wall-back" d="M80 55 292 20 292 174 80 230Z"/>
        <path class="scene-wall-side" d="m292 20 158 81v151l-158-78Z"/>
        <path class="scene-floor" d="m80 230 212-56 158 78-209 45Z"/>
        <path class="scene-window" d="m324 65 86 44v77l-86-42Z"/>
        <path class="scene-window-frame" d="m367 87 0 78m-43-60 86 43"/>
        <g class="scene-current" fill="none">
          <path d="M110 198c43-46 88 9 149-47s83-28 130-38"/>
          <path d="M105 220c46-44 101 10 160-43s78-29 124-38"/>
          <path d="M120 240c45-38 96 10 151-39s78-26 118-36"/>
        </g>
      </svg><div class="scene-scrim"></div>
    </div>`;
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
  getCardSize() { const height = this.renderRoot?.querySelector('ha-card')?.getBoundingClientRect().height; return height ? Math.ceil(height / 50) : this._config?.compact ? 7 : 10; }
  getGridOptions() { return { columns: 12, min_columns: 6 }; }
  _state(id) { return (this._states ?? this.hass?.states)?.[id]; }
  _items(key) { return this._shown(['windows', 'doors'].includes(key) ? 'contacts' : key) ? enabledItems(this._config, key) : []; }
  _cardItems(key) { return this._items(key).filter(item => itemDisplay(this._config, key, item) === 'card'); }
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
    const ids = this._cardItems('lights').filter(item => available(this._state(item.entity)) && this._state(item.entity).state === 'on').map(item => item.entity);
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
    const items = this._cardItems(key);
    if (!this._shown(key) || !items.length) return nothing;
    const on = items.filter(item => this._state(item.entity)?.state === 'on').length;
    return html`<section class="group ${key}-group" aria-label=${title}><div class="group-heading"><span>${title}${key === 'lights' ? ` · ${on}/${items.length}` : ''}</span>${key === 'lights' ? html`<button class="all-off" ?disabled=${this._busy || !on || !this._serviceAvailable('light', 'turn_off')} @click=${this._allOff}><span>All off</span></button>` : key === 'automations' ? html`<span>${on} enabled</span>` : nothing}</div><div class="tiles" style=${key === 'lights' ? `--room-light-count:${items.length}` : nothing}>${repeat(items, item => item.entity, item => this._tile(item, key))}</div></section>`;
  }
  _contactRows(onCard = false) {
    return ['windows', 'doors'].flatMap(key => (onCard ? this._cardItems(key) : this._items(key)).map(item => ({ item, type: key === 'windows' ? 'window' : 'door', state: this._state(item.entity) })));
  }
  _renderContacts() {
    if (!this._shown('contacts')) return nothing;
    const rows = this._contactRows(true);
    if (!rows.length) return nothing;
    const visible = rows.filter(({ item, state }) => !this._config.compact || item.display === 'card' || contactState(state) !== 'Closed');
    const closed = rows.length - visible.length;
    const heating = climateAppearance(this._state(this._config.climate)) === 'heating';
    return html`<div class="contacts">${visible.map(({ item, type, state }) => html`<button class="contact ${contactState(state) === 'Open' ? 'open' : ''}" @click=${this._openDetails} title=${`${this._name(item)} · ${contactState(state)} · ${state?.last_changed || 'change time unknown'}`}><span class="contact-symbol">${mdi(type === 'window' ? 'mdi:window-closed-variant' : 'mdi:door')}</span><span>${this._name(item)} ${contactState(state).toLowerCase()}${heating && type === 'window' && state?.state === 'on' ? ' · heating' : ''}${available(state) ? html` · <time datetime=${state.last_changed || ''}>${relativeTime(state.last_changed)}</time>` : nothing}</span></button>`)}${closed && !visible.length ? html`<button class="contact closed-summary" @click=${this._openDetails}>${mdi('mdi:window-closed-variant')}<span>${closed === rows.length ? 'All closed' : `${closed} closed`}</span></button>` : nothing}</div>`;
  }
  _renderTemperature() {
    if (!this._shown('thermostat') || (!this._config.climate && !this._config.temperature)) return nothing;
    const climate = this._state(this._config.climate);
    const sensor = this._state(this._config.temperature);
    const current = this._config.temperature ? available(sensor) ? number(sensor.state) : null : available(climate) ? number(climate.attributes?.current_temperature) : null;
    const unit = this._unit(this._config.temperature ? sensor : climate);
    const target = available(climate) ? number(climate.attributes?.temperature) : null;
    const appearance = this._config.climate ? climateAppearance(climate) : 'sensor-only';
    const heating = appearance === 'heating';
    const action = appearance === 'off' ? 'Off' : available(climate) ? climate.attributes?.hvac_action || `${climate.state} mode` : 'Unavailable';
    const step = this._config.temperature_step ?? 0.5;
    const next = direction => targetTemperature(climate, direction, step);
    const supported = target !== null && next(1) !== null;
    return html`<div class="thermostat ${appearance}"><div class="temperature-reading"><div class="current" aria-label=${`Current temperature ${this._format(current)} ${unit}`}>${this._format(current)}<span class="unit">${unit}</span></div>${this._config.climate ? html`<div class="hvac ${heating ? 'heating' : ''}">${mdi(heating ? 'mdi:fire' : appearance === 'cooling' ? 'mdi:snowflake' : 'mdi:thermostat')}${action}</div>` : nothing}</div>${this._config.climate ? supported ? html`<div class="target"><button aria-label="Decrease target temperature" ?disabled=${this._busy || next(-1) === target || !this._serviceAvailable('climate', 'set_temperature')} @click=${() => this._temperature(-1)}>−</button><div class="target-center" aria-label=${`Target temperature ${this._format(target)} ${this._unit(climate)}`}><small>Target</small><span>${this._format(target)}${unit === this._unit(climate) ? '°' : this._unit(climate)}</span></div><button aria-label="Increase target temperature" ?disabled=${this._busy || next(1) === target || !this._serviceAvailable('climate', 'set_temperature')} @click=${() => this._temperature(1)}>+</button></div>` : html`<button class="target-readonly" @click=${() => this._moreInfo(this._config.climate)}>${!available(climate) ? 'Thermostat unavailable' : climate.state === 'heat_cool' ? `${this._format(climate.attributes?.target_temp_low)}–${this._format(climate.attributes?.target_temp_high)} ${this._unit(climate)} · Details` : 'Thermostat details'}</button>` : nothing}</div>`;
  }
  _feedback() {
    return html`${this._error ? html`<div class="message error" role="alert">${this._error}<button aria-label="Dismiss error" @click=${() => { this._error = ''; }}>×</button></div>` : nothing}<div class="message status" role="status" aria-live="polite">${this._busy ? 'Sending command · waiting for Home Assistant…' : this._message || nothing}</div>`;
  }
  _detailGroup(key, title) {
    const items = this._items(key);
    if (!items.length) return nothing;
    return html`<section class="detail-group ${key}-details" aria-label=${title}><h3>${title}</h3>${repeat(items, item => item.entity, item => {
      const state = this._state(item.entity);
      const pct = state?.state === 'on' ? Math.round((number(state.attributes?.brightness) ?? 0) / 255 * 100) : 0;
      return html`<div class="detail-control"><div class="detail-row">${this._tile(item, key)}<button class="info-button" aria-label=${`Open ${this._name(item)} details`} @click=${() => this._moreInfo(item.entity)}>${mdi('mdi:information-outline')}</button></div>${key === 'lights' && supportsBrightness(state) ? html`<details class="light-settings"><summary>Brightness <span>${pct}%</span></summary><label class="dimmer"><span class="sr-only">${this._name(item)} brightness</span><input type="range" min="0" max="100" step="1" .value=${String(pct)} aria-label=${`${this._name(item)} brightness`} ?disabled=${this._busy || !this._serviceAvailable('light', 'turn_on')} @change=${event => this._brightness(item, event.target.value)}></label></details>` : nothing}</div>`;
    })}</section>`;
  }
  _renderDetails() {
    const rows = this._contactRows();
    const occupancy = presenceStatus(this._state(this._config.presence), this._config.presence_hold_minutes ?? 0);
    const activity = activityTimestamp(this._state(this._config.activity));
    return html`<dialog aria-label="Room details" @close=${() => { this._details = false; if (!this._openingNative) this.renderRoot.querySelector('.title button')?.focus({ preventScroll: true }); this._openingNative = false; }}><header><h2>${this._config.name || 'Room'}</h2><button class="close" aria-label="Close room details" @click=${() => this.renderRoot.querySelector('dialog').close()}>×</button></header>${this._details ? html`
      ${this._feedback()}
      ${this._shown('presence') && (this._config.presence || this._config.activity) ? html`<p class="detail-presence">${this._config.presence ? `${occupancy.label === 'Recent activity' ? 'Recent activity · ' : ''}${occupancy.detail}` : nothing}${this._config.activity ? html`<span>Last activity · ${activity ? relativeTime(activity) : 'unavailable'}</span>` : nothing}</p>` : nothing}
      ${this._detailGroup('lights', 'Lights')}
      ${this._detailGroup('scenes', 'Scenes')}
      ${this._detailGroup('devices', 'Devices')}
      ${this._detailGroup('automations', 'Automations')}
      ${rows.length ? html`<section class="detail-group"><h3>Windows & doors</h3>${rows.map(({ item, type, state }) => html`<div class="detail-row contact-detail">${mdi(type === 'window' ? 'mdi:window-closed-variant' : 'mdi:door')}<div><strong>${this._name(item)}</strong><small>${contactState(state)}${available(state) ? ` · ${relativeTime(state.last_changed)}` : ''}</small></div><time datetime=${state?.last_changed || ''} title=${state?.last_changed || ''}>${this._changedAt(state)}</time><button class="info-button" aria-label=${`Open ${this._name(item)} details`} @click=${() => this._moreInfo(item.entity)}>${mdi('mdi:information-outline')}</button></div>`)}</section>` : nothing}
      ${this._shown('thermostat') && (this._config.climate || this._config.temperature) ? html`<button class="history" @click=${() => this._moreInfo(this._config.climate || this._config.temperature)}>Thermostat & history <span aria-hidden="true">›</span></button>` : nothing}
    ` : nothing}</dialog>`;
  }
  render() {
    if (!this._config) return nothing;
    const config = this._config;
    const climate = this._state(config.climate);
    const occupancy = presenceStatus(this._state(config.presence), config.presence_hold_minutes ?? 0);
    const humidityState = this._state(config.humidity);
    const humidity = config.humidity ? available(humidityState) ? number(humidityState.state) : null : available(climate) ? number(climate.attributes?.current_humidity) : null;
    const timestamp = activityTimestamp(this._state(config.activity));
    const hasEntities = ['climate', 'temperature', 'humidity', 'presence', 'activity'].some(key => config[key]) || ['lights', 'scenes', 'devices', 'automations', 'windows', 'doors'].some(key => config[key]?.length);
    const hasFavorites = ['scenes', 'devices', 'automations'].some(key => this._cardItems(key).length);
    const appearance = this._shown('thermostat') && config.climate ? climateAppearance(climate) : 'idle';
    return html`<ha-card class="${config.compact ? 'compact' : ''} ${config.show_labels === false ? 'labels-off' : ''} ${config.show_scene !== false ? 'scene-enabled' : ''} ${this.hass?.themes?.darkMode ? 'scheme-dark' : 'scheme-light'} scene-${appearance}">
      ${this._renderScene(appearance)}<div class="room-content">
      <header class="header"><div class="title"><h2><button @click=${this._openDetails}>${config.icon ? mdi(config.icon) : nothing}${config.name || 'Room'}</button></h2>${!config.compact && config.subtitle ? html`<p class="subtitle">${config.subtitle}</p>` : nothing}</div>${this._shown('humidity') && (config.humidity || humidity !== null) ? html`<span class="humidity" aria-label=${`Humidity ${this._format(humidity)} percent`}>${mdi('mdi:water-percent')}${this._format(humidity)}%</span>` : nothing}</header>
      ${this._shown('presence') && (config.presence || config.activity) ? html`<div class="presence ${occupancy.active ? 'on' : ''}"><span class="presence-dot" aria-hidden="true"></span>${config.presence ? occupancy.label === 'Recent activity' ? `Recent activity · ${relativeTime(this._state(config.presence)?.last_changed)}` : occupancy.detail : `Last activity · ${timestamp ? relativeTime(timestamp) : 'unavailable'}`}</div>` : nothing}
      ${this._renderTemperature()}${this._group('lights', 'Lights')}
      ${hasFavorites ? html`<div class="secondary">${this._group('scenes', 'Scenes')}${this._group('devices', 'Devices')}${this._group('automations', 'Automations')}</div>` : nothing}
      ${hasEntities ? html`<footer class="room-footer">${this._renderContacts()}<button class="details-link" aria-label="Room details" @click=${this._openDetails}>Details <span aria-hidden="true">›</span></button></footer>` : html`<p class="empty">Choose room entities in the visual card editor. Add a thermostat, lights, contacts or other controls to get started.</p>`}
      ${!this._details ? this._feedback() : nothing}</div>${this._renderDetails()}
    </ha-card>`;
  }
}
if (!customElements.get('ha-room-card')) customElements.define('ha-room-card', RoomCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'ha-room-card')) window.customCards.push({ type: 'ha-room-card', name: 'HA Room Card', preview: true, description: 'Compact room controls: thermostat, lights, scenes, contacts and automations' });
console.info(`HA Room Card ${__VERSION__}`);
