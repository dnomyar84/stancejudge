import { JOINT_IDS, type AxisName, type JointId } from "./joint-catalog";

/**
 * Pose range for grammar angles, in degrees from the standing pose.
 *
 * Three.js `Bone` is only a transform. It will accept any Euler angle.
 * This table stops a joint short of folding through itself. +flex is forward
 * or into the palm, +abduct is away from the midline, and +twist is axial
 * rotation. The spans are wider than everyday active motion so a stance can
 * reach, point, and turn without the slider dying at the cap.
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
  hips: { flex: [-35, 50], abduct: [-25, 25], twist: [-45, 45] },
  spine: { flex: [-40, 60], abduct: [-35, 35], twist: [-45, 45] },
  chest: { flex: [-30, 45], abduct: [-30, 30], twist: [-50, 50] },
  neck: { flex: [-70, 60], abduct: [-45, 45], twist: [-80, 80] },
  head: { flex: [-40, 40], abduct: [-25, 25], twist: [-45, 45] },
  shoulder: { flex: [-20, 40], abduct: [-20, 30], twist: [-25, 25] },
  upper_arm: { flex: [-70, 180], abduct: [-50, 180], twist: [-100, 100] },
  forearm: { flex: [-5, 160], abduct: [0, 0], twist: [-90, 90] },
  hand: { flex: [-80, 90], abduct: [-35, 45], twist: [-30, 30] },
  hip: LOCKED,
  thigh: { flex: [-40, 145], abduct: [-35, 80], twist: [-50, 60] },
  shin: { flex: [-5, 155], abduct: [-12, 12], twist: [-20, 20] },
  foot: { flex: [-35, 70], abduct: [-35, 35], twist: [-30, 30] },
};

const FINGER: Rom = { flex: [-25, 110], abduct: [-20, 30], twist: [-15, 15] };
const FINGER_TIP: Rom = { flex: [0, 110], abduct: [0, 0], twist: [0, 0] };
const THUMB: Rom = { flex: [0, 100], abduct: [-40, 40], twist: [-30, 30] };
const THUMB_TIP: Rom = { flex: [0, 100], abduct: [0, 0], twist: [0, 0] };

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
