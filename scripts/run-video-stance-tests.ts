/**
 * Integration tests for uploaded MP4s under tests/video/.
 * Requires static export preview (Playwright + next dev turbopack often skips hydration):
 *   GITHUB_PAGES=true npm run build && npm run preview:pages
 */
import { spawn, spawnSync } from "child_process";
import { existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { chromium } from "playwright";
import manifest from "../tests/video/manifest.json";

const ROOT = process.cwd();
const VIDEO_ROOT = join(ROOT, "tests/video");
const PREVIEW_PORT = process.env.PREVIEW_PORT ?? "4322";
const BASE = "/stancejudge";
const ORIGIN = `http://127.0.0.1:${PREVIEW_PORT}${BASE}`;

type EvalResult = {
  sequenceScore: number;
  overallScore: number;
  legCoverage: number;
  handCoverage: number;
  wrongOrder: number;
  frameCount: number;
};

function globMp4(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...globMp4(p));
    else if (/\.(mp4|webm|mov)$/i.test(name)) out.push(p);
  }
  return out;
}

function isNegativePath(rel: string): boolean {
  const s = rel.toLowerCase();
  return (
    s.includes("si-duan-jian") ||
    s.includes("jian") ||
    s.includes("sdj") ||
    s.includes("剑") ||
    s.includes("sword")
  );
}

function waitForServer(ms = 120_000): boolean {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const r = spawnSync("curl", ["-sf", "-o", "/dev/null", `${ORIGIN}/`], {
      encoding: "utf8",
    });
    if (r.status === 0) return true;
    spawnSync("sleep", ["1"]);
  }
  return false;
}

function ensurePreviewServer(): void {
  if (waitForServer(3_000)) return;
  if (!existsSync(join(ROOT, "out"))) {
    console.error("Missing out/. Run: npm run build:pages");
    process.exit(1);
  }
  console.log("Starting preview:pages for video tests…");
  spawn("npm", ["run", "preview:pages"], {
    cwd: ROOT,
    detached: true,
    stdio: "ignore",
  }).unref();
  if (!waitForServer()) {
    console.error("Start preview: npm run preview:pages");
    process.exit(1);
  }
}

async function waitHydrated(page: import("playwright").Page) {
  await page.waitForFunction(
    () => document.body.dataset.stanceJudgeHydrated === "1",
    { timeout: 120_000 },
  );
}

async function evaluateSanDuanFile(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  filePath: string,
): Promise<EvalResult> {
  const page = await browser.newPage();
  const url = `${ORIGIN}/calibrate/?routine=san-duan-chang-quan&test=1`;
  await page.goto(url, { waitUntil: "networkidle" });
  await waitHydrated(page);
  const fileInput = page.getByTestId("calibrate-file");
  await fileInput.setInputFiles(filePath);
  await page.getByTestId("calibrate-sync-input").evaluate((el) => {
    (el as HTMLButtonElement).click();
  });
  await page.waitForFunction(
    () => {
      const v = document.querySelector("video");
      const btn = document.querySelector(
        "[data-testid=calibrate-run]",
      ) as HTMLButtonElement | null;
      return v && v.readyState >= 2 && btn && !btn.disabled;
    },
    { timeout: 180_000 },
  );
  await page.getByTestId("calibrate-run").click();
  await page.getByTestId("calibrate-done").waitFor({ timeout: 600_000 });
  const raw = await page.getByTestId("calibrate-eval").textContent();
  await page.close();
  if (!raw?.trim()) throw new Error("missing calibrate-eval (san-duan-chang-quan only)");
  return JSON.parse(raw) as EvalResult;
}

async function main() {
  const sdcqFiles = globMp4(join(VIDEO_ROOT, "san-duan-chang-quan"));
  const sdjFiles = globMp4(join(VIDEO_ROOT, "si-duan-jian"));
  const rootPos = globMp4(VIDEO_ROOT).filter((p) => {
    const rel = relative(VIDEO_ROOT, p);
    return !rel.includes("/") && !isNegativePath(rel);
  });
  const allPositive = [...sdcqFiles, ...rootPos];
  const allNegative = sdjFiles;

  if (allPositive.length === 0 && allNegative.length === 0) {
    console.log("No MP4 fixtures — skip (see tests/video/README.md)");
    process.exit(0);
  }

  ensurePreviewServer();

  const positiveCase = manifest.cases.find((c) => c.id === "sdcq-positive")!;
  const negativeCase = manifest.cases.find((c) => c.id === "sdj-negative-vs-sdcq")!;

  const browser = await chromium.launch();
  let failed = 0;

  for (const file of allPositive) {
    const rel = relative(VIDEO_ROOT, file);
    console.log(`\n[三段长拳 +] ${rel}`);
    try {
      const ev = await evaluateSanDuanFile(browser, file);
      console.log(
        `  sequence=${ev.sequenceScore} overall=${ev.overallScore} legCov=${(ev.legCoverage * 100).toFixed(0)}% frames=${ev.frameCount}`,
      );
      if (ev.frameCount < 5) {
        console.error("  FAIL: too few pose frames");
        failed++;
      } else if (ev.sequenceScore < positiveCase.minSequenceScore!) {
        console.error(
          `  FAIL: sequence ${ev.sequenceScore} < ${positiveCase.minSequenceScore}`,
        );
        failed++;
      } else if (ev.legCoverage < positiveCase.minLegCoverage!) {
        console.error(
          `  FAIL: legCoverage ${ev.legCoverage} < ${positiveCase.minLegCoverage}`,
        );
        failed++;
      }
    } catch (e) {
      console.error("  FAIL:", e instanceof Error ? e.message : e);
      failed++;
    }
  }

  for (const file of allNegative) {
    const rel = relative(VIDEO_ROOT, file);
    console.log(`\n[四段剑 − vs 长拳] ${rel}`);
    try {
      const ev = await evaluateSanDuanFile(browser, file);
      console.log(`  sequence=${ev.sequenceScore} overall=${ev.overallScore}`);
      if (
        ev.sequenceScore > negativeCase.maxSequenceScore! &&
        ev.overallScore > negativeCase.maxOverallScore!
      ) {
        console.error("  FAIL: sword video matched changquan too well");
        failed++;
      }
    } catch (e) {
      console.error("  FAIL:", e instanceof Error ? e.message : e);
      failed++;
    }
  }

  await browser.close();
  if (failed > 0) process.exit(1);
  console.log("\nAll video stance tests passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
