# Live practice — product & UI spec

## Purpose

Real-time feedback while the student **faces the front camera** — stance width, knees, guard, alignment. Future: Wushu-specific profiles (弓步, 马步, etc.) tied to routine moves.

## When user starts live video

### Phase 1 — Before camera (`cameraOn === false`)

| Element | Requirement |
| --- | --- |
| **Stage placeholder** | Dark 4:3 region, subtle grid or vignette |
| **Primary CTA** | “Start camera” (large, cyan) |
| **Secondary** | Stance mode toggle: Athletic / Boxing guard |
| **Copy** | “Whole body visible, including feet” |
| **Model state** | If landmarker not loaded, CTA triggers load; show spinner on button |

### Phase 2 — Permission (`getUserMedia`)

| Element | Requirement |
| --- | --- |
| **Browser prompt** | Native; no custom modal blocking |
| **On deny** | Error card: title, reason, “Try again”, link “How to enable camera” |
| **On success** | Transition to active (no full-page reload) |

### Phase 3 — Active session (`cameraOn === true`)

| Zone | Content |
| --- | --- |
| **Practice stage** | `<video>` mirrored (`scale-x-[-1]`) + `<canvas>` overlay **same transform**; skeleton `drawPose(..., mirror: false)` |
| **Score HUD** | Overall % (large), color band (emerald/amber/rose) |
| **Headline** | One line: e.g. “Widen your base” / “Good athletic stance” |
| **Criteria list** | Scrollable cards: label, detail, badge Good/Adjust/Fix |
| **Controls** | Stop camera; optional fullscreen (F-020); optional flip mirror for coach review (F-022, off by default) |
| **Performance** | Single rAF loop; skip duplicate `currentTime`; degrade gracefully if FPS low |

### Phase 4 — Not ready (in frame)

| Condition | UI |
| --- | --- |
| Missing lower body | Headline only; criteria hidden or dimmed |
| Low light / no pose | “Stand where the camera can see you” |

## Layout (target — F-012)

**Mobile portrait**

```
┌─────────────────────────┐
│ Stance Judge    [Athletic│
├─────────────────────────┤
│                         │
│      VIDEO + SKELETON   │
│                         │
├─────────────────────────┤
│  78%  Overall           │
│  Headline               │
├─────────────────────────┤
│ Criterion cards…        │
│ [ Stop camera ]         │
└─────────────────────────┘
```

**Desktop**

- Left: stage (larger).
- Right: score + criteria sticky.

## Technical invariants (do not break)

- MediaPipe `detectForVideo(video, timestamp)` on **unmirrored** pixel buffer.
- Display mirror **only** via CSS on video + canvas together.
- Stance analysis uses semantic left/right from landmarks (not screen left/right).

## Future live features

| ID | Feature |
| --- | --- |
| F-030 | Live routine rail (move detection vs canonical) |
| F-031 | Audio cue on move change |
| F-032 | Hold-to-record clip + send to routine analyzer |
| F-033 | Wushu stance mode (弓步/马步/虚步 classifiers) |
