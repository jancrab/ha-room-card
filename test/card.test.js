import { test, before, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { targetTemperature, supportsBrightness, relativeTime, contactState, activityTimestamp, number, climateAppearance } from '../src/model.js';
const window = new Window();
for (const key of ['window', 'document', 'customElements', 'HTMLElement', 'Element', 'Document', 'CSSStyleSheet', 'ShadowRoot', 'CustomEvent', 'Event']) globalThis[key] = window[key];
globalThis.__VERSION__ = 'test';
let validateConfig;
before(async () => { ({ validateConfig } = await import('../src/ha-room-card.js')); });
afterEach(() => document.body.replaceChildren());
const state = (entity_id, value, attributes = {}) => ({ entity_id, state: value, attributes, last_changed: '2026-10-14T06:00:00Z' });
const thermostat = overrides => state('climate.room', 'heat', { friendly_name: 'Thermostat', current_temperature: 21.4, temperature: 22, min_temp: 7, max_temp: 30, target_temp_step: 0.5, supported_features: 1, hvac_action: 'idle', ...overrides });
function fixture(config = {}) {
  const calls = [];
  const card = document.createElement('ha-room-card');
  card.setConfig({ name: 'Living room', climate: 'climate.room', lights: ['light.ceiling'], windows: ['binary_sensor.window'], ...config });
  const hass = {
    states: { 'climate.room': thermostat(), 'light.ceiling': state('light.ceiling', 'on', { friendly_name: 'Ceiling', brightness: 128, supported_color_modes: ['brightness'] }), 'binary_sensor.window': state('binary_sensor.window', 'on', { friendly_name: 'Window' }), 'switch.outlet': state('switch.outlet', 'off'), 'automation.heat': state('automation.heat', 'on'), 'scene.relax': state('scene.relax', '2026-10-13T20:00:00Z') },
    config: { unit_system: { temperature: '°C' } },
    callService: async (domain, service, data) => {
      calls.push({ domain, service, data });
      for (const id of [data.entity_id].flat()) {
        const old = hass.states[id];
        if (domain === 'climate') hass.states[id] = { ...old, attributes: { ...old.attributes, temperature: data.temperature } };
        else if (domain !== 'scene') hass.states[id] = { ...old, state: service === 'turn_on' ? 'on' : 'off', attributes: { ...old.attributes, ...(data.brightness_pct !== undefined ? { brightness: Math.round(data.brightness_pct * 255 / 100) } : {}) } };
      }
      card.hass = hass;
    },
  };
  card.hass = hass; document.body.append(card);
  return { card, hass, calls };
}

test('empty card can be configured visually; legacy entities migrate without trapping the editor', () => {
  assert.deepEqual(validateConfig({}).lights, []);
  const config = validateConfig({ entity: 'climate.room', name: 'Room' });
  assert.equal(config.climate, 'climate.room'); assert.equal(config.entity, undefined);
  assert.equal(validateConfig({ ...config, climate: '' }).climate, undefined);
  assert.equal(validateConfig({ entity: 'sensor.room' }).temperature, 'sensor.room');
});
test('configuration rejects wrong domains, duplicate lights, excess lights and invalid flags', () => {
  assert.throws(() => validateConfig({ climate: 'light.room' }));
  assert.throws(() => validateConfig({ lights: ['light.a', 'light.a'] }));
  assert.throws(() => validateConfig({ lights: Array.from({ length: 6 }, (_, i) => `light.l${i}`) }));
  assert.throws(() => validateConfig({ temperature_step: 0 }));
  assert.throws(() => validateConfig({ compact: 'false' }));
  assert.throws(() => validateConfig({ lights: [{ entity: 'light.a', enabled: 'false' }] }));
});
test('target stepping respects reported step, bounds and real support', () => {
  assert.equal(targetTemperature(thermostat(), 1), 22.5);
  assert.equal(targetTemperature(thermostat({ target_temp_step: 1 }), 1), 23);
  assert.equal(targetTemperature(thermostat({ temperature: 30 }), 1), 30);
  assert.equal(targetTemperature(thermostat({ temperature: 7 }), -1), 7);
  assert.equal(targetTemperature(thermostat({ supported_features: 2 }), 1), null);
  assert.equal(targetTemperature({ ...thermostat(), state: 'heat_cool' }, 1), null);
  assert.equal(targetTemperature(thermostat({ temperature: null }), 1), null);
});
test('light capabilities, unavailable contacts and invalid timestamps are handled conservatively', () => {
  assert.equal(supportsBrightness(state('light.x', 'on', { supported_color_modes: ['onoff'] })), false);
  assert.equal(supportsBrightness(state('light.x', 'on', { supported_color_modes: ['color_temp'] })), true);
  assert.equal(contactState(undefined), 'Unavailable'); assert.equal(contactState(state('binary_sensor.x', 'off')), 'Closed');
  assert.equal(number(false), null); assert.equal(number(' '), null); assert.equal(number('0'), 0);
  assert.equal(activityTimestamp(state('sensor.x', 'unknown')), undefined);
  assert.equal(activityTimestamp(state('sensor.x', 'garbage', { timestamp: 1e99 })), undefined);
  assert.equal(relativeTime('invalid'), 'time unknown');
});
test('room UI displays measured temperature, contacts and labels without pretending to heat', async () => {
  const { card } = fixture(); await card.updateComplete;
  assert.match(card.shadowRoot.querySelector('.current').textContent, /21.4/);
  assert.match(card.shadowRoot.querySelector('.contact').textContent, /open/);
  assert.equal(card.shadowRoot.querySelector('.hvac').classList.contains('heating'), false);
  assert.match(card.shadowRoot.querySelector('.tile').textContent, /Ceiling/);
});
test('heating tint follows reported action, while off overrides a stale heating action', async () => {
  const { card, hass } = fixture(); await card.updateComplete;
  assert.equal(card.shadowRoot.querySelector('.thermostat').classList.contains('idle'), true);
  hass.states['climate.room'] = thermostat({ hvac_action: 'heating' }); card.hass = hass; await card.updateComplete;
  assert.equal(card.shadowRoot.querySelector('.thermostat').classList.contains('heating'), true);
  hass.states['climate.room'] = { ...thermostat({ hvac_action: 'heating' }), state: 'off' }; card.hass = hass; await card.updateComplete;
  assert.equal(card.shadowRoot.querySelector('.thermostat').classList.contains('off'), true);
  assert.equal(card.shadowRoot.querySelector('.hvac').textContent.trim(), 'Off');
  assert.equal(climateAppearance({ ...thermostat(), state: 'unavailable' }), 'unavailable');
  assert.equal(climateAppearance(thermostat({ hvac_action: 'preheating' })), 'heating');
  assert.equal(climateAppearance(thermostat({ hvac_action: 'cooling' })), 'idle');
});
test('reused hass objects update state and unknown entities stay distinct from off', async () => {
  const { card, hass } = fixture(); await card.updateComplete;
  hass.states['light.ceiling'] = state('light.ceiling', 'unavailable'); card.hass = hass; await card.updateComplete;
  assert.equal(card.shadowRoot.querySelector('.tile').disabled, true);
  assert.equal(card.shadowRoot.querySelector('.tile').classList.contains('unavailable'), true);
  assert.equal(card.shadowRoot.querySelector('.tile').classList.contains('active'), false);
});
test('thermostat and automation controls call exact services without changing mode or stopping running actions', async () => {
  const { card, calls } = fixture({ automations: ['automation.heat'] }); await card.updateComplete;
  await card._temperature(1);
  assert.deepEqual(calls[0], { domain: 'climate', service: 'set_temperature', data: { entity_id: 'climate.room', temperature: 22.5 } });
  await card._toggle({ entity: 'automation.heat' });
  assert.deepEqual(calls[1], { domain: 'automation', service: 'turn_off', data: { entity_id: 'automation.heat', stop_actions: false } });
});
test('groups exclude disabled and unavailable lights; dimming uses supported brightness_pct', async () => {
  const { card, hass, calls } = fixture({ lights: ['light.ceiling', { entity: 'light.excluded', enabled: false }, 'light.offline'] });
  hass.states['light.excluded'] = state('light.excluded', 'on'); hass.states['light.offline'] = state('light.offline', 'unavailable');
  await card._allOff(); assert.deepEqual(calls[0].data.entity_id, ['light.ceiling']);
  await card._brightness({ entity: 'light.ceiling' }, 35);
  assert.deepEqual(calls[1], { domain: 'light', service: 'turn_on', data: { entity_id: 'light.ceiling', brightness_pct: 35 } });
});
test('failed service calls retain real state and expose a dismissible error', async () => {
  const { card, hass } = fixture(); hass.callService = async () => { throw new Error('Permission denied'); };
  await card._toggle({ entity: 'light.ceiling' }); await card.updateComplete;
  assert.equal(hass.states['light.ceiling'].state, 'on'); assert.equal(card._busy, false);
  assert.match(card.shadowRoot.querySelector('[role=alert]').textContent, /Permission denied/);
});
test('dimmer failures are visible inside room details instead of hidden behind its modal', async () => {
  const { card, hass } = fixture(); card._details = true;
  hass.callService = async () => { throw new Error('Brightness rejected'); };
  await card._brightness({ entity: 'light.ceiling' }, 35); await card.updateComplete;
  assert.match(card.shadowRoot.querySelector('dialog [role=alert]').textContent, /Brightness rejected/);
  assert.equal(hass.states['light.ceiling'].attributes.brightness, 128);
});
test('duplicate clicks are blocked until state confirmation; a delayed device is never optimistically toggled', async () => {
  const { card, hass } = fixture(); let count = 0; hass.callService = async () => { count++; };
  card._stateTimeout = 20;
  const pending = card._toggle({ entity: 'light.ceiling' });
  await card._toggle({ entity: 'light.ceiling' }); await pending;
  assert.equal(count, 1); assert.equal(hass.states['light.ceiling'].state, 'on');
  assert.match(card._message, /not yet confirmed/);
});
test('a hanging backend command times out with uncertain outcome instead of reporting success', async () => {
  const { card, hass } = fixture(); card._serviceTimeout = 15; hass.callService = () => new Promise(() => {});
  await card._toggle({ entity: 'light.ceiling' });
  assert.match(card._error, /did not confirm/); assert.equal(card._busy, false);
});
test('a later HA update confirms the command instead of relying on optimistic local state', async () => {
  const { card, hass } = fixture(); hass.callService = async () => {};
  const pending = card._toggle({ entity: 'light.ceiling' });
  await Promise.resolve(); assert.equal(card._busy, true); assert.equal(hass.states['light.ceiling'].state, 'on');
  hass.states['light.ceiling'] = state('light.ceiling', 'off'); card.hass = hass; await card.updateComplete;
  await pending; assert.equal(card._busy, false); assert.equal(card._message, 'State updated.');
});
test('range thermostats render a native details link and Fahrenheit remains Fahrenheit', async () => {
  const { card, hass } = fixture();
  hass.states['climate.room'] = { ...thermostat({ supported_features: 2, target_temp_low: 65, target_temp_high: 75, current_temperature: 70, unit_of_measurement: '°F' }), state: 'heat_cool' };
  card.hass = hass; await card.updateComplete;
  assert.equal(card.shadowRoot.querySelector('.target'), null);
  assert.match(card.shadowRoot.querySelector('.target-readonly').textContent, /65–75 °F/);
  assert.match(card.shadowRoot.querySelector('.current').textContent, /70.*°F/);
});
test('unsupported actions are disabled instead of guessing another service', async () => {
  const { card, hass, calls } = fixture(); hass.services = { light: {} }; card.hass = hass; await card.updateComplete;
  await card._toggle({ entity: 'light.ceiling' }); assert.equal(calls.length, 0);
  assert.equal(card.shadowRoot.querySelector('.tile').disabled, true);
});
test('scenes are momentary actions with no on/off semantics', async () => {
  const { card, calls } = fixture({ scenes: ['scene.relax'] }); await card.updateComplete;
  const tile = card.shadowRoot.querySelector('.scenes-group button');
  assert.equal(tile.hasAttribute('aria-pressed'), false);
  await card._execute([{ domain: 'scene', service: 'turn_on', data: { entity_id: 'scene.relax' } }], null, 'scene.relax');
  assert.equal(calls[0].service, 'turn_on'); assert.equal(card._scenePulse, 'scene.relax');
});
test('context states render, unsubscribe and release timers on removal', async () => {
  const host = document.createElement('div'); document.body.append(host); let callback, releases = 0;
  host.addEventListener('context-request', event => { callback = event.callback; });
  const card = document.createElement('ha-room-card'); card.setConfig({ temperature: 'sensor.room' }); host.append(card);
  callback({ 'sensor.room': state('sensor.room', '19.2') }, () => releases++); await card.updateComplete;
  assert.match(card.shadowRoot.querySelector('.current').textContent, /19.2/);
  card.remove(); assert.equal(releases, 1); assert.equal(card._states, undefined);
});
test('native details use the selected entity and custom labels are escaped', async () => {
  const { card } = fixture({ name: '<img src=x>' }); await card.updateComplete;
  assert.equal(card.shadowRoot.querySelector('img'), null);
  let detail; card.addEventListener('hass-more-info', event => { detail = event.detail; });
  card._moreInfo('climate.room'); assert.deepEqual(detail, { entityId: 'climate.room' });
});
test('fresh editor bootstraps native forms, exposes all mappings and preserves custom item fields', async () => {
  let loads = 0;
  window.loadCardHelpers = async () => ({ createCardElement: () => ({ constructor: { getConfigElement: async () => { loads++; customElements.define('ha-form', class extends HTMLElement {}); } } }) });
  const editor = await customElements.get('ha-room-card').getConfigElement();
  editor.setConfig({ name: 'Room', custom_setting: 7, lights: [{ entity: 'light.ceiling', name: 'Desk', enabled: false }] });
  editor.hass = { states: {} }; document.body.append(editor); await editor.updateComplete;
  const forms = [...editor.shadowRoot.querySelectorAll('ha-form')];
  const schemaNames = forms.flatMap(form => form.schema.map(field => field.name));
  for (const key of ['climate', 'lights', 'scenes', 'devices', 'automations', 'windows', 'doors', 'humidity', 'activity', 'compact']) assert.ok(schemaNames.includes(key), key);
  let result; editor.addEventListener('config-changed', event => { result = event.detail.config; });
  forms[0].dispatchEvent(new CustomEvent('value-changed', { detail: { value: { name: 'Updated', lights: ['light.ceiling'] } } }));
  assert.equal(result.custom_setting, 7); assert.equal(result.lights[0].name, 'Desk'); assert.equal(result.lights[0].enabled, false);
  await editor.updateComplete;
  const itemForm = [...editor.shadowRoot.querySelectorAll('ha-form')].find(form => form.schema.some(field => field.name === 'enabled'));
  itemForm.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { enabled: true } } }));
  assert.equal(result.lights[0].enabled, true); assert.equal(result.lights[0].name, 'Desk');
  editor._changed(new CustomEvent('value-changed', { detail: { value: { temperature_step: null, climate: '', doors: null } } }));
  assert.equal(result.temperature_step, undefined); assert.equal(result.climate, undefined); assert.deepEqual(result.doors, []);
  editor.hass = { states: { 'light.room': state('light.room', 'on'), 'light.other': state('light.other', 'off'), 'light.ceiling': state('light.ceiling', 'off') }, entities: { room: { entity_id: 'light.room', area_id: 'room' }, other: { entity_id: 'light.other', area_id: 'other' } }, areas: { room: { name: 'Room A' } } };
  editor.setConfig({ ...result, area: 'room' }); await editor.updateComplete;
  const lightSelector = () => [...editor.shadowRoot.querySelectorAll('ha-form')].flatMap(form => form.schema).find(field => field.name === 'lights').selector.entity;
  assert.ok(lightSelector().include_entities.includes('light.room'));
  assert.ok(lightSelector().include_entities.includes('light.ceiling'), 'explicit outside-room selection remains available');
  assert.ok(lightSelector().exclude_entities.includes('light.other'));
  editor._search = 'other'; await editor.updateComplete;
  assert.ok(lightSelector().include_entities.includes('light.other'), 'global search permits cross-room override');
  const suggested = editor._fillSuggestions({ area: 'room', name: 'My room', lights: [{ entity: 'light.ceiling', name: 'Manual label' }] });
  assert.equal(suggested.name, 'My room'); assert.equal(suggested.lights[0].name, 'Manual label');
  const fresh = editor._fillSuggestions({ area: 'room', name: 'Room' });
  assert.equal(fresh.name, 'Room A'); assert.deepEqual(fresh.lights, ['light.room']);
  await customElements.get('ha-room-card').getConfigElement(); assert.equal(loads, 1);
});
