#!/usr/bin/env node
/**
 * Sanity-check static export before pushing to gh-pages.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const out = join(process.cwd(), "out");
const indexPath = join(out, "index.html");

if (!existsSync(indexPath)) {
  console.error("verify-pages-export: missing out/index.html — run build:pages first");
  process.exit(1);
}

if (!existsSync(join(out, ".nojekyll"))) {
  console.error("verify-pages-export: missing out/.nojekyll (GitHub Pages may ignore _next/)");
  process.exit(1);
}

const html = readFileSync(indexPath, "utf8");
if (!html.includes("/stancejudge/_next/")) {
  console.error("verify-pages-export: index.html lacks /stancejudge/_next/ asset paths");
  process.exit(1);
}

const chunkMatch = html.match(/\/stancejudge\/_next\/static\/chunks\/[a-z0-9_.-]+\.js/gi);
if (!chunkMatch?.length) {
  console.error("verify-pages-export: no JS chunk references in index.html");
  process.exit(1);
}

for (const rel of [...new Set(chunkMatch)].slice(0, 8)) {
  const file = join(out, rel.replace(/^\/stancejudge\//, ""));
  if (!existsSync(file)) {
    console.error(`verify-pages-export: referenced chunk missing on disk: ${rel}`);
    process.exit(1);
  }
}

const cssMatch = html.match(/\/stancejudge\/_next\/static\/css\/[a-z0-9_.-]+\.css/gi);
if (!cssMatch?.length) {
  console.error("verify-pages-export: no CSS references in index.html");
  process.exit(1);
}

let utilitiesOk = false;
for (const rel of [...new Set(cssMatch)]) {
  const file = join(out, rel.replace(/^\/stancejudge\//, ""));
  if (!existsSync(file)) {
    console.error(`verify-pages-export: referenced CSS missing on disk: ${rel}`);
    process.exit(1);
  }
  const css = readFileSync(file, "utf8");
  if (css.includes(".rounded-xl") || css.includes(".bg-card")) {
    utilitiesOk = true;
  }
}
if (!utilitiesOk) {
  console.error(
    "verify-pages-export: built CSS lacks Tailwind utilities (e.g. .rounded-xl) — check postcss.config.mjs",
  );
  process.exit(1);
}

const modelPath = join(out, "models", "xbot.glb");
if (!existsSync(modelPath)) {
  console.error("verify-pages-export: missing out/models/xbot.glb");
  process.exit(1);
}

const coachIndex = join(out, "coach", "wu-bu-quan", "index.html");
if (!existsSync(coachIndex)) {
  console.error("verify-pages-export: missing out/coach/wu-bu-quan/index.html");
  process.exit(1);
}

console.log("verify-pages-export: ok");
