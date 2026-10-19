# Choreography framework (3D visual coach)

**Code:** `src/lib/pose/canonical3d/choreography.ts`, `src/lib/pose/choreography/`, `extended-pose.ts`.

## Purpose

Describe wushu **the way coaches teach it**: not a single frozen frame, but **phases** (并步, 抱拳, …) made of **keyframes**, each with **layered cues** (legs, feet, hands, arms, torso).

The same data drives:

- Pose 3D Lab scrubber + play
- Future: full-routine **visual coach** (rotate view, start→end)
- Future: live/video match against expected flow, not one snapshot

## Model

```
Move (syllabus id)
 └── ChoreographyPhase[]     e.g. 并步, 抱拳
       ├── ChoreographyCue[]   human-readable steps
       └── RigKeyframe[]       ExtendedCoachPose @ t∈[0,1]
```

`ExtendedCoachPose` = `CoachSkeleton` + **hand** end effectors (wrist, knuckle, palm, palm normal) + **foot** (heel, toe, ankle, toe yaw).

## Example: 起势 (wbq-01)

| Phase | Cues (summary) | Keyframes |
| --- | --- | --- |
| **并步** | 开步站立 → 收脚并拢，脚尖朝前，腿直 | 分开站立 → 并步定势 |
| **抱拳** | 体侧立掌（掌心向身）→ 翻拳朝前，肘侧视约45° | 并步+立掌 → 抱拳定势 |

Authoring: `src/lib/pose/choreography/wbq-01-opening.ts`.

## Routine visual coach

`RoutineVisualCoachSpec` chains moves with `durationMs` each. Moves without a choreography file hold a static 定形 pose until authored.

Lab: **Visual coach (full form)** on 五步拳.

## Backlog (from owner feedback)

- [ ] Per-cue timing weights (并步 slower than 抱拳 if needed)
- [ ] Hand meshes: 掌 vs 拳 vs 剑指 geometry
- [ ] Foot sole roll during 并步 close
- [ ] Author choreography for wbq-02…06 with flows (冲拳 3-keyframe)
- [ ] Export choreography JSON for review in PRs
- [ ] Sync MediaPipe scoring to projected `ExtendedCoachPose` at 定形 keyframe only (later)

See also [pose-3d-fundamentals.md](./pose-3d-fundamentals.md).
