# Roadmap

Phases align with `features.md` IDs. Agents should work **top to bottom** within the active phase unless the user requests otherwise.

## Phase 0 — Foundation (complete)

- Static app on GitHub Pages
- Two routines, pose rail, upload/YouTube, live stance, admin calibration
- Docs + agent workflow (this folder)

## Phase 1 — Design & UX (current)

**Theme:** Modern shell, kid-clear flows, no new ML.

| Week slice | Deliverables |
| --- | --- |
| 1 | F-010 home hub, F-012 live layout, F-013 routine layout |
| 2 | F-011 onboarding, F-014 i18n basics, F-016 coach tips |
| 3 | F-015 session reset, F-017 deploy automation, T-04 throttle |

**Exit criteria:** New user reaches live score in &lt;30s; routine session looks “shippable” on phone.

## Phase 2 — Live routine coaching

- F-030 live pose rail
- F-033 Wushu stance mode
- F-034 sword/hand hints
- F-031 audio (optional)

**Exit criteria:** Student can practice 四段剑 with camera only and see move-by-move rail feedback.

## Phase 3 — Reliability & reach

- F-035 PWA
- F-032 clip record
- T-01 proxy alternatives documented + fallback UX
- Full calibration for both routines in repo

## Milestones

| Milestone | Definition |
| --- | --- |
| **M1 — Club pilot** | Both routines calibrated; coach admin documented; 5 students use upload path |
| **M2 — Live duanwei** | F-030 shipped for one routine |
| **M3 — Public beta** | PWA + i18n + automated Pages deploy |
