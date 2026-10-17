/**
 * Preview the GitHub Pages export locally with the same URL shape as production:
 * http://127.0.0.1:4322/stancejudge/
 *
 * Do not `serve out` at the server root — assets use basePath /stancejudge.
 */
import { spawn } from "child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

const root = process.cwd();
const outDir = join(root, "out");
const previewRoot = join(root, ".preview-site");
const siteDir = join(previewRoot, "stancejudge");
const port = process.env.PREVIEW_PORT ?? "4322";

if (!existsSync(outDir)) {
  console.error("Missing out/. Run: GITHUB_PAGES=true npm run build");
  process.exit(1);
}

rmSync(previewRoot, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });
cpSync(outDir, siteDir, { recursive: true });

console.log(
  `Serving ${previewRoot} at http://127.0.0.1:${port}/stancejudge/`,
);
const child = spawn(
  "npx",
  ["--yes", "serve", previewRoot, "-l", port],
  { cwd: root, stdio: "inherit", shell: true },
);
child.on("exit", (code) => process.exit(code ?? 0));
