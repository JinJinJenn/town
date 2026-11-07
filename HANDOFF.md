# Town V11: player-directed live-mode controls

Only change JinJinJenn/town. Baseline: fe8f8b68a983771aae7396d26b95d9557008543b (V10). Work branch: feat/checkpoint-11-player-control. Accepted runtime: fedc014e14b22dc69789b2cd67318ae66df05c04. Passing captures: 5c378e5d5cdff8f74d8d7c27794f8feb61715bba. Final documentation and publishing-workflow changes do not change that runtime. Keep previous checkpoints. Public game: https://jinjinjenn.github.io/town/. Leave the separate profile, mods, Cafe and Farm repositories alone.

## What changed

V10 exposed a few activities but had no floor command or player action queue. V11 adds the missing player-control layer rather than more art. Select a resident by portrait or right-click their in-world character. Left-click clear floor, the furnished lot's accessible garden, or a connected sidewalk and choose Go here. A GPU target marker identifies the destination. Other homes remain closed; unsupported or blocked terrain is rejected instead of teleporting the resident or pretending it is navigable.

Every resident has up to six explicit player commands, including the current command. The first command interrupts autonomous behavior; subsequent commands execute in order. The selected resident's GPU action strip shows active and queued actions. Click or tap an action to cancel it, or X/Delete to cancel all. Cancellation releases activity reservations and preserves the logical position. The next route may first retrace the unfinished safe segment to its last waypoint. Completing a move leaves the resident standing for 60 simulation seconds before ordinary autonomy resumes.

Click the dining table to queue Have a drink, or the TV/sofa to queue Watch TV. Left-click another resident for Chat or Select resident. Targeted chat reserves a pair of existing indoor conversation spots and waits for both people to arrive. This is not an arbitrary-location social group solver. Busy activities use bounded waiting rather than stealing another player's reservation.

The house remains populated and unselected residents retain their autonomous activities and neighborhood circulation. No build/buy mode, needs, jobs, relationship simulation or new art was added. All 32 residents remain selectable; this is not a new household-ownership system.

## Controls

- Left click/tap: object or ground context menu. Choose its action to enqueue it.
- Portrait click/tap or right-click a resident: select that resident.
- P or 0: pause/resume. 1/2/3: simulation speed.
- Space or N: next resident. This intentionally replaces V10's Space-to-pause behavior.
- Click a queued action: cancel it. X or Delete: cancel all selected resident commands.
- Escape/right-click empty space: dismiss context. Escape also opens options when no context is open.
- Drag/WASD/arrows: camera pan; right drag or Q/E: orbit; wheel/pinch: zoom.
- H: focus home. R: overview. F: follow. T: queue TV. B: queue drink. Existing roof, palette and options remain.

This is a simplified click-and-queue control scheme, not complete Sims 3/4 keyboard or simulation parity.

## Rendering and navigation

The command strip, context menus and target marker share the existing single GPU HUD batch and 1024x512 glyph/icon/portrait atlas. No DOM game controls, external font files, image downloads, additional lights or render contexts were introduced. HTML remains the canvas host and fatal-error fallback. Screen-reader accessibility remains incomplete.

src/v11-navigation.js extends the existing entry/sidewalk graph with clearance grids for the cottage floor and its garden. Furniture, partitions, bounds and modeled V8 yard-prop footprints block destinations. Binary-heap A* runs on destination changes, not every frame. One reusable exact-destination endpoint per resident prevents growing the graph on repeated commands. This is not a complete physics collision or crowd-avoidance system; decorative sprigs are not obstacles and the model does not cover every scenery mesh.

## Source and accepted verification

- src/v11-life.js: command priority, bounded queues, cancellation, safe-route continuation and invitation handshake.
- src/v11-navigation.js: clearance grid, valid endpoint resolution and A*.
- src/v11-hud.js: GPU contexts, action strip and touch hit regions.
- src/main-v11.js: canvas input, floor raycasting, shortcuts and runtime. src/main.js re-exports it.
- tests/v11.test.mjs: reachable destinations, furniture rejection, exact arrival, command order, cancellation, movement bounds, furniture queues and invited partners.
- tools/review-v11.mjs: real ground and furniture pointer input, GPU queue cancellation, pause/selection keyboard semantics, 390/320-pixel touch checks and regeneration/missing-art fallback. SITE_URL runs the public check with natural simulation time, not the test advance helper.
- tools/integrate-v11.py and tools/refine-v11.py: development migrations only. Native source is already saved in Git and browsers do not run these scripts.

Review run 42389822454 passed all 50 unit tests and four browser scenarios: desktop, 390px touch, 320px touch, and 820px regeneration/missing-art. The desktop browser actually clicked floor, chose Go here, enqueued a second destination, cancelled it through the GPU control, reached the first point, and completed a queued drink. Simulation tests also cover bedroom/bathroom and garden reachability, safe cancellation and directed conversation. The first review exposed an invitation timing bug; the accepted source waits for both participants and releases the invitee on cancellation.

Actual captures and review.json are tracked under docs/v11-captures. The desktop capture reports 57 scene calls plus one HUD call, 1,058,204 scene triangles, seven renderer textures and 25 geometries. This is not a matched-camera performance comparison or a hardware FPS benchmark. Phone default renderer ratio remains 1 with soft shading off. The artwork and 113 V8 props are retained, not new V11 content.

## Publish and recover

Read HOSTING.md. Main uses the V11 harness for validation and public-site verification. Keep the complete public-file hash check. Verify the final Pages result and public __deployment.json commit before claiming publication; a source branch or passed local test is not a live release. Preserve earlier branches and use expected-SHA fast-forward updates, never force-push over concurrent changes.

Packaged source includes the pinned renderer: node tools/serve.mjs, then http://127.0.0.1:4173/town/. Fresh checkout: npm ci --ignore-scripts; npm run vendor; npm run dev. Do not open via file://. npm test runs unit tests. Install Playwright Chromium, then node tools/review-v11.mjs for the browser review. Archive source and checksums before costly follow-up. Keep this a bounded controls checkpoint.
