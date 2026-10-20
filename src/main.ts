import {
  createWoodenDummy,
  executePoseProgram,
  groundDummy,
  resetPoseAngles,
  syncBonesFromAngles,
} from "./engine/wooden-dummy";
import {
  parsePoseGrammar,
} from "./engine/pose-grammar";
import { JOINT_IDS, type AxisName, type JointId } from "./engine/joint-catalog";
import { listAdjustableAxes } from "./engine/joint-limits";
import type { JointAnglesDeg } from "./engine/wooden-dummy";
import { createDummyViewer } from "./engine/viewer";
import { POSE_LIBRARY, type PoseDefinition } from "./pose-library";
import rawPoseEdits from "../data/pose-edits.json";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="layout">
    <aside class="panel">
      <h1>Wushu pose studio</h1>
      <p class="lede">
        Review 30 editable stances, techniques, keyframes, and hand gestures on a human figure. Every change moves over 500 ms.
      </p>
      <section class="pose-browser" aria-labelledby="pose-browser-title">
        <div class="section-heading">
          <h2 id="pose-browser-title">Pose library</h2>
          <span id="pose-count">1 / ${POSE_LIBRARY.length}</span>
        </div>
        <label for="pose-select">Destination or keyframe</label>
        <select id="pose-select"></select>
        <div class="pose-title">
          <strong id="pose-name"></strong>
          <span id="pose-chinese"></span>
          <span class="keyframe-badge" id="keyframe-badge">Tween keyframe</span>
        </div>
        <p class="pose-description" id="pose-description"></p>
        <div class="toolbar pose-actions">
          <button type="button" id="previous-pose">← Previous</button>
          <button type="button" class="primary" id="next-pose">Next →</button>
          <button type="button" id="save-pose">Save edits</button>
          <button type="button" id="restore-pose">Restore default</button>
        </div>
        <p class="save-note">Save edits writes the pose into the project when this studio server is running. The published page is a static copy and cannot save.</p>
      </section>
      <details class="grammar-editor">
        <summary>Pose grammar</summary>
      <label for="grammar">Pose program</label>
      <textarea id="grammar" class="grammar" spellcheck="false"></textarea>
      <div class="toolbar">
        <button type="button" class="primary" id="apply">Apply pose</button>
      </div>
      </details>
      <p id="status" class="status" aria-live="polite"></p>
      <section class="sliders">
        <div class="section-heading">
          <h2>Joint sliders</h2>
          <span>95 movable axes</span>
        </div>
        <p class="hint">Drag a slider, then mirror that arm or leg onto the other side. Save edits stores the whole pose in the project.</p>
        <div class="slider-scroll" id="sliders"></div>
      </section>
    </aside>
    <div class="viewport-wrap" id="viewport">
      <span class="viewport-hint">Drag to orbit · scroll to zoom</span>
      <span class="figure-state" id="figure-state">Loading the human figure…</span>
    </div>
  </div>
`;

const grammarEl = document.querySelector<HTMLTextAreaElement>("#grammar")!;
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;
const viewportEl = document.querySelector<HTMLDivElement>("#viewport")!;
const poseSelect = document.querySelector<HTMLSelectElement>("#pose-select")!;
const poseNameEl = document.querySelector<HTMLElement>("#pose-name")!;
const poseChineseEl = document.querySelector<HTMLElement>("#pose-chinese")!;
const poseDescriptionEl = document.querySelector<HTMLParagraphElement>("#pose-description")!;
const poseCountEl = document.querySelector<HTMLElement>("#pose-count")!;
const keyframeBadgeEl = document.querySelector<HTMLElement>("#keyframe-badge")!;
const savePoseButton = document.querySelector<HTMLButtonElement>("#save-pose")!;
const restorePoseButton = document.querySelector<HTMLButtonElement>("#restore-pose")!;

const dummy = createWoodenDummy();
const viewer = createDummyViewer();
const figureState = document.querySelector<HTMLElement>("#figure-state")!;
viewer.mount(viewportEl);
resetPoseAngles(dummy);
syncBonesFromAngles(dummy);
viewer.setDummy(dummy);
groundDummy(dummy);
viewer.useHumanFigure("./models/Xbot.glb").then(
  () => {
    figureState.hidden = true;
  },
  () => {
    figureState.textContent = "The human figure did not load. Joint lines stay visible.";
  },
);

function setStatus(ok: boolean, message: string) {
  statusEl.textContent = message;
  statusEl.className = ok ? "status ok" : "status err";
}

const POSE_BLEND_MS = 500;
let blendToken = 0;
let currentPoseIndex = 0;

type PoseSnapshot = Record<JointId, JointAnglesDeg>;
const defaultSnapshots = new Map<string, PoseSnapshot>();
const savedSnapshots = new Map<string, PoseSnapshot>();

function copyAngles(): Record<JointId, JointAnglesDeg> {
  const out = {} as Record<JointId, JointAnglesDeg>;
  for (const id of JOINT_IDS) out[id] = { ...dummy.angles[id] };
  return out;
}

function writeAngles(src: Record<JointId, JointAnglesDeg>) {
  for (const id of JOINT_IDS) dummy.angles[id] = { ...src[id] };
}

function cloneSnapshot(src: PoseSnapshot): PoseSnapshot {
  const out = {} as PoseSnapshot;
  for (const id of JOINT_IDS) out[id] = { ...src[id] };
  return out;
}

function isSnapshot(value: unknown): value is PoseSnapshot {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PoseSnapshot>;
  return JOINT_IDS.every((id) => {
    const angles = candidate[id];
    return angles
      && Number.isFinite(angles.flex)
      && Number.isFinite(angles.abduct)
      && Number.isFinite(angles.twist);
  });
}

function buildDefaultSnapshots() {
  for (const pose of POSE_LIBRARY) {
    const parsed = parsePoseGrammar(pose.program);
    if (!parsed.ok) throw new Error(`Invalid library pose "${pose.name}": ${parsed.error}`);
    executePoseProgram(dummy, parsed.program);
    defaultSnapshots.set(pose.id, copyAngles());
  }
  resetPoseAngles(dummy);
  syncBonesFromAngles(dummy);
  groundDummy(dummy);
}

function loadSavedSnapshots() {
  const stored = rawPoseEdits as Record<string, unknown>;
  for (const pose of POSE_LIBRARY) {
    const candidate = stored[pose.id];
    if (isSnapshot(candidate)) savedSnapshots.set(pose.id, cloneSnapshot(candidate));
  }
}

async function writePoseEdit(pose: PoseDefinition, angles: PoseSnapshot | null) {
  const response = await fetch("/api/pose-edits", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(
      angles
        ? { id: pose.id, name: pose.name, angles }
        : { id: pose.id, name: pose.name, remove: true },
    ),
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (response.ok) return;
  if (response.status === 404 || response.status === 405 || !body.error) {
    throw new Error("This published page has no save server. Open the running studio to write the pose into the project.");
  }
  throw new Error(body.error);
}

function snapshotFor(pose: PoseDefinition): PoseSnapshot {
  return cloneSnapshot(savedSnapshots.get(pose.id) ?? defaultSnapshots.get(pose.id)!);
}

function updatePoseOptionLabels() {
  for (const option of poseSelect.options) {
    const pose = POSE_LIBRARY[Number(option.dataset.index)];
    option.textContent = `${pose.chinese} · ${pose.name}${savedSnapshots.has(pose.id) ? " • Edited" : ""}`;
  }
}

function updateDirtyState(dirty: boolean) {
  savePoseButton.classList.toggle("unsaved", dirty);
  savePoseButton.textContent = dirty ? "Save edits *" : "Save edits";
}

function showPose(index: number, animate = true) {
  currentPoseIndex = (index + POSE_LIBRARY.length) % POSE_LIBRARY.length;
  const pose = POSE_LIBRARY[currentPoseIndex];
  poseSelect.value = pose.id;
  poseNameEl.textContent = pose.name;
  poseChineseEl.textContent = pose.chinese;
  poseDescriptionEl.textContent = pose.description;
  poseCountEl.textContent = `${currentPoseIndex + 1} / ${POSE_LIBRARY.length}`;
  keyframeBadgeEl.hidden = !pose.transitional;
  grammarEl.value = `${pose.program}\n`;

  const from = copyAngles();
  const to = snapshotFor(pose);
  updateDirtyState(false);
  if (animate) {
    blendPose(from, to);
    setStatus(true, `${pose.name} · moving for ${POSE_BLEND_MS} ms.`);
  } else {
    writeAngles(to);
    syncBonesFromAngles(dummy);
    groundDummy(dummy);
    refreshSliders();
    setStatus(true, `${pose.name} loaded.`);
  }
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
    refreshSliders();
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
  updateDirtyState(true);
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
    refreshSliders();
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

document.querySelector("#apply")!.addEventListener("click", () => applyGrammar());

grammarEl.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    applyGrammar();
  }
});

poseSelect.addEventListener("change", () => {
  showPose(POSE_LIBRARY.findIndex((pose) => pose.id === poseSelect.value));
});

document.querySelector("#previous-pose")!.addEventListener("click", () => showPose(currentPoseIndex - 1));
document.querySelector("#next-pose")!.addEventListener("click", () => showPose(currentPoseIndex + 1));

savePoseButton.addEventListener("click", async () => {
  const pose = POSE_LIBRARY[currentPoseIndex];
  const angles = copyAngles();
  savePoseButton.disabled = true;
  restorePoseButton.disabled = true;
  setStatus(true, `Saving ${pose.name} into the project…`);
  try {
    await writePoseEdit(pose, angles);
    savedSnapshots.set(pose.id, angles);
    updatePoseOptionLabels();
    updateDirtyState(false);
    setStatus(true, `${pose.name} saved into the project.`);
  } catch (error) {
    setStatus(false, error instanceof Error ? error.message : "Could not save this pose into the project.");
  } finally {
    savePoseButton.disabled = false;
    restorePoseButton.disabled = false;
  }
});

restorePoseButton.addEventListener("click", async () => {
  const pose = POSE_LIBRARY[currentPoseIndex];
  savePoseButton.disabled = true;
  restorePoseButton.disabled = true;
  setStatus(true, `Restoring ${pose.name} in the project…`);
  try {
    await writePoseEdit(pose, null);
    savedSnapshots.delete(pose.id);
    updatePoseOptionLabels();
    showPose(currentPoseIndex);
    setStatus(true, `${pose.name} restored in the project.`);
  } catch (error) {
    setStatus(false, error instanceof Error ? error.message : "Could not restore this pose.");
  } finally {
    savePoseButton.disabled = false;
    restorePoseButton.disabled = false;
  }
});

const SLIDER_GROUPS: Array<{ title: string; test: (joint: JointId) => boolean }> = [
  { title: "Torso", test: (id) => ["hips", "spine", "chest", "neck", "head"].includes(id) },
  { title: "Left arm", test: (id) => /^l_(shoulder|upper_arm|forearm|hand)$/.test(id) },
  { title: "Right arm", test: (id) => /^r_(shoulder|upper_arm|forearm|hand)$/.test(id) },
  { title: "Left fingers", test: (id) => /^l_(thumb|index|middle|ring|pinky)/.test(id) },
  { title: "Right fingers", test: (id) => /^r_(thumb|index|middle|ring|pinky)/.test(id) },
  { title: "Left leg", test: (id) => /^l_(thigh|shin|foot)$/.test(id) },
  { title: "Right leg", test: (id) => /^r_(thigh|shin|foot)$/.test(id) },
];

const ARM_JOINTS = [
  "shoulder",
  "upper_arm",
  "forearm",
  "hand",
  "thumb",
  "thumb_tip",
  "index",
  "index_tip",
  "middle",
  "middle_tip",
  "ring",
  "ring_tip",
  "pinky",
  "pinky_tip",
] as const;
const LEG_JOINTS = ["thigh", "shin", "foot"] as const;

const MIRROR_ACTIONS: Record<string, { kind: "arm" | "leg"; from: "l" | "r"; label: string }> = {
  "Left arm": { kind: "arm", from: "l", label: "Mirror to right arm" },
  "Right arm": { kind: "arm", from: "r", label: "Mirror to left arm" },
  "Left leg": { kind: "leg", from: "l", label: "Mirror to right leg" },
  "Right leg": { kind: "leg", from: "r", label: "Mirror to left leg" },
};

const sliderInputs = new Map<string, { input: HTMLInputElement; out: HTMLOutputElement }>();

function sliderKey(joint: JointId, axis: AxisName) {
  return `${joint}:${axis}`;
}

function mirrorLimb(kind: "arm" | "leg", from: "l" | "r") {
  const to = from === "l" ? "r" : "l";
  const names = kind === "arm" ? ARM_JOINTS : LEG_JOINTS;
  blendToken += 1;
  for (const name of names) {
    const src = dummy.angles[`${from}_${name}`];
    const dst = dummy.angles[`${to}_${name}`];
    dst.flex = src.flex;
    dst.abduct = src.abduct;
    dst.twist = src.twist;
  }
  syncBonesFromAngles(dummy);
  groundDummy(dummy);
  refreshSliders();
  updateDirtyState(true);
  const source = from === "l" ? "left" : "right";
  const target = from === "l" ? "right" : "left";
  const hand = kind === "arm" ? ", including the hand" : "";
  setStatus(true, `Mirrored the ${source} ${kind} onto the ${target}${hand}. Save edits to keep it.`);
}

function refreshSliders() {
  for (const [key, row] of sliderInputs) {
    const [joint, axis] = key.split(":") as [JointId, AxisName];
    const value = dummy.angles[joint][axis];
    row.input.value = String(value);
    row.out.textContent = `${Math.round(value)}°`;
  }
}

function mountSliders() {
  const root = document.querySelector<HTMLDivElement>("#sliders")!;
  const axes = listAdjustableAxes();
  for (const group of SLIDER_GROUPS) {
    const mine = axes.filter((axis) => group.test(axis.joint));
    if (mine.length === 0) continue;
    const details = document.createElement("details");
    details.open = group.title === "Torso" || group.title.endsWith("leg") || group.title.endsWith("arm");
    const summary = document.createElement("summary");
    summary.textContent = `${group.title} (${mine.length})`;
    details.appendChild(summary);
    const mirror = MIRROR_ACTIONS[group.title];
    if (mirror) {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "mirror-action";
      action.textContent = mirror.label;
      action.addEventListener("click", () => mirrorLimb(mirror.kind, mirror.from));
      details.appendChild(action);
    }
    for (const axis of mine) {
      const label = document.createElement("label");
      label.className = "slider-row";
      const name = document.createElement("span");
      name.textContent = `${axis.joint} ${axis.axis}`;
      const out = document.createElement("output");
      const input = document.createElement("input");
      input.type = "range";
      input.min = String(axis.min);
      input.max = String(axis.max);
      input.step = "1";
      input.setAttribute("aria-label", `${axis.joint} ${axis.axis}`);
      input.addEventListener("input", () => {
        blendToken += 1;
        dummy.angles[axis.joint][axis.axis] = Number(input.value);
        syncBonesFromAngles(dummy);
        groundDummy(dummy);
        out.textContent = `${input.value}°`;
        updateDirtyState(true);
        setStatus(true, "Pose adjusted. Save edits to keep this version.");
      });
      label.append(name, out, input);
      details.appendChild(label);
      sliderInputs.set(sliderKey(axis.joint, axis.axis), { input, out });
    }
    root.appendChild(details);
  }
}

function mountPoseLibrary() {
  const groups = new Map<string, HTMLOptGroupElement>();
  POSE_LIBRARY.forEach((pose, index) => {
    let group = groups.get(pose.category);
    if (!group) {
      group = document.createElement("optgroup");
      group.label = pose.category;
      groups.set(pose.category, group);
      poseSelect.appendChild(group);
    }
    const option = document.createElement("option");
    option.value = pose.id;
    option.dataset.index = String(index);
    group.appendChild(option);
  });
  updatePoseOptionLabels();
}

buildDefaultSnapshots();
loadSavedSnapshots();
mountPoseLibrary();
mountSliders();
showPose(POSE_LIBRARY.findIndex((pose) => pose.id === "right-gongbu-left-punch"), false);
