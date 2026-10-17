# Vision

## One-liner

**Stance Judge** helps kids practice **武术段位** routines with **DDR-style** instant feedback — see each move graded as you perform, feel rewards for great stances, see penalties for misses or shallow form, then **review your score** at the end — using only a phone or laptop camera, no server required.

North-star gameplay spec: [gameplay-ddr.md](./gameplay-ddr.md).

## Personas

| Persona | Goals | Pain today |
| --- | --- | --- |
| **Student (8–14)** | Learn order of moves, fix stances, feel progress | Boring repetition, unsure if form is right |
| **Parent** | Support practice at home without coaching | Hard to judge Wushu details |
| **Coach** | Set club reference, calibrate timing, assign forms | Manual video review, inconsistent standards |

## Product principles

1. **DDR-grade gratification** — Perfect/Good/Miss (and stance depth) must be **visually and optionally audibly rewarding or punishing** in real time; see [gameplay-ddr.md](./gameplay-ddr.md).
2. **Non-blocking loop** — scoring never freezes camera or playback.
3. **Routine bookends** — detect **start** (first respect/起势) and **end** (收势); then show results review.
4. **No iframe analysis** — all pose input is `<video>` or webcam (blob/upload/camera).
5. **Coach-owned truth** — canonical sequences and reference clips live in repo or browser export, not a proprietary cloud.
6. **Kid-safe & simple** — large touch targets, clear green/red, minimal jargon; 中文 labels where it helps recognition.
7. **Works on GitHub Pages** — static export; optional proxies only for YouTube bytes.
8. **Honest limits** — show confidence, “step back” prompts, and upload fallback when stream fails.

## Success metrics (v1 → v2)

| Metric | Target |
| --- | --- |
| Time to first score (live) | &lt; 30s after landing (incl. model load) |
| Routine video → rail feedback | User sees rail update while video plays |
| Calibration | Coach can ship new `canonical/*.json` without code change |
| Mobile usability | Usable in portrait (browse) and landscape (practice) |

## Out of scope (for now)

- Accounts, leaderboards, social
- Multi-person sparring / partner detection
- Full IWUF competition judging (difficulty, deductions)
- Native iOS/Android apps (PWA later)
