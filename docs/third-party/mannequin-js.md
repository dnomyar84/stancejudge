# mannequin-js (GPL-3.0)

3D coach figures use **[mannequin-js](https://github.com/boytchev/mannequin.js)** (v5.2.3) for articulated human meshes: head, neck, torso, upper/lower limbs, palms, feet.

- **License:** GPL-3.0 — see `node_modules/mannequin-js/LICENSE`
- **Integration:** `src/lib/pose/mannequin-adapter/` + `scene-stub.ts` (no fullscreen canvas side effects)
- **Pose drive:** `coach-pose-to-mannequin.ts` maps `ExtendedCoachPose` joint targets to mannequin joint angles (client-side IK heuristic)
