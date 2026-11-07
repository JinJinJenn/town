# Town V12 accepted checkpoint

V11 baseline: `a9290b5e532a6fc8d33ccb23a4b64828a53e3614`.

Accepted V12 gameplay runtime: `3818b7f72b8105272685be54d1208f46a7619970`.

Passing captures: `d42086d45729e15578d2298f03c8aab65ed844a1`.

Feature review: https://github.com/JinJinJenn/town/actions/runs/42395990250

V12 makes 21 outdoor seating positions commandable through the GPU **Sit** context and extends indoor conversations from pair-only behavior to small dynamic social circles. Directed Chat remains target-specific inside a group, and members can leave without destroying the remaining conversation.

The accepted review passed 54 unit tests plus a real WebGL browser flow that clicked the home lounger, executed Sit, verified finite resident/HUD state, formed a 3+ Sim social and captured phone layout. Review artifacts are committed under `docs/v12-captures/`.

A transient Three.js bounding-sphere warning is recorded at boot; persistent geometry and runtime state audits are clean. Treat that warning as known/unresolved rather than fixed.

Read `HANDOFF.md` for exact scope and limitations. Confirm Pages and the public deployment manifest separately before calling the checkpoint live.
