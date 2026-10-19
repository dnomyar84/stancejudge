import type { ExtendedCoachPose, FootEndEffector, HandEndEffector } from "./extended-pose";
import type { CoachSkeleton } from "./skeleton";
import { lerp3, type Vec3 } from "./vec3";

function lerpHand(a: HandEndEffector, b: HandEndEffector, t: number): HandEndEffector {
  return {
    shape: t < 0.5 ? a.shape : b.shape,
    wrist: lerp3(a.wrist, b.wrist, t),
    knuckle: lerp3(a.knuckle, b.knuckle, t),
    palm: lerp3(a.palm, b.palm, t),
    palmNormal: lerp3(a.palmNormal, b.palmNormal, t),
  };
}

function lerpFoot(a: FootEndEffector, b: FootEndEffector, t: number): FootEndEffector {
  return {
    ankle: lerp3(a.ankle, b.ankle, t),
    heel: lerp3(a.heel, b.heel, t),
    toe: lerp3(a.toe, b.toe, t),
    toeYaw: a.toeYaw + (b.toeYaw - a.toeYaw) * t,
  };
}

function lerpSk(a: CoachSkeleton, b: CoachSkeleton, t: number): CoachSkeleton {
  const keys = Object.keys(a) as (keyof CoachSkeleton)[];
  const out = {} as CoachSkeleton;
  for (const k of keys) {
    out[k] = lerp3(a[k] as Vec3, b[k] as Vec3, t);
  }
  return out;
}

export function lerpExtendedPose(
  a: ExtendedCoachPose,
  b: ExtendedCoachPose,
  t: number,
): ExtendedCoachPose {
  return {
    skeleton: lerpSk(a.skeleton, b.skeleton, t),
    leftHand: lerpHand(a.leftHand, b.leftHand, t),
    rightHand: lerpHand(a.rightHand, b.rightHand, t),
    leftFoot: lerpFoot(a.leftFoot, b.leftFoot, t),
    rightFoot: lerpFoot(a.rightFoot, b.rightFoot, t),
  };
}
