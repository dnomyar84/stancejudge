# 五步拳 — international / 国标 left-side standard

Reference: 武术段位制入门、中小学体育武术教材（左式）。Stance Judge implements the **full nine-move** visual coach chain (`wbq-01`…`wbq-09`).

## Standard sequence (left side)

| # | Move id | Name | Leg / body | Hands |
|---|---------|------|------------|--------|
| 1 | `wbq-01` | 起势（并步抱拳） | 并步 | 抱拳 |
| 2 | `wbq-02` | 弓步冲拳 | **左弓步** | **右冲拳**，左抱腰 |
| 3 | `wbq-03` | 弹腿冲拳 | 左支撑，**右腿弹踢** | **左冲拳**，右抱腰 |
| 4 | `wbq-04` | 马步架打 | 马步 | 左上架，右冲拳 |
| 5 | `wbq-05` | 歇步盖冲拳 | 歇步 | 盖掌→**左冲拳** |
| 6 | `wbq-06` | 提膝穿掌 | **左提膝** | 穿掌 |
| 7 | `wbq-07` | 仆步穿掌 | **左仆步** | 左掌穿至脚面 |
| 8 | `wbq-08` | 虚步挑掌 | **右虚步** | 左勾手，右挑掌 |
| 9 | `wbq-09` | 并步抱拳 | 并步 | 收势抱拳 |

## Code

- Syllabus: `src/lib/wushu/routines/wu-bu-quan.ts`
- 定势: `src/lib/pose/choreography/wbq-standard.ts`
- Choreography: `wbq-01-opening.ts`, `wbq-moves.ts`, `wbq-moves-closing.ts`
- Visual coach: `getRoutineVisualCoach("wu-bu-quan")` in `registry.ts`
- Tests: `tests/unit/wu-bu-standard.test.ts`

## 三段长拳 contrast

三段长拳 often uses **同侧** 右弓步冲拳; 五步拳左式 uses **对侧** 左弓步 + 右冲拳.
