import { test } from 'node:test';
import assert from 'node:assert/strict';
import { areaEntityIds, areaSuggestions, presenceStatus, validateConfig } from '../src/model.js';

test('room discovery inherits device areas but gives an explicit entity area priority', () => {
  const hass = { states: { 'light.room': {}, 'light.override': {}, 'light.hidden': {}, 'light.diagnostic': {}, 'light.unregistered': {} }, devices: { device: { area_id: 'room' } }, entities: {
    'light.room': { entity_id: 'light.room', device_id: 'device' },
    'light.override': { entity_id: 'light.override', device_id: 'device', area_id: 'other' },
    'light.hidden': { entity_id: 'light.hidden', area_id: 'room', hidden: true },
    'light.diagnostic': { entity_id: 'light.diagnostic', area_id: 'room', entity_category: 'diagnostic' },
  } };
  assert.deepEqual(areaEntityIds(hass, 'room'), ['light.room']);
  assert.deepEqual(areaEntityIds(hass, 'other'), ['light.override']);
  assert.deepEqual(areaEntityIds({ states: hass.states }, 'room'), []);
});
test('room suggestions avoid ambiguous thermostats and unknown binary-sensor meanings', () => {
  const states = { 'climate.a': { attributes: {} }, 'climate.b': { attributes: {} }, 'binary_sensor.generic': { attributes: { device_class: 'opening' } }, 'binary_sensor.occupancy': { attributes: { device_class: 'occupancy' } }, 'binary_sensor.motion': { attributes: { device_class: 'motion' } } };
  for (let i = 0; i < 7; i++) states[`light.l${i}`] = { attributes: {} };
  const hass = { states, entities: Object.fromEntries(Object.keys(states).map(id => [id, { entity_id: id, area_id: 'room' }])) };
  const suggestions = areaSuggestions(hass, 'room');
  assert.equal(suggestions.climate, undefined); assert.equal(suggestions.presence, 'binary_sensor.occupancy');
  assert.deepEqual(suggestions.windows, []); assert.deepEqual(suggestions.doors, []);
  assert.equal(suggestions.lights.length, 5); assert.equal(suggestions.activity, undefined);
});
test('occupancy uses binary state and last_changed; hold time is explicitly recent activity', () => {
  const now = Date.parse('2026-10-14T08:00:00Z');
  const sensor = { state: 'on', last_changed: '2026-10-14T07:52:00Z' };
  assert.deepEqual(presenceStatus(sensor, 0, now), { label: 'Occupied', active: true, detail: 'Occupied · 8 min' });
  const off = { ...sensor, state: 'off' };
  assert.equal(presenceStatus(off, 0, now).label, 'Clear');
  assert.equal(presenceStatus(off, 10, now).label, 'Recent activity');
  assert.equal(presenceStatus(off, 10, now + 2 * 60000).label, 'Clear');
  assert.equal(presenceStatus({ ...off, state: 'unavailable' }, 10, now).label, 'Unavailable');
  assert.equal(presenceStatus({ ...off, last_changed: 'invalid' }, 10, now).label, 'Clear');
  assert.throws(() => validateConfig({ presence_hold_minutes: -1 }));
});
