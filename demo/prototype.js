const paths = {
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
let rooms = structuredClone(initial);
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
  root.innerHTML = rooms.map((room, index) => {
    const heating = room.target > room.current;
    return `<article class="room-card" data-room="${index}" aria-label="${room.name}">
      <header class="card-heading"><span class="room-symbol">${icon(room.icon)}</span><div class="room-title"><h3>${room.name}</h3><p>${room.floor}</p></div><span class="presence ${room.presence ? 'occupied' : ''}">${icon('person')}${room.presence ? 'Occupied' : 'Clear'}</span></header>
      <div class="thermostat"><div><div class="temperature" aria-label="Current temperature ${format(room.current)} degrees Celsius">${format(room.current)}<small>°C</small></div><div class="heat-status ${heating ? 'heating' : ''}">${icon(heating ? 'flame' : 'leaf')}${heating ? 'Heating' : 'At temperature'}</div></div><div class="setpoint"><button data-action="temperature" data-delta="-0.5" aria-label="Decrease ${room.name} target by 0.5 degrees Celsius">−</button><div class="setpoint-center"><span>SET TO</span><strong aria-live="polite">${format(room.target)}°</strong></div><button data-action="temperature" data-delta="0.5" aria-label="Increase ${room.name} target by 0.5 degrees Celsius">+</button></div></div>
      <div class="control-section"><div class="control-label"><span>Lights</span><span>${room.lights.filter(item => item.on).length} of ${room.lights.length} on</span></div><div class="lights" style="--lights:${room.lights.length}">${room.lights.map((item, lightIndex) => `<button class="light ${item.on ? 'on' : ''}" data-action="light" data-index="${lightIndex}" aria-label="${item.name} light in ${room.name}" aria-pressed="${item.on}">${icon(item.type)}<span>${item.name}</span></button>`).join('')}</div></div>
      <div class="control-label"><span>Scenes</span><span>${room.activity}</span></div><div class="scenes">${room.scenes.map(([name, symbol], sceneIndex) => `<button class="scene" data-action="scene" data-index="${sceneIndex}" aria-pressed="${room.scene === sceneIndex}">${icon(symbol)}${name}</button>`).join('')}</div>
      <div class="devices">${room.devices.map((item, deviceIndex) => `<button class="device" data-action="device" data-index="${deviceIndex}" aria-pressed="${item.on}" aria-label="${item.name} in ${room.name}">${icon(item.type)}<span>${item.name}</span><span class="switch" aria-hidden="true"></span></button>`).join('')}</div>
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
  if (action === 'temperature') {
    room.target = Math.min(30, Math.max(5, room.target + Number(button.dataset.delta)));
    notify(`${room.name} · Set to ${format(room.target)} °C`);
  } else if (action === 'light') {
    room.lights[index].on = !room.lights[index].on;
    room.scene = undefined;
  } else if (action === 'device') {
    room.devices[index].on = !room.devices[index].on;
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
document.querySelector('#reset').addEventListener('click', () => { rooms = structuredClone(initial); render(); notify('Demo reset'); });
render();
