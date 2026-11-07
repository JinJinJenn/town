# JinJinJenn Town V6

A playable rose-and-mint neighborhood that combines real 3D homes, furniture and residents with illustrated garden details.

**Play:** https://jinjinjenn.github.io/town/  
**Runtime art gallery:** https://jinjinjenn.github.io/town/assets/v6/

## What's in V6

Painted hedge and planter cards decorate the gardens, with illustrated noticeboards beside the cafe and parks. The 99 garden cards share three instanced draw batches. Floral artwork decorates the interface, and drifting petals use a painted texture. The houses, furniture, people and cottage interactions are still 3D, not an image masquerading as a game.

Visit Clover Cottage to open its furnished interior, invite Luca to sit on the sofa, and choose among four saved furniture palettes. Search for a resident and follow their walk, leave the camera touring the town, or use photo view to hide the interface. Help includes independent toggles for illustrated garden layers and drifting petals.

Assets in the gallery are small optimized runtime derivatives, not full-resolution source PNGs. Original art remains in the downloaded thread art kit. See [RELEASE_V6.md](RELEASE_V6.md) for the exact scope.

## Run locally

From a complete checkpoint ZIP, run `node tools/serve.mjs` and visit http://127.0.0.1:4173/town/. The checkpoint includes the renderer.

From a source checkout, run `npm ci --ignore-scripts`, `npm run vendor`, and `npm run dev`. Use Node 20 or later and a WebGL2-capable browser. Do not open index.html directly with file://. Three.js is pinned to 0.180.0; no external image-generation service is called at runtime.

## Controls

Drag to pan, scroll or pinch to zoom, and right-drag to rotate. WASD or arrow keys move the camera; Q/E turn and R resets it. Tour moves the camera, Pause stops simulation, Evening switches lighting, and New town generates a different seed. Photo view exits with Return or Escape. Help contains the seed and graphics options.

## Current limits

Town is a finite 4-by-4 neighborhood with 16 lots and 32 residents. Only Clover Cottage has a furnished interactive interior; its sofa is the one usable furniture interaction. Garden cards and noticeboards are decoration, not additional gameplay. Furniture placement, deeper resident AI, sleeping, additional furnished houses and infinite streaming are not implemented. Concept artwork remains an aspirational visual target.

## Tests, publishing and recovery

Run `npm test` for 26 unit tests. Install the browser with `npx playwright install --with-deps chromium`, then run `npx playwright test tests/browser/v6.spec.js` for six focused browser tests. These check rendering, artwork loading, the sofa route, saved palettes, following, photo exit, regeneration, the art gallery and phone layouts; they are not hardware performance benchmarks.

Runtime changes on `main` publish automatically through `.github/workflows/pages.yml`. It builds the site, updates `gh-pages`, requests publication and checks the public manifest, file hashes and browser behavior. Check the actual workflow and `/town/__deployment.json` before claiming a version is live.

Read [HANDOFF.md](HANDOFF.md) before continuing and [HOSTING.md](HOSTING.md) for the publishing route. Keep milestone branches and source ZIPs. This project is separate from Jenn's profile, mods, Cafe and Farm sites. Independent project; not affiliated with Electronic Arts or Maxis.
