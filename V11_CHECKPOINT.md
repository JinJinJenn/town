# V11 accepted checkpoint: Go here and player command queues

Baseline V10: fe8f8b68a983771aae7396d26b95d9557008543b. Accepted runtime: fedc014e14b22dc69789b2cd67318ae66df05c04. Passing captures: 5c378e5d5cdff8f74d8d7c27794f8feb61715bba. Review: https://github.com/JinJinJenn/town/actions/runs/42389822454.

All 50 unit tests and four focused browser scenarios passed. Ground clicks open a GPU Go here action; commands take priority over autonomy, reach exact valid destinations, queue up to six actions per resident and support individual or full cancellation. Movement, TV, drinks and directed conversations share the queue. Paused commands remain queued until resumed. Cancellation releases reservations without teleporting. P/0 pauses; Space/N selects the next resident.

The clearance graph covers Clover Cottage's open floor including bedroom/bathroom access, accessible garden regions and connected sidewalks. Other interiors and arbitrary terrain are not supported. Binary-heap A* runs for route requests; exact destination nodes are reused. This is not a complete physical collision solver. Most scenery props remain decorative.

The interface still uses one HUD draw call and the existing 1024x512 atlas. Captured desktop diagnostics are 57 scene calls, 1,058,204 scene triangles, seven textures and 25 geometries. No extra rendering context, image download or light was introduced. These are diagnostic counters, not hardware FPS measurements.

Screenshots and review.json are permanently tracked in docs/v11-captures/. Source was saved before browser review. Release documentation and publishing CI changes do not change the accepted runtime. Confirm the final Pages workflow and exact published manifest before calling it live. Preserve earlier checkpoints and read HANDOFF.md for controls, scope and recovery.
