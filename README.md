# Stance Judge

Browser app for kids’ **Wushu** practice: compare a **student video** to a **known sequence** from a coach’s **YouTube reference** — step order, leg stance, and hand/sword shape.

**Live site (GitHub Pages):** https://dnomyar84.github.io/stancejudge/

## Routines (duanwei syllabus)

- **三段长拳** — 22-move duanwei changquan solo (起势 … 收势)  
- **四段剑** — 32-form taiji sword (太极剑32式) + 起势 / 收势 on the pose rail  

These are **武术段位制** exam forms, not IWUF optional-competition custom routines. Timing is refined from your champion calibration videos.

## How the known sequence is set

1. Pick the official/coach **YouTube** for each routine in  
   `src/data/reference-videos.json`:

   ```json
   {
     "si-duan-jian": {
       "youtubeUrl": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
       "label": "Club reference 2025"
     }
   }
   ```

2. **Calibrate** (extract move order, timing, and stances from that performance):

   ```bash
   npm install
   npm run dev
   # Option A — browser: open http://localhost:4317/calibrate/
   #   Upload an MP4 of the same YouTube performance → copy JSON into src/data/canonical/

   # Option B — automated (download + browser pose scan):
   npx playwright install chromium
   npm run calibrate -- si-duan-jian
   npm run calibrate -- san-duan-chang-quan
   ```

3. Commit `src/data/canonical/*.json` and push to `main`.  
   GitHub Actions deploys static files to Pages.

## GitHub Pages setup (one-time)

In the repo **Settings → Pages → Build and deployment**, choose **GitHub Actions** (workflow `Deploy GitHub Pages` is included).

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:4317

Static export (same as Pages):

```bash
npm run build:pages
npx serve out
```

## Student videos & YouTube links

Pose detection needs a **real `<video>` element** you control (same as webcam or MP4 upload). A **YouTube iframe cannot** be read by JavaScript (browser security).

Flow for a YouTube link:

1. App calls a **small proxy** that returns MP4 bytes (built-in `/api/youtube` when running `npm run dev`, or `youtube-proxy/` on Vercel for GitHub Pages).
2. Browser builds a **blob URL** and attaches it to `<video>`.
3. **MediaPipe** runs `detectForVideo(video, …)` — identical pipeline to upload/camera.

Set repo variable `YOUTUBE_PROXY_URL` (e.g. `https://your-proxy.vercel.app/api/youtube`) for Pages builds, or upload MP4 if you skip the proxy.

## Stack

- Next.js static export, MediaPipe Pose (browser)
- Canonical sequences in `src/data/canonical/`

## Repo

https://github.com/dnomyar84/stancejudge
