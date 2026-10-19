# ADR-003: 3D canonical pose model (source of truth)

**Status:** Accepted  
**Date:** 2026-10-19  

## Context

Pose understanding today is split: coach art (3D skeleton projected to 2D) vs scoring driven by coarse enums and MediaPipe 2D keypoints. Video frame picking assumes a single representative 2D frame is “correct.” Monocular 2D cannot uniquely determine depth; our **storage** should still be 3D so we can project, rotate, and compare views consistently.

## Decision

1. **Canonical pose data is 3D** in a floor-aligned rig (`PoseCanonical3D` / `CoachSkeleton` lineage), including stance, foot aim, hand shape, and (later) weapon lines.
2. **2D keypoints are derived** by projection + optional yaw search, not authored as primary truth.
3. **Techniques with motion** are modeled as `MoveFlowSpec` with ordered keyframes and timing; competition **定形** is a hold window on the terminal keyframe.
4. **Visual acceptance** for this track is owner review in Pose 3D Lab and rail, not reference-video regression until Phase H.
5. **五步拳** is the first short routine for dictionary + pose QA; **三段长拳** follows move batches.

## Consequences

- New UI: Pose 3D Lab (WebGL/Three.js).
- Expand vocabulary beyond current `LegStanceType` / `HandProfileType` in `canonical3d/vocabulary.ts`.
- Scoring migration is incremental behind flags; enums remain as hints until F-phase.
- More authoring work per move, but eliminates thumbnail/scoring drift.

## Alternatives considered

- **Lift 3D from 2D only:** rejected as primary model — ambiguous and frame-dependent.
- **Keep 2D templates only:** rejected — cannot express foot aim, hand shape, or flows.
- **Full mocap / SMPL:** deferred — too heavy for browser MVP; stick to proportional coach rig.
