import type { CoachBonePoseV1 } from "./schema";
import {
  COACH_BONE_DRIVER_MIXAMO_XBOT,
  COACH_BONE_POSE_SCHEMA,
  type BoneEulerDeg,
} from "./schema";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpEuler(a: BoneEulerDeg, b: BoneEulerDeg, t: number): BoneEulerDeg {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    order: "XYZ",
  };
}

/** Blend two stored bone poses (same driver). */
export function lerpCoachBonePose(
  a: CoachBonePoseV1,
  b: CoachBonePoseV1,
  t: number,
): CoachBonePoseV1 {
  const u = Math.max(0, Math.min(1, t));
  const keys = new Set([
    ...Object.keys(a.rotations),
    ...Object.keys(b.rotations),
  ]);
  const rotations: Record<string, BoneEulerDeg> = {};
  for (const name of keys) {
    const ra = a.rotations[name];
    const rb = b.rotations[name];
    if (ra && rb) rotations[name] = lerpEuler(ra, rb, u);
    else if (ra) rotations[name] = ra;
    else if (rb) rotations[name] = rb;
  }
  return {
    schema: COACH_BONE_POSE_SCHEMA,
    driver: COACH_BONE_DRIVER_MIXAMO_XBOT,
    root: {
      x: lerp(a.root.x, b.root.x, u),
      y: lerp(a.root.y, b.root.y, u),
      z: lerp(a.root.z, b.root.z, u),
    },
    rotations,
  };
}
