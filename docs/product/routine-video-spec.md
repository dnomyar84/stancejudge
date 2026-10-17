# Routine video — product & UI spec

## Purpose

Student performs or uploads a **full routine**; app compares to **canonical** move order, leg stance, and hand/sword profile from coach calibration.

## Session layout (target)

```
┌──────────────────────────────────────────────────┐
│ STICKY POSE RAIL (scroll with playback)          │
├────────────────────┬─────────────────────────────┤
│ Reference          │ Student source              │
│ (thumb / local MP4)│ Upload | Stream | Coach link│
├────────────────────┴─────────────────────────────┤
│ VIDEO PLAYER (controls, scrub)                    │
├──────────────────────────────────────────────────┤
│ Move report (after scan) or tips while scanning   │
└──────────────────────────────────────────────────┘
```

## Required controls

| Control | Behavior |
| --- | --- |
| Routine picker | 三段长拳 / 四段剑; persist choice |
| Coach link | Fill reference YouTube from config |
| Upload MP4 | File picker; revoke old blob URL |
| Stream | Normalize URL; proxy or dev API; progress |
| Play | Native video controls |
| Rescan | Optional button after edit (F-015) |

## Pose rail behavior

| Playback | Rail |
| --- | --- |
| Playing | Playhead moves; active chip highlighted |
| Scanning | Chips `scanning` state until frame evidence |
| Complete | `met` / `missed` per move |
| Scrub | Rail position follows `currentTime` |

## Feedback copy (kids)

- Green: “Good” / 对了
- Amber: “Adjust form”
- Red: “Missed” / order wrong
- Coach tip on chip `title` attribute; future toast (F-016)

## Data dependencies

- `src/data/canonical/<routineId>.json` — timings + expected stances
- `src/data/reference-videos.json` — default YouTube / labels
- Browser overrides via admin `localStorage` / IndexedDB

## Errors

| Error | User message + action |
| --- | --- |
| YouTube 404/bot | Pages proxy instructions + Upload MP4 |
| No calibration | Banner “Timing not locked”; still show move names |
| Video codec | Suggest re-encode MP4 H.264 |
