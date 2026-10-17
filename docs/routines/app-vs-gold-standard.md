# App scoring vs gold standard

## What the app expects

| Layer | File | Role |
|-------|------|------|
| Syllabus (names, order, coach enums) | `src/lib/wushu/routines/san-duan-chang-quan.ts` | Matches [san-duan-chang-quan-gold-standard.md](./san-duan-chang-quan-gold-standard.md) (22 moves) |
| Timing & export | `src/data/canonical/san-duan-chang-quan.json` | `startSec` / `endSec` per move; scaled to student video length |
| Pose labels | `src/lib/wushu/classify.ts` | Maps MediaPipe keypoints → leg + hand enums |
| Video pipeline | `src/lib/wushu/sequence.ts` | Sample frames → per-move best frame → report |

## Are we scoring random frames?

**Before:** Uniform time steps (~0.35–0.45 s) across the whole clip, then `bestFrameForMove` chose the best match inside a **fixed equal-width window** (90 s ÷ 22). That often missed the real peak of each movement and mis-ordered legs → false `wrong_sequence`.

**Now:**

1. **Denser sampling** along the timeline (capped for performance).
2. **Calibrated windows** from the reference performer video (leg-transition–aligned splits), stored in canonical JSON.
3. **Per-move peak pick:** within each move’s scaled window, the frame with the highest leg+hand match to that move’s expected enums (not a random uniform frame).
4. **Sequence score** uses collapsed leg timeline vs syllabus (LCS), independent of per-move window peaks.
5. **Body-relative classifiers** so side and diagonal facing still measure stance width and punch along the performer’s forward axis.

## Rotation

Classifiers use `estimateBodyAxes()` (hip origin, lateral = shoulder line, forward = toward nose). Ankle width, bow/empty stance, and punches are computed in this frame — not raw image X/Y.

## Live DDR vs video

- **Live routine** (`session-phase.ts` + `move-grade.ts`) grades in real time on the current pose.
- **Routine video / calibrate** uses `sampleVideoPoses` + `buildRoutineReport`.

Both share `classifyPose()` so rotation handling is consistent.
