# Town V8: simple 3D prop variety

## Resume here

Use only JinJinJenn/town. The prior combined V7 release is 62d900bb3ec21c0487ed74f9bf98feb10c4b078e. The V8 source branch is feat/checkpoint-08-prop-variety. The tested runtime is 1d4f97dab343b3d868d36cdd9058385677300a2a; passing captures are committed at 01d1f9546db1686e691ebf41b36ac2b12c7e2f85. Subsequent documentation does not change that runtime. Do not modify the separate profile, mods, Cafe or Farm repos.

## Implemented scope

The default town adds 105 outdoor prop assemblies and eight cottage/wall objects from a catalogue of 36 simple-3D recipes. Gardens vary between gardening, outdoor dining, family-yard and quiet-garden arrangements. Parks gain picnic tables, swings, sandboxes and board-game tables. The cafe gains a striped pastry cart. Clover Cottage gains a toaster, range hood, wall clock, key rack, radio, cactus, succulent bowl and tissue box.

The new props are decorative only. No new sitting, swinging, cooking, chess, gardening or pet simulation is implemented. Existing sofa interaction, 32 animated residents, 16 lots, one furnished home, saved palettes, cutaway walls and camera controls remain. The game starts in Clover Cottage as before.

All new geometry uses existing kit primitives and shared materials. Outdoor objects join the existing art batches; interior objects follow their interior/cutaway-wall owner. There are no extra image downloads, lights, or per-frame object-update loops. Preserve the garden-card atlas, shadow throttling, reduced-motion settings, phone defaults and resource-disposal paths.

## Source and evidence

- src/v8-props.js: catalogue, seeded placement, home dressing and summary counters.
- src/main.js: enables V8 and exposes v8Props stats.
- src/home.js: optional V8 dressing before batching.
- tests/v8.test.mjs: catalogue budgets, placement, shared assets, palettes and cutaways.
- tools/integrate-v8.mjs: guarded idempotent development migration. Native files are already integrated.
- tools/review-v8.mjs and .github/workflows/v8-review.yml: matched V7/V8 desktop captures, phone layouts, draw/triangle budgets and interaction regression. Source is committed before browser work; passing evidence is committed afterward, and the artifact is retained even on failure.

All 36 unit tests and the focused review passed in run 42351021274. Desktop comparisons use seed petalwood, the same cottage camera, 1280x800 viewport, DPR 1 and soft shading enabled. Scene calls are 54 -> 55; scene triangles are 1,014,990 -> 1,048,522; texture allocations remain 6 and geometry allocations remain 22. The prior V7 performance-only checkpoint is not the baseline for these numbers. These are software-rendered counters, not physical-device FPS benchmarks.

Captures and comparison.json are tracked under docs/v8-captures/. The review checks automatic cottage entry, sofa round trip, pause, palettes, four camera directions, regeneration/resource reuse, photo exit, resident following and 390/320px phone controls. Phone defaults retain DPR 1 and soft shading off. It is not a claim that every legacy version-specific browser test passes.

## Run and publish

Packaged source includes the renderer: node tools/serve.mjs then http://127.0.0.1:4173/town/. Fresh checkout: npm ci --ignore-scripts; npm run vendor; npm run dev. Do not open via file://.

Main publishes through the existing Pages workflow. Confirm its final result and the public __deployment.json before calling a new release live. Keep earlier checkpoint branches unchanged and use expected-SHA fast-forward publication to protect concurrent edits.

This is a bounded art checkpoint. Interactive use of the new objects, additional furnished homes, needs, relationships and infinite streaming remain future work. Commit source before expensive follow-up.
