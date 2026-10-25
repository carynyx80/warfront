# Asset provenance

- `dist/assets/operators/soldier-rigged.glb`: Grab3D CC0 rigged soldier, optimized to 42,000 triangles. Full license, AI-assisted disclosure, source links and modifications in `dist/assets/operators/PROVENANCE.md` and `LICENSE.txt`.
- `dist/game/city.js`: original procedural geometry and canvas textures, inspired by Southwark/London. References and collision/performance notes in CITY_REFERENCE.md.
- `dist/game/weapons.js`: seven original mesh constructions and SVG armory icons. See WEAPONS.md. Product names describe familiar firearm types; no third-party game models or logos are used.
- `dist/client.js`: original procedural environment lighting and synthesized shot/reload/impact tones.
- PlayCanvas: MIT; dependency version pinned. Its license is copied into `dist/vendor` at build time.
- Barlow Condensed and Inter: loaded from Google Fonts with system-font fallback.

All required gameplay models and textures are included in the repository or generated during build. Operator loading is local to the deployed origin; it does not fetch the asset author's website at runtime.
