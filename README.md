# HA Room Card

Compact room dashboard concept for Home Assistant. The interactive visual prototype in `demo/` shows five rooms with current/target temperature, 0.5 °C adjustment buttons, one to five lights, scenes, presence/last activity and device toggles. Light and dark themes and responsive layouts are included. All prototype data and actions are simulated; reloading restores the example home.

Use **Compact** above the grid for a denser layout. **Configure rooms**, or the settings icon on a card, opens per-room visibility settings for the thermostat, presence/last activity, lights, scenes, devices and automations. Individual lights, scenes, devices and automations can also be included or hidden. Hiding a control preserves its simulated state; it does not switch the device off. Automation switches on the cards enable/disable example automations without running real schedules or Home Assistant actions. Visibility preferences and the compact layout are saved in this browser; **Reset demo** restores both the example home and default settings.

The installable `src/` and `dist/` card remains the initial entity-display starter. The room prototype is not yet connected to Home Assistant services or the configuration editor.

Lights, devices, scenes and automations share clickable icon tiles. Active lights use warm amber; enabled devices/automations and the last selected scene use green, with muted icons for inactive controls. Standard view includes captions; compact view uses icons with hover titles and accessible names. Scenes are actions: their highlight indicates the last selection, not a measured on/off state.

## Install with HACS

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=jancrab&repository=ha-room-card&category=plugin)

After the repository is published publicly, add it as a custom Dashboard repository in HACS, download the card and reload the browser. Check the module resource: `/hacsfiles/ha-room-card/ha-room-card.js`.

## Manual installation

Copy `dist/ha-room-card.js` to `/config/www/`. Register `/local/ha-room-card.js?v=0.1.0` as a JavaScript module under Settings > Dashboards > Resources, then reload. On updates replace the file and update the version query on the existing resource.

```yaml
type: custom:ha-room-card
entity: sensor.example
layout: compact # or wide
```

Choose the entity and layout in the visual editor. An optional name overrides friendly_name. Theme colors, card background, borders and typography use Home Assistant variables.

## Development

```sh
npm install
npm run check
npm run dev
```

Commit the generated package-lock.json and dist bundle. Later installs use npm ci. Open http://127.0.0.1:4173 for the interactive room prototype. Set the PORT environment variable if that port is occupied. Tests cover the starter card using mocked Home Assistant objects; previews do not prove real-device behavior.

Read [AGENTS.md](AGENTS.md) and [the working guide](docs/working-guide.md) for editor, device and release lessons. For an authorized release, synchronize package/lock versions and changelog, rebuild and tag v0.1.0. GitHub workflows test/build, validate HACS for public repos and publish the JavaScript release asset.

MIT; see LICENSE.
