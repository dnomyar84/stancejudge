# Stance Judge

Web app for **kids’ Wushu practice**: judge **routine sequence**, **leg stance**, and **hand / sword shape** from a **YouTube link or uploaded video**, plus **live webcam** feedback.

Routines included (simplified teaching checklists, not official competition sheets):

- **三段长拳** San Duan Chang Quan (unarmed)
- **四段剑** Si Duan Jian (straight sword)

## Features

| Area | What it checks |
|------|----------------|
| **Sequence** | Whether major leg-stance sections appear in the expected order (missed or out-of-order steps). |
| **Leg stance** | Horse (马步), bow (弓步), empty (虚步), feet together, etc. |
| **Hands / sword** | Punches, guards, salutes, sword point & carry (arm geometry; sword inferred from arm line). |

## Requirements

- Modern browser with WebGL
- For **live** mode: webcam
- For **video** mode: MP4/WebM upload, or YouTube import (server-assisted; may fail on restricted videos — upload file as fallback)
- Film **full body** from the front when possible

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:4317](http://localhost:4317).

## GitHub

[github.com/dnomyar84/stancejudge](https://github.com/dnomyar84/stancejudge)

## Stack

- Next.js, TypeScript, Tailwind, shadcn/ui
- MediaPipe Pose Landmarker (browser)
- Optional YouTube import via `/api/youtube` (`@distube/ytdl-core`)

## Limitations (beta)

- Pose-only: no real sword detection; jian techniques are approximated from arm position.
- Sequence matching uses time windows and stance labels — fast routines or poor camera angles reduce accuracy.
- Customize move lists in `src/lib/wushu/routines/`.
