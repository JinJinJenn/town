# JinJinJenn Town V7

A cozy 3D neighborhood that opens inside Clover Cottage, with saturated rose-and-mint colors, furnished cutaway rooms, animated residents and illustrated garden details.

**Play:** https://jinjinjenn.github.io/town/

**Runtime art gallery:** https://jinjinjenn.github.io/town/assets/v6/

## Explore the town

The game starts on the furnished cottage with its roof removed. Rotate or zoom the camera, invite Luca to sit on the sofa, change the furniture palette, or follow a resident. Use the neighborhood overview control or R to zoom out, and Tour to watch the wider neighborhood. Visit Clover Cottage brings you back inside.

V7 adds layered wall trim, curtains, framed botanicals, kitchen clutter, woven rugs and quilt stitching, denser flowering borders, herb beds and small ambient effects. Garden motes and cup steam respect Pause and reduced-motion settings. Buildings, furniture and residents remain real 3D; the existing illustrated plants and panel ornaments provide a mixed-media finish.

The current neighborhood has 16 lots, 32 residents, a cafe, two parks and one furnished home. It is a bounded prototype, not a complete life simulation. Furniture placement, needs, sleeping, relationships and infinite streaming are not implemented.

## Run locally

The packaged checkpoint includes the pinned Three.js renderer. Run `node tools/serve.mjs` and open http://127.0.0.1:4173/town/.

For a fresh repository checkout, run `npm ci --ignore-scripts`, `npm run vendor`, then `npm run dev`. Do not open index.html directly through file://.

The combined V7 release also retains the garden texture atlas, lighter shared geometry, bounded static merging, shadow-update throttling and phone quality defaults from the parallel performance checkpoint. Earlier benchmark captures are retained as historical evidence, not measurements of the denser final scene.

## Tests and recovery

`npm test` runs the Node unit tests. Install the browser with `npx playwright install --with-deps chromium`, then run `npx playwright test tests/browser/v7-lived-in.spec.js` for the focused V7 browser review. Screenshots and test state are written to `artifacts-v7/`.

Read `HANDOFF.md`, `V7_COMBINED_HANDOFF.md` and `HOSTING.md` before continuing work. The review workflow saves integrated source before testing and archives source, renderer and evidence even on failure. Software-rendered browser tests are not hardware performance benchmarks.

Runtime changes on main publish automatically through the existing Pages workflow. The public `__deployment.json` identifies the source commit and file hashes; a source commit alone is not proof of a live deployment.

This project is separate from Jenn's profile website, mods, Cafe and Farm. It is not affiliated with Electronic Arts or Maxis.
