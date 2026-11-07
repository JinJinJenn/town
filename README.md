# JinJinJenn Town

A procedural, pastel 3D neighborhood for [JinJinJenn](https://jinjinjenn.github.io/), built as a standalone project for `/town/`.

## Checkpoint 02: a home you can visit

The neighborhood has 16 lots, including Jenn's Cafe and two parks, with 32 articulated residents walking along the sidewalks. Seeded recipes vary the other homes, gardens, colors, and residents. This checkpoint keeps the finite street grid and adds one furnished, usable home rather than attempting a whole life simulator at once.

**Visit Clover Cottage** opens a close-up view of its kitchen, living room, bedroom, and bathroom. The roof lifts out of view and the walls facing the camera disappear. Rotating the camera changes which walls are hidden. Choose **Ask Luca to sit**, or select the sofa, and Luca walks around the sidewalk, through the gate, up the steps, and into the living room. After Luca sits down, **Send Luca outside** retraces the route and resumes the neighborhood walk. Pause freezes this activity too.

The house has a real doorway and a hinged door, and its furniture is built from the same reusable geometry kit as the rest of the neighborhood. Roof seams now use filtered surface shading instead of small raised strips. No Blender job, external model service, or generated-image backdrop is required.

This is a new implementation, not recovered source from the interrupted November 6 prototype. The interface uses complete, natural sentences. The world is real-time WebGL, while the website controls remain HTML/CSS.

## Run the packaged checkpoint ZIP

The checkpoint ZIP includes the pinned renderer in `vendor/`, so no CDN or npm installation is needed to run it.

1. Extract the whole ZIP while preserving its folders.
2. In that folder, run `node tools/serve.mjs`.
3. Open `http://127.0.0.1:4173/town/`.
4. Select **Visit Clover Cottage**, then **Ask Luca to sit**.

Alternatively, run `python -m http.server 4173` in the extracted folder and open `http://127.0.0.1:4173/`.

Do not double-click `index.html`: JavaScript modules need a local HTTP server. The scene requires WebGL2. When it cannot start, the page explains the failure instead of presenting a still image as gameplay.

## Run a fresh Git checkout

Use Node.js 20 or later:

```sh
npm ci
npm run vendor
npm run dev
```

`npm run vendor` copies the pinned Three.js 0.180.0 modules and license into `vendor/`. No build bundler is required. To run the tests after preparing the renderer:

```sh
npm test
npx playwright install chromium
npm run test:browser
```

## Controls

| Action | Control |
| --- | --- |
| Move around | Drag, WASD, or arrow keys |
| Zoom | Scroll, pinch, or the + and - buttons |
| Rotate | Right-drag, Q, or E |
| Return to the starting view | R or the home button |
| Inspect a resident or building | Select it in the scene |
| Follow a resident | Select them, then choose Follow this resident |
| Visit the furnished home | Visit Clover Cottage, or select the cottage and choose Look inside |
| Try the sofa | Ask Luca to sit, or select the sofa while the home is open |
| Leave the sofa | Send Luca outside |
| Restore the exterior | Put the roof back |
| Watch a camera tour | Tour |
| Pause movement | Pause |
| Change the lighting | Evening |
| Reproduce a neighborhood | Open ? and enter its seed |

Manual camera input stops the tour or following. The welcome panel remembers dismissal when local storage is available. Rendering and simulation pause when the tab is hidden. Home activity is session-only; there is no editable save format yet.

## Source map

- `src/plan.js` produces deterministic lot recipes and sidewalk paths.
- `src/kit.js` defines shared geometry, architecture, props, materials, roof shading, and instancing.
- `src/world.js` assembles the neighborhood and articulated residents.
- `src/home-plan.js` defines the one furnished layout, furniture footprints, sofa anchor, and bounded route advancement.
- `src/home.js` builds the cottage's independently visible exterior, interior, and door batches.
- `src/home-activity.js` handles Luca's walk, seated pose, and return journey.
- `src/main.js` owns rendering, camera input, lighting, selection, and interface behavior.
- `tests/` contains generation, placement, routing, geometry, desktop, and mobile checks.
- `HANDOFF.md` records the validated commit and the next bounded task.

## Validation and backups

The GitHub Actions workflow checks JavaScript, runs the unit tests, and tests the real renderer in Chromium. Browser checks include a screen-space click on the sofa, pause behavior, camera-aware walls, sitting and returning, seed regeneration during a visit, repeated cutaway toggles, and mobile layouts at 390 and 320 pixels. The long walking journey is advanced through the same simulation code in bounded fixed steps during testing; it is not replaced with teleportation.

Artifacts include source, the pinned renderer, screenshots, test results, `COMMIT.txt`, and `SHA256SUMS.txt`. Packaging also runs when a check fails, so an archive by itself does not mean the tests passed. See `HANDOFF.md` for the accepted result. GitHub Actions artifacts expire after 30 days; Git history and downloaded ZIPs are separate copies. Software-rendered screenshots are not hardware frame-rate measurements.

Checkpoint 01 remains available on `checkpoint/01-visual-neighborhood`. Keep accepted checkpoints intact, and commit each bounded change before starting another expensive task.

## Current limits

Only Clover Cottage is furnished. Its layout and route are authored, not a general room generator or navigation system. Luca is the only resident who can use furniture; other residents still follow sidewalk loops. The bed, kitchen, and bathroom furniture are visual assets, not usable activities yet. Decorating, needs, relationships, cross-block navigation, district streaming, and persistent edits are not implemented.

The roof and shadow pass is an improvement, not a claim of Blender-quality global illumination. Hardware performance, antialiasing at different display scales, and wider device coverage still need review.

## Publishing under /town/

All runtime imports and assets use relative paths. The intended public URL is `https://jinjinjenn.github.io/town/`, but deployment has not been verified. A source commit does not prove GitHub Pages is enabled. A deployed copy needs `index.html`, `style.css`, `src/`, and `vendor/` together.

## Next bounded step

Move the furniture route and interaction data into reusable approach/occupancy records, then add one bed interaction with the same path, pause, release, and regeneration tests. Do not expand to district streaming until the small interaction loop is dependable.

Blender remains optional. Introduce one asset script and one time-limited export at a time, committing both the script and result before another job. A temporary Blender or browser workspace must never contain the only copy of working source.

Independent project; not affiliated with Electronic Arts or Maxis. Runtime geometry is generated by this project's code rather than extracted from The Sims. Third-party renderer licensing is included with packaged checkpoints.
