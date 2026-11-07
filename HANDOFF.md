# Town checkpoint 02: furnished cottage

## Resume here

Continue the existing Three.js project in `JinJinJenn/town`. This is a new implementation, not recovered source from the lost November 6 session. Keep it separate from Jenn's Cafe, Farm, and the main portfolio. Preserve the pastel isometric reference and natural, complete-sentence interface copy.

Checkpoint 01 remains at `517ad13d0c69a932c2764f3d1aeffce9326e23e1` on `checkpoint/01-visual-neighborhood`. Work for this iteration was committed on `feat/checkpoint-02-interior` in multiple source milestones. Do not force-push or overwrite other projects.

## What changed

Clover Cottage is the first furnished home. Its fixed lot is `HOME_ID = 10`, with world origin `(12, 0.376, 11)`. The fixed layout includes a living room, kitchen/dining area, bedroom, and bathroom. The roof, four external walls, interior, base, and door use separate instanced batches. Opening the home hides its roof and the two camera-facing walls; rotation updates the visible sides without rebuilding geometry. Interiors remain hidden in the exterior view.

Luca, resident index 20, can walk from the current sidewalk position to the front gate, up the steps, through the doorway, around the coffee table, and onto the sofa. The seated pose adjusts hips, thighs, knees, and arms. Sending Luca outside reverses the approach route and resumes the original sidewalk loop. The door has a hinge animation. Only one resident and one seat are supported in this checkpoint; this is not a general navigation or interaction-reservation system.

The other 31 residents keep their original sidewalk routines. The 16-lot neighborhood, cafe, parks, camera controls, tour, seed regeneration, and evening lighting remain available. Roof seams use derivative-filtered surface shading rather than tiny raised shadow-casting strips. The structural floor slab sits below the floorboards to avoid coplanar flicker.

The new home shortcut is reachable on narrow mobile layouts. The house inspector moves below the scene on mobile, and the introduction is bounded and scrollable. The interface is still HTML/CSS; the world and residents use WebGL. No Blender dependency was added.

## Validation

Final runtime and tests: `50ddc3bd04f5595f74cfba08d450308a975d550f`.
Final validation run: https://github.com/JinJinJenn/town/actions/runs/42319421394

All 14 unit tests and all 7 browser tests passed. GitHub Actions artifact: `13551864859`. Its downloaded ZIP SHA-256 is `3d1437e0dce602e3ea394bf9404299eab0f277958025085dafd1abeb5df403c4`. The download and its individual file checksums were verified before packaging.

The desktop test uses a real screen-space click on the sofa, checks movement across rendered frames, confirms pause, walks the complete route using bounded production simulation steps, checks seating and return, rotates the cutaway, and toggles the roof repeatedly. Regeneration during a visit releases the interaction and preserves seeded output. Browser tests also cover the original neighborhood controls, mobile viewports at 390 and 320 pixels, and honest handling of unavailable WebGL2.

The fixed-step helper is available only with `?test=1`. It calls the same `world.step` used during play; it does not teleport the resident. Software-rendered Chromium was used for browser verification. No real-device frame-rate claim is made. Geometry-count stability is checked, but that is not an exhaustive memory-leak proof.

Screenshots and validation reports are in the packaged `artifacts/` directory. Inspect the final runtime commit and test result before calling any archive validated. Source packaging also occurs after failed or cancelled runs.

## Run and try the interaction

From the packaged ZIP, run `node tools/serve.mjs` and open `http://127.0.0.1:4173/town/`. The ZIP includes the pinned renderer and its license. Do not open `index.html` using `file://`.

From a fresh checkout, run `npm ci`, `npm run vendor`, and `npm run dev`. Unit tests use `npm test`; browser tests use `npx playwright install chromium` followed by `npm run test:browser`.

Select **Visit Clover Cottage**, then **Ask Luca to sit**, or click the sofa. **Send Luca outside** returns the resident to the sidewalk. **Put the roof back** restores the exterior. Pause freezes the activity, and rotating the camera changes which walls are cut away.

## Implementation notes

- `home-plan.js` owns layout constants, furniture footprints, the sofa anchor, and route advancement.
- `home.js` owns furniture geometry, the separate wall/roof batches, and the hinged door. Call `source.updateMatrixWorld(true)` before compiling its detached child batches; omitting this puts the geometry at the wrong world position.
- `home-activity.js` owns the outside/entering/sitting/leaving states and the character pose.
- `world.js` skips Luca's normal sidewalk update while the home activity owns the resident. It disposes the home batches during regeneration. Shrubs are kept outside the wider cottage footprint.
- `main.js` owns selection, home-view camera changes, UI states, and test inspection hooks.
- `tests/home-geometry.test.mjs` checks actual Three.js matrices with a minimal canvas stub. It verifies lot placement, camera-aware walls, stable batch counts, and floor-surface separation; GPU rendering is covered separately by browser tests.

## Limits and next bounded task

Only Clover Cottage is furnished, and its layout is authored. Only the sofa has a working interaction. Other furniture is visual. General pathfinding, dynamic avoidance, needs, relationships, decorating, persistent edits, cross-block navigation, and district streaming are not implemented. Shadows and character close-ups still deserve further art review; this is not Blender-style global illumination.

The next useful step is reusable furniture approach and occupancy data plus one bed interaction. Add approach-clearance, pause, state-release, and regeneration tests before generalizing to more residents or homes. Avoid adding infinite streaming in the same checkpoint.

## Recovery and publishing

The handoff and README may be committed after the validated runtime. Such a documentation-only commit must be compared against the tested version before accepting the checkpoint. Packaged `COMMIT.txt` identifies the saved checkpoint; `VALIDATED_RUNTIME_COMMIT.txt` identifies the tested code. `PROVENANCE.json` records the workflow, artifact, and packaging relationship. `SHA256SUMS.txt` covers the packaged files.

GitHub Actions artifacts expire after 30 days. Git history and a downloaded ZIP are separate copies, so keep both. Never claim an entire prototype is backed up merely because a branch exists; verify its files and commit.

The intended site is `https://jinjinjenn.github.io/town/`, but GitHub Pages deployment has not been verified. A source commit is not proof of a live deployment. Runtime deployment needs `index.html`, `style.css`, `src/`, and `vendor/` together.

Keep Blender optional: one generator script and one time-limited export at a time, with source and output committed before another job. A temporary cloud workspace must never contain the only copy of working code.
