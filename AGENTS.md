# HA Room Card working guide

- Build a compact room dashboard reusable across a home: thermostat with current/target temperature and ± controls (default 0.5 °C), 1–5 icon light toggles, scenes, presence with last activity, and device/switch toggles. The current requested deliverable is the optical, interactive prototype in demo/, using clearly labeled simulated data. src/ remains the baseline HA starter; demo behavior does not establish live device support. Do not hard-code a user's real entities.
- Preserve the optional compact layout, per-room section/item visibility settings and automation enable/disable controls. Browser storage persists display preferences only; device and automation states remain simulated. Hiding a control must not change its state.
- Read docs/working-guide.md before modifying editor, device actions or releases. Keep verified new lessons there.
- Keep the UI and documentation in English; respond in the user's language. Use Home Assistant themes, accessible names, keyboard focus, 44px targets and reduced-motion support.
- Implement the requested device controls from actual supported features and exact service parameters. The starter only displays state and opens more-info. Do not infer device behavior from a different integration.
- Preserve native editor bootstrap, context subscription cleanup and reused-hass rendering. Keep configuration minimal and preserve unknown fields on editor updates.
- Run npm run check after card changes. Test meaningful state/service failures. Distinguish mocked previews from real Home Assistant or device verification.
- Commit package-lock.json and the built dist/ha-room-card.js with source changes. Runtime code must not depend on a CDN.
- Before releasing, synchronize package and lock versions, update CHANGELOG.md, rebuild, verify CI, and use a matching v-version tag. Confirm the actual GitHub release asset and HACS validation.
- Check git status and preserve unrelated work. Use the requested repository-local Git author/committer identity; do not change global identity or rewrite old commits implicitly.
- Repository creation, pushing, publishing, visibility changes and releases require authorization from the task. A credential, this guide or past authorization for another repo does not authorize those actions.
