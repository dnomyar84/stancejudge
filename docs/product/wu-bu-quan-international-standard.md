# 五步拳 — international / 国标 left-side standard (QA mapping)

Reference: 武术段位制入门、中小学体育武术教材（左式）。Full competition/school form has **10 segments**; Stance Judge ships a **6-move QA chain** (`wbq-01`…`wbq-06`) with the same left-side technique.

## Full standard sequence (left side)

| # | Name | Leg / body | Hands |
|---|------|------------|--------|
| 1 | 并步抱拳 | 并步 | 两拳抱腰，头向左甩（本应用起势仅并步+抱拳） |
| 2 | 弓步冲拳 | **左弓步**（前屈后绷） | **右冲拳**，左拳抱腰 |
| 3 | 弹腿冲拳 | 左支撑，**右腿弹踢** | **左冲拳**，右拳抱腰 |
| 4 | 马步架打 | 马步（右转） | 左掌上架，**右冲拳**（目视右方） |
| 5 | 歇步盖冲拳 | 后插步→**歇步** | 右掌下盖→**左冲拳**，右抱腰 |
| 6 | 提膝穿掌 | **左提膝** | 穿掌（见国标图解） |
| 7 | 仆步穿掌 | 仆步 | 穿掌 |
| 8 | 虚步挑掌 | 右虚步 | 勾手 + 挑掌 |
| 9 | 并步抱拳 | 并步 | 收势 |

## App move ids (`wu-bu-quan`)

| Move id | Standard alignment | Notes |
|---------|-------------------|--------|
| `wbq-01` | 并步 + 抱拳 | Owner spec: side 抱拳, not chest salute |
| `wbq-02` | 弓步冲拳 | `legsGongBu("left")` + `armsPunchForward("right")` |
| `wbq-03` | 弹腿冲拳 | `legsRightSnapKickStrike()` + left punch |
| `wbq-04` | 马步架打 | `armsBlockElbow()` (上架 + 侧冲) |
| `wbq-05` | 歇步盖冲之冲拳 | Left punch in `legsXieBu()` |
| `wbq-06` | **Abbrev.** 提膝收势 | Full form continues 仆步→虚步→并步 |

## Code

- Syllabus: `src/lib/wushu/routines/wu-bu-quan.ts`
- 定势 recipes: `src/lib/pose/choreography/wbq-standard.ts`
- Choreography: `src/lib/pose/choreography/wbq-01-opening.ts`, `wbq-moves.ts`
- Tests: `tests/unit/wu-bu-standard.test.ts`

## Contrast with 三段长拳

三段长拳 uses **同侧** 右弓步冲拳 in many moves (`sdcq-14`). 五步拳入门左式 uses **对侧** 左弓步 + 右冲拳 — do not copy 三段 leg lead into 五步拳 without checking the syllabus.
