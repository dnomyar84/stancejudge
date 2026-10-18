#!/usr/bin/env node
/**
 * Build static export and force-push to the gh-pages branch (GitHub Pages source).
 * Used by agents after pushing main — see AGENTS.md and .github/DEPLOY.md.
 */
import { execSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", cwd: root, ...opts });
}

function gitRemoteGithub() {
  try {
    return execSync("git remote get-url github", {
      encoding: "utf8",
      cwd: root,
    }).trim();
  } catch {
    return execSync("git remote get-url origin", {
      encoding: "utf8",
      cwd: root,
    }).trim();
  }
}

run("npm run build:pages");

const shortSha = execSync("git rev-parse --short HEAD", {
  encoding: "utf8",
  cwd: root,
}).trim();

const stage = mkdtempSync(join(tmpdir(), "stancejudge-pages-"));
cpSync(join(root, "out"), stage, { recursive: true });

const remote = gitRemoteGithub();
const msg = `Deploy ${shortSha}`;

execSync(
  `git init -q && git add -A && git -c user.name=stancejudge -c user.email=stancejudge@users.noreply.github.com commit -q -m "${msg}" && git branch -M gh-pages && git push -f "${remote}" gh-pages`,
  { cwd: stage, stdio: "inherit" },
);

rmSync(stage, { recursive: true, force: true });
console.log(`\nPublished ${msg} → gh-pages (${remote})`);
