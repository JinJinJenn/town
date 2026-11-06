# JinJinJenn Town

A procedural, pastel 3D neighborhood for [JinJinJenn](https://jinjinjenn.github.io/), built as a standalone project for `/town/`.

## Checkpoint 01: the visual benchmark

This is a new implementation, not recovered source from the interrupted November 6 prototype. It starts with one finite neighborhood so the art, controls, and performance can be judged before streaming or deeper simulation is added.

The source implements 16 lots, including two parks and Jenn's Cafe; parameterized cottages and two-storey houses; layered pitched roofs, shutters, porches, fences, gardens, street furniture, and a pond bridge; and 32 varied, articulated residents who walk along the sidewalks and occasionally pause. Repeated parts are combined into instanced rendering batches.

The camera supports dragging, zooming, rotation, an optional tour, and following a selected resident. The interface includes afternoon/evening lighting, simulation pause, reproducible neighborhood seeds, and links to Jenn's main website. Prose uses complete, natural sentences rather than marketing fragments.

**This is not a complete life simulator.** Streets currently use a fixed grid. Seeds vary the buildings, palettes, gardens, and residents. Residents follow sidewalk loops rather than planning activities. Furnished interiors, house cutaways, decorating, needs, relationships, district streaming, and Blender assets are not implemented in this checkpoint.

## Run the packaged checkpoint ZIP

The GitHub Actions checkpoint archive includes `vendor/`, so no CDN or package installation is needed to run that archive.

1. Extract the whole ZIP while preserving its folders.
2. In that folder, run `node tools/serve.mjs`.
3. Open `http://127.0.0.1:4173/town/`.

Alternatively, run `python -m http.server 4173` from the extracted folder and open `http://127.0.0.1:4173/`.

Do not double-click `index.html`: browsers restrict JavaScript modules opened through `file://`. The graphics scene requires WebGL2. A clear error is shown when it cannot start; a static render is never presented as live gameplay.

## Run a fresh Git checkout

Use Node.js 20 or later:

```sh
npm install
npm run vendor
npm run dev
```

`npm run vendor` copies the pinned Three.js 0.180.0 modules and license into `vendor/`. The renderer files are generated dependencies, not Blender exports. No build bundler is required.

## Controls

| Action | Control |
| --- | --- |
| Move around | Drag, WASD, or arrow keys |
| Zoom | Scroll, pinch, or the + and - buttons |
| Rotate | Right-drag, Q, or E |
| Return to the starting view | R or the home button |
| Inspect a resident or building | Select it in the scene |
| Follow a resident | Select them, then choose Follow this resident |
| Watch a camera tour | Tour |
| Pause resident movement | Pause |
| Change the lighting | Evening |
| Reproduce a neighborhood | Open ? and enter its seed |

Manual camera input stops the tour or following. The welcome panel remembers dismissal when local storage is available. Simulation/rendering pauses when the tab is hidden. There is no player save format yet because this checkpoint has no editing system.

## Source map

- `src/plan.js` produces deterministic recipes and sidewalk paths without a renderer dependency.
- `src/kit.js` defines shared parametric geometry, architecture, props, and instancing.
- `src/world.js` assembles the neighborhood and articulated residents.
- `src/main.js` owns rendering, camera input, lighting, selection, and UI behavior.
- `tools/serve.mjs` serves either the root or the `/town/` subpath for testing.
- `tests/` contains generation invariants and browser checks.
- `HANDOFF.md` records the checkpoint state and the next bounded task.

## Validation and backups

`npm test` checks seeded generation, lot dimensions, and looping sidewalk routes. To run the browser suite locally, use `npx playwright install chromium` followed by `npm run test:browser`.

The GitHub Actions workflow validates the source and runs actual browser rendering and interaction checks. It saves desktop, neighborhood-only, evening, and mobile screenshots, plus test evidence and a source archive. It also packages source when a validation step fails, so a failed test does not discard the work.

Each archive contains `COMMIT.txt`, `SHA256SUMS.txt`, and the dependency license. The workflow's downloadable artifacts expire after 30 days; Git commits and any ZIP you keep locally are separate copies. Always inspect the workflow result and handoff before treating a checkpoint as validated. Software-rendered screenshots do not establish real-device frame rates.

## Publishing under /town/

All runtime imports and assets use relative paths. The intended public URL is `https://jinjinjenn.github.io/town/`. A source commit alone does not prove Pages is enabled or the site is live. The deployed site needs `index.html`, `style.css`, `src/`, and `vendor/` together.

## Next steps

First review the visual benchmark against the reference and refine proportions, shadows, and character readability. Then add one furnished, usable house before expanding the simulation. Add worker-based district streaming only after those small milestones are verified.

Blender remains optional. Introduce one asset generator and one time-limited export at a time, committing the script and exported result before beginning another. A Blender job must never be the only place a working neighborhood exists.

Independent project; not affiliated with Electronic Arts or Maxis. Runtime geometry is generated by this project's code rather than extracted from The Sims. Third-party renderer licensing is included with packaged checkpoints.
