# Town V7 checkpoint: cottage-first detail and rendering optimization

## Resume here

Project: JinJinJenn/town. Public game: https://jinjinjenn.github.io/town/. Do not modify Jenn's separate profile, mods, Cafe or Farm repositories.

V7 is actual Three.js code, not the generated concept image. The baseline is V6 commit 01441198963c9ddc9ebdc7ba9fe92a021b7ae56b. V7 integrated runtime is 333b1df1b80e297ed066e9e5b604d3f72ef3d09a; passing screenshots and comparison metrics are committed at a504204b23d0ac327c75a8729c801feb625ba6c9. This documentation update changes no game code. Source branch: feat/checkpoint-07-detail-performance.

## This bounded checkpoint

Town opens directly inside the central Clover Cottage with its roof removed, camera focused and property controls selected. Regenerating the town also returns to the furnished cottage. The neighborhood remains finite: 16 lots, 32 residents, a cafe, two parks and one furnished house. The sofa interaction, editable furniture palettes, cutaway walls, navigation, residents and photo view remain real runtime systems.

New art dressing adds 350 small garden flowers plus leaf clusters across the lots (80 around the furnished lot, 18 around each other lot), 36 fence garland clusters, cups and saucers, a table bouquet, book stacks, sofa-end cushions, bathroom towels and candles, and trailing wall-owned vines. The front gate and Luca's central seat remain clear. The existing 96 animated petals remain; this is not a claim of more particle instances.

Three illustrated garden materials are packed into one padded 256x256 atlas and one instanced batch for the same 99 garden cards. Small immutable assemblies merge by compatible material, but dense scenery remains instanced, palette furniture remains editable, and animated actors/doors remain separate. A 90,000-source-vertex ceiling limits merge memory growth. Shared rounded boxes decrease from 192 to 108 triangles and small flower buds from 20 to 8.

Directional shadow updates are capped at 10 Hz during ordinary motion, with explicit refresh for cutaway/roof changes, regeneration and evening-light changes. This is shadow-update throttling, NOT a separate baked static-shadow system. A paused, unchanged scene reuses its existing shadow map.

Narrow screens default to a renderer pixel ratio of 1 and soft contact shading off when no explicit saved preference exists. Visitors can enable soft shading in Help. Desktop soft shading is retained. Atlas textures survive regeneration; per-world merge buffers/materials and card resources are disposed.

## Measured before and after

Review Town V7 run 42346475232 passed source/unit validation and the focused capture/interaction harness. Matching desktop captures use 1280x800, DPR 1, seed petalwood, the same cottage camera and soft contact shading enabled in both builds.

- Scene draw calls: V6 63, V7 49 (22.2% fewer).
- Scene submitted triangles: V6 1,109,514, V7 927,246 (16.4% fewer despite added detail).
- Illustrated garden batches: 3 to 1.
- Renderer texture allocations in the desktop capture: 9 to 6.
- Actual moving-frame GL submissions including shadow and composite passes: 127 to 100 in this software-rendered sample.
- Actual paused-frame GL submissions: 127 to 50; the shadow map is reused in V7.

The phone captures use a 320x640 CSS viewport and DPR 2, but intentionally compare each version's DEFAULT quality settings, not identical rendering quality. V7 has no default compositor pass there. Software Chromium timings are not hardware FPS benchmarks. Do not turn these draw/triangle reductions into an unsupported percentage FPS claim.

All four before/after PNGs and the complete comparison.json are permanently tracked under docs/v7-captures/. The capture harness also checks automatic cottage entry, sofa round trip, palette saves across regeneration, four cutaway directions, atlas/resource reuse, photo-view exit and phone control bounds. The source artifact includes checksums. Legacy browser scripts that hard-code V6 are not the V7 acceptance suite.

## Code map and repeatable capture

- src/v7-polish.js: bounded static merging, shared-geometry reduction, garden and interior details.
- src/v7-media.js: runtime texture atlas and per-instance UV rectangles; reuses V6 art sources.
- src/main.js and src/home.js: integrated startup, detail and quality behavior.
- tests/v7.test.mjs: merge ownership/disposal, palette safety, geometry budgets and wall cutaways.
- tools/capture-v7.mjs: matched V6/V7 capture and GL draw/triangle counters.
- .github/workflows/v7-review.yml: saves integrated source BEFORE browser work, commits passing evidence, and archives even on failure.
- tools/integrate-v7.mjs: guarded source migration; not a runtime dependency. Already integrated in accepted source.

Packaged checkpoint: node tools/serve.mjs, then http://127.0.0.1:4173/town/. Fresh checkout: npm ci --ignore-scripts; npm run vendor; npm run dev. The archive includes the renderer. Do not open index.html via file://.

For the comparison, prepare a checkout/archive of the exact V6 baseline with its vendor directory, set BASELINE_ROOT to that directory, install Playwright Chromium, then run node tools/capture-v7.mjs from V7. The GitHub workflow automates this setup. npm test runs the unit suite.

## Publication and remaining work

Read HOSTING.md. Main publishes automatically to gh-pages. Verify the public __deployment.json AND the completed deployment smoke test before calling any new commit live. Do not require the user to configure Pages again. Preserve checkpoint/06-mixed-media and all earlier versions.

V7 is a small code-and-performance checkpoint, not full parity with the lush generated reference. More foliage variety, higher-resolution source art, denser interior storytelling and advanced phone UI can be later bounded batches. Furniture placement, additional furnished homes, sleeping, needs, relationships and infinite streaming are not implemented. Keep the original full-resolution art in the downloaded thread kit; this release reuses the compact V6 image derivatives.

Commit each next change before expensive work and avoid overwriting checkpoint branches. The screenshot comparisons are real browser captures, not image-generation outputs.
