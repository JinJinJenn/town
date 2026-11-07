# V9 accepted checkpoint: GPU live mode

Baseline V8: 9b67f1f847d9712c87770a1255a061aae1ff1b7d.
Tested runtime: f75d4def5523b60de3003fdbe25266c25865996a.
Passing evidence: db17c50b4e265ac8c578c472b0110bdf152b15a1.
Review: https://github.com/JinJinJenn/town/actions/runs/42383482984.

All 40 unit tests and the five focused browser scenarios passed. Screenshots and review.json are committed under docs/v9-captures. The UI is GPU-rendered with one glyph/icon atlas and one additional draw call. Normal gameplay has no visible DOM text/buttons; a fatal graphics-error fallback remains HTML.

The existing 32 residents now share connected neighborhood routes and rotate through eight reserved indoor conversation slots plus a sofa. Six people start chatting and Luca starts seated. The long unit simulation verified all residents visited, with 92 arrivals and 97 departures. Movement is distance-driven with acceleration and limited turning. Pause/speed and keyboard/pointer controls work. No build mode or new needs/relationship system is included.

The first review's menu-click timing failure was fixed by waiting for the GPU hit table to rebuild; the successful second review retains actual pointer clicks rather than bypassing controls. The desktop capture reports 57 scene calls plus one HUD call, 1,048,818 scene triangles and seven renderer textures. No hardware FPS claim is made.

Release documentation and CI adjustments do not modify the accepted runtime. Pages must be checked separately before declaring it live. Preserve older checkpoints. Read HANDOFF.md for scope, controls, code map and recovery.
