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

console.log("verify-pages-export: ok");
