# Roadmap

Phases align with `features.md` and [GitHub Issues](https://github.com/dnomyar84/stancejudge/issues). Owner reviews [gameplay-ddr.md](./gameplay-ddr.md) for reward/penalty intensity.

## Phase 0 — Foundation (complete)

Static app, pose rail + video scan, live stance %, admin, tests fixture folder.

## Phase 0.5 — **3D pose fundamentals** (parallel, owner visual QA)

**Theme:** Canonical poses in 3D; Pose 3D Lab; 五步拳 + 三段长拳 coach review; movement keyframes later.

| Slice | Backlog |
| --- | --- |
| 1 | [pose-3d-fundamentals.md](./pose-3d-fundamentals.md) A + B: lab UI, vocabulary |
| 2 | 五步拳 (C), then 三段 batches (D) |
| 3 | Flow framework (E), 2D↔3D match (F) |
| 4 | Re-integrate rail/DDR/video (H) |

**Exit criteria:** Owner signs off 五步拳 + 三段长拳 3D poses in lab; scoring reads same rig.

## Phase 1 — **Wushu DDR** (current priority)

**Theme:** Perform live (or play video) and **feel** each move — rewards, penalties, start/end detection, results screen.

| Slice | Features |
| --- | --- |
| 1 | F-044 session FSM, F-042 start, F-043 end, canonical boundary flags |
| 2 | F-037 grades, F-038 depth penalty, F-046 live rail + camera |
| 3 | F-040/F-041 juice, F-039 combo |
| 4 | F-045 results review |
| Parallel | F-010 home (“Play”), F-012 stage layout for HUD |

**Exit criteria:** Child can perform 四段剑 opening → closing on camera, see real-time grades, get results breakdown.

## Phase 2 — Polish & parity

- F-013 routine layout, F-014 i18n, F-016 coach tips
- F-031 audio, F-020 fullscreen
- F-036 video fixture tests, reference MP4s from masters
- F-047 timing tiers

## Phase 3 — Reach

- F-035 PWA, F-032 clip record, deploy automation F-017

## Milestones

| Milestone | Definition |
| --- | --- |
| **M1 — DDR alpha** | F-037–F-045 + F-046 on one routine (calibrated) |
| **M2 — Club pilot** | Both routines + reference test videos |
| **M3 — Public beta** | PWA, i18n, automated Pages |
