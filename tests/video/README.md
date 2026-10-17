# Video stance tests

Upload master / student MP4s here (Git **LFS** recommended).

```
tests/video/
  san-duan-chang-quan/   ← 三段长拳 performances (should match syllabus)
  si-duan-jian/          ← 四段剑 (negative control vs changquan scorer)
  manifest.json
```

## Run

```bash
npm run dev          # terminal 1 — http://localhost:4317
npm run test:video   # terminal 2 — Playwright + MediaPipe
```

Unit tests without video: `npm test`

## Scoring

Videos are sampled every ~0.45s, poses classified, then compared to **三段长拳** expected legs/hands and move order (`evaluate-san-duan.ts`).

- **san-duan-chang-quan/** videos should score **high** sequence + coverage.
- **si-duan-jian/** videos should score **low** when judged as changquan.

Thresholds in `manifest.json` — tune after first real runs.
