# Town V6: illustrated gardens in a real 3D world

This batch integrates five generated art derivatives into the game. It is not another concept screenshot. All work belongs to JinJinJenn/town; other repositories are unchanged.

The decorative layer has 64 illustrated hedge clusters, 32 planter clusters and three blank garden noticeboards, using three instanced draw batches and shared textures. Cards are ground-anchored and face the camera. Alpha-tested depth preserves occlusion by the real 3D scene. Existing petals gain a painted texture and remain driven by the paused/reduced-motion-aware simulation. Floral corner artwork decorates interface cards. An Art cards gallery at assets/v6/ exposes the runtime images.

Buildings, cutaway walls, furniture, residents and Luca's sofa route remain 3D. Illustrated props are decorative, not selectable furniture or new gameplay. The help panel can disable the garden layer independently from petals. Missing art files do not prevent the underlying 3D game from starting.

Runtime textures are compact 96px-class WebP derivatives for small on-screen props, not full-resolution source artwork. Original PNGs are preserved in the user's downloaded thread art kit. assets/v6/manifest.json records source and derivative hashes. The larger house and furniture illustrations are not substituted for playable geometry.

Source starts at V5 4f354acd19918c68f3fc57726ea06078dc0d479b. Work branch: feat/checkpoint-06-mixed-media. The review workflow commits the guarded integration before testing; its trigger SHA may differ from the actual tested SHA in COMMIT.txt. Verify Review Town V6 and the Pages workflow before calling this release tested or live.
