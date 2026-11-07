# Town v4: pink website and cottage polish

## Resume here

Continue `JinJinJenn/town`, not Jenn's Cafe, Farm, main profile, or mods site. The public game lives at https://jinjinjenn.github.io/town/. The art references are aspirational direction, not images to substitute for the interactive scene. Keep prose natural and complete. Keep Blender optional.

V3's published runtime is preserved at `274d797293e428e4275cf77c59af0408e814dbc8`. V4 was developed in `feat/checkpoint-04-pink-polish` with incremental commits. The integrated code checkpoint is `9b24c88c382824315ee6fb62d22cb13b7d31d65f`. Inspect subsequent commits and workflow results before declaring a version tested or live.

## V4 implementation

The site now has a rose-pink navigation bar, cream/pink panels, illustrated line icons, floral accents, mobile layout, readable buttons, and an About Jenn dialog. Mods links point at `/mods/`; this work does not modify that separate repository.

The Residents dialog lists the actual 32 residents and filters by name. Selecting a result selects that resident and moves the camera to them; the original Follow action remains available. There are no fake social, account, or gallery controls.

Photo mode hides the website chrome, leaves camera movement available, and exports a PNG of the actual rendered WebGL canvas. Save photo renders and snapshots in one task; the photo does not contain the website overlays or selection ring. Escape or Back to Town exits. Rendering quality and drifting-petal preferences are stored locally. Reduced-motion preference disables petals by default.

Clover Cottage has warmer cream walls, curtains, a shelf with books and jars, hanging greenery, a slim bookcase, a sofa throw and tassels, flowers, table settings, an oven front, a quilt detail, and bathroom accessories. Wall-mounted details are attached to their respective cutaway batch. No furniture placement or navigation behavior was generalized.

Blossom trees receive small instanced buds. A single instanced petal draw uses a shader time uniform rather than CPU-updated particle transforms. It has bounded population, independent resource disposal, and follows simulation pause. The scene is still a finite 16-lot neighborhood with one furnished home and 32 residents.

## Key files

- `src/site-ui.js`: resident browsing, dialogs, icons, PNG export, persisted quality and petal controls.
- `src/main.js`: runtime integration, quality/pixel-ratio changes, selection, camera, capture callback, original controls and inspection API.
- `src/home-decor.js`: active v4 cottage-dressing geometry, compiled through the existing kit.
- `src/polish-kit.js`: blossom detail wrapper around the accepted v3 kit.
- `src/garden-air.js`: shader-animated instanced petals.
- `src/art-world.js`: attaches decoration and petals and disposes their resources on regeneration.
- `src/home.js`: original separate wall/roof/door batches and furnished layout, with active `home-decor.js` integration.
- `src/home-polish.js`: another saved dressing/palette experiment arrived on the feature branch during integration. It is preserved, but it is not imported by the accepted runtime. Do not present palette switching as a shipped feature.

Never force-push over concurrent edits. During this pass, the branch advanced from `a0c7086f` to `002fb770`; its new `home-polish.js` file was preserved by the merge at `d50fd77b`.

## Validation and packaging

Use `npm test` for unit tests. The v4 suite has 19 unit tests. The CI workflow separates browser coverage into three jobs: art (2 tests), interaction (7 tests), and interface (3 tests). The art job verifies both the full compositor and the supported ordinary renderer. The original interaction assertions remain intact; those tests choose the ordinary renderer through the real user preference to avoid spending their entire timeout on software-GPU effects. The interface tests cover resident search and following, a seated cottage visit, actual PNG download, settings persistence, dialogs, and mobile widths 390 and 320.

Validation of `9b24c88c` began in run https://github.com/JinJinJenn/town/actions/runs/42331467429. Do not infer success from this file: inspect the final run, artifacts and any follow-up fixes. Screenshots use software-rendered Chromium and are not hardware frame-rate benchmarks. A cancelled or failed run can still produce a source archive.

Keep checkpoint source, tests, pinned vendor renderer, license, screenshots, provenance, and SHA-256 sums in the downloadable archive. Exclude node_modules, temporary servers, exploratory local scripts, and unrelated files. The archive's COMMIT.txt identifies the saved source; its validation report records the actual tested commit and run.

## Hosting

`HOSTING.md` records the established route. The workflow on main stages only runtime files, appends a build commit on gh-pages without force, explicitly requests the native Pages build, and verifies every published hash against __deployment.json. It then tests actual public rendering and cottage controls. A source commit or an uploaded Pages artifact alone does not establish that the newest game is live. Verify the public source SHA before claiming release.

The Pages source remains gh-pages. Do not switch it to main, because vendor/ is generated by the workflow. User action is not required to deploy ordinary code changes through this established configuration.

## Limits

Only Clover Cottage is furnished; only Luca's sofa interaction is implemented. The bed, kitchen and bathroom props are decorative. There is no general pathfinding, furniture editing, needs/relationship simulation, multiplayer, or infinite streaming. The website is still HTML/CSS; the town is real WebGL2. New detail moves the real-time style toward the pink mockup but is not a pixel-perfect recreation of its painted lighting or textures.

## Run

Packaged archive: `node tools/serve.mjs`, then http://127.0.0.1:4173/town/.
Fresh checkout: `npm ci`, `npm run vendor`, `npm run dev`.
Tests: `npm test`; `npx playwright install chromium`; `npm run test:browser`.
