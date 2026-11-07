# V8 accepted source checkpoint: simple 3D variety

Baseline: 62d900bb3ec21c0487ed74f9bf98feb10c4b078e, combined V7. Tested V8 runtime: 1d4f97dab343b3d868d36cdd9058385677300a2a. Review: https://github.com/JinJinJenn/town/actions/runs/42351021274. All 36 unit tests and the focused browser capture/interaction harness passed. Captures and metrics are committed at 01d1f9546db1686e691ebf41b36ac2b12c7e2f85. Documentation added afterward does not change the tested game.

## New objects

Gardening: potting benches, tomato beds, wheelbarrows, watering cans, hose reels, produce crates, mushrooms and pumpkins.
Outdoor living: bistro tables/chairs, loungers, barbecues, stacked firewood, laundry lines/baskets, doghouses, pet bowls, toy wagons, birdbaths, birdhouses, beehives, easels and pinwheels.
Parks and cafe: picnic tables, swing sets, sandboxes, board-game tables, recycling bins and a striped pastry cart.
Cottage: toaster, range hood, wall clock, key rack, radio, cactus, succulent bowl and tissue box.

The default seed places 105 exterior objects and eight interior/wall objects, covering all 36 recipes. These objects are decorative, not newly interactive simulation features. Household routes and existing interactions are retained.

## Measured cost

Matching desktop capture: scene draw calls 54 -> 55; submitted scene triangles 1,014,990 -> 1,048,522 (33,532 extra, approximately 3.3%). Renderer textures stay at 6 and geometries at 22. These are scene-pass counters from software Chromium, not total GPU work or hardware FPS estimates. The atlas, shared materials and existing quality defaults remain intact. No new image downloads or lights are introduced.

## Recovery

Source, tests, guarded integration script and review workflow were committed before browser work. The workflow commits passing evidence and packages a source ZIP with pinned renderer and checksums even on failure. Read HANDOFF.md for the source map. Confirm the completed Pages workflow and public deployment manifest separately before calling this source live. Do not force-push or replace prior checkpoint branches.
