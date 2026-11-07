# Town V5: Rose Mint Pop, first art-direction batch

## Resume here

The current runtime is a real Three.js game in `JinJinJenn/town`, intended at https://jinjinjenn.github.io/town/. This is not the generated concept mockup. Do not alter the separate profile, mods, Cafe or Farm repos.

Jenn selected the saturated rose-and-mint concept. V5's first batch implements that palette in the actual world and interface, while preserving V4 functionality. Read `RELEASE_V5.md` for the scope and next asset batch. Earlier checkpoints remain in Git.

## Shipped source scope

The finite neighborhood has 16 lots, 32 articulated residents, one furnished cutaway cottage, a cafe and two parks. Tour, manual camera movement, selection, following, pause, evening lighting and seeded regeneration remain. The existing home sofa interaction routes Luca from the sidewalk through the gate and door, sits, then returns outside.

V5 enriches static material colors without filtering resident skin or applying a screenshot. Rose Mint Pop is the new default cottage palette. Rose & cream, Lilac & linen and Sage & honey remain selectable; kitchen colors and new textile accents now participate. Selections use `town.palette.v5` and survive regeneration/reload. The old V4 preference is preserved, not deleted.

The pink header, property panel, toolbar, searchable resident dialog, help, and photo view remain. Green primary controls contrast with the rose UI. Photo view hides the interface and exits with Return or Escape; it is not image-file export.

New shared flower meshes, a mint bed throw, rug edging, wall-owned botanical pictures, kitchen handles and jars add detail. The existing floral gate, stepping stones, blossom clusters and 96 shader petals remain. Pause stops petal simulation and reduced-motion preferences can disable it.

This is still a bounded prototype. Furniture placement, needs, relationships, sleeping, other furnished homes and infinite streaming are not implemented. Generated transparent UI artwork has not yet been added; do not claim otherwise.

## Code map

- `src/v5-look.js`: selective material recoloring, shared garden flowers and additional cottage dressing.
- `src/v5.css`: palette and control presentation overrides after V4 styles, preserving tested layout rules.
- `src/home-polish.js`: four cottage palettes and component roles.
- `src/v4-ui.js`: active resident/palette/photo controls, now saving the V5 palette key.
- `src/main.js`, `src/home.js`: active runtime and cutaway integration.
- `src/v4-world.js`: bounded petals and prior foliage details.
- `src/render-style.js`: contact shading and lighting; soft rendering remains optional.
- `tests/v5.test.mjs`, `tests/browser/v5.spec.js`: focused V5 regression checks.
- `tools/integrate-v5.mjs`: guarded one-time source migration. Browser code never runs it.

## Validation and publication

Local source checks and all 24 unit tests passed during assembly. GitHub review run 42335239132 tests the production compositor, default palette, desktop control bounds, sofa round trip, pause, saved palettes, resident search/follow, photo exit, and 390/320-pixel phone layouts. Inspect that run's final result and screenshots rather than assuming it passed. Software-rendered Chromium does not establish hardware frame rates.

The review trigger commit is not necessarily the tested source: the workflow saves its integration commit first. COMMIT.txt identifies the tested runtime. The integrated runtime checkpoint is b5e3cf81799aa80ac08e2de0abc41945b8476d4b; documentation may be added after validation without changing game code.

The existing Pages workflow publishes runtime changes from main to gh-pages, verifies every public file hash and runs a real public-site WebGL smoke check. Its recursive src copy includes the V5 stylesheet. Read HOSTING.md and verify the public deployment manifest before calling an update live.

## Run and recover

Packaged checkpoint: `node tools/serve.mjs`, then http://127.0.0.1:4173/town/.
Fresh checkout: `npm ci --ignore-scripts`, `npm run vendor`, `npm run dev`.
Do not open index.html through file://. Checkpoint archives include the pinned renderer, checksums and browser evidence.

Continue in bounded batches with source commits before heavy work. Keep Blender optional and time-limited. Never discard checkpoint history, force-push another project, or label a static concept image as live gameplay.
