# Motion coach platform

Stance Judge treats **motion coaching** as a small platform: shared rig, retargeting, and visual-coach playback; **discipline packs** plug in routines (wushu first, then TKD forms, basketball layup drills, dance phrases, etc.).

## Layers

| Layer | Path | Responsibility |
| --- | --- | --- |
| Coach rig | `src/lib/pose/coach-figure/`, `src/lib/pose/canonical3d/` | Anatomy-neutral skeleton, keyframes, sampling, constraints |
| Motion core | `src/lib/motion/` | Choreography helpers, visual-coach registry, humanoid retarget (H-Anim / Mixamo glTF) |
| Discipline | `src/lib/disciplines/<name>/` | Routine choreography, cues, registration |
| Syllabus metadata | `src/lib/wushu/routines/` (today) | Move lists, names, judging hooks — may split per discipline later |

## Adding a discipline

1. Add `src/lib/disciplines/<discipline>/choreography/` with `MoveChoreographySpec` data.
2. Add `visual-coach/<routine>.ts` to build a `RoutineVisualCoachSpec` (chain 定势 between moves when needed).
3. Call `registerVisualCoachRoutine` from `disciplines/<discipline>/register.ts`.
4. Import `@/lib/motion/disciplines-init` from the app entry or coach UI (side-effect registration).

Wushu reference: `disciplines/wushu/register.ts` registers **五步拳** (`wu-bu-quan`). Registration uses `registry-core.ts` to avoid circular imports with the public `visual-coach/registry` barrel.

## Retargeting

Coach poses are retargeted onto a glTF humanoid (`public/models/xbot.glb`, Mixamo bone names) under `motion/retarget/hanim/`. Future disciplines reuse the same retarget path; only choreography and stance recipes change.

## Backward compatibility

Legacy imports under `pose/hanim/` and `pose/choreography/wbq-*` re-export the new locations so existing tests and docs keep working during migration.
