# 三段长拳 (San Duan Chang Quan) — gold standard syllabus

Authoritative sequence for **武术段位制 · 长拳三段单练** (22 movements). Names and order match the national duanwei changquan textbook and international duanwei tables (e.g. IWUF-style third-duan solo list).

**Sources (trusted):**

- 《中国武术段位制系列教程：长拳》— 国家体育总局武术研究组
- International/Wushu Tokyu third-duan changquan action list (22 names, two sections of 11)

This document is the **human-readable gold standard**. The app’s `RoutineDefinition` in `src/lib/wushu/routines/san-duan-chang-quan.ts` uses the same 22 IDs and Chinese names. Timing in `src/data/canonical/san-duan-chang-quan.json` is **calibrated from the reference performance video**, not equal slices.

## Section 1 (actions 1–11)

| # | 中文 | English (app) | Leg (coach) | Hands (coach) |
|---|------|---------------|-------------|----------------|
| 1 | 起势 | Opening posture | 并步 / feet together | 抱拳礼 — fists folded, salute at chest/face |
| 2 | 右弓步格肘 | Right bow, block elbow | 右弓步 — front knee bent, rear leg extended | 格肘 — forearm block, guard at chest |
| 3 | 抱拳弹腿 | Embrace fist, snap kick | 弹踢支撑 — one foot kick, weight on rear (虚步/过渡) | 抱拳于腰 — fists at waist |
| 4 | 金丝缠腕 | Golden silk wrist wrap | 弓步落步 | 缠腕 — one hand grasps/wraps wrist |
| 5 | 马步冲拳 | Horse stance punch | 马步 — wide, knees bent, feet apart | 冲拳 — one fist thrust to body forward |
| 6 | 转身平扫前推掌 | Turn, sweep, push palm | 弓步 (after turn) | 推掌 — palm push along body forward |
| 7 | 右弓步挑拳 | Right bow, raise fist | 右弓步 | 挑拳 — lifting strike forward/up |
| 8 | 翻腰提膝推掌 | Waist flip, knee lift, push palm | 提膝 / 虚步 — knee up, empty weight | 推掌 |
| 9 | 旋风脚 | Whirlwind kick | 跳跃旋转 — airborne / walking transition | 两臂展开 — arms spread for balance |
| 10 | 虚步护身掌 | Empty stance, guard palm | 虚步 — rear leg load, front toe/light | 护身掌 — guard at chest |
| 11 | 歇步冲拳 | Cross stance punch | 歇步 — low crossed sit | 冲拳 |

## Section 2 (actions 12–22)

| # | 中文 | English (app) | Leg | Hands |
|---|------|---------------|-----|-------|
| 12 | 右弓步格肘 | Right bow block elbow | 弓步 | 格肘 |
| 13 | 马步切掌 | Horse stance cut palm | 马步 | 切掌 (scored as forward palm strike) |
| 14 | 右弓步冲拳 | Right bow punch | 弓步 | 冲拳 |
| 15 | 左弓步斜推掌 | Left bow diagonal push | 左弓步 | 斜推掌 |
| 16 | 震脚弓步双推掌 | Stamp, bow, double push | 弓步 | 双推掌 |
| 17 | 左弓步推掌 | Left bow push palm | 弓步 | 推掌 |
| 18 | 翻身劈掌 | Turning chop palm | 弓步 (after turn) | 劈掌 |
| 19 | 腾空飞脚 | Jump flying kick | 腾空 — jump / walking | 展臂 |
| 20 | 右弓步冲拳 | Right bow punch | 弓步 | 冲拳 |
| 21 | 马步看拳 | Horse stance guard fist | 马步 | 看拳 — fists at waist, guard |
| 22 | 收势 | Closing posture | 并步 | 抱拳礼 |

## Stance & hand enums (app)

Leg profiles: `feet_together`, `gong_bu`, `ma_bu`, `xu_bu`, `walking` (jumps / transitions).

Hand profiles: `salute`, `guard_chest`, `fist_waist`, `punch_forward`, `arms_spread`, plus sword-only types.

## Facing / camera notes

- Only **起势** and **收势** are nominally front-facing to the audience.
- Mid-routine, performers turn (e.g. 转身平扫, 翻身劈掌). Scoring must use **body-relative** geometry (shoulder line + forward toward head), not camera X-axis.
- App classifiers read pose in a **body frame** (`src/lib/pose/body-frame.ts`).

## App alignment

See [app-vs-gold-standard.md](./app-vs-gold-standard.md) for how video scoring picks frames (per-move time windows vs random uniform samples).
