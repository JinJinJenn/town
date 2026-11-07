# Town V9: GPU live mode and neighborhood gatherings

## Resume here

Only change JinJinJenn/town. V9 builds on V8 release 9b67f1f847d9712c87770a1255a061aae1ff1b7d. Source branch: feat/checkpoint-09-gpu-live-mode. Accepted runtime: f75d4def5523b60de3003fdbe25266c25865996a. Captures are committed at db17c50b4e265ac8c578c472b0110bdf152b15a1. Subsequent documentation and CI updates do not change runtime code. Prior checkpoints remain intact. Public game: https://jinjinjenn.github.io/town/. Leave the separate profile, mods, Cafe and Farm repositories unchanged.

## Interface

The normal page is a full-window WebGL canvas with a compact pink-and-mint live HUD. It has selection/activity, resident shortcuts, pause and 1/2/3 speed controls, home, gathering, resident chooser and a small options menu. The old website header, property-description card and HTML buttons are removed from the active page. No build/buy mode or fake needs bars were added.

A single 1024x512 glyph/icon atlas is rasterized once into an offscreen canvas using the installed system font. Visible glyphs and icons are GPU-textured quads; rounded panels share their geometry/material. The HUD uses one additional draw call on the existing WebGL renderer, not a Canvas2D overlay or another WebGL context. It is bitmap-atlas text, not MSDF. The atlas is not redrawn each frame. Font files are not shipped. Geometry updates when state changes and at a bounded refresh cadence.

HTML remains only as the canvas host, nonvisual instructions, noscript message and fatal graphics-error fallback. Normal gameplay has no visible HTML text or buttons; the web page is not literally HTML-free. Pointer/touch hits, hover tooltips, Tab/Enter and Escape work, but this is not a complete screen-reader interface.

## Residents

All 32 residents use connected sidewalks and crosswalks rather than isolated lot loops. A clearance grid connects the gate, steps and doorway to eight reserved indoor conversation destinations and one reserved sofa position. Six residents start chatting inside and Luca starts seated; the others begin outside. This initial placement happens at world creation. Subsequent visits/departures follow routes without teleporting.

Visits rotate between the cottage and public sidewalk gathering positions near the cafe, parks and house. Gather prioritizes home visits without stacking everyone on one point. Locomotion uses acceleration/deceleration, rate-limited turning, distance-driven gait and walking/sitting blending. Chatters gesture and receive GPU bubbles. Simple following-distance slowdown and opposite sidewalk offsets are included; this is not a general collision-avoidance/crowd solver.

Selected residents can queue sofa use or stand when already sitting. Pause and speed affect the same simulation clock as existing ambient effects. Hidden tabs stop the render loop. Existing V8 geometry, props, garden atlas, limited shadow updates, phone pixel-ratio cap and shading defaults remain. Needs, relationships, jobs, additional furnished homes and other furniture interactions are not implemented.

## Controls

Drag to pan; scroll/pinch to zoom; right-drag or Q/E to rotate. WASD/arrows pan. Click a resident to select them. Space pauses, 1/2/3 set speed, H focuses home, R gives overview, G gathers, F follows, X queues sofa use or stands, V toggles the roof, C changes the cottage palette. Escape opens options; Tab/Enter operate the HUD. The options menu includes overview, roof, evening, palettes, shading, ambient details and regeneration.

The old DOM portfolio panels, resident-search input, tour button and photo-view UI are intentionally not V9 controls. Do not silently claim they were retained. Original versions remain in Git.

## Source and verification

- src/main-v9.js: live renderer lifecycle, camera, input and simulation clock. src/main.js is its stable re-export.
- src/v9-hud.js: atlas, one-batch overlay and control hit rectangles.
- src/v9-life.js: route graph, destination reservations, movement and animation.
- src/world.js: optional live-controller hook, retaining older movement for legacy unit coverage.
- tests/v9.test.mjs: reachability/clearance, deterministic visits, movement bounds and sofa reservation.
- tools/review-v9.mjs: actual WebGL capture and pointer/keyboard, phone/tablet, no-DOM and missing-art checks. SITE_URL runs the public smoke check.
- tools/integrate-v9.mjs: guarded development migration, not a browser dependency; accepted source is already integrated.

Review run 42383482984 passed all 40 unit tests and five browser scenarios: desktop, 390px, 320px, 820px and missing-art fallback. Its 900-second unit simulation verified visits by all 32 residents, 92 arrivals and 97 departures, unique reservations and bounded movement. Browser checks exercise actual GPU hit locations, pause/2x/3x, movement, gathering, sofa stand-up, palette changes, roster selection and following. More exhaustive physical-device playtesting remains worthwhile; do not claim every old version-specific browser test passes.

The desktop capture reports 57 scene calls, 1,048,818 scene triangles, seven renderer textures and 24 geometries, with one extra HUD call. These are diagnostic counters, not a matched V8 FPS benchmark. The 320px capture uses renderer pixel ratio 1 with soft shading off. Screenshots are real software-rendered Chromium captures, not image-generation outputs.

The initial browser run caught a test race: opening a GPU menu changes state before the next frame builds its hit table. The review now waits for rendered control bounds and a subsequent frame. Preserve that synchronization.

## Publish and recover

Main's validation now uses the V9 harness instead of legacy DOM scripts. Pages retains complete public-file hash verification and runs the new live-mode smoke test. Check the final Pages result and public __deployment.json commit before saying a source update is live. Preserve checkpoint/08-prop-variety and earlier versions. Source alone on the feature branch is not publication.

Packaged source includes vendor/: node tools/serve.mjs, then http://127.0.0.1:4173/town/. Fresh checkout: npm ci --ignore-scripts; npm run vendor; npm run dev. Do not use file://. npm test runs unit tests. Install Playwright Chromium, then node tools/review-v9.mjs for the focused browser suite.

Source is committed before heavy tests. Passing captures are tracked in docs/v9-captures, and source archives include checksums. Use expected-SHA fast-forward updates, never force-push over concurrent edits. Keep this a bounded live-mode checkpoint.
