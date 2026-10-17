# UI design system

## Aesthetic direction

**“Dojo night mode”** — dark, focused, premium athletic UI (not cartoon kids’ app).

- **Base:** near-black background with subtle cyan/teal atmospheric gradient (keep existing `to-cyan-950/20`).
- **Accent:** cyan-400 primary actions; emerald = success; amber = in-progress; rose = miss/fix.
- **Surfaces:** `card` with `ring-1 ring-foreground/10`, occasional `border-cyan-500/20` on primary panels.
- **Typography:** Geist sans (already in layout); **routine names** use mixed EN + 中文; scores use tabular nums.
- **Motion:** rail scroll `150ms linear`; chip `scale-105` on active pose; respect `prefers-reduced-motion`.

## Layout patterns

| Pattern | Use |
| --- | --- |
| **App shell** | Top: wordmark + routine context; bottom (mobile): primary action bar |
| **Practice stage** | 16:9 or 4:3 video/canvas hero, full width on mobile in landscape |
| **HUD sidebar** | Desktop: grid `1.4fr video + 1fr feedback`; mobile: sheet or stack below stage |
| **Sticky pose rail** | Only in routine-video mode; never covers camera controls in live mode |

## Core components (shadcn/ui + custom)

| Component | Status | Notes |
| --- | --- | --- |
| `PoseRail` | Built | Horizontal chips, playhead line |
| `RoutinePicker` | Partial | Two buttons today → segmented control + icons |
| `PracticeStage` | Planned | Video + canvas stack, permission overlay |
| `ScoreRing` | Planned | Overall % with color band |
| `CriterionList` | Partial | Live stance criteria |
| `CoachTipToast` | Planned | Short tip for active move |
| `EmptyState` | Partial | Illustration + single CTA |
| `UploadDropzone` | Planned | Drag-drop MP4, progress |

## Accessibility

- All status conveyed with **color + icon + text** (not color alone).
- Camera permission screen: plain language, link to browser settings help.
- Focus rings on all interactive controls (`focus-visible:ring-3`).
- `aria-live="polite"` for score headline changes in live mode.

## Responsive rules

- **&lt; md:** single column; pose rail font min 9px; sticky rail height capped.
- **Landscape + short height:** collapse coach admin link to icon; enlarge video stage.
- **Safe areas:** `env(safe-area-inset-*)` on fixed bottom bars (future).

## Reference screens (wire intent)

1. **Home / mode select** — two large cards: “Practice a routine (video)” vs “Live stance check”.
2. **Routine session** — rail on top, reference thumbnail left, student video right, play area bottom.
3. **Live session** — full stage, floating score ring, criteria cards swipeable.

See Figma-free specs in `ux-flows.md` and mode specs.
