import { JOINT_IDS, type AxisName, type JointId } from "./joint-catalog";

/**
 * Anatomical range of motion for grammar angles (degrees from the standing pose).
 *
 * Three.js `Bone` is only a transform. It will accept any Euler angle.
 * This table is the constraint layer: clinical-style active ROM, applied
 * before a bone is rotated. +flex is forward / into the palm, +abduct is
 * away from the midline, +twist is axial rotation.
 *
 * Ranges are approximate active limits (shoulder flexion ~170°, elbow 0–145°,
 * knee 0–140°, and so on). They are a software clamp, not a medical model.
 */
export type AxisLimit = readonly [min: number, max: number];

export type Rom = {
  flex: AxisLimit;
  abduct: AxisLimit;
  twist: AxisLimit;
};

const LOCKED: Rom = { flex: [0, 0], abduct: [0, 0], twist: [0, 0] };

const ROM: Record<string, Rom> = {
  root: LOCKED,
  hips: { flex: [-15, 30], abduct: [-15, 15], twist: [-25, 25] },
  spine: { flex: [-25, 45], abduct: [-25, 25], twist: [-35, 35] },
  chest: { flex: [-20, 35], abduct: [-20, 20], twist: [-30, 30] },
  neck: { flex: [-55, 50], abduct: [-40, 40], twist: [-70, 70] },
  head: { flex: [-25, 25], abduct: [-15, 15], twist: [-30, 30] },
  shoulder: { flex: [-10, 20], abduct: [-10, 15], twist: [-15, 15] },
  upper_arm: { flex: [-50, 170], abduct: [-30, 175], twist: [-90, 90] },
  forearm: { flex: [0, 145], abduct: [0, 0], twist: [-85, 85] },
  hand: { flex: [-70, 80], abduct: [-25, 35], twist: [-20, 20] },
  hip: LOCKED,
  thigh: { flex: [-20, 125], abduct: [-25, 45], twist: [-40, 45] },
  shin: { flex: [0, 140], abduct: [-5, 5], twist: [-10, 10] },
  foot: { flex: [-20, 50], abduct: [-20, 25], twist: [-15, 15] },
};

const FINGER: Rom = { flex: [-15, 95], abduct: [-12, 20], twist: [-5, 5] };
const FINGER_TIP: Rom = { flex: [0, 100], abduct: [0, 0], twist: [0, 0] };
const THUMB: Rom = { flex: [0, 90], abduct: [-25, 25], twist: [-20, 20] };
const THUMB_TIP: Rom = { flex: [0, 90], abduct: [0, 0], twist: [0, 0] };

function romFor(id: JointId): Rom {
  const name = id.replace(/^[lr]_/, "");
  if (name === "thumb") return THUMB;
  if (name === "thumb_tip") return THUMB_TIP;
  if (name.endsWith("_tip")) return FINGER_TIP;
  if (name === "index" || name === "middle" || name === "ring" || name === "pinky") return FINGER;
  return ROM[name] ?? LOCKED;
}

export type ClampNote = {
  joint: JointId;
  axis: AxisName;
  requested: number;
  applied: number;
};

export type AdjustableAxis = {
  joint: JointId;
  axis: AxisName;
  min: number;
  max: number;
};

/** Every flex / abduct / twist axis whose anatomical range is not a single locked value. */
export function listAdjustableAxes(): AdjustableAxis[] {
  const axes: AdjustableAxis[] = [];
  for (const joint of JOINT_IDS) {
    const rom = romFor(joint);
    for (const axis of ["flex", "abduct", "twist"] as const) {
      const [min, max] = rom[axis];
      if (min !== max) axes.push({ joint, axis, min, max });
    }
  }
  return axes;
}

function clampAxis(value: number, limit: AxisLimit): number {
  return Math.min(limit[1], Math.max(limit[0], value));
}

/** Mutates grammar angles so every axis stays inside human ROM. */
export function clampToAnatomy(
  angles: Record<JointId, { flex: number; abduct: number; twist: number }>,
): ClampNote[] {
  const notes: ClampNote[] = [];
  for (const id of Object.keys(angles) as JointId[]) {
    const rom = romFor(id);
    const a = angles[id];
    for (const axis of ["flex", "abduct", "twist"] as const) {
      const requested = a[axis];
      const applied = clampAxis(requested, rom[axis]);
      if (applied !== requested) {
        a[axis] = applied;
        notes.push({ joint: id, axis, requested, applied });
      }
    }
  }
  return notes;
}
