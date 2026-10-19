#!/usr/bin/env node
/**
 * Smoke: 五步拳 3D coach loads WebGL, plays briefly, no fatal errors.
 * Usage: node scripts/smoke-wbq-visual-coach.mjs [baseUrl]
 */
import { chromium } from "playwright";

const base =
  process.argv[2] ??
  process.env.SMOKE_BASE_URL ??
  "http://127.0.0.1:4322/stancejudge";

const errors = [];

const browser = await chromium.launch({
  args: ["--enable-webgl", "--use-gl=angle"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto(`${base}/coach/wu-bu-quan/`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: /五步拳/ }).waitFor({ timeout: 20_000 });
await page.waitForTimeout(2500);
const canvas = page.locator("canvas");
await canvas.waitFor({ state: "visible", timeout: 45_000 });

await page.getByRole("button", { name: /^Play$/ }).click();
await page.waitForTimeout(5000);

const loadingGone = await page
  .getByText("Loading 3D figure")
  .isVisible()
  .catch(() => false);
if (loadingGone) {
  throw new Error("3D figure still loading after 5s play");
}

const fatal = errors.filter(
  (e) => !e.includes("favicon") && !e.includes("404"),
);
await browser.close();

if (fatal.length) {
  console.error("Console errors:", fatal.slice(0, 5));
  process.exit(1);
}
console.log("smoke-wbq-visual-coach: ok");
