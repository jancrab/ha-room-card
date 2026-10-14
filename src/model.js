export const LISTS = { lights: ['light'], scenes: ['scene'], devices: ['switch', 'input_boolean', 'fan'], automations: ['automation'], windows: ['binary_sensor'], doors: ['binary_sensor'] };
export const SINGLES = { climate: ['climate'], temperature: ['sensor'], humidity: ['sensor'], presence: ['binary_sensor'], activity: ['sensor', 'input_datetime'] };
export const SECTIONS = ['thermostat', 'humidity', 'presence', 'contacts', 'lights', 'scenes', 'devices', 'automations'];
const entityPattern = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
export const entityId = value => typeof value === 'string' ? value : value?.entity;
export const domainOf = id => id?.split('.')[0];
export const enabledItems = (config, key) => (config[key] || []).filter(item => item.enabled !== false);
export const available = state => !!state && !['unknown', 'unavailable'].includes(state.state);
export function climateAppearance(state) {
  if (!available(state)) return 'unavailable';
  if (state.state === 'off') return 'off';
  return ['heating', 'preheating'].includes(state.attributes?.hvac_action) ? 'heating' : 'idle';
}
export const number = value => (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) && Number.isFinite(Number(value)) ? Number(value) : null;

export function migrateConfig(value) {
  const config = { ...value };
  if (config.entity && !Object.keys(SINGLES).some(key => config[key]) && !Object.keys(LISTS).some(key => config[key]?.length)) {
    const domain = domainOf(config.entity);
    const key = domain === 'climate' ? 'climate' : domain === 'sensor' ? 'temperature' : domain === 'binary_sensor' ? 'presence' : Object.keys(LISTS).find(list => LISTS[list].includes(domain));
    if (key) config[key] = key in LISTS ? [config.entity] : config.entity;
  }
  if (config.entity && ['climate', 'sensor', 'binary_sensor', ...Object.values(LISTS).flat()].includes(domainOf(config.entity))) delete config.entity;
  return config;
}

export function validateConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Configure a room card.');
  const config = migrateConfig(value);
  for (const key of ['name', 'subtitle', 'icon', 'area']) if (config[key] !== undefined && typeof config[key] !== 'string') throw new Error(`${key} must be text.`);
  if (config.presence_hold_minutes !== undefined && (typeof config.presence_hold_minutes !== 'number' || !Number.isFinite(config.presence_hold_minutes) || config.presence_hold_minutes < 0 || config.presence_hold_minutes > 120)) throw new Error('Presence hold time must be between 0 and 120 minutes.');
  for (const key of ['compact', 'show_labels', ...SECTIONS.map(section => `show_${section}`)]) if (config[key] !== undefined && typeof config[key] !== 'boolean') throw new Error(`${key} must be true or false.`);
  if (config.layout !== undefined && !['compact', 'wide'].includes(config.layout)) throw new Error('Layout must be compact or wide.');
  if (config.temperature_step !== undefined && (typeof config.temperature_step !== 'number' || !Number.isFinite(config.temperature_step) || config.temperature_step <= 0 || config.temperature_step > 10)) throw new Error('Temperature step must be greater than zero and at most 10.');
  const checkId = (id, domains, key) => {
    if (!entityPattern.test(id || '') || !domains.includes(domainOf(id))) throw new Error(`${key}: select a ${domains.join(' / ')} entity.`);
  };
  for (const [key, domains] of Object.entries(SINGLES)) {
    if (config[key] === '' || config[key] === null) delete config[key];
    if (config[key] !== undefined) checkId(config[key], domains, key);
  }
  for (const [key, domains] of Object.entries(LISTS)) {
    const entries = config[key] ?? [];
    if (!Array.isArray(entries)) throw new Error(`${key} must be an entity list.`);
    if (key === 'lights' && entries.length > 5) throw new Error('Select at most five lights (a light group counts as one).');
    const seen = new Set();
    config[key] = entries.map(entry => {
      const item = typeof entry === 'string' ? { entity: entry } : { ...entry };
      checkId(item.entity, domains, key);
      if (seen.has(item.entity)) throw new Error(`${key}: duplicate entity ${item.entity}.`);
      seen.add(item.entity);
      for (const field of ['name', 'icon']) if (item[field] !== undefined && typeof item[field] !== 'string') throw new Error(`${key}.${field} must be text.`);
      if (item.enabled !== undefined && typeof item.enabled !== 'boolean') throw new Error(`${key}.enabled must be true or false.`);
      return item;
    });
  }
  return { compact: config.layout !== 'wide', show_labels: true, ...config };
}

export function targetTemperature(state, direction, configuredStep = 0.5) {
  if (!available(state) || state.state === 'heat_cool' || !(Number(state.attributes?.supported_features) & 1)) return null;
  const attributes = state.attributes || {};
  const target = number(attributes.temperature);
  if (target === null) return null;
  const nativeStep = number(attributes.target_temp_step);
  const step = nativeStep > 0 ? Math.max(nativeStep, Math.ceil(configuredStep / nativeStep - 1e-8) * nativeStep) : configuredStep;
  const min = number(attributes.min_temp);
  const max = number(attributes.max_temp);
  const anchor = min ?? 0;
  let next = anchor + Math.round((target + direction * step - anchor) / (nativeStep > 0 ? nativeStep : step)) * (nativeStep > 0 ? nativeStep : step);
  if (min !== null) next = Math.max(min, next);
  if (max !== null) next = Math.min(max, next);
  return Number(next.toFixed(4));
}

export function supportsBrightness(state) {
  return available(state) && Array.isArray(state.attributes?.supported_color_modes) && state.attributes.supported_color_modes.some(mode => !['onoff', 'unknown'].includes(mode));
}
export function relativeTime(timestamp, now = Date.now()) {
  const date = Date.parse(timestamp);
  if (!Number.isFinite(date)) return 'time unknown';
  const minutes = Math.max(0, Math.floor((now - date) / 60000));
  if (!minutes) return 'just now';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} h${minutes % 60 ? ` ${minutes % 60} min` : ''}` : `${Math.floor(hours / 24)} d`;
}
export const contactState = state => !available(state) || !['on', 'off'].includes(state.state) ? 'Unavailable' : state.state === 'on' ? 'Open' : 'Closed';
export function activityTimestamp(state) {
  if (!available(state)) return undefined;
  const timestamp = number(state.attributes?.timestamp);
  const date = new Date(timestamp === null ? state.state : timestamp * 1000);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

export function presenceStatus(state, holdMinutes = 0, now = Date.now()) {
  if (!available(state) || !['on', 'off'].includes(state.state)) return { label: 'Unavailable', active: false, detail: 'Presence unavailable' };
  const duration = relativeTime(state.last_changed, now);
  if (state.state === 'on') return { label: 'Occupied', active: true, detail: `Occupied · ${duration}` };
  const changed = Date.parse(state.last_changed);
  if (holdMinutes > 0 && Number.isFinite(changed) && now >= changed && now - changed < holdMinutes * 60000) return { label: 'Recent activity', active: true, detail: `Sensor cleared · ${duration}` };
  return { label: 'Clear', active: false, detail: `Clear · ${duration}` };
}

export function areaEntityIds(hass, area) {
  if (!area) return [];
  return Object.values(hass?.entities || {}).filter(entry => {
    const assignedArea = entry.area_id || hass?.devices?.[entry.device_id]?.area_id;
    return assignedArea === area && hass?.states?.[entry.entity_id] && !entry.hidden && !entry.hidden_by && !entry.disabled_by && !entry.entity_category;
  }).map(entry => entry.entity_id).sort();
}

export function areaSuggestions(hass, area) {
  const ids = areaEntityIds(hass, area);
  const matches = (domain, classes) => ids.filter(id => domainOf(id) === domain && (!classes || classes.includes(hass.states[id].attributes?.device_class)));
  const unique = values => values.length === 1 ? values[0] : undefined;
  const climate = unique(matches('climate'));
  const occupancy = matches('binary_sensor', ['occupancy', 'presence']);
  return {
    climate, temperature: climate ? undefined : unique(matches('sensor', ['temperature'])), humidity: unique(matches('sensor', ['humidity'])),
    presence: unique(occupancy.length ? occupancy : matches('binary_sensor', ['motion'])),
    lights: matches('light').slice(0, 5), scenes: matches('scene'), devices: ids.filter(id => LISTS.devices.includes(domainOf(id))), automations: matches('automation'),
    windows: matches('binary_sensor', ['window']), doors: matches('binary_sensor', ['door', 'garage_door']),
  };
}
