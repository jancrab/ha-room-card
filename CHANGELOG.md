# Changelog

## 0.2.0

- Replace the entity-only starter with the actual theme-native room card and native HA visual editor in the release bundle.
- Add real climate, light, scene, fan, switch, input_boolean and automation actions, device capability checks, state confirmation and error/timeout handling.
- Add current/target temperature, humidity, occupancy/activity, window/door change durations and native details with supported dimmers and real HA history links.
- Add section/item visibility, labels/icons, compact mode and migration of the supported legacy entity configuration.
- Make the canonical preview load the actual dist bundle. Transport and native-form mocks are labeled explicitly; live HA/physical-device verification remains outstanding.

## 0.1.0

- First preview of the interactive room dashboard with five simulated rooms, compact layout and light/dark themes.
- Thermostat target adjustments, light and device icon toggles, momentary scenes, automation toggles and per-room visibility settings.
- Window/door contact state durations, humidity, heating/window-open hints and all-room-lights-off actions.
- Room details with dimmers, contact timestamps, illustrative temperature history and simulated failure/unavailable-state controls.
- Initial installable HA card scaffold with entity picker, visual editor, theme variables and HACS build/release setup. The room prototype is separate from this starter; live Home Assistant service integration and real-device verification are not included.
