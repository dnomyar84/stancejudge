import type { HandShapeKind } from "../canonical3d/vocabulary";
import type { CoachSkeleton } from "./skeleton";
import { lerp3, v, type Vec3 } from "./vec3";

/** Hand articulation beyond the wrist joint. */
export type HandEndEffector = {
  shape: HandShapeKind;
  /** Wrist joint (matches skeleton). */
  wrist: Vec3;
  /** Knuckle / fist primary axis — points where fist “faces”. */
  knuckle: Vec3;
  /** Palm center for open-hand gestures. */
  palm: Vec3;
  /** Unit-ish normal: palm faces this direction (掌心朝向). */
  palmNormal: Vec3;
};

/** Foot articulation beyond the ankle. */
export type FootEndEffector = {
  ankle: Vec3;
  heel: Vec3;
  toe: Vec3;
  /** Toe line yaw in floor plane (radians, 0 = +fwd). */
  toeYaw: number;
};

export type ExtendedCoachPose = {
  skeleton: CoachSkeleton;
  leftHand: HandEndEffector;
  rightHand: HandEndEffector;
  leftFoot: FootEndEffector;
  rightFoot: FootEndEffector;
};

export function handAtSidePalmIn(side: "left" | "right"): HandEndEffector {
  const hy = 0.52;
  const sign = side === "left" ? -1 : 1;
  const wrist = v(sign * 0.14, 0.02, hy - 0.08);
  const palm = v(sign * 0.16, 0.04, hy - 0.1);
  const knuckle = v(sign * 0.15, 0.12, hy - 0.06);
  return {
    shape: "zhang",
    wrist,
    palm,
    knuckle,
    palmNormal: v(-sign, 0, 0.02),
  };
}

/** 抱拳 at sides: fist faces forward, elbow ~45° from vertical (side view). */
export function handBaoQuanAtSide(side: "left" | "right"): HandEndEffector {
  const hy = 0.52;
  const sign = side === "left" ? -1 : 1;
  const wrist = v(sign * 0.12, 0.08, hy - 0.02);
  const knuckle = v(sign * 0.1, 0.22, hy + 0.02);
  const palm = lerp3(wrist, knuckle, 0.4);
  return {
    shape: "bao_quan",
    wrist,
    palm,
    knuckle,
    palmNormal: v(0, 0, -1),
  };
}

export function footFromAnkleForward(
  ankle: Vec3,
  toeYaw = 0,
  footLen = 0.12,
): FootEndEffector {
  const toe = v(
    ankle.lat + Math.sin(toeYaw) * footLen,
    ankle.fwd + Math.cos(toeYaw) * footLen,
    ankle.up,
  );
  const heel = v(
    ankle.lat - Math.sin(toeYaw) * footLen * 0.35,
    ankle.fwd - Math.cos(toeYaw) * footLen * 0.35,
    ankle.up,
  );
  return { ankle, heel, toe, toeYaw };
}

export function defaultHandsForSkeleton(sk: CoachSkeleton): {
  left: HandEndEffector;
  right: HandEndEffector;
} {
  return {
    left: {
      shape: "quan",
      wrist: sk.leftWrist,
      knuckle: v(sk.leftWrist.lat, sk.leftWrist.fwd + 0.04, sk.leftWrist.up),
      palm: sk.leftWrist,
      palmNormal: v(-1, 0, 0),
    },
    right: {
      shape: "quan",
      wrist: sk.rightWrist,
      knuckle: v(sk.rightWrist.lat, sk.rightWrist.fwd + 0.04, sk.rightWrist.up),
      palm: sk.rightWrist,
      palmNormal: v(1, 0, 0),
    },
  };
}

export function defaultFeetForSkeleton(sk: CoachSkeleton): {
  left: FootEndEffector;
  right: FootEndEffector;
} {
  return {
    left: footFromAnkleForward(sk.leftAnkle, 0),
    right: footFromAnkleForward(sk.rightAnkle, 0),
  };
}

export function extendedFromSkeleton(sk: CoachSkeleton): ExtendedCoachPose {
  const hands = defaultHandsForSkeleton(sk);
  const feet = defaultFeetForSkeleton(sk);
  return {
    skeleton: sk,
    leftHand: hands.left,
    rightHand: hands.right,
    leftFoot: feet.left,
    rightFoot: feet.right,
  };
}
