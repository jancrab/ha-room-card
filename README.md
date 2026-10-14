# HA Room Card

Compact room dashboard concept for Home Assistant. The interactive visual prototype in `demo/` shows five rooms with current/target temperature, 0.5 °C adjustment buttons, one to five lights, scenes, presence/last activity and device toggles. Light and dark themes and responsive layouts are included. All prototype data and actions are simulated; reloading restores the example home.

The installable `src/` and `dist/` card remains the initial entity-display starter. The room prototype is not yet connected to Home Assistant services or the configuration editor.

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
