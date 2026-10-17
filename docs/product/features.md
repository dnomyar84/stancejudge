# Feature catalog

**Execution backlog: [GitHub Issues](https://github.com/dnomyar84/stancejudge/issues)** ([workflow](./issues-workflow.md)). This file is the **ID catalog** and spec reference.

| ID | Issue |
| --- | --- |
| F-010 | [#1](https://github.com/dnomyar84/stancejudge/issues/1) |
| F-011 | [#2](https://github.com/dnomyar84/stancejudge/issues/2) |
| F-012 | [#3](https://github.com/dnomyar84/stancejudge/issues/3) |
| F-013 | [#4](https://github.com/dnomyar84/stancejudge/issues/4) |
| F-014 | [#5](https://github.com/dnomyar84/stancejudge/issues/5) |
| F-015 | [#6](https://github.com/dnomyar84/stancejudge/issues/6) |
| F-016 | [#7](https://github.com/dnomyar84/stancejudge/issues/7) |
| F-017 | [#8](https://github.com/dnomyar84/stancejudge/issues/8) |
| F-030 | [#9](https://github.com/dnomyar84/stancejudge/issues/9) |
| T-01 | [#10](https://github.com/dnomyar84/stancejudge/issues/10) |
| T-02 | [#11](https://github.com/dnomyar84/stancejudge/issues/11) |
| T-03 | [#12](https://github.com/dnomyar84/stancejudge/issues/12) |
| T-04 | [#13](https://github.com/dnomyar84/stancejudge/issues/13) |
| F-036 | [#14](https://github.com/dnomyar84/stancejudge/issues/14) |
| F-037–F-047 | [#15–#25](https://github.com/dnomyar84/stancejudge/issues?q=is%3Aissue+is%3Aopen+F-037) (gameplay DDR) |

- Each feature has an **ID** (`F-###`), **priority** (P0–P3), and **acceptance criteria**.
- Open/close work on Issues; reference `F-###` in the issue title.
- When an issue closes, set **Status** here to `done` and note **Issue #** in Implementation notes.
- Bugs from testing → new Issues (`type:bug`), not only chat.

**Status values:** `planned` | `in_progress` | `done` | `deferred`

---

## P0 — Core (shipped or stabilize)

### F-001 Routine syllabus data
- **Status:** `done`
- **Scope:** 三段长拳 22 moves, 四段剑 32+起收 in `src/lib/wushu/routines/`.
- **Acceptance:** Move list loads; rail shows correct count per routine.

### F-002 Pose rail synced to video
- **Status:** `done`
- **Scope:** `PoseRail` + `buildRailFromReport` + background scan.
- **Acceptance:** Rail scrolls during play; colors update after scan.

### F-003 Student video input (upload + YouTube blob)
- **Status:** `done`
- **Scope:** `routine-judge.tsx`, `load-youtube-video.ts`, optional proxy.
- **Acceptance:** MP4 upload analyzes; YouTube works on dev or with proxy.

### F-004 Live stance scoring (athletic/boxing)
- **Status:** `done`
- **Scope:** `stance-judge.tsx`, `analyze.ts`, mirrored overlay fix (F-009).
- **Acceptance:** Camera on → score + criteria update in real time.

### F-005 Coach admin & canonical export
- **Status:** `done`
- **Scope:** `/admin/`, `calibrate-routine`, `canonical-store`.
- **Acceptance:** Upload ref video → download JSON for `src/data/canonical/`.

### F-006 GitHub Pages static deploy
- **Status:** `done`
- **Scope:** `build:pages`, `gh-pages` branch, `preview:pages`.
- **Acceptance:** Site loads at `/stancejudge/` with assets.

### F-007 Reference without iframe
- **Status:** `done`
- **Scope:** `reference-video-link.tsx`, thumbnail + external link.
- **Acceptance:** No YouTube embed for analysis path.

### F-008 Sample 四段剑 reference URL
- **Status:** `done`
- **Scope:** `reference-videos.json` + `c1cgyuk-r7o`.
- **Acceptance:** Coach link + thumbnail for si-duan-jian.

### F-009 Front camera skeleton alignment
- **Status:** `done`
- **Scope:** Single mirror via CSS only; `drawPose(..., false)`.
- **Acceptance:** Overlay matches mirrored video.

---

## P1 — UX polish & clarity (next)

### F-010 Practice home hub
- **Status:** `planned`
- **Priority:** P1
- **Scope:** Replace flat tabs with hero + two mode cards; optional last routine chip.
- **Acceptance:**
  - [ ] Landing shows “Routine video” and “Live practice” as primary cards
  - [ ] Routine choice persists in `localStorage`
  - [ ] Mobile: cards stack full-width, min 48px tap height
- **Files:** `wushu-app.tsx`, new `practice-home.tsx`

### F-011 First-run onboarding (skippable)
- **Status:** `planned`
- **Priority:** P1
- **Acceptance:**
  - [ ] 3 slides max; “Skip” always visible
  - [ ] Sets `stancejudge.onboarding.v1 = done`
  - [ ] Mentions camera + upload fallback

### F-012 Live practice layout refresh
- **Status:** `planned`
- **Priority:** P1
- **Scope:** `PracticeStage` component; score ring; sticky criteria on desktop.
- **Acceptance:**
  - [ ] Matches wireframes in `live-practice-spec.md`
  - [ ] Permission denied state implemented
  - [ ] `prefers-reduced-motion` reduces chip animations

### F-013 Routine session layout refresh
- **Status:** `planned`
- **Priority:** P1
- **Acceptance:**
  - [ ] Clear visual hierarchy: rail → inputs → player → results
  - [ ] Upload dropzone with drag-and-drop
  - [ ] Loading skeleton for YouTube stream

### F-014 i18n labels (EN + 中文) for kid-facing strings
- **Status:** `planned`
- **Priority:** P1
- **Acceptance:**
  - [ ] `src/lib/i18n/` or JSON messages; toggle or browser locale
  - [ ] Move names already 中文; add buttons/status

### F-015 Rescan / reset session
- **Status:** `planned`
- **Priority:** P1
- **Acceptance:**
  - [ ] “Clear video” revokes blob and resets report
  - [ ] “Rescan” without re-upload

### F-016 Coach tip toast on active rail chip
- **Status:** `planned`
- **Priority:** P1
- **Acceptance:**
  - [ ] When chip `isActive`, show `coachTip` below rail or toast

### F-017 Actions deploy to gh-pages (or fix environment)
- **Status:** `planned`
- **Priority:** P1
- **Acceptance:**
  - [ ] Single workflow: build + deploy without manual `gh-pages` force push
  - [ ] Document in `.github/DEPLOY.md`

---

## P0 gameplay — Wushu DDR (owner-reviewed spec: [gameplay-ddr.md](./gameplay-ddr.md))

### F-037 Live per-move grades (Perfect / Good / Miss)
- **Status:** `planned`
- **Priority:** P0 gameplay
- **Acceptance:**
  - [ ] Active move window shows grade in real time (live + synced video play)
  - [ ] Grades map from leg/hand scores + sequence alignment
  - [ ] `GradeFloater` component per [ui-design-system.md](./ui-design-system.md)

### F-038 Stance depth penalty (not low enough)
- **Status:** `planned`
- **Priority:** P0 gameplay
- **Acceptance:**
  - [ ] Knee/hip metrics vs per-stance thresholds → Good vs LOW/Miss
  - [ ] Visible `DepthMeter` + penalty floater when shallow

### F-039 Combo streak & multiplier
- **Status:** `planned`
- **Priority:** P1 gameplay
- **Acceptance:**
  - [ ] Consecutive Good/Perfect increases multiplier
  - [ ] Miss breaks combo with clear animation

### F-040 Reward juice (VFX)
- **Status:** `planned`
- **Priority:** P1 gameplay
- **Acceptance:**
  - [ ] Perfect/Good: screen pulse, chip burst, +points floater
  - [ ] `prefers-reduced-motion` disables particles

### F-041 Penalty juice (VFX)
- **Status:** `planned`
- **Priority:** P1 gameplay
- **Acceptance:**
  - [ ] Miss/wrong move: red flash, chip shake, combo break
  - [ ] Wrong move vs shallow stance visually distinct

### F-042 Detect routine **start** (first move / 起势 / respect)
- **Status:** `planned`
- **Priority:** P0 gameplay
- **Acceptance:**
  - [ ] Canonical `routineBoundary: start` on first move(s)
  - [ ] Stable pose match → session `Performing`, scoring/timer starts

### F-043 Detect routine **end** (收势 / closing respect)
- **Status:** `planned`
- **Priority:** P0 gameplay
- **Acceptance:**
  - [ ] Last move stable match → session `Complete`, stop live grading

### F-044 Session state machine (Ready → Performing → Complete → Review)
- **Status:** `planned`
- **Priority:** P0 gameplay
- **Acceptance:**
  - [ ] UI banner per phase; no score before start
  - [ ] Shared between live DDR and video play modes

### F-045 Results / score review screen
- **Status:** `planned`
- **Priority:** P0 gameplay
- **Acceptance:**
  - [ ] Total score + per-move grade table after Complete
  - [ ] Stats: Perfect count, max combo, weakest stance
  - [ ] “Practice again” CTA
  - [ ] Supersedes minimal F-021 scope

### F-046 Live DDR mode (camera + pose rail + grades)
- **Status:** `planned`
- **Priority:** P0 gameplay
- **Acceptance:**
  - [ ] Extends F-030: rail + F-037 grades on webcam
  - [ ] Non-blocking camera loop

### F-047 Early / Late timing windows (optional DDR timing)
- **Status:** `planned`
- **Priority:** P2
- **Acceptance:**
  - [ ] Optional grade tier when pose correct but outside window

---

## P2 — Deeper coaching value

### F-020 Live fullscreen & landscape hint
- **Status:** `planned`
- **Priority:** P2
- **Acceptance:**
  - [ ] Fullscreen API on stage container
  - [ ] Rotate phone prompt when portrait + live active

### F-021 Live session summary on stop
- **Status:** `planned` → fold into **F-045**
- **Priority:** P2
- **Acceptance:**
  - [ ] Covered by F-045 results screen

### F-022 Optional mirror toggle (coach view)
- **Status:** `planned`
- **Priority:** P2
- **Acceptance:**
  - [ ] Toggle unmirror for recording review; default mirrored for student

### F-030 Live routine follow (pose rail + live detection)
- **Status:** `planned`
- **Priority:** P2
- **Scope:** Unify live camera with `classify.ts` + move index vs canonical windows.
- **Acceptance:**
  - [ ] Rail visible in live mode for selected routine
  - [ ] Active move advances from pose classification, not video time
  - [ ] Non-blocking; missed move does not stop camera

### F-031 Audio feedback (optional mute)
- **Status:** `planned`
- **Priority:** P2
- **Acceptance:**
  - [ ] Short beep or TTS on move change / good stance
  - [ ] Mute persisted

### F-032 Record 30s clip → routine analyzer
- **Status:** `planned`
- **Priority:** P2
- **Acceptance:**
  - [ ] MediaRecorder from stream → blob → same pipeline as upload

### F-033 Wushu stance mode in live tab
- **Status:** `planned`
- **Priority:** P2
- **Acceptance:**
  - [ ] Classify 弓步/马步/虚步/并步 vs athletic/boxing
  - [ ] Copy aligned with duanwei coaching

### F-034 Hand / sword profile feedback (routine + live)
- **Status:** `planned`
- **Priority:** P2
- **Acceptance:**
  - [ ] Visual hint when `jian_point` vs `jian_guard` wrong
  - [ ] Uses existing `HandProfileType` classifiers

### F-035 PWA install + offline model cache
- **Status:** `planned`
- **Priority:** P2
- **Acceptance:**
  - [ ] `manifest.json`, service worker for static assets
  - [ ] MediaPipe wasm cached after first load

---

## P3 — Nice to have

### F-040 Multiple club profiles (local)
- **Status:** `deferred`
- **Scope:** Named canonical sets in IndexedDB.

### F-041 Share score card image
- **Status:** `deferred`

### F-042 Parent PIN for admin
- **Status:** `partial` — `NEXT_PUBLIC_COACH_PIN` exists; document + UI gate polish.

---

## Bug / tech debt backlog

| ID | Item | Status |
| --- | --- | --- |
| T-01 | YouTube proxy reliability (bot detection) | open |
| T-02 | Calibrate all routines from reference MP4 | open |
| T-03 | `object-cover` vs canvas alignment on resize | open |
| T-04 | Reduce `setState` every frame in live mode (throttle UI) | open |
