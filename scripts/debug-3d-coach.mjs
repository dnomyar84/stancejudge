import { chromium } from "playwright";

const url =
  process.argv[2] ?? "http://127.0.0.1:4322/stancejudge/";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => logs.push(`[pageerror] ${err.message}`));

await page.goto(url, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Watch & rotate/i }).click();
await page.waitForTimeout(12_000);

const canvas = page.locator("canvas");
const count = await canvas.count();
const loading = await page.getByText(/Loading humanoid coach/i).count();
const error = await page.getByText(/3D preview could not load/i).count();
const hasWebgl = count > 0;

console.log(JSON.stringify({ url, canvasCount: count, loading, error, hasWebgl }, null, 2));
if (logs.length) console.log("logs:\n" + logs.slice(-30).join("\n"));

await page.screenshot({ path: "/opt/cursor/artifacts/3d-coach-debug.png", fullPage: true });
await browser.close();
