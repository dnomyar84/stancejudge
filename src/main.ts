import {
  createWoodenDummy,
  executePoseProgram,
  groundDummy,
  resetPoseAngles,
  syncBonesFromAngles,
} from "./engine/wooden-dummy";
import {
  EXAMPLE_FIST,
  EXAMPLE_GONGBU,
  EXAMPLE_HANDS_BY_EARS,
  EXAMPLE_LEFT_KNEE,
  EXAMPLE_NEUTRAL,
  EXAMPLE_PALM,
  EXAMPLE_SWORD,
  parsePoseGrammar,
} from "./engine/pose-grammar";
import { JOINT_IDS, type JointId } from "./engine/joint-catalog";
import type { JointAnglesDeg } from "./engine/wooden-dummy";
import { createDummyViewer } from "./engine/viewer";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="layout">
    <aside class="panel">
      <h1>Wooden dummy — pose grammar</h1>
      <p class="lede">
        Write a pose in plain lines, then apply. A button eases the figurine from the pose it is in into the next one.
      </p>
      <label for="grammar">Pose program</label>
      <textarea id="grammar" class="grammar" spellcheck="false"></textarea>
      <div class="toolbar">
        <button type="button" class="primary" id="apply">Apply pose</button>
        <button type="button" id="ex-neutral">Neutral</button>
        <button type="button" id="ex-ears">Hands by ears</button>
        <button type="button" id="ex-knee">Left knee</button>
        <button type="button" id="ex-palm">掌 Palm</button>
        <button type="button" id="ex-fist">拳 Fist</button>
        <button type="button" id="ex-sword">剑指 Sword</button>
        <button type="button" id="ex-gongbu">右弓步冲拳</button>
      </div>
      <p id="status" class="status" aria-live="polite"></p>
      <p class="joint-list">stand · right gong bu left punch · raise left knee · hands by the ears · arms forward · both palms · left fist · sword fingers · or joint lines (${JOINT_IDS.length} joints)</p>
    </aside>
    <div class="viewport-wrap" id="viewport">
      <span class="viewport-hint">Drag to orbit · scroll to zoom</span>
    </div>
  </div>
`;

const grammarEl = document.querySelector<HTMLTextAreaElement>("#grammar")!;
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;
const viewportEl = document.querySelector<HTMLDivElement>("#viewport")!;

grammarEl.value = EXAMPLE_GONGBU;

const dummy = createWoodenDummy();
const viewer = createDummyViewer();
viewer.mount(viewportEl);
resetPoseAngles(dummy);
syncBonesFromAngles(dummy);
viewer.setDummy(dummy);
groundDummy(dummy);

function setStatus(ok: boolean, message: string) {
  statusEl.textContent = message;
  statusEl.className = ok ? "status ok" : "status err";
}

const POSE_BLEND_MS = 800;
let blendToken = 0;

function copyAngles(): Record<JointId, JointAnglesDeg> {
  const out = {} as Record<JointId, JointAnglesDeg>;
  for (const id of JOINT_IDS) out[id] = { ...dummy.angles[id] };
  return out;
}

function writeAngles(src: Record<JointId, JointAnglesDeg>) {
  for (const id of JOINT_IDS) dummy.angles[id] = { ...src[id] };
}

function blendPose(from: Record<JointId, JointAnglesDeg>, to: Record<JointId, JointAnglesDeg>): number {
  const token = ++blendToken;
  const started = performance.now();
  const step = (now: number) => {
    if (token !== blendToken) return;
    const u = Math.min(1, (now - started) / POSE_BLEND_MS);
    const eased = u * u * (3 - 2 * u);
    for (const id of JOINT_IDS) {
      const a = dummy.angles[id];
      a.flex = from[id].flex + (to[id].flex - from[id].flex) * eased;
      a.abduct = from[id].abduct + (to[id].abduct - from[id].abduct) * eased;
      a.twist = from[id].twist + (to[id].twist - from[id].twist) * eased;
    }
    syncBonesFromAngles(dummy);
    groundDummy(dummy);
    if (u < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  return token;
}

function applyGrammar(animate = true) {
  const parsed = parsePoseGrammar(grammarEl.value);
  if (!parsed.ok) {
    setStatus(
      false,
      parsed.line ? `Line ${parsed.line}: ${parsed.error}` : parsed.error,
    );
    return;
  }
  const from = copyAngles();
  const clamped = executePoseProgram(dummy, parsed.program);
  const to = copyAngles();
  writeAngles(from);
  syncBonesFromAngles(dummy);
  groundDummy(dummy);
  const finish = () => {
    if (clamped.length === 0) {
      setStatus(true, `Applied ${parsed.program.statements.length} statement(s).`);
      return;
    }
    const detail = clamped
      .map((n) => `${n.joint} ${n.axis} ${n.requested}° → ${n.applied}°`)
      .join("; ");
    statusEl.textContent = `Clamped to human range: ${detail}`;
    statusEl.className = "status warn";
  };
  if (!animate) {
    writeAngles(to);
    syncBonesFromAngles(dummy);
    groundDummy(dummy);
    finish();
    return;
  }
  const token = blendPose(from, to);
  setStatus(true, "Moving into the pose.");
  window.setTimeout(() => {
    if (token !== blendToken) return;
    finish();
  }, POSE_BLEND_MS + 40);
}

document.querySelector("#apply")!.addEventListener("click", applyGrammar);

document.querySelector("#ex-neutral")!.addEventListener("click", () => {
  grammarEl.value = EXAMPLE_NEUTRAL;
  applyGrammar();
});
document.querySelector("#ex-ears")!.addEventListener("click", () => {
  grammarEl.value = EXAMPLE_HANDS_BY_EARS;
  applyGrammar();
});
document.querySelector("#ex-knee")!.addEventListener("click", () => {
  grammarEl.value = EXAMPLE_LEFT_KNEE;
  applyGrammar();
});
document.querySelector("#ex-palm")!.addEventListener("click", () => {
  grammarEl.value = EXAMPLE_PALM;
  applyGrammar();
});
document.querySelector("#ex-fist")!.addEventListener("click", () => {
  grammarEl.value = EXAMPLE_FIST;
  applyGrammar();
});
document.querySelector("#ex-sword")!.addEventListener("click", () => {
  grammarEl.value = EXAMPLE_SWORD;
  applyGrammar();
});
document.querySelector("#ex-gongbu")!.addEventListener("click", () => {
  grammarEl.value = EXAMPLE_GONGBU;
  applyGrammar();
});

grammarEl.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    applyGrammar();
  }
});

applyGrammar(false);
