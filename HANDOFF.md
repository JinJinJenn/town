# Town checkpoint 01: validated visual benchmark

## Resume here

This is a new Three.js implementation, not recovered source from the lost November 6 cloud session. Keep it separate from Jenn's Cafe, Farm, and the main portfolio. Preserve the pastel isometric reference and natural, complete-sentence interface copy.

## Saved implementation

The finite 4-by-4 neighborhood has 16 lots: 13 homes, Jenn's Cafe, and two parks. Seeds vary house dimensions, palettes, gardens, and resident appearance; street topology is still fixed. The reusable geometry kit includes layered roofs, chimneys, shutters, porches, fences, cafe furniture and awning, a bicycle, trees, flowers, lamps, a pond bridge, and a fountain.

There are 32 articulated residents. They walk sidewalk loops and occasionally pause; they do not yet choose activities or enter houses. Repeated static geometry and resident parts use instanced batches.

Camera pan, zoom, rotation, tour, reset, selection, and resident following are implemented, along with simulation pause, afternoon/evening lighting, seed input, a responsive website interface, and a dismissible welcome panel. Runtime assets use relative paths under /town/. No Blender job or asset dependency was introduced.

## Verified checkpoint

Code and tests were validated at commit 56541ee958e394492c4145c715181f28630c6d87.
GitHub Actions run: https://github.com/JinJinJenn/town/actions/runs/42312998583

All six generation tests and all three browser tests passed. The desktop test checks actual rendering, population movement, pause, tour, following, zoom, evening lighting, repeatable regeneration, and geometry-count stability. The other tests cover mobile layout/controls and an honest error when WebGL2 is unavailable. No JavaScript page errors were recorded by the desktop test.

Desktop, unobstructed neighborhood, mobile, and evening screenshots are in the archive's artifacts/ folder. These are actual browser renders, not a Blender still substituted for gameplay. Screenshots were inspected as the first visual baseline, not a pixel-perfect match to the original reference.

The initial main render reported 20 draw calls and 425470 submitted triangles. This is not an all-pass GPU measurement or a real-device frame-rate benchmark. Tests used software-rendered Chromium.

## Run

From the packaged ZIP: node tools/serve.mjs, then open http://127.0.0.1:4173/town/.
From a Git checkout: npm install, npm run vendor, npm run dev.
The ZIP includes vendor/ and the Three.js license. Do not open index.html through file://.

## Recovery and limits

Each source component was committed during implementation. Archives include source, pinned renderer files, screenshots, test results, COMMIT.txt, and SHA256SUMS.txt. GitHub Actions artifacts expire after 30 days; Git history and locally saved ZIPs are separate copies. Verify the commit and file contents before claiming a backup.

This is not yet a full life simulator. Furnished interiors, cutaways, decorating, needs, relationships, cross-block navigation, district streaming, and an editable save format are not implemented. Fine roof seams still need an anti-aliasing/depth pass. Hardware-browser performance remains to be checked. The UI is HTML/CSS; the world and residents use WebGL.

The intended public URL is https://jinjinjenn.github.io/town/, but GitHub Pages deployment has not been verified. Do not describe it as live solely because source is committed.

## Next bounded checkpoint

Refine roof seams, shadow softness, and character readability against this baseline. Then add ONE furnished house, a working cutaway, and one usable interaction anchor. Test and commit that milestone before adding streaming or deeper AI.

Keep Blender optional: one generator script and one time-limited export at a time, committing both source and output before another job. Never put the only copy of a working scene inside a temporary workspace. Do not force-push or overwrite other projects.
