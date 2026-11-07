# Town V7: combined cottage detail and rendering optimizations

## Current source

Use `JinJinJenn/town` only. Public game: https://jinjinjenn.github.io/town/. Leave the separate profile, mods, Cafe and Farm repos unchanged.

This release reconciles the concurrent detail/performance checkpoint at `1bf150f5313a0422bf18d302b1a905115c0ad4b3` and layered-detail work at `249f975da12a39b663bcb5732cca997106f2a5d9`. Both histories are retained by merge commit `8e4dc089bb3ba1eb3ec99ddd783437277ea40bb0`. The integrated combined runtime is `8a0b61f6823538f262111a5e6dffcfacd947d67c`; final documentation does not change runtime code. Source branch: `feat/checkpoint-07-combined-release`.

Read `V7_COMBINED_HANDOFF.md`, `RELEASE_V7.md` (performance checkpoint) and `RELEASE_V7_LAYERED_DETAIL.md` (additional art pass) for their respective scope. Older checkpoints and full-resolution downloaded art remain preserved.

## What the user sees

The normal URL opens inside the central furnished Clover Cottage in isometric cutaway, roof removed and property controls selected. Reloading and seeded regeneration return to this house. The overview control and R show the town; Tour and Visit Clover Cottage still work. `?view=town` explicitly starts at the overview. This does not add first-person locomotion or a new controllable character.

The finite neighborhood retains 16 lots, 32 residents, a cafe, two parks and one furnished home. Real 3D furniture, the sofa round trip, saved palettes, residents, following, cutaway walls and photo-view exit remain functional. Photo view hides UI, not file export.

The art pass adds 204 interior detail instances plus wall-owned panelling, cornices, pleated curtains, botanical frames, kitchen backsplash and utensils, woven rug lines/fringe, quilt stitching, dishes, books, fruit, flowers, baskets, slippers, mirror/towels and bath accessories. It adds 436 deterministic edge planting patches on top of the earlier flower placements, cottage stone edging, fence blooms, two lanterns and two herb beds. The new beds clear the existing raised planter and the front gate/sofa route remain unchanged.

48 garden motes and eight cup-steam instances use two shader batches and the simulation clock. Pause stops them; reduced motion and the existing ambient/petal checkbox control them. Steam is hidden with the house closed. The original 96 petals and generated illustrated garden artwork remain. No new generated PNGs were produced in this pass.

## Retained optimization and ownership

The existing 99 illustrated garden cards still use the shared atlas and one instanced batch. Lighter rounded/bud geometry, bounded material merging for small static assemblies, 10 Hz shadow refresh with explicit invalidation, and phone default quality settings remain. Dynamic objects and palette-owned furniture are not flattened into immutable merged meshes. The atmosphere and decorative resources retain explicit disposal paths; missing art textures must not block the 3D game.

Historical captures in `docs/v7-captures/` measure the earlier performance checkpoint, NOT this denser combined release. Do not repeat their percentage draw/triangle reductions as new measurements. Use the combined review's `artifacts-v7/render.json` and screenshots for this source. Software Chromium is not a hardware FPS benchmark.

## Code and validation

- `src/v7-polish.js` and `src/v7-media.js`: retained optimization and earlier decoration.
- `src/v7-detail.js`: additive home/garden detail and bounded ambient effects.
- `src/main.js` / `src/home.js`: integrated lifecycle, startup, palette and cutaway behavior.
- `tests/v7.test.mjs` and `tests/v7-lived-in.test.mjs`: both unit suites retained.
- `tests/browser/v7-lived-in.spec.js`: five focused combined browser tests.
- `.github/workflows/v7-lived-in-review.yml`: combined source-save, validation and archive workflow.
- `tools/integrate-v7-lived-in.mjs`: guarded idempotent development migration. Native source is already integrated; browsers do not run it.

The combined suite runs 33 unit tests and five browser tests. Review run: https://github.com/JinJinJenn/town/actions/runs/42347685240. Check its actual final result rather than assuming it passed because this document exists. The browser tests cover actual composited rendering, default home, retained atlas/shadow settings, sofa round trips, pause, saved palettes, following, photo exit, 390/320-pixel controls, rotation, regeneration, reduced motion and missing-art fallback. A focused suite is not a claim that every older version-specific browser test passes.

Review workflows may commit integration before testing, so trigger SHA and tested SHA differ. The artifact's COMMIT.txt identifies tested source. Packaged release copies may contain documentation-only changes and record both tested and release commits.

## Run and publish

Packaged source includes the pinned renderer: `node tools/serve.mjs`, then http://127.0.0.1:4173/town/. Fresh checkout: `npm ci --ignore-scripts`, `npm run vendor`, `npm run dev`. Do not use file://.

Read HOSTING.md. Main publishes automatically through the existing gh-pages workflow, verifies every public file hash and runs the public WebGL smoke test. The public __deployment.json is the source of truth for the deployed source commit. Do not ask the user to enable Pages again or label a branch save as live.

Furniture placement, sleeping, needs, relationships, additional furnished homes and infinite streaming remain unimplemented. Keep copy natural, retain source checkpoints before expensive work, and never force-push over concurrent changes. The imagery in the review is actual gameplay, not concept art.
