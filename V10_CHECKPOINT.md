# V10 accepted source checkpoint

V9 baseline: 81a2ec56cc78173e5364014016489b34072ad0f7. Tested V10 runtime: b1eb719cd92aeddcbf37468ac2c78267140378b5. Passing captures: 81301167082fb377b3ead9ff29e92c356e0fba2f. Review: https://github.com/JinJinJenn/town/actions/runs/42387145772.

All 45 unit tests and five focused browser scenarios passed. The household starts with two reciprocal talking/listening pairs, two seated drinkers and Luca watching television. All 32 neighbors continue to visit and leave. Smaller heads, longer limbs, articulated elbows, held cups and appearance-matched portraits make activities more legible. Clicking the TV/sofa or table reveals its contextual GPU action. The camera is closer and slightly lower.

The HUD still uses one draw call and the existing 1024x512 atlas; portraits occupy unused atlas space. No new image/video download, light or render context is required. The TV is one small shader plane. Desktop capture counters: 57 scene calls plus one HUD call, 1,058,204 scene triangles, seven textures and 25 geometries. These are diagnostics, not a matched-camera V9 performance comparison or hardware FPS benchmark.

Source was committed before expensive browser review. Passing captures and review.json are tracked in docs/v10-captures/. The initial shader failure was corrected before acceptance. Read HANDOFF.md for controls and scope. Confirm the completed Pages workflow and the published deployment manifest separately before calling any new commit live.
