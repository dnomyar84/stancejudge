# Stance Judge

Browser-based pose estimation app that scores your **athletic** or **boxing** stance from a webcam feed. All inference runs locally with [MediaPipe Pose Landmarker](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker) — no video leaves your device.

## Features

- Live skeleton overlay on mirrored camera preview
- Overall stance score (0–100) with per-criterion feedback
- **Athletic** mode: stance width, knee bend, hip/shoulder level, upright torso
- **Boxing guard** mode: same checks plus hand-guard height

## Requirements

- Modern browser with WebGL and camera access (Chrome, Edge, Firefox, Safari)
- HTTPS or `localhost` for `getUserMedia`

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:4317](http://localhost:4317), allow camera access, and stand so your full body is visible.

## Build

```bash
npm run build
npm start
```

## GitHub

This project is developed in Cursor. To put it on GitHub under a name like `stancejudge`, use **Create repo** in the agent view (or connect your own remote) and push this branch.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- `@mediapipe/tasks-vision` (Pose Landmarker Lite)
