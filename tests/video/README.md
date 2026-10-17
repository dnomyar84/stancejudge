# Video stance tests

Upload master / student MP4s here (Git **LFS** recommended for clips over ~50MB).

```
tests/video/
  san-duan-chang-quan/   ← 三段长拳 performances (should match syllabus)
  si-duan-jian/          ← 四段剑 (negative control vs changquan scorer)
  manifest.json
```

## Run

Playwright must hit a **production static export** (Next `dev` + Turbopack often does not hydrate in headless Chrome).

```bash
npm run build:pages
npm run preview:pages    # http://127.0.0.1:4322/stancejudge/
npm run test:video       # auto-starts preview if port 4322 is down
```

One-shot CI-style:

```bash
npm run test:video:ci
```

Unit tests without video: `npm test`

## Scoring

Videos are sampled every ~0.45s, poses classified, then compared to **三段长拳** canonical move order and syllabus legs/hands (`evaluate-san-duan.ts` uses `src/data/canonical/san-duan-chang-quan.json`).

- **san-duan-chang-quan/** videos should score **high** sequence + coverage.
- **si-duan-jian/** videos should score **low** when judged as changquan.

Thresholds in `manifest.json` — tuned to the checked-in 720p clip; raise as scoring improves.
