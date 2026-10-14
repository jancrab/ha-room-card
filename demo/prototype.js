import { elapsedSince, contactStatus } from './prototype-model.js';
const paths = {
  window: '<path d="M3 3h18v18H3zM12 3v18M3 12h18M9 8v1m6-1v1"/>',
  door: '<path d="M5 21V3h14v18M3 21h18M15 12h.1"/>',
  droplet: '<path d="M12 2C9 7 5 10 5 15a7 7 0 0 0 14 0c0-5-4-8-7-13Z"/>',
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
  room.humidity = [46, 51, 44, 42, 64][index];
  room.hvac = ['heating', 'idle', 'idle', 'heating', 'heating'][index];
  room.contacts = [
    { name: index === 0 ? 'Balcony window' : 'Window', type: 'window', open: index === 0, changed: Date.now() - [8, 42, 155, 70, 23][index] * 60000 },
    { name: 'Door', type: 'door', open: index === 3, changed: Date.now() - [65, 12, 110, 4, 34][index] * 60000 },
  ];
  room.lights.forEach(item => { item.brightness = item.on ? 70 : 0; item.available = true; });
  room.automations = [
    device(['Presence lighting', 'Counter auto-off', 'Night routine', 'Workday comfort', 'Mirror auto-off'][index], true, 'automation'),
    device('Heating schedule', index !== 2, 'automation'),
  ];
});
let rooms = structuredClone(initial);
const sectionNames = { thermostat: 'Thermostat', humidity: 'Humidity', contacts: 'Window & door contacts', presence: 'Presence & last activity', lights: 'Lights', scenes: 'Scenes', devices: 'Devices & switches', automations: 'Automations' };
const storageKey = 'ha-room-prototype-settings-v1';
const defaults = () => ({ compact: true, rooms: initial.map(() => ({ sections: Object.fromEntries(Object.keys(sectionNames).map(key => [key, true])), hidden: { contacts: [], lights: [], scenes: [], devices: [], automations: [] } })) });
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
    const heating = room.hvac === 'heating';
    const enabled = preferences.rooms[index].sections;
    const lights = visibleItems(room, index, 'lights');
    const scenes = visibleItems(room, index, 'scenes');
    const devices = visibleItems(room, index, 'devices');
    const automations = visibleItems(room, index, 'automations');
    const contacts = visibleItems(room, index, 'contacts');
    const windowOpen = enabled.contacts && contacts.some(({ item }) => item.type === 'window' && item.open === true);
    const hasVisibleContent = enabled.presence || enabled.thermostat || enabled.humidity || (enabled.contacts && contacts.length) || (enabled.lights && lights.length) || (enabled.scenes && scenes.length) || (enabled.devices && devices.length) || (enabled.automations && automations.length);
    return `<article class="room-card" data-room="${index}" aria-label="${room.name}">
      <header class="card-heading"><span class="room-symbol">${icon(room.icon)}</span><div class="room-title"><h3><button class="room-link" data-action="details" aria-label="Open ${room.name} details">${room.name}<span aria-hidden="true">↗</span></button></h3><p>${room.floor}</p></div>${enabled.presence ? `<span class="presence ${room.presence ? 'occupied' : ''}" title="${room.activity}">${icon('person')}${room.presence ? 'Occupied' : 'Clear'}</span>` : ''}<button class="card-settings" data-action="settings" aria-label="Configure ${room.name}">${icon('settings')}</button></header>
      <div class="room-meta">${enabled.presence ? `<span class="last-activity">${room.activity}</span>` : ''}${enabled.humidity ? `<span class="humidity" aria-label="Humidity ${room.humidity} percent">${icon('droplet')}${room.humidity}%</span>` : ''}</div>
      ${enabled.contacts && contacts.length ? `<div class="contacts" aria-label="Window and door status">${contacts.map(({ item, itemIndex }) => `<span class="contact ${item.open === true ? 'open' : item.open === false ? '' : 'unavailable'}" title="${item.name}: ${contactStatus(item)} · Last change ${new Date(item.changed).toLocaleString('en-GB')}">${icon(item.type)}<span>${item.type === 'window' ? 'Window' : 'Door'} <strong>${contactStatus(item).toLowerCase()}</strong></span><time data-contact="${index}:${itemIndex}" datetime="${new Date(item.changed).toISOString()}">${elapsedSince(item.changed)}</time></span>`).join('')}</div>` : ''}
      ${enabled.thermostat ? `<div class="thermostat"><div><div class="temperature" aria-label="Current temperature ${format(room.current)} degrees Celsius">${format(room.current)}<small>°C</small></div><div class="heat-status ${heating ? 'heating' : ''}">${icon(heating ? 'flame' : 'leaf')}${heating ? (windowOpen ? 'Heating · window open' : 'Heating') : 'Idle'}</div></div><div class="setpoint"><button data-action="temperature" data-delta="-0.5" aria-label="Decrease ${room.name} target by 0.5 degrees Celsius">−</button><div class="setpoint-center"><span>SET TO</span><strong aria-live="polite">${format(room.target)}°</strong></div><button data-action="temperature" data-delta="0.5" aria-label="Increase ${room.name} target by 0.5 degrees Celsius">+</button></div></div>` : ''}
      ${enabled.lights && lights.length ? `<section class="control-section" aria-label="Lights"><div class="control-label"><span>Lights · ${lights.filter(({ item }) => item.available && item.on).length}/${lights.length}${lights.some(({ item }) => !item.available) ? ' · offline' : ''}</span><button class="all-off" data-action="all-off" aria-label="Turn all ${room.name} lights off" ${room.lights.some(item => item.on && item.available) ? '' : 'disabled'}>All off</button></div><div class="lights" style="--lights:${lights.length}">${lights.map(({ item, itemIndex }) => `<button class="light ${!item.available ? 'unavailable' : item.on ? 'on' : ''}" aria-disabled="${!item.available}" data-action="light" data-index="${itemIndex}" aria-label="${item.name} light in ${room.name}" title="${item.name} · ${!item.available ? 'Unavailable' : item.on ? 'On' : 'Off'}" aria-pressed="${item.on}">${icon(item.type)}<span>${!item.available ? 'Offline' : item.name}</span></button>`).join('')}</div></section>` : ''}
      <div class="secondary-controls">${enabled.scenes && scenes.length ? `<section class="scene-section" aria-label="Scenes"><div class="control-label"><span>Scenes</span></div><div class="icon-controls scenes" style="--controls:${scenes.length}">${scenes.map(({ item: [name, symbol], itemIndex }) => `<button class="light state-icon ${room.scene === itemIndex ? 'on' : ''}" data-action="scene" data-index="${itemIndex}"  title="${name} · ${room.scene === itemIndex ? 'Activated' : 'Activate scene'}" aria-label="${name} scene in ${room.name}">${icon(symbol)}<span>${name}</span></button>`).join('')}</div></section>` : ''}
      ${enabled.devices && devices.length ? `<section class="devices-section" aria-label="Devices and switches"><div class="control-label"><span>Devices</span></div><div class="icon-controls devices" style="--controls:${devices.length}">${devices.map(({ item, itemIndex }) => `<button class="light state-icon ${item.on ? 'on' : ''}" data-action="device" data-index="${itemIndex}" aria-pressed="${item.on}" aria-label="${item.name} in ${room.name}" title="${item.name} · ${item.on ? 'On' : 'Off'}">${icon(item.name === 'TV outlet' ? 'movie' : item.name === 'Monitor' ? 'desk' : item.name === 'Coffee machine' ? 'coffee' : item.name === 'Towel warmer' ? 'towel' : item.type)}<span>${item.name}</span></button>`).join('')}</div></section>` : ''}
      ${enabled.automations && automations.length ? `<section class="automations-section" aria-label="Automations"><div class="control-label"><span>Automations</span><span>${automations.filter(({ item }) => item.on).length} enabled</span></div><div class="icon-controls automations" style="--controls:${automations.length}">${automations.map(({ item, itemIndex }) => `<button class="light state-icon ${item.on ? 'on' : ''}" data-action="automation" data-index="${itemIndex}" aria-pressed="${item.on}" aria-label="${item.name} automation in ${room.name}" title="${item.name} · ${item.on ? 'Enabled' : 'Disabled'}">${icon(item.name === 'Heating schedule' ? 'thermometer' : 'automation')}<span>${item.name === 'Heating schedule' ? 'Schedule' : item.name.replace(' lighting', '').replace(' auto-off', '').replace(' comfort', '')}</span></button>`).join('')}</div></section>` : ''}
      </div>${!hasVisibleContent ? '<p class="empty-card">No controls selected. Choose what appears in room settings.</p>' : ''}
    </article>`;
  }).join('') + `<aside class="room-note">${icon('home')}<div><strong>Every room. One rhythm.</strong><p>From a single bedside light to the whole living room. A little space for everything.</p></div></aside>`;
  document.querySelector('#average').textContent = `${format(rooms.reduce((sum, room) => sum + room.current, 0) / rooms.length)} °C`;
  document.querySelector('#active-count').textContent = `${rooms.filter(room => room.presence).length} rooms occupied`;
}
root.addEventListener('click', async event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const roomIndex = Number(button.closest('[data-room]').dataset.room);
  const room = rooms[roomIndex];
  const index = Number(button.dataset.index);
  const action = button.dataset.action;
  if (action === 'settings') { openSettings(roomIndex); return; }
  if (action === 'details') { openDetails(roomIndex); return; }
  if (button.getAttribute('aria-disabled') === 'true' || button.getAttribute('aria-busy') === 'true') return;
  button.setAttribute('aria-busy', 'true');
  await new Promise(resolve => setTimeout(resolve, 160));
  if (room.failNext) {
    room.failNext = false;
    button.removeAttribute('aria-busy');
    notify(`${room.name} · Command failed. State unchanged. Please try again.`);
    return;
  }
  if (action === 'all-off') {
    room.lights.filter(item => item.available).forEach(item => { item.on = false; item.brightness = 0; });
    notify(`${room.name} · ${room.lights.some(item => !item.available) ? 'Available lights off · Some lights unreachable' : 'All lights off'}`);
  }
  if (action === 'temperature') {
    room.target = Math.min(30, Math.max(5, room.target + Number(button.dataset.delta)));
    notify(`${room.name} · Set to ${format(room.target)} °C`);
  } else if (action === 'light') {
    if (!room.lights[index].available) { notify('Light unavailable'); return; }
    room.lights[index].on = !room.lights[index].on;
    room.lights[index].brightness = room.lights[index].on ? 70 : 0;
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
    room.lights.filter(item => item.available).forEach((item, position) => { item.on = bright || position === 0; item.brightness = item.on ? (bright ? 100 : 35) : 0; });
    notify(`${room.name} · ${sceneName} scene activated`);
    setTimeout(() => {
      if (room.scene === index) {
        room.scene = undefined;
        root.querySelectorAll(`[data-room="${roomIndex}"] [data-action="scene"]`).forEach(element => { element.classList.remove('on'); element.title = `${room.scenes[Number(element.dataset.index)][0]} · Activate scene`; });
      }
    }, 1400);
  }
  const delta = button.dataset.delta;
  render();
  // Preserve keyboard focus when replacing simulated state.
  const selector = delta ? `[data-delta="${delta}"]` : button.dataset.index !== undefined ? `[data-index="${index}"]` : '';
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

const details = document.querySelector('#room-details');
let detailRoom = 0;
function renderDetails() {
  const room = rooms[detailRoom];
  document.querySelector('#details-title').textContent = room.name;
  document.querySelector('#details-content').innerHTML = `
    <div class="detail-summary"><strong>${format(room.current)} °C</strong><span>Target ${format(room.target)} °C · Humidity ${room.humidity}%</span></div>
    <section class="detail-section"><h3>Window & door contacts</h3>${room.contacts.map((contact, index) => `<div class="detail-contact ${contact.open === true ? 'open' : ''}">${icon(contact.type)}<div><strong>${contact.name}</strong><span>${contactStatus(contact)} · ${elapsedSince(contact.changed)}${contact.open === null ? ' since last update' : ''}</span></div><time datetime="${new Date(contact.changed).toISOString()}">${new Date(contact.changed).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</time></div>`).join('')}</section>
    <section class="detail-section"><h3>Lighting</h3>${room.lights.map((item, index) => `<label class="dimmer"><span>${item.name}${!item.available ? ' · Unavailable' : ''}</span><output id="brightness-${index}">${item.brightness}%</output><input type="range" min="0" max="100" step="5" value="${item.brightness}" data-brightness="${index}" aria-label="${item.name} brightness" ${!item.available ? 'disabled' : ''}></label>`).join('')}</section>
    <section class="detail-section"><div class="chart-label"><h3>Temperature</h3><span>Illustrative demo · 6 hours</span></div><svg class="temperature-chart" viewBox="0 0 320 60" aria-label="Illustrative simulated temperature history; not measured data" role="img"><path d="M0 46 30 43 60 47 90 35 120 37 150 28 180 33 210 21 240 23 270 15 300 19 320 13"/></svg></section>
    <details class="demo-tools"><summary>Simulate sensor & service changes</summary><p>Preview only. Contacts are read-only on the room cards.</p>${room.contacts.map((contact,index) => `<label class="item-option"><input type="checkbox" data-demo-contact="${index}" ${contact.open === true ? 'checked' : ''}>${contact.name} open</label>`).join('')}<label class="item-option"><input type="checkbox" id="demo-offline" ${!room.lights[0].available ? 'checked' : ''}>First light unreachable</label><label class="item-option"><input type="checkbox" id="demo-failure" ${room.failNext ? 'checked' : ''}>Fail the next card command</label></details>`;
}
function openDetails(index) { detailRoom = index; renderDetails(); details.showModal(); }
document.querySelector('#close-details').addEventListener('click', () => details.close());
document.querySelector('#details-content').addEventListener('input', event => {
  if (event.target.dataset.brightness === undefined) return;
  const index = Number(event.target.dataset.brightness);
  const item = rooms[detailRoom].lights[index];
  if (!item.available) return;
  item.brightness = Number(event.target.value);
  item.on = item.brightness > 0;
  rooms[detailRoom].scene = undefined;
  document.querySelector(`#brightness-${index}`).textContent = `${item.brightness}%`;
  render();
});
document.querySelector('#details-content').addEventListener('change', event => {
  const room = rooms[detailRoom];
  if (event.target.dataset.demoContact !== undefined) {
    const contact = room.contacts[Number(event.target.dataset.demoContact)];
    contact.open = event.target.checked;
    contact.changed = Date.now();
    render();
    const row = document.querySelectorAll('.detail-contact')[Number(event.target.dataset.demoContact)];
    row.classList.toggle('open', contact.open);
    row.querySelector('div>span').textContent = `${contactStatus(contact)} · just now`;
    row.querySelector('time').textContent = new Date(contact.changed).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    row.querySelector('time').dateTime = new Date(contact.changed).toISOString();
  } else if (event.target.id === 'demo-offline') { room.lights[0].available = !event.target.checked; render(); }
  else if (event.target.id === 'demo-failure') room.failNext = event.target.checked;
});
setInterval(() => {
  document.querySelectorAll('[data-contact]').forEach(element => {
    const [roomIndex, contactIndex] = element.dataset.contact.split(':').map(Number);
    element.textContent = elapsedSince(rooms[roomIndex].contacts[contactIndex].changed);
  });
  if (details.open) document.querySelectorAll('.detail-contact').forEach((row, index) => {
    const contact = rooms[detailRoom].contacts[index];
    row.querySelector('div>span').textContent = `${contactStatus(contact)} · ${elapsedSince(contact.changed)}${contact.open === null ? ' since last update' : ''}`;
  });
}, 30000);
details.addEventListener('close', () => root.querySelector(`[data-room="${detailRoom}"] [data-action="details"]`)?.focus({ preventScroll: true }));
settings.addEventListener('close', () => root.querySelector(`[data-room="${roomSelect.value}"] [data-action="settings"]`)?.focus({ preventScroll: true }));
render();
