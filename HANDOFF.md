# Town checkpoint 01: resumable visual benchmark

## What this is

A new Three.js implementation of JinJinJenn Town. The old November 6 cloud-computer prototype was not recovered. Keep Town separate from Jenn's Cafe, Farm, and the main portfolio.

The approved reference is a pastel isometric neighborhood with detailed cottages, a striped cafe awning, pale sidewalks, fenced gardens, small residents, and soft lighting. UI prose must use natural complete sentences rather than marketing fragments.

## Implemented and committed

- A finite 4-by-4 neighborhood with 16 lots: 13 homes, one cafe, and two parks.
- Seeded house dimensions, materials, garden details, and resident appearance. Street topology is still a fixed grid.
- Parametric architecture and props with shared geometries/materials, compacted into instanced batches.
- 32 articulated residents walking block-sidewalk loops and occasionally pausing. They do not yet choose activities or enter homes.
- Orthographic camera pan, zoom, rotation, tour, reset, resident/building selection, and resident following.
- Afternoon/evening lighting, simulation pause, seed input, responsive interface, dismissible introduction, and links to Jenn's website.
- Relative asset paths and a local server supporting /town/.
- No Blender dependency or long-running asset job.

## Run it

From a Git checkout: npm install, npm run vendor, npm run dev.
From a packaged checkpoint: node tools/serve.mjs. The archive already includes vendor/.
Open http://127.0.0.1:4173/town/. Do not double-click index.html.

## Validation so far

All six generation tests passed. The actual WebGL2 scene rendered in Chromium on the GitHub Actions runner. Desktop and mobile screenshots were inspected; the result establishes the initial visual baseline, not a pixel-perfect match to the original Blender reference.

The mobile layout/control test and the unavailable-WebGL error test passed. An initial desktop motion assertion was too timing-sensitive: it required one resident to move during an arbitrary 800 ms window even though residents can idle. The test now waits for rendered frames and checks the population. Inspect the latest Validate and package Town run before declaring the full browser suite passed.

The first measured desktop frame reported 20 main-render draw calls, 425470 submitted triangles, 14 static batches, and 6 dynamic batches. These are renderer counters, not all-pass GPU cost or a real-device frame-rate measurement.

## Backups

All runtime source was committed as it was created. GitHub Actions packages source, vendor files, screenshots when available, COMMIT.txt, and SHA256SUMS.txt even when validation fails. Action artifacts expire after 30 days; the commits and locally saved ZIPs are separate copies. Never claim a backup exists without checking its content and commit.

## Known scope and visual follow-up

The world is finite. No furnished interiors, cutaways, decorating, needs, relationships, cross-block pathfinding, world streaming, or editable-save format exists yet. Fine roof seams can alias at this camera distance. Shadows and material balance still need a hardware-browser art/performance pass. The current UI is HTML/CSS, while the neighborhood and residents are rendered in WebGL.

The intended public address is https://jinjinjenn.github.io/town/. A successful source commit does not mean GitHub Pages is configured; public deployment has not been verified.

## Next bounded checkpoint

Review this build first. Refine roof seams, shadows, and character readability without rewriting the generator. Then add one furnished house with a working cutaway and a single usable interaction anchor. Verify and commit that before adding other systems.

Keep Blender optional: one generator script and one time-limited export at a time, saving both source and output before another job. Do not start Blender rendering, worker streaming, and full resident AI in one uncommitted session. Do not force-push or overwrite other projects.
