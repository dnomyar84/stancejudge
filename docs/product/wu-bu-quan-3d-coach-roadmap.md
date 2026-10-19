# 五步拳 3D visual coach — roadmap to shippable product

**Goal:** User opens **五步拳 3D coach**, presses Play, and watches the full **9-move** form on a human figurine with stable framing, readable stances, and no WebGL crashes.

**Current stack:** `ExtendedCoachPose` (semantic) → compile → `CoachBonePoseV1` → Xbot `SkinnedMesh` + Tween.js (`ADR-005`).

---

## Phase 1 — Playback reliability (in progress)

| ID | Task | Done when |
| --- | --- | --- |
| P1-01 | All **9 moves** registered in `buildWuBuQuanVisualCoach` | `motion-visual-coach.test` asserts move count + end frame |
| P1-02 | **Instant pose** during timeline scrub/play (no tween fight) | `smoothMotion={false}` while playing |
| P1-03 | Camera **frame avatar** on first pose | Figure fills viewport, feet on grid |
| P1-04 | **Smoke test** (Playwright): load coach, play 5s, no console error | CI script `scripts/smoke-wbq-visual-coach.mjs` |
| P1-05 | Owner **visual recording** of full routine | Artifact in agent / GH Pages |

---

## Phase 2 — Display truth (bone authoring)

| ID | Task | Done when |
| --- | --- | --- |
| P2-01 | **Lab export**: capture `CoachBonePoseV1` JSON from current figure | Button in Pose 3D Lab |
| P2-02 | **Bake script**: compile all keyframes → `data/wbq-bone-poses/*.json` | Committed gold files |
| P2-03 | Keyframes load `bone` from gold; runtime IK **off** for 五步拳 | `rigKeyframe({ pose, bone })` per 定势 |
| P2-04 | Transitions **lerp bone** only (no semantic compile mid-blend) | `sampleRoutineVisualCoach` always has `bone` |

---

## Phase 3 — Retarget quality (until gold bones exist)

| ID | Task | Done when |
| --- | --- | --- |
| P3-01 | **Spine / chest** aim from shoulder–hip line | Visible torso lean in 弓步 / 马步 |
| P3-02 | **Head** aim to coach `nose` | Looks forward in 冲拳 |
| P3-03 | **Feet** toe yaw from `FootEndEffector` | 并步 / 弓步 toe line correct |
| P3-04 | Per-move **QA checklist** (owner sign-off table in this doc) | Each move row marked pass |

---

## Phase 4 — Product polish

| ID | Task | Done when |
| --- | --- | --- |
| P4-01 | **Move list** chips (tap to seek timeline) | All 9 names clickable |
| P4-02 | **Speed** 0.75× / 1× / 1.25× | User control |
| P4-03 | **Loading** skeleton + error retry for glTF | Slow network OK |
| P4-04 | **GitHub Pages** deploy verified on iPad Safari | Manual checklist |
| P4-05 | Optional: **mirror** (右式) second bone set | Future |

---

## Owner visual QA matrix (五步拳)

| Move | ID | 定势 pass? | Notes |
| --- | --- | --- | --- |
| 起势 | wbq-01 | ☐ | 并步、抱拳 |
| 弓步冲拳 | wbq-02 | ☐ | 左弓步右冲拳 |
| 弹踢冲拳 | wbq-03 | ☐ | |
| 马步架打 | wbq-04 | ☐ | |
| 歇步冲拳 | wbq-05 | ☐ | |
| 提膝穿掌 | wbq-06 | ☐ | |
| 仆步穿掌 | wbq-07 | ☐ | |
| 虚步挑掌 | wbq-08 | ☐ | |
| 收势 | wbq-09 | ☐ | |

---

## Related

- [motion-coach-platform.md](./motion-coach-platform.md)
- [display-figurine-pose.md](./display-figurine-pose.md) (legacy mannequin)
- [ADR-005](../decisions/adr-005-threejs-bones-tween.md)
