import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elapsedSince, contactStatus } from '../demo/prototype-model.js';

test('contact duration handles minute, hour and day boundaries', () => {
  const now = 2000000000;
  assert.equal(elapsedSince(now - 59000, now), 'just now');
  assert.equal(elapsedSince(now - 60000, now), '1 min');
  assert.equal(elapsedSince(now - 65 * 60000, now), '1 h 5 min');
  assert.equal(elapsedSince(now - 24 * 3600000, now), '1 d');
  assert.equal(elapsedSince(now - 25 * 3600000, now), '1 d 1 h');
});
test('clock skew and missing timestamps do not produce misleading durations', () => {
  assert.equal(elapsedSince(200, 100), 'just now');
  assert.equal(elapsedSince(undefined), 'time unknown');
});
test('an unavailable contact is distinct from a closed contact', () => {
  assert.equal(contactStatus({ open: true }), 'Open');
  assert.equal(contactStatus({ open: false }), 'Closed');
  assert.equal(contactStatus({ open: null }), 'Unavailable');
});
