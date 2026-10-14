// Deliberately local mocks; no tokens, external APIs or physical devices.
const iconPaths = {
  lightbulb:'M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0l-1 2H9z',
  thermostat:'M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0ZM12 8v10',
  window:'M3 3h18v18H3zM12 3v18M3 12h18', door:'M5 21V3h14v18M3 21h18M15 12h.1',
  water:'M12 2C9 7 5 10 5 15a7 7 0 0 0 14 0c0-5-4-8-7-13Z', lightning:'m13 2-9 12h7l-1 8 10-13h-7z',
  home:'m3 10 9-7 9 7v10H3zM9 20v-7h6v7', plug:'M8 3v5m8-5v5M6 8h12v3a6 6 0 0 1-12 0ZM12 17v5',
  palette:'M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h6a3 3 0 0 0 3-3c0-4-4-7-9-7ZM7 8h.1M12 6h.1M17 8h.1',
  fire:'M12 2c1 5 6 7 6 12a6 6 0 0 1-12 0c0-3 2-6 3-7 0 3 1 4 2 4 2-3 1-5 1-9Z',
  information:'M12 10v7m0-10v.1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  fan:'M10 10C3 4 10 0 13 4l-1 6m2 1c8-3 8 5 3 6l-4-3m-3 0c-1 9-8 5-7 1l7-3',
};
customElements.define('ha-icon', class extends HTMLElement {
  set icon(value) { const key = Object.keys(iconPaths).find(name => value.includes(name)) || 'home'; this.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPaths[key]}"/></svg>`; }
});
let formCounter = 0;
class MockForm extends HTMLElement {
  set hass(value) { this._hass = value; this._schedule(); }
  set schema(value) { this._schema = value; this._schedule(); }
  set data(value) { this._data = value; this._schedule(); }
  set computeLabel(value) { this._label = value; this._schedule(); }
  connectedCallback() { this._schedule(); }
  _schedule() { if (this._queued) return; this._queued = true; queueMicrotask(() => { this._queued = false; this._render(); }); }
  _render() {
    if (!this._schema || !this._data || !this._hass) return;
    this.replaceChildren();
    for (const field of this._schema) {
      const label = document.createElement('label'); label.className = 'mock-field';
      const caption = document.createElement('span'); caption.textContent = this._label?.(field) || field.name; label.append(caption);
      const selector = field.selector;
      let input;
      if (selector.entity || selector.area) {
        input = document.createElement('select'); input.multiple = !!selector.entity?.multiple;
        if (!input.multiple) { const none = document.createElement('option'); none.value = ''; none.textContent = 'None'; input.append(none); }
        if (selector.area) {
          for (const [id, area] of Object.entries(this._hass.areas || {})) {const option=document.createElement('option');option.value=id;option.textContent=area.name;option.selected=this._data[field.name]===id;input.append(option);}
        } else {
        const filters = Array.isArray(selector.entity.filter) ? selector.entity.filter : [selector.entity.filter || { domain: selector.entity.domain || [] }];
        for (const [id, state] of Object.entries(this._hass.states)) if ((!selector.entity.include_entities || selector.entity.include_entities.includes(id)) && !selector.entity.exclude_entities?.includes(id) && filters.some(filter => { const domains = [filter.domain || []].flat(); const classes = [filter.device_class || []].flat(); return (!domains.length || domains.includes(id.split('.')[0])) && (!classes.length || classes.includes(state.attributes.device_class)); })) {
          const option = document.createElement('option'); option.value = id; option.textContent = `${state.attributes.friendly_name || id} (${id})`; option.selected = input.multiple ? (this._data[field.name] || []).includes(id) : this._data[field.name] === id; input.append(option);
        }
        }
      } else {
        input = document.createElement('input'); input.type = selector.boolean ? 'checkbox' : selector.number ? 'number' : 'text';
        if (selector.boolean) input.checked = !!this._data[field.name];
        else input.value = this._data[field.name] ?? '';
        if (selector.number) { input.min = selector.number.min; input.max = selector.number.max; input.step = selector.number.step; }
      }
      input.id = `mock-${++formCounter}`; input.setAttribute('aria-label', caption.textContent);
      input.addEventListener('change', () => {
        const value = input.multiple ? [...input.selectedOptions].map(option => option.value) : input.type === 'checkbox' ? input.checked : input.type === 'number' ? input.value === '' ? undefined : Number(input.value) : input.value;
        this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { ...this._data, [field.name]: value } }, bubbles: true, composed: true }));
      }); label.append(input); this.append(label);
    }
  }
}
window.loadCardHelpers = async () => ({ createCardElement: () => ({ constructor: { getConfigElement: async () => { if (!customElements.get('ha-form')) customElements.define('ha-form', MockForm); } } }) });
await import('/dist/ha-room-card.js');
const states = {};
const add = (id, value, attrs = {}, minutes = 8) => { states[id] = { entity_id: id, state: value, attributes: attrs, last_changed: new Date(Date.now() - minutes * 60000).toISOString(), last_updated: new Date().toISOString() }; };
const configs = ['Living room', 'Kitchen', 'Bedroom', 'Office', 'Bathroom'].map((name,index) => {
  const slug = name.toLowerCase().replaceAll(' ','_');
  add(`climate.${slug}`, 'heat', { friendly_name: `${name} thermostat`, unit_of_measurement: '°C', current_temperature: [21.4,20.8,19.2,21.1,22.6][index], temperature: [22,20.5,19,21.5,23][index], hvac_action: index === 0 || index > 2 ? 'heating' : 'idle', min_temp: 7, max_temp: 30, target_temp_step: 0.5, supported_features: 1 });
  add(`sensor.${slug}_humidity`, String([46,51,44,42,64][index]), { unit_of_measurement:'%', device_class:'humidity' });
  add(`binary_sensor.${slug}_presence`, index === 0 || index === 3 ? 'on' : 'off', { device_class:'occupancy' }, index * 12);
  add(`binary_sensor.${slug}_window`, index === 0 ? 'on' : 'off', { friendly_name:'Window', device_class:'window' }, index ? 42 + index * 13 : 8);
  add(`binary_sensor.${slug}_door`, index === 3 ? 'on' : 'off', { friendly_name:'Door', device_class:'door' }, index === 3 ? 4 : 65);
  const lightNames = ['Ceiling','Sofa','Shelf','Reading','Accent'].slice(0,[5,3,2,4,1][index]);
  const lights = lightNames.map((label,i) => { const id=`light.${slug}_${i}`; add(id, (index===0&&[0,1,4].includes(i))||index===3||index===1&&i===0 ? 'on':'off', { friendly_name:label, supported_color_modes:i===2?['onoff']:['brightness'], brightness:179 }); return id; });
  const scenes=['Relax','Bright'].map(label=>{const id=`scene.${slug}_${label.toLowerCase()}`;add(id,'2026-10-13T18:00:00Z',{friendly_name:label});return id;});
  const devices=['Outlet','Fan'].slice(0,index===0?2:1).map((label,i)=>{const id=`${i?'fan':'switch'}.${slug}`;add(id,index===0?'on':'off',{friendly_name:label});return id;});
  const automations=['Presence','Schedule'].map((label,i)=>{const id=`automation.${slug}_${i}`;add(id,index===2&&i?'off':'on',{friendly_name:label});return id;});
  return { type:'custom:ha-room-card',name,subtitle:index<2?'Ground floor':'First floor',compact:true,climate:`climate.${slug}`,humidity:`sensor.${slug}_humidity`,presence:`binary_sensor.${slug}_presence`,windows:[`binary_sensor.${slug}_window`],doors:[`binary_sensor.${slug}_door`],lights,scenes,devices,automations };
});
let failNext=false;
const cards=[];
const hass={states,locale:{language:'en'},config:{unit_system:{temperature:'°C'}},services:Object.fromEntries(['light','switch','fan','automation','scene','climate'].map(domain=>[domain,{turn_on:{},turn_off:{},set_temperature:{}}])),callService:async(domain,service,data)=>{
  document.querySelector('#service-log').textContent=`${domain}.${service} ${JSON.stringify(data)}`;
  await new Promise(resolve=>setTimeout(resolve,120));
  if(failNext){failNext=false;throw new Error('Simulated backend failure. State unchanged.');}
  for(const id of [data.entity_id].flat()){
    const current=states[id];if(!current)throw new Error('Unknown entity');
    if(domain==='climate')states[id]={...current,attributes:{...current.attributes,temperature:data.temperature}};
    else if(domain==='scene')states[id]={...current,state:new Date().toISOString()};
    else states[id]={...current,state:service==='turn_on'?'on':'off',attributes:{...current.attributes,...(data.brightness_pct!==undefined?{brightness:Math.round(data.brightness_pct*255/100)}:{})},last_changed:new Date().toISOString()};
  }
  refresh();
}};
hass.areas={};hass.devices={};hass.entities={};
configs.forEach(config=>{const area=config.name.toLowerCase().replaceAll(' ','_');config.area=area;hass.areas[area]={area_id:area,name:config.name};hass.devices[area]={id:area,area_id:area};[config.climate,config.humidity,config.presence,...config.windows,...config.doors,...config.lights,...config.scenes,...config.devices,...config.automations].forEach(id=>{hass.entities[id]={entity_id:id,device_id:area};});});
function refresh(){cards.forEach(card=>{card.hass=hass;});if(editor)editor.hass=hass;}
let editor;
configs.forEach(config=>{const card=document.createElement('ha-room-card');card.setConfig(config);card.hass=hass;cards.push(card);document.querySelector('#rooms').append(card);});
document.querySelector('#edit').addEventListener('click',async()=>{
  if(!editor){editor=await customElements.get('ha-room-card').getConfigElement();editor.setConfig(configs[0]);editor.hass=hass;editor.addEventListener('config-changed',event=>{try{cards[0].setConfig(event.detail.config);configs[0]=event.detail.config;}catch(error){document.querySelector('#service-log').textContent=error.message;}});document.querySelector('#editor-host').append(editor);}
  document.querySelector('#editor-dialog').showModal();
});
document.querySelector('#close-editor').onclick=()=>document.querySelector('#editor-dialog').close();
document.querySelector('#theme').onclick=event=>{const dark=document.body.classList.toggle('dark');event.target.textContent=dark?'Light theme':'Dark theme';};
document.querySelector('#layout').onclick=event=>{const compact=!configs[0].compact;configs.forEach((config,i)=>{config.compact=compact;cards[i].setConfig(config);});if(editor)editor.setConfig(configs[0]);event.target.textContent=compact?'Standard layout':'Compact layout';};
document.querySelector('#fail').onclick=()=>{failNext=true;document.querySelector('#service-log').textContent='Next command will fail.';};
document.querySelector('#offline').onclick=()=>{const id='light.living_room_0';states[id]={...states[id],state:states[id].state==='unavailable'?'on':'unavailable'};refresh();};
document.querySelector('#window').onclick=()=>{const id='binary_sensor.living_room_window';states[id]={...states[id],state:states[id].state==='on'?'off':'on',last_changed:new Date().toISOString()};refresh();};
document.addEventListener('hass-more-info',event=>{const state=states[event.detail.entityId];document.querySelector('#info-title').textContent=state?.attributes.friendly_name||event.detail.entityId;document.querySelector('#info-content').textContent=JSON.stringify(state,null,2);document.querySelector('#info-dialog').showModal();});
document.querySelector('#close-info').onclick=()=>document.querySelector('#info-dialog').close();

document.querySelector('#heating-state').onchange=event=>{const value=event.target.value;const id='climate.living_room';states[id]={...states[id],state:['off','unavailable'].includes(value)?value:'heat',attributes:{...states[id].attributes,hvac_action:value}};refresh();};
