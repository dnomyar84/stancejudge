import type { ExtendedCoachPose, FootEndEffector, HandEndEffector } from "./extended-pose";
import type { CoachSkeleton } from "./skeleton";
import type { Vec3 } from "./vec3";

/** Coach-space floor: ankle `up` at or just above this value is weight-bearing. */
export const COACH_FLOOR_CONTACT_UP = 0.02;

/** Both feet clearly airborne (jump); only used when spread is tiny. */
const AIRBORNE_MIN_UP = 0.14;

function shiftVertical(p: Vec3, deltaUp: number): Vec3 {
  return { ...p, up: p.up - deltaUp };
}

function shiftSkeleton(sk: CoachSkeleton, deltaUp: number): CoachSkeleton {
  const out = {} as CoachSkeleton;
  for (const key of Object.keys(sk) as (keyof CoachSkeleton)[]) {
    out[key] = shiftVertical(sk[key], deltaUp);
  }
  return out;
}

function shiftHand(h: HandEndEffector, deltaUp: number): HandEndEffector {
  return {
    ...h,
    wrist: shiftVertical(h.wrist, deltaUp),
    knuckle: shiftVertical(h.knuckle, deltaUp),
    palm: shiftVertical(h.palm, deltaUp),
    palmNormal: h.palmNormal,
  };
}

function shiftFoot(f: FootEndEffector, deltaUp: number): FootEndEffector {
  return {
    ...f,
    ankle: shiftVertical(f.ankle, deltaUp),
    heel: shiftVertical(f.heel, deltaUp),
    toe: shiftVertical(f.toe, deltaUp),
  };
}

/**
 * Gravity in coach space: move the whole rig vertically so the lowest foot
 * contacts the floor. One-legged poses (提膝, 弹踢) keep the raised foot up.
 */
export function settlePoseOnFloor(pose: ExtendedCoachPose): ExtendedCoachPose {
  const la = pose.skeleton.leftAnkle.up;
  const ra = pose.skeleton.rightAnkle.up;
  const lowest = Math.min(la, ra);
  const highest = Math.max(la, ra);

  let anchor = lowest;
  if (
    lowest >= AIRBORNE_MIN_UP &&
    highest - lowest < 0.06
  ) {
    anchor = lowest;
  }

  const deltaUp = anchor - COACH_FLOOR_CONTACT_UP;
  if (Math.abs(deltaUp) < 1e-5) {
    return pose;
  }

  const skeleton = shiftSkeleton(pose.skeleton, deltaUp);
  return {
    skeleton,
    leftHand: shiftHand(pose.leftHand, deltaUp),
    rightHand: shiftHand(pose.rightHand, deltaUp),
    leftFoot: shiftFoot(pose.leftFoot, deltaUp),
    rightFoot: shiftFoot(pose.rightFoot, deltaUp),
  };
}
