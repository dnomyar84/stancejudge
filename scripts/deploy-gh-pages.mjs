#!/usr/bin/env node
import { execSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const dist = join(root, "dist");
const stage = join(root, ".gh-pages-stage");

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", cwd: root, ...opts });
}

run("npm run build");

rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
cpSync(dist, stage, { recursive: true });
writeFileSync(join(stage, ".nojekyll"), "\n");

const sha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
run('git init', { cwd: stage });
run('git checkout -b gh-pages', { cwd: stage });
run('git add -A', { cwd: stage });
run(`git commit -m "Deploy ${sha} → gh-pages"`, { cwd: stage });

const remotes = execSync("git remote", { encoding: "utf8", cwd: root }).trim().split("\n");
const remote = remotes.includes("github") ? "github" : remotes.includes("origin") ? "origin" : "origin";
const url = execSync(`git remote get-url ${remote}`, { encoding: "utf8", cwd: root }).trim();

run(`git push ${url} HEAD:gh-pages --force`, { cwd: stage });
console.log(`\nPublished Deploy ${sha} → gh-pages (${url})\n`);

rmSync(stage, { recursive: true, force: true });
