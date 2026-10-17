/**
 * Build canonical sequence JSON from a reference performance video.
 *
 * Usage:
 *   npm run calibrate -- si-duan-jian path/to/reference.mp4
 *   npm run calibrate -- si-duan-jian   # downloads from src/data/reference-videos.json
 *
 * Requires dev server: npm run dev (script will wait for http://127.0.0.1:4317)
 */
import { spawn } from "child_process";
import { createWriteStream, existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { chromium } from "playwright";
import ytdl from "@distube/ytdl-core";
import referenceVideos from "../src/data/reference-videos.json";
import { parseYouTubeVideoId } from "../src/lib/youtube";

const routineId = process.argv[2];
const videoArg = process.argv[3];

if (!routineId) {
  console.error("Usage: npm run calibrate -- <routine-id> [path-to.mp4]");
  process.exit(1);
}

const ref = referenceVideos[routineId as keyof typeof referenceVideos];
if (!ref) {
  console.error(`Unknown routine: ${routineId}`);
  process.exit(1);
}

async function waitForServer(url: string, ms = 120_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`Dev server not reachable at ${url}. Run: npm run dev`);
}

async function downloadYouTube(url: string, dest: string): Promise<void> {
  mkdirSync(join(dest, ".."), { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const stream = ytdl(url, { quality: "lowestvideo" });
    const out = createWriteStream(dest);
    stream.pipe(out);
    stream.on("error", reject);
    out.on("finish", () => resolve());
    out.on("error", reject);
  });
}

async function main() {
  const tmpDir = join(process.cwd(), "tmp/calibrate");
  mkdirSync(tmpDir, { recursive: true });
  let videoPath = videoArg ? join(process.cwd(), videoArg) : join(tmpDir, `${routineId}.mp4`);

  if (!videoArg) {
    const url = ref.youtubeUrl?.trim();
    if (!url) {
      console.error(
        `Set youtubeUrl in src/data/reference-videos.json for "${routineId}" or pass a local MP4 path.`,
      );
      process.exit(1);
    }
    console.log("Downloading reference from YouTube…");
    await downloadYouTube(url, videoPath);
  }

  if (!existsSync(videoPath)) {
    console.error(`Video not found: ${videoPath}`);
    process.exit(1);
  }

  const base = process.env.GITHUB_PAGES === "true" ? "/stancejudge" : "";
  const appUrl = `http://127.0.0.1:4317${base}/calibrate/?routine=${routineId}`;

  console.log("Waiting for dev server…");
  await waitForServer(`http://127.0.0.1:4317${base}/`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(appUrl);
  await page.getByTestId("calibrate-file").setInputFiles(videoPath);
  await page.getByTestId("calibrate-run").click();
  await page.getByTestId("calibrate-done").waitFor({ timeout: 600_000 });
  const json = await page.getByTestId("calibrate-json").textContent();
  await browser.close();

  if (!json) {
    console.error("Calibration produced no JSON.");
    process.exit(1);
  }

  const outPath = join(process.cwd(), `src/data/canonical/${routineId}.json`);
  writeFileSync(outPath, json.endsWith("\n") ? json : `${json}\n`);
  console.log(`Updated ${outPath}`);
  const id = ref.youtubeUrl ? parseYouTubeVideoId(ref.youtubeUrl) : null;
  console.log(id ? `Reference YouTube id: ${id}` : "No YouTube id in config.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
