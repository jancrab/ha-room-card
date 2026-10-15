# Project workflow

The runtime uses Lit, a bundled ES module, a native HA form editor, node:test and Happy DOM. Version 0.2.0 replaces the starter with the real room dashboard and exact HA service calls. The canonical browser preview loads the same dist bundle through a mocked HA transport; do not confuse it with live HA verification.

## Editor and state

Native HA forms/selectors can be lazy-loaded. Keep getConfigElement's native editor loading until a tested replacement exists. HA can reuse its hass object, so rendering must still update. The starter accepts both hass and the states context; unsubscribe when disconnected.

Discover related entities through shared device_id where available; do not guess unrelated devices. Use exact preset strings and supported_features from the actual integration. A writable number's name does not prove that it measures live device position. Validate before actions; stop commands should not wait behind optional polling or profile validation.

## Testing

Run npm run check. Add service sequencing and failure tests with controls. Use npm run dev for the simulated preview. An HTML preview or mock test is not real Home Assistant/device verification. Native editor loading and live integration behavior must be checked in HA when possible.

## HACS and releases

The repository slug, hacs filename, bundle and release asset must match. HACS installs the frontend JavaScript, not backend scripts or an iPhone widget. Document any backend additions separately.

Commit the generated package-lock.json and dist bundle. The release workflow checks tag/version consistency and publishes the JS asset; validation verifies the committed build and HACS structure. Public HACS custom distribution requires a public repository. Do not change visibility or publish without task authorization.

The repository is now public. Run public HACS validation for releases. First-release prototype notes in docs/releases/v0.1.0.md are historical; use version-specific notes for each new release.

Public HACS validation checks GitHub repository topics as well as files. Keep relevant topics (home-assistant, lovelace, custom-card, hacs) on the repository; the first public run failed only on missing topics, while the package and build checks passed.

## Runtime verification lessons

Area suggestions must use entity.area_id first, then its device.area_id. Never guess room membership from entity names. Use native entity selectors' include_entities/exclude_entities for room scope and keep explicit selected overrides visible. Global search is deliberately independent of room scope. Fill only empty fields; do not overwrite manual mappings or guess an activity timestamp from arbitrary timestamp sensors. Presence hold is based on the off transition and must be labeled Recent activity, not confirmed occupancy.

Use the actual dist bundle for browser QA, including its editor. Native HA's entities-card editor imports ha-form; preserve that lazy bootstrap. Treat scenes as momentary scene.turn_on actions; automation.turn_off uses stop_actions:false so disabling a rule does not abort already-running actions. Target adjustments require ClimateEntityFeature.TARGET_TEMPERATURE (1), a numeric single target and a non-range mode. Prefer native details for heat_cool/range controls. Contact durations use last_changed, never last_updated. A cleared presence sensor's last_changed is a presence transition, not necessarily the last motion event; an optional activity timestamp entity supplies that separately. Close the card's native modal dialog before emitting hass-more-info so HA's own dialog is not hidden behind the top layer.

For manual updates replace the file and change the query version on the existing module resource; do not add a duplicate. Check actual GitHub release assets and workflow results after publishing.

GitHub login does not set Git author/committer metadata. Check effective identity and keep per-project changes repository-local. Do not store tokens, personal device data or inherited authorization in this guide.

Sources: https://hacs.dev/docs/publish/plugin/ and https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/.


## Focused layouts and placement

Item `display` can be card, details or hidden; absence means the layout default. Compact defaults scenes/devices to details; automations default to details in both modes. An explicit card placement also pins closed-contact duration. Legacy enabled:false remains excluded. Section visibility applies to both views. All off acts only on included lights currently placed on the card; details-only lights retain individual control in the dialog. Reordering must preserve every item field and unknown configuration. Details must expose actual toggles/scene actions before controls are moved off the overview. Dimmer disclosures should retain their open state across HA updates. Never summarize unavailable contacts as closed. Keep readable labels and 44px hit targets; use full accessible names and detail labels when narrow layouts truncate captions.

## Atmospheric scene

The original inline SVG room is decorative and hidden from accessibility APIs. It must never imply measured light, window position or a thermostat action not reported by HA. HVAC action alone drives heat/cool motion, with off/unavailable precedence. `show_scene` and `animate_scene` are independent saved editor options. Use HA fonts/text/surfaces and separate overridable light/dark scene palettes; keep controls above a contrast layer.

Motion requires a visible intersection, a visible document, no room dialog and no reduced-motion preference. Without IntersectionObserver stay static. Reconfiguration/removal must release the observer and document/media-query listeners; queued callbacks from disconnected observers must not revive animation. Verify actual fixed card widths (280/360/480 px), not only viewport sizes. Use the real bundle and clearly simulated preview fixtures; reduced-motion and hidden-tab lifecycle tests use controlled browser API mocks.
