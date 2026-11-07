# Town V10: household activities and portrait-led GPU live mode

Only change JinJinJenn/town. V9 baseline: 81a2ec56cc78173e5364014016489b34072ad0f7. Work branch: feat/checkpoint-10-household-life. Tested runtime: b1eb719cd92aeddcbf37468ac2c78267140378b5. Passing captures: 81301167082fb377b3ead9ff29e92c356e0fba2f. Release documentation and CI changes do not change that runtime. Leave the profile, mods, Cafe and Farm repositories alone. Preserve earlier checkpoints.

## Scope

The central cottage remains the starting view, now closer and slightly lower. The existing town, 16 lots, 32 residents, detailed props and illustrated garden cards remain. No build/buy mode, needs, jobs, relationship simulation or additional furnished homes were introduced.

The household controller uses three pairs of conversation destinations, one reserved sofa/TV spot and two reserved dining chairs. The initial household contains two talking/listening pairs, two residents having drinks and Luca watching television. Only world construction places residents directly at their activities. Later arrivals and departures use the connected street, entry and clearance graph. Characters settle, perform bounded activities, release slots and circulate outside. Conversations require reciprocal partners and alternate speech/listening turns. Selected activity requests do not steal occupied destinations.

Residents have smaller heads, longer legs, clearer clothing silhouettes, articulated elbows and held cups. Seated drinking raises a cup; TV watching turns the head toward the screen; listeners nod while speakers gesture. This is procedural animation, not full-body IK or motion capture. Locomotion retains acceleration, bounded turning, distance-driven gait and simple following distance. It is not a general crowd collision solver.

One small unlit procedural TV screen becomes active when someone watches. It needs no image/video download or extra light, follows the simulation clock and is hidden with the cottage closed.

## GPU interface

The compact desktop HUD sits at the bottom left. Selected and nearby residents have colored portraits based on their actual skin, hair, clothes, hat and glasses metadata. These are illustrated faces, not offscreen renders of the 3D mesh. Portraits, glyphs, icons and rounded panels share the existing 1024x512 atlas and one GPU overlay draw call. Canvas2D only prepares atlas pixels; the visible interface is WebGL. Portrait regions rebuild for a changed world seed, not each animation frame. No font files are bundled.

Select a resident, then click the dining table for Have a drink or the TV/sofa for Watch TV. Context menus dismiss when clicking elsewhere or pressing Escape. T or X queues/stops TV; B queues/stops a drink. Space, 1/2/3, H, G, R, F, Q/E, palette and options controls remain. There is no build mode or permanent action-toolbar expansion. HTML only hosts the canvas, nonvisual instructions and fatal-error fallback. Screen-reader accessibility remains incomplete.

## Source and recovery

- src/v10-life.js: household navigation, destination reservations, reciprocal conversations, activity lifecycle and animation.
- src/v10-characters.js: shared-primitive resident factory, appearance metadata and held cups.
- src/v10-fixtures.js: TV shader and furniture hit targets with explicit cleanup.
- src/v10-hud.js: GPU portrait atlas, compact layout and object-action menu.
- src/main-v10.js: integrated runtime; src/main.js is its re-export.
- src/world.js: optional character factory hook, retaining legacy unit coverage.
- tests/v10.test.mjs: reachability, reciprocal partners, selected action requests, turnover and movement bounds.
- tools/integrate-v10.mjs and tools/refine-v10.mjs: guarded development migrations, not browser dependencies. Native accepted source is already committed.
- tools/review-v10.mjs: actual rendered captures, object clicks, activities, no-visible-DOM assertion, phone/tablet and missing-art checks.
- .github/workflows/v10-review.yml: saves integrated source before browser work, commits passing captures and packages recoverable source even on failure.

Review run 42387145772 passed all 45 unit tests and five browser scenarios: desktop, 390px, 320px, 820px and regeneration/missing-art. The 900-second simulation covered all 32 residents, 87 arrivals, 90 departures, 21 paired conversations, 22 drink sessions and nine TV sessions. The browser exercised actual projected furniture clicks, selected drink completion, pause, palettes, portrait selection, following and phone control bounds. The initial browser failure caught a reserved GLSL identifier in the TV shader; it was fixed, not ignored.

Captured desktop counters: 57 scene calls plus one HUD call, 1,058,204 scene triangles, seven textures and 25 geometries. These are software Chromium diagnostics, not hardware FPS or a matched-camera V9 performance comparison. Before/after screenshots intentionally show the versions' different arrival framing. Actual passing captures are permanently tracked in docs/v10-captures/.

## Run and publish

Packaged source includes the pinned renderer: node tools/serve.mjs, then http://127.0.0.1:4173/town/. Fresh checkout: npm ci --ignore-scripts; npm run vendor; npm run dev. Do not use file://. npm test runs unit tests. Install Playwright Chromium and run node tools/review-v10.mjs for the browser suite. SITE_URL selects the public-site smoke check.

Main deploys through the established Pages workflow with public file hashes and a live browser check. Read HOSTING.md. Confirm the final Pages result and public __deployment.json commit before saying a new version is live. Preserve bounded merging, the garden atlas, shadow throttling, phone quality defaults and disposal. Never force-push over concurrent work or confuse a saved feature branch with a published release.
