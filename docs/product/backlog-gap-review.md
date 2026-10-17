# Backlog gap review (user expectations)

*Review date: 2026-10-17 — DDR / gamification lens.*

## What users expect from a “stance judge” game

1. **Real-time feedback** while performing — not only after uploading a video.
2. **Clear win moment** — Perfect/Good should feel as rewarding as DDR “Marvelous/Perfect”.
3. **Clear fail moment** — wrong step or not low enough should **look** wrong immediately.
4. **Routine bookends** — system knows **start** (first respect/起势) and **finish** (收势).
5. **Score review** — after the run, see breakdown and what to fix.
6. **Reference masters** — compare mentally to champion video (thumbnail/link today; timing sync later).

## Current open issues (before gameplay expansion)

Heavy on **shell** (F-010–F-013, onboarding, i18n) and **infra** (deploy, YouTube, tests #14).

**Underrepresented:** game feel, live routine rail (F-030 only), session FSM, results screen.

## Recommended priority shift

| Tier | Focus |
| --- | --- |
| **P0 gameplay** | F-044 session FSM, F-042/F-043 start/end, F-037 live grades, F-045 results (minimal) |
| **P1 juice** | F-038 depth penalty, F-039 combo, F-040/F-041 reward/penalty VFX |
| **P1 shell** | F-010 home (entry to “Play” mode), F-012 stage layout for HUD |
| **P2** | F-030 full live rail sync, audio F-031, timing Early/Late F-047 |

Layout polish (F-013) can parallel once HUD slots exist on `PracticeStage`.

## New issues

Tracked as **F-037–F-047** in [features.md](./features.md) and GitHub Issues (created with gameplay-ddr spec linked).

Owner reviews **gameplay-ddr.md** for tone of rewards/penalties before agent implements VFX intensity.
