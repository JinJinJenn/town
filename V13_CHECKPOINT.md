# Town V13: seated animation and exit QA checkpoint

Base: V12 live on main at 33d75c4b2feb24fbd65a149ca04af8400111b4b5.

V13 fixes a concrete movement/animation defect: when a Sim was sitting on the sofa, an outdoor chair or a dining chair, a queued move or cancellation could translate the character while their pelvis and bent legs were still in the sitting pose. This caused visible clipping through seating meshes.

## Behavior

The shared V12 household controller now records the outgoing seat and its ground/hip height when releasing a seated activity. For 0.82 simulated seconds, the actor holds their world XZ position while their torso/limbs transition from seated to standing and the pelvis rises on the correct seat-relative ground frame. The character's route does not advance until the transition completes. The temporary outgoing seat remains blocked from reoccupation until the Sim has finished standing. A command cancellation releases logical occupancy promptly but does not skip the visual exit.

The same transition covers:
- Clover Cottage TV sofa and dining chairs
- all V12 garden, bistro, park, chess and picnic seat activities
- autonomous seat turnover, manual commands, queued actions and cancellations

This is a procedural pose transition, not mocap, full-body IK, or an exact mesh collision solver. The navigation clearance model still excludes decorative meshes. Do not claim all 3D animation problems are solved.

## Verification and performance

V13 added four targeted regression tests. The existing suite plus V13 passes 64 tests, covering seat/get-up positions, walking after standing, cancellation, outdoor lot floor offsets, group gestures and finite actor transforms.

Review workflow: https://github.com/JinJinJenn/town/actions/runs/42524824075 (passed).
The Playwright WebGL review loaded the real 3D game, captured Luca seated, mid-stand and fully standing, then exercised the outdoor lounger, GPU HUD, and 390-pixel phone layout.

Captured evidence: docs/v13-captures/TownV13-sofa-seated.png, TownV13-standing-up.png, TownV13-standing-clear.png, TownV13-garden-lounger.png, TownV13-phone.png, and review.json. These are actual 3D browser captures, not generated concept art.

V13 reuses existing character meshes, shaders, atlas, and furniture hit targets. It adds no new rendering batches, particles, textures, or draw calls for the get-up transition.

## Recovery and publication

The guarded tool tools/apply-v13.py was used to save the runtime source before costly browser review. src/v11-life.js is still the shared controller; src/main-v11.js and src/v11-hud.js continue to host the V13 runtime and GPU interface to avoid disruptive renames. tests/v13.test.mjs and tools/review-v13.mjs are executable QA evidence.

Preserve checkpoint/13-animation-qa after review. Main publishes through the existing GitHub Pages workflow. Confirm the public __deployment.json source commit and actual Pages browser smoke before calling V13 live. Do not overwrite separate JinJinJenn mods or site repositories.
