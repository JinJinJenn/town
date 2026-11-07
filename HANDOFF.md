# Town V7: cottage-first arrival and layered detail

## Resume here

The game and source belong to `JinJinJenn/town`. The public address is https://jinjinjenn.github.io/town/. Keep Jenn's separate profile, mods, Cafe and Farm projects unchanged. This is a real Three.js runtime, not the generated concept mockup.

V7 starts from V6 release `01441198963c9ddc9ebdc7ba9fe92a021b7ae56b`. Work is preserved on `feat/checkpoint-07-lived-in-cottage`. The refined runtime is `e98d3743573b30ba9312ac54994589e0615e4daf`; the release adds documentation without changing that runtime. Read `RELEASE_V7.md` for the scope. Preserve older checkpoint branches and source ZIPs.

## Startup and interaction

The normal URL opens on the central furnished Clover Cottage in isometric cutaway, with its roof removed, the introduction dismissed and the property panel available. This is a camera presentation change, not first-person movement or a new controllable character. Reloads and new seeded neighborhoods return to the furnished home. The overview control and R show the neighborhood; Tour still explores; Visit Clover Cottage returns home. The explicit `?view=town` URL starts at the overview for previews.

The town remains a finite 16-lot neighborhood with 32 articulated residents, a cafe, two parks and one furnished cottage. Luca's sofa round trip, four saved furniture palettes, resident search/following, pause, evening lighting, cutaway rotation and photo-view exit remain. Photo view hides UI; it does not export a screenshot file.

## V7 art implementation

`src/v7-detail.js` adds 204 interior detail instances, plus wall-owned panelling, cornices, pleated curtains, botanical frames, kitchen tile and utensils, and bathroom mirror/towels. Textiles use small shared meshes for rug weave/fringe and quilt stitching. Counter dishes, fruit, books, flowers, storage baskets, slippers and bath accessories add readable clutter. Decorations do not introduce new navigation obstacles; the couch remains fully 3D and usable.

There are 436 deterministic garden border patches with leaves, flowers and lavender spires, plus richer cottage stone edging and front-fence blooms. Two emissive garden lanterns avoid adding expensive dynamic point lights. Two herb beds are positioned away from the existing raised planter. Placement refinements also put bathroom wall decorations on the correct wall section and avoid duplicate gate lamps.

48 garden motes and eight cup-steam instances use two shader batches. Motion uses the existing simulation clock; Pause freezes it. The existing ambient/petal checkbox and reduced-motion setting control the effects. Steam is visible only with the cottage open. `createV7Atmosphere` wraps `world.step` and `world.dispose`, retaining their `this` binding and disposing its owned resources once. It exposes `sync` for cutaway changes while paused.

V6's generated illustrated cards remain: 64 hedge cards, 32 planter cards, three blank noticeboards, floral UI ornament and textured petals. Shared textures survive regeneration; missing decorative textures do not prevent 3D startup. Runtime images remain small WebP derivatives, not the full-resolution PNG originals from the downloaded art kit. V7 adds procedural geometry/effects; it does not generate a new image batch.

## Code map

- `src/v7-detail.js`: house dressing, deterministic border planning, kit extension and ambient effects.
- `src/main.js`: cottage-first arrival, overview controls, effect lifecycle and debug state.
- `src/home.js`: additive detail integration before palette batching, cutaways and home metadata.
- `src/v6-media.js`, `assets/v6/`: existing generated cards, textures, loader and gallery.
- `src/home-polish.js`, `src/v5-look.js`: Rose Mint colors and selectable cottage palettes.
- `tests/v7.test.mjs`: garden determinism/clearance, palette/cutaway compatibility and effect disposal.
- `tests/browser/v7.spec.js`: five focused browser tests and screenshots.

`tools/integrate-v7.mjs` and `tools/refine-v7.mjs` are guarded, idempotent development migrations retained for recovery. The real source files are already integrated and committed; the browser does not run these scripts. Review workflows can save a bot integration commit before testing, so the workflow trigger SHA differs from the actual source in its artifact's `COMMIT.txt`.

## Validation and release evidence

The first integrated runtime passed 29 unit tests and five focused browser tests in run 42346182920. The refined runtime is reviewed in run 42346505302. Inspect that run's final result and screenshots rather than assuming success from the existence of this document. These tests cover real composited rendering, cottage-first startup, sofa round trips, pause, palette persistence, resident following, photo-view exit, 390/320-pixel phone controls, rotated views, regeneration/resource reuse, reduced motion and missing-art fallback.

Artifacts retain source, pinned renderer, `artifacts-v7/` screenshots, `COMMIT.txt` and `SHA256SUMS.txt`. Software-rendered Chromium does not establish hardware FPS. Older broad regression suites are separate; a focused V7 pass is not a claim that every legacy test has passed.

The established Pages workflow stages `src/`, `assets/`, `vendor/`, index.html and style.css from main, publishes to gh-pages, requests a native Pages build, verifies every public file hash, and runs a real public-site WebGL smoke check. Do not require the user to enable Pages again. Check `/town/__deployment.json` and the final deploy result before claiming the release is live.

## Run and boundaries

Packaged source includes the renderer: run `node tools/serve.mjs`, then open http://127.0.0.1:4173/town/. A fresh checkout needs `npm ci --ignore-scripts`, `npm run vendor`, then `npm run dev`. Do not open index.html through file://.

Furniture placement, sleeping, needs, relationships, additional furnished homes and infinite streaming are not implemented. Keep copy natural and do not add mock controls for unimplemented features. Continue in bounded committed batches; keep Blender optional. Do not overwrite accepted checkpoints, force-push other projects, or describe concept art as live gameplay.
