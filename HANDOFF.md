# Town V4: pink presentation and furnished-cottage polish

## Resume here

This is a real Three.js runtime update, not the generated mockup. Keep the game in `JinJinJenn/town`; do not change the separate mods, Cafe, Farm, or profile repositories. The public address is https://jinjinjenn.github.io/town/.

V3 source was `274d797293e428e4275cf77c59af0408e814dbc8`. V4 was assembled on `feat/checkpoint-04-polish-release`. The separate `feat/checkpoint-04-pink-polish` layout draft and `backup/v4-cottage-palettes-d4b1b03a` remain preserved. The release merge retains both histories without force-pushing.

## Actual V4 functionality

The pink interface includes the header, property panel, toolbar, help and searchable resident dialogs. You can find all 32 residents by name and follow their walks. Photo view hides the website panels; Return or Escape restores the interface. This release does not implement photo-file export.

Clover Cottage has interior-facing window frames and curtains, wall-owned shelves, kitchen details, books, plants, a sofa throw, quilt detail and bathroom accessories. Wall-owned decoration follows the existing cutaway rules. Rose & cream, Lilac & linen, and Sage & honey palettes modify furniture instance colors without rebuilding geometry. The choice is saved in localStorage and restored after regeneration/reload.

The scene adds blossom clusters, a floral cottage gate, stepping stones and 96 shader-animated petals. The simulation clock drives the effect, so Pause stops it. Reduced-motion preferences and the help checkbox can disable it. Regeneration disposes the petal GPU resources. Existing deterministic generation, lighting, camera controls and Luca's sofa route remain intact.

The reference image is aspirational. This release does not add furniture placement, needs, relationships, sleeping, additional furnished houses or infinite streaming. Do not claim those as shipped features.

## Code map

- `src/home-polish.js`: cottage dressing and palette definitions.
- `src/v4-world.js`: extra blossoms/gate and bounded GPU petals.
- `src/v4-ui.js`: active V4 residents, palette and photo-view controls.
- `src/v4.css` and `src/v4-layout.css`: active styling after the original style.css. The layout override fixes a legacy :has() rule that otherwise puts the phone property panel over the house.
- `src/site-ui.js`: retained alternate draft, not an active entrypoint.
- `src/main.js` and `src/home.js`: integrated runtime and palette API.
- `tests/v4.test.mjs` and `tests/browser/v4.spec.js`: V4 unit and browser checks.

## Build and hosting

Packaged ZIP: `node tools/serve.mjs`, then http://127.0.0.1:4173/town/.
Fresh checkout: `npm ci --ignore-scripts`, `npm run vendor`, then `npm run dev`.
Do not open index.html as file://. The packaged checkpoint includes the pinned renderer.

The existing Pages workflow publishes runtime changes from main to gh-pages and verifies public file hashes and a real WebGL browser smoke test. Its recursive src copy includes both V4 stylesheets. Do not move them to unlisted root files without updating deployment staging. Main's published source commit is recorded at /town/__deployment.json; check that public manifest before calling a build live.

`tools/integrate-v4.mjs` is a guarded one-time migration retained for recovery. The application files are already integrated and committed; browsers do not run it. The review workflow can create a bot source commit before testing, so its trigger SHA and tested-source SHA may differ. The artifact's COMMIT.txt identifies the actual tested source.

## Validation and recovery

Initial integrated runtime d9ba8430f534a99edefd63b34deefe717ef81e6e passed all 20 unit tests and four V4 browser tests in run 42331695977. Visual inspection caught a layout issue those original bounds checks missed. A subsequent CSS fix anchors the phone inspector at the bottom and keeps the desktop palette visible, with stronger tests for both conditions. Check the latest Review Town V4 result for that final validation; do not assume it succeeded just because the source is committed.

Tests cover production contact shading, palette persistence, resident search/following, photo-view exit, the sofa round trip and pause, regeneration, and mobile layouts at 390 and 320 pixels. Software-rendered Chromium is not a hardware frame-rate benchmark. No claim is made that every older long-running regression suite passes; the older V3 run had a timeout.

Keep accepted checkpoints in Git and a source ZIP. Review artifacts-v4/render.json and screenshots; COMMIT.txt and SHA256SUMS.txt identify each package. Preserve history and compare branch heads before changing them.
