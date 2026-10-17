/**
 * Integration tests for uploaded MP4s under tests/video/.
 * Requires: npm run dev on port 4317
 */
import { spawnSync } from "child_process";
import { existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { chromium } from "playwright";
import manifest from "../tests/video/manifest.json";

const ROOT = process.cwd();
const VIDEO_ROOT = join(ROOT, "tests/video");
const BASE = process.env.GITHUB_PAGES === "true" ? "/stancejudge" : "";
const PAGE_URL = `http://127.0.0.1:4317${BASE}/test/video-sample/`;

function isNegativePath(rel: string): boolean {
  const s = rel.toLowerCase();
  return (
    s.includes("si-duan-jian") ||
    s.includes("/jian") ||
    s.includes("sdj") ||
    s.includes("剑") ||
    s.includes("sword")
  );
}

function globMp4AtRootPositive(root: string): string[] {
  return globMp4(root).filter((p) => {
    const rel = relative(root, p);
    if (rel.includes("/")) return false;
    return !isNegativePath(rel);
  });
}

function globMp4AtRootNegative(root: string): string[] {
  return globMp4(root).filter((p) => {
    const rel = relative(root, p);
    if (rel.includes("/")) return false;
    return isNegativePath(rel);
  });
}

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

function waitForServer(ms = 60_000): boolean {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = spawnSync("curl", ["-sf", "-o", "/dev/null", `http://127.0.0.1:4317${BASE}/`], {
        encoding: "utf8",
      });
      if (r.status === 0) return true;
    } catch {
      /* retry */
    }
    spawnSync("sleep", ["1"]);
  }
  return false;
}

type EvalResult = {
  sequenceScore: number;
  overallScore: number;
  legCoverage: number;
  handCoverage: number;
  wrongOrder: number;
  frameCount: number;
  error?: string;
};

async function evaluateFile(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  filePath: string,
): Promise<EvalResult> {
  const page = await browser.newPage();
  await page.goto(PAGE_URL);
  await page.getByTestId("video-file").setInputFiles(filePath);
  await page.getByTestId("video-el").evaluate(
    (el: HTMLVideoElement) =>
      new Promise<void>((resolve, reject) => {
        if (el.readyState >= 2) resolve();
        else {
          el.onloadeddata = () => resolve();
          el.onerror = () => reject(new Error("video load failed"));
        }
      }),
  );
  await page.getByTestId("video-run").click();
  await page.waitForFunction(
    () => {
      const el = document.querySelector("[data-testid=video-result]");
      return el?.textContent && el.textContent.length > 2;
    },
    { timeout: 600_000 },
  );
  const raw = await page.getByTestId("video-result").textContent();
  await page.close();
  const parsed = JSON.parse(raw || "{}") as EvalResult & { error?: string };
  if (parsed.error) throw new Error(parsed.error);
  return parsed;
}

async function main() {
  const sdcqDir = join(VIDEO_ROOT, "san-duan-chang-quan");
  const sdjDir = join(VIDEO_ROOT, "si-duan-jian");
  const sdcqFiles = [...globMp4(sdcqDir), ...globMp4AtRootPositive(VIDEO_ROOT)];
  const sdjFiles = [...globMp4(sdjDir), ...globMp4AtRootNegative(VIDEO_ROOT)];

  if (sdcqFiles.length === 0 && sdjFiles.length === 0) {
    console.log(
      "No MP4 under tests/video/san-duan-chang-quan or si-duan-jian — skip integration (upload videos to GitHub).",
    );
    process.exit(0);
  }

  if (!waitForServer()) {
    console.error("Start dev server: npm run dev");
    process.exit(1);
  }

  const positiveCase = manifest.cases.find((c) => c.id === "sdcq-positive")!;
  const negativeCase = manifest.cases.find((c) => c.id === "sdj-negative-vs-sdcq")!;

  const browser = await chromium.launch();
  let failed = 0;

  for (const file of sdcqFiles) {
    const rel = relative(VIDEO_ROOT, file);
    console.log(`\n[三段长拳 +] ${rel}`);
    const ev = await evaluateFile(browser, file);
    console.log(
      `  sequence=${ev.sequenceScore} overall=${ev.overallScore} legCov=${(ev.legCoverage * 100).toFixed(0)}% frames=${ev.frameCount}`,
    );
    if (ev.frameCount < 5) {
      console.error("  FAIL: too few pose frames");
      failed++;
      continue;
    }
    if (ev.sequenceScore < positiveCase.minSequenceScore!) {
      console.error(
        `  FAIL: sequenceScore ${ev.sequenceScore} < ${positiveCase.minSequenceScore}`,
      );
      failed++;
    }
    if (ev.legCoverage < positiveCase.minLegCoverage!) {
      console.error(
        `  FAIL: legCoverage ${ev.legCoverage} < ${positiveCase.minLegCoverage}`,
      );
      failed++;
    }
  }

  for (const file of sdjFiles) {
    const rel = relative(VIDEO_ROOT, file);
    console.log(`\n[四段剑 − vs 长拳] ${rel}`);
    const ev = await evaluateFile(browser, file);
    console.log(
      `  sequence=${ev.sequenceScore} overall=${ev.overallScore} legCov=${(ev.legCoverage * 100).toFixed(0)}%`,
    );
    if (
      ev.sequenceScore > negativeCase.maxSequenceScore! &&
      ev.overallScore > negativeCase.maxOverallScore!
    ) {
      console.error(
        `  FAIL: sword video matched changquan too well (seq ${ev.sequenceScore}, overall ${ev.overallScore})`,
      );
      failed++;
    }
  }

  await browser.close();
  if (failed > 0) {
    console.error(`\n${failed} video assertion(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll video stance tests passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
