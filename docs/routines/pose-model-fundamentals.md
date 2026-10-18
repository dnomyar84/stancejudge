# Why poses look wrong vs 三段长拳 (fundamental model)

## Two different systems (the core bug)

| What you see | What actually runs |
|--------------|-------------------|
| **Rail / syllabus thumbnails** | Hand-drawn stick figures per move id (`san-duan-chang-quan-poses.ts`) — coach art |
| **Live grades & video scores** | `classifyPose()` → **6 leg buckets + 6 hand buckets** (`classify.ts`) |

Thumbnails were fixed move-by-move; **scoring never uses those templates**. It only asks: “does this frame look like *some* 弓步 + *some* 冲拳?” — not “does it look like **#11 歇步冲拳**?”

So visuals can feel like the syllabus while the engine still collapses distinct techniques into the same labels.

## The enum layer is too coarse for changquan

`LegStanceType` today:

- `feet_together`, `gong_bu`, `ma_bu`, `xu_bu`, `walking`, `unknown`

`HandProfileType` today:

- `salute`, `fist_waist`, `punch_forward`, `guard_chest`, `arms_spread`, (+ sword)

**三段长拳** has 22 named techniques. Many share the same bucket:

| Syllabus | Often scored as | Problem |
|----------|-----------------|---------|
| 歇步冲拳 | `xu_bu` + `punch_forward` | 歇步 is seated/crossed; 虚步 is upright empty stance |
| 抱拳弹腿 | `xu_bu` + `fist_waist` | Kick / knee height not a first-class signal |
| 金丝缠腕 | `gong_bu` + `guard_chest` | Wrist wrap ≠ generic guard |
| 转身平扫前推掌 | `gong_bu` + `punch_forward` | Sweep + push ≠ single punch |
| 震脚弓步双推掌 | same as 冲拳 | Two palms not modeled |
| 马步看拳 | `ma_bu` + `fist_waist` | “View fist” posture vs waist guard |

So **expectedLeg / expectedHand on each move are syllabus hints**, not a full description of the technique. The classifier cannot recover move identity from enums alone.

## What MediaPipe actually gives us

- 33 points in **2D**, no guaranteed facing direction, occlusion, gi/clothes.
- We infer **body-relative** width and “punch forward” from geometry — reasonable for **stance family**, weak for **named movement**.

Sequence scoring (leg timeline LCS) is closer to “did you visit bow → horse → … in order?” than “did each of the 22 names look correct?”

## What “correct” would look like (target architecture)

1. **Per-move reference pose** (same data as thumbnails) for each `moveId`.
2. **Score = similarity** student keypoints ↔ that template (after body-frame alignment), not only enum match.
3. **Extend stances** where enums matter: e.g. `xie_bu`, `ding_bu`, `ti_xi` (raised knee), not only `xu_bu` / `walking`.
4. **Optional**: technique tags on hands (`block_elbow`, `push_palm`, `chop`, `double_push`) instead of one `punch_forward` for all strikes.

Until (1–2) drive live + video grades, **fixing thumbnails alone will always feel disconnected** from scoring.

## Current direction in code

- Thumbnails: per-move templates for 三段长拳.
- Scoring: enums + time windows + sequence LCS; **`move-pose-score.ts` exists but is not wired** into live or video grades yet.
- **`xie_bu` is not in `LegStanceType` yet** — 歇步冲拳 still uses `expectedLeg: "xu_bu"` in the syllabus file; only the rail thumbnail uses a seated cross pose.

See also [app-vs-gold-standard.md](./app-vs-gold-standard.md).
