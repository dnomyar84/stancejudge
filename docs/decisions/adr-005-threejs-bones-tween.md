# ADR-005: Three.js native bones + Tween.js (visual coach renderer)

**Status:** Accepted  
**Date:** 2026-10-19  

## Context

mannequin-js is a second rig with its own joint vocabulary and GPL-3.0 license. Display truth (`CoachFigurinePoseV1`) still did not match Three.js skinned meshes used for H-Anim / glTF. We need one performant path: **native `THREE.Bone` rotations**, deterministic storage, and **Tween.js** for in-viewer blends.

## Decision

1. **Default viewer** (`pose-3d-viewer-bone.tsx`): load Mixamo Xbot glTF, drive `SkinnedMesh.skeleton` directly.
2. **Display storage** (`CoachBonePoseV1`): root position + `rotations` map (bone name → local Euler degrees, XYZ).
3. **Playback**: choreography may lerp stored `bone` keyframes; viewer uses **@tweenjs/tween.js** for short blends when the target changes.
4. **Semantic compile fallback**: when `bone` is absent, run existing limb IK once, then `captureCoachBonePose` (author `bone` on keyframes to avoid IK at runtime).
5. **mannequin-js** remains behind `NEXT_PUBLIC_COACH_RENDERER=mannequin`.

## Consequences

- Single WebGL skinned mesh per viewer; no mannequin fullscreen canvas side effects.
- Authoring tool: capture bind pose + keyframe bone JSON (future lab export).
- `CoachFigurinePoseV1` is legacy for mannequin renderer only.

## Alternatives considered

- **Keep mannequin as default:** rejected for performance / licensing / dual rig.
- **Pure procedural `Bone` mesh without glTF:** deferred — Xbot already in repo; custom skinning is a larger art task.
