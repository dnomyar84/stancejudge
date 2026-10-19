# ADR-004: Display figurine pose (Mermaid-like display contract)

**Status:** Accepted  
**Date:** 2026-10-19  

## Context

Choreography stored `ExtendedCoachPose` (3D joint *positions* in coach space). The mannequin viewer inferred joint *angles* through heuristic IK (`applyCoachPoseToMannequin`). That mapping is many-to-one and lossy — the same stored pose could not be reproduced on the figurine without ambiguity, unlike text → Mermaid rendering.

Semantic 3D (scoring, 2D projection, stance rules) still needs joint positions. The **on-screen figurine** needs a separate, deterministic layer.

## Decision

1. Introduce **`CoachFigurinePoseV1`** (`coach-figurine-pose/v1`) — a JSON object of mannequin-js public angles (same vocabulary as the posture editor): `leftLeg.raise`, `torso.bend`, etc.
2. **Display rule:** if a keyframe (or sampled frame) includes `figurine`, the viewer calls **`applyCoachFigurinePoseToMannequin`** (1:1 assignment, no IK).
3. **Semantic rule:** `pose: ExtendedCoachPose` remains on keyframes for cues, constraints, and future 2D/3D scoring.
4. **Authoring:** use `rigKeyframe({ pose, figurine? })` — omit `figurine` only while migrating; compile once via `extendedToCoachFigurinePose` (legacy IK, deprecated for display truth).
5. **Playback:** interpolate `figurine` with `lerpCoachFigurinePose` when both endpoints store it; otherwise compile from lerped semantic pose (temporary).

## Consequences

- Tuning a move for visuals = edit `figurine` (or capture from mannequin posture editor), not chase skeleton XYZ.
- glTF path later adds a second driver mapping the same schema or a parallel `coach-figurine-pose/v2` for Mixamo DOFs.
- ADR-003 canonical 3D stays valid for *meaning*; ADR-004 owns *pixels on the coach mesh*.

## Alternatives considered

- **Store only mannequin `posture` v7 arrays:** rejected — opaque, hard to diff in reviews; DOF record is clearer.
- **Make joint positions display truth:** rejected — mannequin-js does not expose FK from arbitrary world targets without IK.
