# Vision

## One-liner

**Stance Judge** helps kids practice **武术段位** routines with instant, playful feedback — like a coach watching their form — using only a phone or laptop camera, no server required.

## Personas

| Persona | Goals | Pain today |
| --- | --- | --- |
| **Student (8–14)** | Learn order of moves, fix stances, feel progress | Boring repetition, unsure if form is right |
| **Parent** | Support practice at home without coaching | Hard to judge Wushu details |
| **Coach** | Set club reference, calibrate timing, assign forms | Manual video review, inconsistent standards |

## Product principles

1. **Non-blocking “game” feel** — scanning and scoring never freeze playback; live mode never blocks the camera loop.
2. **No iframe analysis** — all pose input is `<video>` or webcam (blob/upload/camera).
3. **Coach-owned truth** — canonical sequences and reference clips live in repo or browser export, not a proprietary cloud.
4. **Kid-safe & simple** — large touch targets, clear green/red, minimal jargon; 中文 labels where it helps recognition.
5. **Works on GitHub Pages** — static export; optional proxies only for YouTube bytes.
6. **Honest limits** — show confidence, “step back” prompts, and upload fallback when stream fails.

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
