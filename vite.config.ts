import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { defineConfig, type Connect, type Plugin, type ViteDevServer } from "vite";
import { JOINT_IDS } from "./src/engine/joint-catalog";

const root = __dirname;
const editsPath = join(root, "data/pose-edits.json");

type PoseEdits = Record<string, Record<string, { flex: number; abduct: number; twist: number }>>;

function readEdits(): PoseEdits {
  try {
    const parsed = JSON.parse(readFileSync(editsPath, "utf8")) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as PoseEdits) : {};
  } catch {
    return {};
  }
}

function isAngle(value: unknown): value is { flex: number; abduct: number; twist: number } {
  if (!value || typeof value !== "object") return false;
  const angle = value as { flex?: unknown; abduct?: unknown; twist?: unknown };
  return [angle.flex, angle.abduct, angle.twist].every(
    (n) => typeof n === "number" && Number.isFinite(n) && n >= -360 && n <= 360,
  );
}

function isPoseSnapshot(value: unknown): value is PoseEdits[string] {
  if (!value || typeof value !== "object") return false;
  const pose = value as Record<string, unknown>;
  return JOINT_IDS.every((id) => isAngle(pose[id])) && Object.keys(pose).length === JOINT_IDS.length;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

let saveChain = Promise.resolve();

function enqueueSave(job: () => Promise<void>): Promise<void> {
  const run = saveChain.then(job, job);
  saveChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function commitPoseEdit(name: string, restoring: boolean) {
  execFileSync("git", ["add", "data/pose-edits.json"], { cwd: root });
  try {
    execFileSync("git", ["commit", "-m", `${restoring ? "Restore" : "Save"} pose edits for ${name}`], {
      cwd: root,
    });
  } catch (error) {
    const output =
      error && typeof error === "object"
        ? `${"stdout" in error ? String(error.stdout) : ""} ${"stderr" in error ? String(error.stderr) : ""}`
        : "";
    const message = `${error instanceof Error ? error.message : ""} ${output}`;
    if (!message.includes("nothing to commit")) throw error;
  }
  execFileSync("git", ["push", "-u", "github", "main"], { cwd: root });
  execFileSync("npm", ["run", "deploy:pages"], { cwd: root, stdio: "inherit" });
}

function poseEditsPlugin(): Plugin {
  const handle: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url?.startsWith("/api/pose-edits")) {
      next();
      return;
    }
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Use POST to save a pose." });
      return;
    }
    void enqueueSave(async () => {
      try {
        const payload = JSON.parse(await readBody(req)) as {
          id?: unknown;
          name?: unknown;
          remove?: unknown;
          angles?: unknown;
        };
        if (typeof payload.id !== "string" || !/^[a-z0-9-]{1,80}$/.test(payload.id)) {
          sendJson(res, 400, { error: "Unknown pose." });
          return;
        }
        const name = typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : payload.id;
        const edits = readEdits();
        if (payload.remove === true) delete edits[payload.id];
        else if (isPoseSnapshot(payload.angles)) edits[payload.id] = payload.angles;
        else {
          sendJson(res, 400, { error: "A saved pose must include every joint angle." });
          return;
        }
        mkdirSync(join(root, "data"), { recursive: true });
        writeFileSync(editsPath, `${JSON.stringify(edits, null, 2)}\n`);
        commitPoseEdit(name.slice(0, 80), payload.remove === true);
        sendJson(res, 200, { ok: true });
      } catch (error) {
        sendJson(res, 500, { error: error instanceof Error ? error.message : "Could not save the pose." });
      }
    });
  };

  const attach = (server: ViteDevServer) => {
    server.middlewares.use(handle);
  };

  return {
    name: "pose-edits",
    configureServer: attach,
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    },
  };
}

export default defineConfig({
  base: "./",
  server: {
    port: 4321,
    host: "127.0.0.1",
    watch: { ignored: ["**/data/pose-edits.json"] },
  },
  plugins: [poseEditsPlugin()],
  build: {
    rollupOptions: {
      external: ["three", /^three\/addons\//],
    },
  },
});
