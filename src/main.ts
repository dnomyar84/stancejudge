import {
  createWoodenDummy,
  executePoseProgram,
  groundDummy,
  resetPoseAngles,
  syncBonesFromAngles,
} from "./engine/wooden-dummy";
import {
  EXAMPLE_HANDS_BY_EARS,
  EXAMPLE_LEFT_KNEE,
  EXAMPLE_NEUTRAL,
  parsePoseGrammar,
} from "./engine/pose-grammar";
import { JOINT_IDS } from "./engine/joint-catalog";
import { createDummyViewer } from "./engine/viewer";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="layout">
    <aside class="panel">
      <h1>Wooden dummy — pose grammar</h1>
      <p class="lede">
        Frontend-only: Three.js (CDN) + procedural <code>THREE.Bone</code> /
        <code>SkinnedMesh</code> figurine. Edit the text program and apply.
      </p>
      <label for="grammar">Pose program</label>
      <textarea id="grammar" class="grammar" spellcheck="false"></textarea>
      <div class="toolbar">
        <button type="button" class="primary" id="apply">Apply pose</button>
        <button type="button" id="ex-neutral">Neutral</button>
        <button type="button" id="ex-ears">Hands by ears</button>
        <button type="button" id="ex-knee">Left knee</button>
      </div>
      <p id="status" class="status" aria-live="polite"></p>
      <p class="joint-list">Joints: ${JOINT_IDS.join(", ")}</p>
    </aside>
    <div class="viewport-wrap" id="viewport">
      <span class="viewport-hint">Drag to orbit · scroll to zoom</span>
    </div>
  </div>
`;

const grammarEl = document.querySelector<HTMLTextAreaElement>("#grammar")!;
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;
const viewportEl = document.querySelector<HTMLDivElement>("#viewport")!;

grammarEl.value = EXAMPLE_NEUTRAL;

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

function applyGrammar() {
  const parsed = parsePoseGrammar(grammarEl.value);
  if (!parsed.ok) {
    setStatus(
      false,
      parsed.line ? `Line ${parsed.line}: ${parsed.error}` : parsed.error,
    );
    return;
  }
  executePoseProgram(dummy, parsed.program);
  groundDummy(dummy);
  viewer.setDummy(dummy);
  setStatus(true, `Applied ${parsed.program.statements.length} statement(s).`);
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

grammarEl.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    applyGrammar();
  }
});

applyGrammar();
