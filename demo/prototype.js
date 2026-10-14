const paths = {
  coffee: '<path d="M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM16 9h2a3 3 0 0 1 0 6h-2M7 3v2m4-2v2M3 22h15"/>',
  towel: '<path d="M4 3h16v18H4zM4 7h16M8 7v10h8V7M8 14h8"/>',
  automation: '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
  settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>',
  home: '<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',
  sofa: '<path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M5 10H4a2 2 0 0 0-2 2v6h20v-6a2 2 0 0 0-2-2h-1v5H5zM5 18v2m14-2v2"/>',
  bed: '<path d="M3 18V7m18 11V7M3 15h18M3 10h18v8M6 10V6h5v4m2 0V6h5v4M3 18v2m18-2v2"/>',
  desk: '<path d="M3 12h18M5 12v8m14-8v8M7 4h10v6H7zM12 10v2"/>',
  kitchen: '<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M18 3c-4 3-4 9 0 9h1M19 3v18"/>',
  bath: '<path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM5 12V5a2 2 0 0 1 4 0M6 20v1m12-1v1M8 7h3"/>',
  bulb: '<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/>',
  pendant: '<path d="M12 2v6M8 8h8l4 9H4zM10 20h4"/>',
  lamp: '<path d="M8 3h8l3 11H5zM12 14v7m-4 0h8"/>',
  strip: '<path d="M4 8h16v8H4zM7 12h.1m5 0h.1m5 0h.1"/>',
  person: '<circle cx="12" cy="5" r="2"/><path d="M8 21v-7l-3-3 4-3h6l4 3-3 3v7M9 8l3 5 3-5M12 13v8"/>',
  thermometer: '<path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z M12 8v9"/><circle cx="12" cy="18" r="1"/>',
  flame: '<path d="M12 2c1 5 6 7 6 12a6 6 0 0 1-12 0c0-3 2-6 3-7 0 3 1 4 2 4 2-3 1-5 1-9Z"/>',
  leaf: '<path d="M20 3C8 2 2 9 6 16s15 1 14-13ZM5 21 16 10"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  moon: '<path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z"/>',
  movie: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="m10 8 5 3-5 3zM8 21h8"/>',
  plug: '<path d="M8 3v5m8-5v5M6 8h12v3a6 6 0 0 1-12 0ZM12 17v5"/>',
  fan: '<circle cx="12" cy="12" r="2"/><path d="M10 10C3 4 10 0 13 4l-1 6m2 1c8-3 8 5 3 6l-4-3m-3 0c-1 9-8 5-7 1l7-3"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.bulb}</svg>`;
const light = (name, on, type = 'bulb') => ({ name, on, type });
const device = (name, on, type = 'plug') => ({ name, on, type });
const initial = [
  { name: 'Living room', icon: 'sofa', floor: 'Ground floor', current: 21.4, target: 22, presence: true, activity: 'Activity just now', lights: [light('Ceiling', true, 'pendant'), light('Sofa', true, 'lamp'), light('Shelf', false, 'strip'), light('Reading', false, 'lamp'), light('Accent', true)], scenes: [['Relax', 'leaf'], ['Movie', 'movie'], ['Bright', 'sun']], devices: [device('Air purifier', true, 'fan'), device('TV outlet', false)] },
  { name: 'Kitchen', icon: 'kitchen', floor: 'Ground floor', current: 20.8, target: 20.5, presence: false, activity: 'Last activity 12 min ago', lights: [light('Counter', true, 'strip'), light('Island', false, 'pendant'), light('Dining', false, 'pendant')], scenes: [['Cooking', 'kitchen'], ['Dinner', 'moon'], ['Bright', 'sun']], devices: [device('Coffee machine', false)] },
  { name: 'Bedroom', icon: 'bed', floor: 'First floor', current: 19.2, target: 19, presence: false, activity: 'Last activity 2 hours ago', lights: [light('Ceiling', false, 'pendant'), light('Bedside', false, 'lamp')], scenes: [['Reading', 'lamp'], ['Wind down', 'moon']], devices: [device('Fan', false, 'fan')] },
  { name: 'Office', icon: 'desk', floor: 'First floor', current: 21.1, target: 21.5, presence: true, activity: 'Activity just now', lights: [light('Ceiling', true, 'pendant'), light('Desk', true, 'lamp'), light('Monitor', true, 'strip'), light('Shelf', false)], scenes: [['Focus', 'desk'], ['Soft light', 'leaf']], devices: [device('Monitor', true), device('Desk outlet', true)] },
  { name: 'Bathroom', icon: 'bath', floor: 'First floor', current: 22.6, target: 23, presence: false, activity: 'Last activity 34 min ago', lights: [light('Mirror', false, 'strip')], scenes: [['Morning', 'sun'], ['Evening', 'moon']], devices: [device('Towel warmer', true)] },
];
initial.forEach((room, index) => {
  room.automations = [
    device(['Presence lighting', 'Counter auto-off', 'Night routine', 'Workday comfort', 'Mirror auto-off'][index], true, 'automation'),
    device('Heating schedule', index !== 2, 'automation'),
  ];
});
let rooms = structuredClone(initial);
const sectionNames = { thermostat: 'Thermostat', presence: 'Presence & last activity', lights: 'Lights', scenes: 'Scenes', devices: 'Devices & switches', automations: 'Automations' };
const storageKey = 'ha-room-prototype-settings-v1';
const defaults = () => ({ compact: false, rooms: initial.map(() => ({ sections: Object.fromEntries(Object.keys(sectionNames).map(key => [key, true])), hidden: { lights: [], scenes: [], devices: [], automations: [] } })) });
let preferences = defaults();
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved) {
    preferences.compact = saved.compact === true;
    preferences.rooms.forEach((room, index) => {
      for (const section of Object.keys(sectionNames)) {
        if (typeof saved.rooms?.[index]?.sections?.[section] === 'boolean') room.sections[section] = saved.rooms[index].sections[section];
      }
      for (const section of Object.keys(room.hidden)) {
        const list = saved.rooms?.[index]?.hidden?.[section];
        if (Array.isArray(list)) room.hidden[section] = list.filter(value => Number.isInteger(value) && value >= 0 && value < initial[index][section].length);
      }
    });
  }
} catch { /* Storage may be unavailable or contain an older, incompatible draft. */ }
function savePreferences() {
  try { localStorage.setItem(storageKey, JSON.stringify(preferences)); document.querySelector('#save-status').textContent = 'Saved in this browser'; }
  catch { document.querySelector('#save-status').textContent = 'Applied for this session · Browser storage unavailable'; }
}
const visibleItems = (room, index, section) => room[section].map((item, itemIndex) => ({ item, itemIndex })).filter(({ itemIndex }) => !preferences.rooms[index].hidden[section].includes(itemIndex));
let feedbackTimeout;
const root = document.querySelector('#rooms');
const format = number => number.toFixed(1);
function notify(message) {
  const feedback = document.querySelector('#feedback');
  feedback.textContent = message;
  feedback.classList.add('visible');
  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => feedback.classList.remove('visible'), 2600);
}
function render() {
  document.body.classList.toggle('compact', preferences.compact);
  document.querySelector('#compact').setAttribute('aria-pressed', String(preferences.compact));
  root.innerHTML = rooms.map((room, index) => {
    const heating = room.target > room.current;
    const enabled = preferences.rooms[index].sections;
    const lights = visibleItems(room, index, 'lights');
    const scenes = visibleItems(room, index, 'scenes');
    const devices = visibleItems(room, index, 'devices');
    const automations = visibleItems(room, index, 'automations');
    const hasVisibleContent = enabled.presence || enabled.thermostat || (enabled.lights && lights.length) || (enabled.scenes && scenes.length) || (enabled.devices && devices.length) || (enabled.automations && automations.length);
    return `<article class="room-card" data-room="${index}" aria-label="${room.name}">
      <header class="card-heading"><span class="room-symbol">${icon(room.icon)}</span><div class="room-title"><h3>${room.name}</h3><p>${room.floor}</p></div>${enabled.presence ? `<span class="presence ${room.presence ? 'occupied' : ''}">${icon('person')}${room.presence ? 'Occupied' : 'Clear'}</span>` : ''}<button class="card-settings" data-action="settings" aria-label="Configure ${room.name}">${icon('settings')}</button></header>
      ${enabled.presence ? `<div class="last-activity">${room.activity}</div>` : ''}
      ${enabled.thermostat ? `<div class="thermostat"><div><div class="temperature" aria-label="Current temperature ${format(room.current)} degrees Celsius">${format(room.current)}<small>°C</small></div><div class="heat-status ${heating ? 'heating' : ''}">${icon(heating ? 'flame' : 'leaf')}${heating ? 'Heating' : 'At temperature'}</div></div><div class="setpoint"><button data-action="temperature" data-delta="-0.5" aria-label="Decrease ${room.name} target by 0.5 degrees Celsius">−</button><div class="setpoint-center"><span>SET TO</span><strong aria-live="polite">${format(room.target)}°</strong></div><button data-action="temperature" data-delta="0.5" aria-label="Increase ${room.name} target by 0.5 degrees Celsius">+</button></div></div>` : ''}
      ${enabled.lights && lights.length ? `<section class="control-section" aria-label="Lights"><div class="control-label"><span>Lights</span><span>${lights.filter(({ item }) => item.on).length} of ${lights.length} on</span></div><div class="lights" style="--lights:${lights.length}">${lights.map(({ item, itemIndex }) => `<button class="light ${item.on ? 'on' : ''}" data-action="light" data-index="${itemIndex}" aria-label="${item.name} light in ${room.name}" title="${item.name} · ${item.on ? 'On' : 'Off'}" aria-pressed="${item.on}">${icon(item.type)}<span>${item.name}</span></button>`).join('')}</div></section>` : ''}
      ${enabled.scenes && scenes.length ? `<section class="scene-section" aria-label="Scenes"><div class="control-label"><span>Scenes</span></div><div class="icon-controls scenes" style="--controls:${scenes.length}">${scenes.map(({ item: [name, symbol], itemIndex }) => `<button class="light state-icon ${room.scene === itemIndex ? 'on' : ''}" data-action="scene" data-index="${itemIndex}" aria-pressed="${room.scene === itemIndex}" title="${name} · ${room.scene === itemIndex ? 'Last selected scene' : 'Activate scene'}" aria-label="${name} scene in ${room.name}">${icon(symbol)}<span>${name}</span></button>`).join('')}</div></section>` : ''}
      ${enabled.devices && devices.length ? `<section class="devices-section" aria-label="Devices and switches"><div class="control-label"><span>Devices</span></div><div class="icon-controls devices" style="--controls:${devices.length}">${devices.map(({ item, itemIndex }) => `<button class="light state-icon ${item.on ? 'on' : ''}" data-action="device" data-index="${itemIndex}" aria-pressed="${item.on}" aria-label="${item.name} in ${room.name}" title="${item.name} · ${item.on ? 'On' : 'Off'}">${icon(item.name === 'TV outlet' ? 'movie' : item.name === 'Monitor' ? 'desk' : item.name === 'Coffee machine' ? 'coffee' : item.name === 'Towel warmer' ? 'towel' : item.type)}<span>${item.name}</span></button>`).join('')}</div></section>` : ''}
      ${enabled.automations && automations.length ? `<section class="automations-section" aria-label="Automations"><div class="control-label"><span>Automations</span><span>${automations.filter(({ item }) => item.on).length} enabled</span></div><div class="icon-controls automations" style="--controls:${automations.length}">${automations.map(({ item, itemIndex }) => `<button class="light state-icon ${item.on ? 'on' : ''}" data-action="automation" data-index="${itemIndex}" aria-pressed="${item.on}" aria-label="${item.name} automation in ${room.name}" title="${item.name} · ${item.on ? 'Enabled' : 'Disabled'}">${icon(item.name === 'Heating schedule' ? 'thermometer' : 'automation')}<span>${item.name}</span></button>`).join('')}</div></section>` : ''}
      ${!hasVisibleContent ? '<p class="empty-card">No controls selected. Choose what appears in room settings.</p>' : ''}
    </article>`;
  }).join('') + `<aside class="room-note">${icon('home')}<div><strong>Every room. One rhythm.</strong><p>From a single bedside light to the whole living room. A little space for everything.</p></div></aside>`;
  document.querySelector('#average').textContent = `${format(rooms.reduce((sum, room) => sum + room.current, 0) / rooms.length)} °C`;
  document.querySelector('#active-count').textContent = `${rooms.filter(room => room.presence).length} rooms occupied`;
}
root.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const roomIndex = Number(button.closest('[data-room]').dataset.room);
  const room = rooms[roomIndex];
  const index = Number(button.dataset.index);
  const action = button.dataset.action;
  if (action === 'settings') { openSettings(roomIndex); return; }
  if (action === 'temperature') {
    room.target = Math.min(30, Math.max(5, room.target + Number(button.dataset.delta)));
    notify(`${room.name} · Set to ${format(room.target)} °C`);
  } else if (action === 'light') {
    room.lights[index].on = !room.lights[index].on;
    room.scene = undefined;
  } else if (action === 'device') {
    room.devices[index].on = !room.devices[index].on;
  } else if (action === 'automation') {
    room.automations[index].on = !room.automations[index].on;
    notify(`${room.name} · ${room.automations[index].name} ${room.automations[index].on ? 'enabled' : 'disabled'}`);
  } else if (action === 'scene') {
    room.scene = index;
    const sceneName = room.scenes[index][0];
    const bright = ['Bright', 'Cooking', 'Morning', 'Focus'].includes(sceneName);
    room.lights.forEach((item, position) => { item.on = bright || position === 0; });
    notify(`${room.name} · ${sceneName} scene activated`);
  }
  const delta = button.dataset.delta;
  render();
  // Preserve keyboard focus when replacing simulated state.
  const selector = delta ? `[data-delta="${delta}"]` : `[data-index="${index}"]`;
  root.querySelector(`[data-room="${roomIndex}"] [data-action="${action}"]${selector}`)?.focus({ preventScroll: true });
});
document.querySelector('#brand-icon').innerHTML = icon('home');
document.querySelector('#summary-icon').innerHTML = icon('thermometer');
const themeButton = document.querySelector('#theme');
themeButton.innerHTML = icon('moon');
themeButton.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeButton.innerHTML = icon(dark ? 'sun' : 'moon');
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
});
const settings = document.querySelector('#settings');
const roomSelect = document.querySelector('#settings-room');
roomSelect.innerHTML = rooms.map((room, index) => `<option value="${index}">${room.name}</option>`).join('');
function renderSettings() {
  const index = Number(roomSelect.value);
  const config = preferences.rooms[index];
  document.querySelector('#settings-content').innerHTML = Object.entries(sectionNames).map(([key, label]) => {
    const items = rooms[index][key];
    return `<section class="setting-section"><label class="setting-toggle"><span>${label}</span><input type="checkbox" data-section="${key}" ${config.sections[key] ? 'checked' : ''} aria-label="Show ${label}"><span class="setting-switch" aria-hidden="true"></span></label>${Array.isArray(items) ? `<fieldset ${config.sections[key] ? '' : 'disabled'}><legend class="sr-only">Visible ${label}</legend>${items.map((item, itemIndex) => `<label class="item-option"><input type="checkbox" data-section="${key}" data-item="${itemIndex}" ${config.hidden[key].includes(itemIndex) ? '' : 'checked'}><span>${Array.isArray(item) ? item[0] : item.name}</span></label>`).join('')}</fieldset>` : ''}</section>`;
  }).join('');
}
function openSettings(index = 0) {
  roomSelect.value = String(index);
  renderSettings();
  settings.showModal();
}
roomSelect.addEventListener('change', renderSettings);
document.querySelector('#settings-content').addEventListener('change', event => {
  const input = event.target.closest('input[data-section]');
  if (!input) return;
  const config = preferences.rooms[Number(roomSelect.value)];
  const section = input.dataset.section;
  if (input.dataset.item === undefined) {
    config.sections[section] = input.checked;
    const fieldset = input.closest('section').querySelector('fieldset');
    if (fieldset) fieldset.disabled = !input.checked;
  } else {
    const index = Number(input.dataset.item);
    config.hidden[section] = config.hidden[section].filter(item => item !== index);
    if (!input.checked) config.hidden[section].push(index);
  }
  savePreferences();
  render();
});
document.querySelector('#configure').addEventListener('click', () => openSettings());
document.querySelector('#close-settings').addEventListener('click', () => settings.close());
document.querySelector('#done-settings').addEventListener('click', () => settings.close());
document.querySelector('#compact').addEventListener('click', () => { preferences.compact = !preferences.compact; savePreferences(); render(); });
document.querySelector('#reset').addEventListener('click', () => { rooms = structuredClone(initial); preferences = defaults(); savePreferences(); render(); notify('Demo and room settings reset'); });
render();
