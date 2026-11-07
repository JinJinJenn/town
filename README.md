# JinJinJenn Town V4

A playable pastel neighborhood for [JinJinJenn](https://jinjinjenn.github.io/), with generated homes, gardens, a cafe and residents going about their walks.

**Play:** https://jinjinjenn.github.io/town/

## V4

The website has a pink header, property panel, toolbar and dialogs. Search the Residents menu to find someone and follow their walk. Visit Clover Cottage to look inside its four furnished rooms, invite Luca onto the sofa, and choose a rose, lavender or sage furniture palette. The palette is remembered in your browser. Photo view hides the interface without replacing the real 3D scene.

The cottage now includes interior window frames and curtains, shelves and books, kitchen details, a sofa throw, patterned bedding and bathroom accessories. More blossoms, a floral gate and drifting petals dress the gardens. The petals use a bounded instanced batch and can be disabled in Help; reduced-motion preferences are respected.

## Run locally

From a downloaded checkpoint ZIP, run `node tools/serve.mjs` and open http://127.0.0.1:4173/town/. The archive includes the renderer.

From a source checkout, run `npm ci --ignore-scripts`, `npm run vendor`, then `npm run dev`. Do not open index.html directly with file://.

Node 20 or later and a WebGL2-capable browser are required. Three.js is pinned to 0.180.0 and copied to vendor for same-origin deployment. No Blender job, image service, CDN, or additional runtime framework is required.

## Controls

Drag to pan, scroll or pinch to zoom, and right-drag to rotate. WASD or arrow keys move the camera; Q/E turn and R resets it. Tour moves the camera, Pause stops simulation, Evening switches lighting, and New town generates a different seed. Help contains the seed input, shading option and petal toggle.

## Current limits

The neighborhood is a finite 4-by-4 layout with 16 lots and 32 residents. Only Clover Cottage has a furnished interactive interior, and its sofa is the one usable furniture interaction. Full furniture placement, deeper resident AI, sleeping and infinite streaming are future work. The generated concept artwork is an art-direction reference, not an exact screenshot or a substitute for the runtime.

## Tests, hosting and recovery

`npm test` runs 20 unit tests. Install the browser with `npx playwright install --with-deps chromium`, then run `npx playwright test tests/browser/v4.spec.js` for the four targeted V4 browser tests. Tests check actual rendering and controls, persistence, the sofa route, and phone layouts; they do not certify hardware frame rates.

Changes to runtime files on main are published automatically through `.github/workflows/pages.yml`. That workflow stages only the game, pushes gh-pages, requests a native Pages build and verifies the public manifest, file hashes and live browser behavior. `src/v4.css` and `src/v4-layout.css` are published by its recursive src copy.

Read [HANDOFF.md](HANDOFF.md) before resuming work and [HOSTING.md](HOSTING.md) for the publishing route. Review the latest workflow results rather than assuming a commit is deployed. Keep milestones in Git and downloadable source ZIPs; never leave the only working copy in a temporary computer.

Town is separate from Jenn's Cafe, Farm, mods site, and profile website. Independent project; not affiliated with Electronic Arts or Maxis.
