# Changelog

## 0.4.0

- Redesign Compact as a focused room overview with larger labels, one presence line and a stable temperature/light hierarchy.
- Add per-item card/details/hidden placement and manual ordering in the native visual editor; preserve legacy exclusions.
- Summarize closed contacts while retaining visible open/unavailable states and individually pinned contact durations.
- Add direct light/device/automation toggles and scene actions to room details, with individually expandable brightness controls.
- Scope All off to visible included lights; keep hidden sections out of both views and group actions.
- Keep full entity names accessible when narrow cards truncate light labels, and simplify initially expanded editor sections.

## 0.3.0

- Add state-aware thermostat styling: subtle red for reported heating/preheating, gray for off, neutral for idle and dashed for unavailable. Off mode takes precedence over stale action attributes.
- Use a small outlined All off control while retaining a 44px touch target.
- Add HA area selection, empty-field suggestions from entity/device registries and room-scoped pickers. Global entity search and explicit existing selections allow manual cross-room overrides.
- Derive occupancy and elapsed duration from binary state/last_changed; add an optional, explicitly labeled Recent activity hold after the sensor clears.

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
