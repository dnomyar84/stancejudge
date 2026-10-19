# 3D-first pose fundamentals — backlog & iteration plan

**Owner review:** visual check of 3D coach figures (rail + **Pose 3D Lab**). Video regression (`test:video`) is **paused** until 3D canonical poses stabilize.

**Related:** [pose-model-fundamentals.md](../routines/pose-model-fundamentals.md), [app-vs-gold-standard.md](../routines/app-vs-gold-standard.md), ADR [adr-003-3d-canonical-pose-model.md](../decisions/adr-003-3d-canonical-pose-model.md).

---

## North star

1. **Canonical truth is 3D** — each technique is a rigged body state (joints, foot aim, hand shape, weapon line) in a **floor-aligned world frame** (+Y up, +Z forward toward camera default).
2. **2D extraction is a view** — MediaPipe (or any monocular detector) yields a **partial projection** of that 3D state from an unknown yaw/pitch/roll. Matching = “does this 2D observation fit *some* legitimate view of the expected 3D pose?”
3. **Rail / lab / scoring share one skeleton** — display (tubes + solid torso + head), templates, and geometry all read the same `PoseCanonical3D` (or derived `CoachSkeleton`), not parallel 2D art.
4. **Moves are flows when needed** — static **定形** keyframes plus ordered **keyframes** for strikes, sweeps, jumps, 震脚, etc., with timing and pause windows for competition-style holds.

---

## Architecture (target)

```
┌─────────────────────────────────────────────────────────────┐
│  Syllabus move (id, name, coach text, weapon)               │
└───────────────────────────┬─────────────────────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│ PoseCanonical3D      │              │ MoveFlowSpec         │
│ (static 定形)         │              │ keyframes[], timing,   │
│ joints + feet + hands│              │ pause, force profile   │
└──────────┬──────────┘              └──────────┬──────────┘
           │ project(camera)                     │ sample(t)
           ▼                                     ▼
┌─────────────────────┐              ┌─────────────────────┐
│ 2D template KP       │              │ 3D at time t         │
│ (13 MediaPipe slots) │              │ for live/video flow  │
└──────────┬──────────┘              └──────────┬──────────┘
           │                                     │
           └──────────────┬──────────────────────┘
                          ▼
              ┌───────────────────────┐
              │ ViewMatch + Geometry   │
              │ (yaw search, leg/hand) │
              └───────────────────────┘
```

**Code homes (evolving):**

| Concern | Today | Target |
| --- | --- | --- |
| 3D rig | `coach-figure/skeleton.ts` | `canonical3d/` + shared rig |
| Vocabulary | `LegStanceType`, `HandProfileType` | `canonical3d/vocabulary.ts` + richer tags |
| Display 2D rail | projected KP + `draw.ts` | same projection |
| Display 3D lab | `mannequin-js` solid figure | `pose-3d-viewer.tsx` + IK adapter |
| Flows | single frame per move | `MoveFlowSpec` per move |

---

## Iteration loop (until backlog empty)

Each iteration:

1. Pick **one** backlog item (or a tight cluster).
2. Implement + expose in **Pose 3D Lab** (and rail when stable).
3. **Owner visual sign-off** on listed moves (五步拳 + 三段长拳 slices).
4. Mark item done; **split** new discoveries into new backlog lines (do not hide scope creep).
5. Repeat. **No `test:video` gate** during this track unless explicitly re-enabled.

---

## Backlog — Phase A: Foundations & vocabulary

| ID | Item | Acceptance (owner-visible) |
| --- | --- | --- |
| A-01 | **ADR + this doc** linked from `docs/README.md` | Readable plan on GitHub |
| A-02 | **`PoseCanonical3D` schema** (joints, root on floor, facing) | Types in `canonical3d/schema.ts` |
| A-03 | **World frame conventions** (axes, facing, lead leg, mirror) | Documented; lab shows grid + forward arrow |
| A-04 | **Leg stance dictionary** — 并步, 弓步, 马步, 虚步, 歇步, 仆步, 丁步, 独立步/提膝, 交叉步, 跪步, 横裆步, … | Each has zh/en + geometry rules |
| A-05 | **Foot aim dictionary** — toe direction, heel down, weight % L/R, foot parallel vs line | Per-stance defaults in vocabulary |
| A-06 | **Hand shape dictionary** — 拳, 掌, 勾手, 刁手, 架, 穿掌, 推掌, 按掌, 抱拳, 亮掌, … | Enum + lab placeholder mesh |
| A-07 | **Weapon hand** — 剑指 (index+middle extended, others closed), 持剑, 劈/刺/格 | Distinct from unarmed fist |
| A-08 | **Head / gaze** — 目视前方, 随手动, 平视/俯视 (coarse) | Optional neck DOF later |
| A-09 | **Torso** — 含胸拔背, 立身中正, 拧腰 (yaw offset) | Torso box + twist param on rig |
| A-10 | **Separate display rig vs scoring rig** if needed | ADR note when we split |

---

## Backlog — Phase B: 3D authoring & lab UI

| ID | Item | Acceptance |
| --- | --- | --- |
| B-01 | **Pose 3D Lab** screen (home → lab) | Orbit camera, floor, lighting |
| B-02 | **Tube limbs** + **solid torso** + **sphere head** + neck cylinder | Matches coach skeleton proportions |
| B-03 | Move picker: routine + move id | 三段长拳 + 五步拳 |
| B-04 | **Keyframe scrubber** (when flow exists) | Slider 0…1 across flow |
| B-05 | Read-only **vocabulary panel** (leg, feet, hands expected) | From move metadata |
| B-06 | Export **screenshot** or pose JSON for owner review | Optional; helps async feedback |
| B-07 | Wire rail thumbnails to **same mesh projection** (optional path) | Visual parity lab ↔ rail |
| B-08 | **Neck articulation** (not rigid nose–shoulder) | Head sphere sits on neck |
| B-09 | **Hand meshes** per hand-shape enum (low-poly) | At least 拳 + 掌 + 剑指 |
| B-10 | **Foot plates** showing toe line | Ground-aligned wedges |

---

## Backlog — Phase C: 五步拳 (Wu Bu Quan) — visual QA routine

| ID | Item | Acceptance |
| --- | --- | --- |
| C-01 | **Routine definition** `wu-bu-quan` in `routines/` | Listed in lab |
| C-02 | Author **定形** 3D pose per move (coach) | Owner signs off each of 5–8 moves |
| C-03 | Align names with 国标/段位左式五步拳 | See [wu-bu-quan-international-standard.md](./wu-bu-quan-international-standard.md) |
| C-04 | Use 五步拳 to regression-test **stance dictionary** before long 22-move pass | All leg tags exercised |

**Draft move list (to confirm with owner):**

1. 起势 / 并步抱拳  
2. 弓步冲拳  
3. 弹踢冲拳  
4. 马步架打  
5. 歇步冲拳  
6. 提膝收势  

---

## Backlog — Phase D: 三段长拳 3D pass

| ID | Item | Acceptance |
| --- | --- | --- |
| D-01 | Migrate each `moveId` from `poses-san-duan.ts` to **`PoseCanonical3D` record** | One JSON/TS record per move |
| D-02 | Owner review **#1–#5** then **#6–#11** … in lab | Batched sign-off |
| D-03 | Fix **歇步 vs 虚步**, **弓步** knee ~90°, rear straight | Geometry + visual |
| D-04 | **金丝缠腕**, **转身** family — torso yaw + arm path | Not a single static punch |
| D-05 | **震脚** — foot lift + stamp (flow, see Phase E) | |
| D-06 | **弹腿** — 提膝 height + toe snap | |
| D-07 | Re-enable template scoring only after D-batch approved | |

---

## Backlog — Phase E: Movement & flow framework

| ID | Item | Acceptance |
| --- | --- | --- |
| E-01 | **`MoveFlowSpec` schema** — keyframes[], durations, easing | Types + one example |
| E-02 | **定形 window** — hold last keyframe ≥ `pauseMinMs` for bonus | Documented in gameplay spec |
| E-03 | **冲拳 flow** — retracted → midway → full extension | 3 keyframes; lab scrubber |
| E-04 | **冲拳 force** — shorter interval retract→mid vs mid→full = “爆发力” | Timing metadata |
| E-05 | **推掌 / 双推掌** — two-hand path | |
| E-06 | **扫掌 / 转身平扫** — horizontal arc keyframes | |
| E-07 | **弹踢** — chamber → snap → retraction | |
| E-08 | **震脚** — lift → impact → settle into 弓步/马步 | |
| E-09 | **剑法** — 劈、刺、格 with wrist/剑 line | Finger-sword + jian |
| E-10 | Research table: **online / syllabus descriptions** → keyframe count per move | Appendix in doc |
| E-11 | Live/video: match **flow state** not only final frame | Deferred until E-01–03 solid |

**Example — 冲拳 (competition intuition):**

| Keyframe | Name | Body intent |
| --- | --- | --- |
| K0 | 收拳 | Fist at waist, elbow back, torso square |
| K1 | 出拳中段 | Arm extending, hip driving |
| K2 | 定形 | Full extension, 拳眼向上/向前 per syllabus |
| Timing | `t01` < `t12` implies speed; pause at K2 ≥ 1s → 定形加分 |

---

## Backlog — Phase F: 2D ↔ 3D matching (monocular)

| ID | Item | Acceptance |
| --- | --- | --- |
| F-01 | **Project** canonical 3D → 2D for fixed camera model | Matches lab default view |
| F-02 | **Yaw search** — find body yaw that minimizes reprojection error vs student KP | Unit tests on synthetic views |
| F-03 | **Confidence** when occlusion / ambiguous depth | Score down, don’t guess |
| F-04 | Replace enum-primary scoring with **view-matched geometry** | Feature flag |
| F-05 | **Depth lift** heuristic from 2D (limb length ratios) — optional second stage | Document limits |
| F-06 | Do **not** trust single video frame as gold; canonical from 3D coach only | Policy in ADR |

---

## Backlog — Phase G: 四段剑 & weapon body

| ID | Item | Acceptance |
| --- | --- | --- |
| G-01 | `poses-si-duan-jian.ts` on 3D stack | Lab picker |
| G-02 | Sword segment mesh (line + guard) | |
| G-03 | 剑指 vs 持剑 grip | Hand dictionary |

---

## Backlog — Phase H: Product integration (after visual QA)

| ID | Item | Acceptance |
| --- | --- | --- |
| H-01 | Rail uses 3D mesh snapshot (or projected KP from same rig) | |
| H-02 | Live DDR grades from 3D match + flow | |
| H-03 | Re-enable `test:video` with 3D-based thresholds | |
| H-04 | `features.md` F-048 epic closed per slice | |

---

## Flow candidates (research → keyframes)

Derive from syllabus + common coaching text; each becomes an E-item when prioritized.

| Move family | Likely keyframes | Pause / 定形 |
| --- | --- | --- |
| 冲拳 | 收拳 → 出拳 → 定拳 | End |
| 推掌 | 收掌 → 推出 → 定掌 | End |
| 弹踢 | 提膝 → 弹击 → 落步 | Peak at snap |
| 震脚 | 抬脚 → 震脚 → 定势 | After impact |
| 转身 | 预备 → 转体中段 → 定势 | End facing |
| 歇步 | 下落 → 交叉坐步 → 冲拳定形 | End |
| 剑刺 | 预备 → 刺出 → 定式 | End extension |

---

## Current iteration

- [x] A-01 fundamentals doc + ADR  
- [x] B-01/B-02 Pose 3D Lab (tubes, torso, head, orbit)  
- [x] C-01 五步拳 routine stub in lab picker  
- [x] **Choreography framework** — phases, cues, keyframes ([choreography-framework.md](./choreography-framework.md))  
- [x] **Extended rig** — hands (wrist/knuckle/palm) + feet (heel/toe) in 3D mesh  
- [x] **wbq-01 起势** — 并步 + 抱拳 flow (owner spec); visual coach timeline stub for full 五步拳  
- [x] **五步拳 visual coach** UI (`wu-bu-coach`) — full playback + move markers  
- [x] Choreography wbq-01…06 + 600ms inter-move transitions  
- [x] Horizontal orbit / swipe rotate on 3D viewer  
- [ ] Owner: review full 五步拳 playback (poses + timing)  
- [ ] Refine per-move keyframes from visual feedback  
- [ ] 四段剑 / 三段长拳 visual coach (later)  

---

## How to give feedback

Open **Pose 3D Lab** on GitHub Pages → pick move → rotate view. Report: **routine, move #, 中文名, what’s wrong** (e.g. “右脚尖应朝前”, “应是拳不是掌”). Each report becomes a numbered backlog item under D or C.
