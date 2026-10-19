import { spawnSync } from "child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

const root = process.cwd();
const apiDir = join(root, "src/app/api");
const backupDir = join(root, ".cache/dev-api-backup");

function backupApi() {
  if (!existsSync(apiDir)) return;
  mkdirSync(join(root, ".cache"), { recursive: true });
  rmSync(backupDir, { recursive: true, force: true });
  cpSync(apiDir, backupDir, { recursive: true });
  rmSync(apiDir, { recursive: true, force: true });
}

function restoreApi() {
  if (!existsSync(backupDir)) return;
  rmSync(apiDir, { recursive: true, force: true });
  mkdirSync(join(root, "src/app"), { recursive: true });
  cpSync(backupDir, apiDir, { recursive: true });
  rmSync(backupDir, { recursive: true, force: true });
}

backupApi();
rmSync(join(root, ".next"), { recursive: true, force: true });
const env = { ...process.env };
const result = spawnSync("next", ["build", "--webpack"], {
  cwd: root,
  env,
  stdio: "inherit",
  shell: true,
});
restoreApi();
process.exit(result.status ?? 1);
