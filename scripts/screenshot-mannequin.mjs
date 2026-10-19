import { chromium } from "playwright";
import { mkdirSync } from "fs";

mkdirSync("/opt/cursor/artifacts/screenshots", { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://127.0.0.1:4317/", { waitUntil: "networkidle" });
await page.locator("text=Watch & rotate").click();
await page.waitForTimeout(2000);
await page.locator('button:has-text("Play")').first().click();
await page.waitForTimeout(3000);
await page.screenshot({
  path: "/opt/cursor/artifacts/screenshots/wu-bu-mannequin-coach.png",
  fullPage: false,
});
await browser.close();
console.log("saved");
