# Town V12: functional seating and multi-Sim socials

Only change `JinJinJenn/town`. V11 baseline: `a9290b5e532a6fc8d33ccb23a4b64828a53e3614`. V12 work branch: `feat/checkpoint-12-seats-groups`. Accepted runtime was reviewed from `3818b7f72b8105272685be54d1208f46a7619970`; passing captures were committed at `d42086d45729e15578d2298f03c8aab65ed844a1`. Subsequent documentation and CI changes do not change gameplay runtime. Preserve earlier checkpoints. Public game: https://jinjinjenn.github.io/town/. Leave the profile, mods, Cafe and Farm repositories alone.

## Scope

V12 is an interaction-coverage checkpoint. V11 already provides resident selection, Go here, a six-command player queue, cancellation, table drinks, TV watching and directed Chat. V12 makes a useful first set of outdoor chairs real and replaces pair-only conversations with small social circles.

Twenty-one outdoor seat targets are planned across the furnished home and two parks. Clover Cottage exposes two bistro seats, one lounger and two garden-bench seats. Each park exposes four picnic-bench positions, two chess chairs and two park-bench positions. Click one of those meshes and choose **Sit** from the GPU context menu. The resident routes to a reserved seat, settles into the existing seated pose, stays for a bounded period and releases the reservation. These targets reuse invisible shared hit geometry and add no texture download or new render context.

This does **not** make every decorative chair in every procedural residential yard interactive. Those lots do not yet have full local navigation/interactions and should be expanded deliberately rather than by teleporting residents.

## Multi-Sim socials

Indoor talk destinations are organized into social circles with up to four positions rather than hard-coded pairs. A circle becomes active with two residents and can gain additional residents. Speakers rotate through the current membership. Residents face the group centroid, listeners use the existing listening motion, and normal autonomous turnover remains allowed.

Directed **Chat** still matters inside a group. A player-commanded resident waits for the requested target to arrive before the command is considered fulfilled. The selected Sim and requested target prefer each other as reciprocal partners even if other residents are present. A third/fourth resident may join later. Cancelling or naturally finishing one resident removes only that resident; the remaining social continues when at least two members remain.

The old invitation timing and target-pair regression is still covered by V11 tests.

## Controls and UI

V11 controls remain:
- left click/tap clear floor, accessible yard or connected sidewalk -> **Go here**
- click supported seating -> **Sit**
- click dining table -> **Have a drink**
- click TV/sofa -> **Watch TV**
- click another resident -> **Chat** or select them
- portraits/right-click resident select; P/0 pause; 1/2/3 speed; Space/N next resident
- click a queued action to cancel it; X/Delete cancels all
- drag/WASD/arrows pan; right-drag or Q/E orbit; wheel/pinch zoom; H home; R overview; F follow

The Sit menu, queue label and seat icon stay inside the existing GPU HUD batch and atlas. No visible DOM game controls, build mode or new permanent toolbar were added.

## Source map

- `src/v12-seats.js`: deterministic seat definitions, navigation slot attachment and shared invisible click targets.
- `src/v11-life.js`: still the active command/life controller; V12 extends it with seat commands, reservations and group social membership.
- `src/v11-hud.js`: Sit context/queue support and finite-quad guard.
- `src/main-v11.js`: mounts/disposes V12 seat targets and exposes test/debug seat projection.
- `tests/v12.test.mjs`: seat coverage, selected Sit command, 3+ Sim social joining and group-member cancellation.
- `tools/review-v12.mjs`: real rendered outdoor-seat click, GPU Sit action, 3+ Sim social, finite-state audit and phone capture. `SITE_URL` selects public Pages verification.
- `.github/workflows/v12-review.yml`: bounded feature review and recoverable packaging.

The filenames retain V11 names for the shared controller/runtime to avoid a large rename-only checkpoint. Do not assume the name means V12 code is absent.

## Verification

Feature review run `42395990250` passed **54/54 unit tests** and the focused browser review. The browser physically clicked the home lounger, waited for the GPU Sit hit region, commanded the selected resident to sit, then formed a social with `maxGroup: 3`. Its final reviewed stats included 32 neighbors, 32 total activity slots, 4 residents seated at that moment and 12 seat sessions during the simulated interval.

The browser also audits persistent scene geometry, resident positions and HUD control rectangles for finite values. A transient Three.js `computeBoundingSphere` console warning is recorded at boot; the accepted V11 harness previously filtered this class of non-shader error, and V12's persistent geometry/state audits are clean. Do not describe that warning as fixed until its pre-existing source is isolated. Shader/page errors still fail review.

Accepted captures are in `docs/v12-captures/`. Software Chromium is not a hardware FPS benchmark.

## Publish/recovery

Before saying V12 is live, verify:
1. `main` contains the accepted checkpoint.
2. Pages workflow passes all file hashes.
3. Public `__deployment.json` identifies the same main commit.
4. Public `tools/review-v12.mjs` interaction smoke passes.

The source checkpoint should be preserved as `checkpoint/12-seats-groups`. Never force-push over concurrent work. A source archive should include `vendor/`, captures and SHA-256 checksums.

Fresh checkout: `npm ci --ignore-scripts`, `npm run vendor`, `npm test`, install Playwright Chromium, then `node tools/review-v12.mjs`. Local server: `node tools/serve.mjs`.
