import type { CoachFigurinePoseV1 } from "./coach-figurine-pose";
import {
  COACH_FIGURINE_DRIVER_MANNEQUIN_MALE,
  COACH_FIGURINE_POSE_SCHEMA,
} from "./coach-figurine-pose";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpTriple(
  a: { tilt: number; turn: number; bend: number },
  b: { tilt: number; turn: number; bend: number },
  t: number,
) {
  return {
    tilt: lerp(a.tilt, b.tilt, t),
    turn: lerp(a.turn, b.turn, t),
    bend: lerp(a.bend, b.bend, t),
  };
}

function lerpLimb(
  a: { straddle: number; turn: number; raise: number },
  b: { straddle: number; turn: number; raise: number },
  t: number,
) {
  return {
    straddle: lerp(a.straddle, b.straddle, t),
    turn: lerp(a.turn, b.turn, t),
    raise: lerp(a.raise, b.raise, t),
  };
}

/** Deterministic blend between two stored figurine poses (display timeline). */
export function lerpCoachFigurinePose(
  a: CoachFigurinePoseV1,
  b: CoachFigurinePoseV1,
  t: number,
): CoachFigurinePoseV1 {
  const u = Math.max(0, Math.min(1, t));
  return {
    schema: COACH_FIGURINE_POSE_SCHEMA,
    driver: COACH_FIGURINE_DRIVER_MANNEQUIN_MALE,
    root: {
      x: lerp(a.root.x, b.root.x, u),
      y: lerp(a.root.y, b.root.y, u),
      z: lerp(a.root.z, b.root.z, u),
    },
    body: lerpTriple(a.body, b.body, u),
    torso: lerpTriple(a.torso, b.torso, u),
    head: {
      tilt: lerp(a.head.tilt, b.head.tilt, u),
      turn: lerp(a.head.turn, b.head.turn, u),
      nod: lerp(a.head.nod, b.head.nod, u),
    },
    leftLeg: lerpLimb(a.leftLeg, b.leftLeg, u),
    leftKnee: { bend: lerp(a.leftKnee.bend, b.leftKnee.bend, u) },
    leftAnkle: lerpTriple(a.leftAnkle, b.leftAnkle, u),
    rightLeg: lerpLimb(a.rightLeg, b.rightLeg, u),
    rightKnee: { bend: lerp(a.rightKnee.bend, b.rightKnee.bend, u) },
    rightAnkle: lerpTriple(a.rightAnkle, b.rightAnkle, u),
    leftArm: lerpLimb(a.leftArm, b.leftArm, u),
    leftElbow: { bend: lerp(a.leftElbow.bend, b.leftElbow.bend, u) },
    leftWrist: lerpTriple(a.leftWrist, b.leftWrist, u),
    leftFingers: { bend: lerp(a.leftFingers.bend, b.leftFingers.bend, u) },
    rightArm: lerpLimb(a.rightArm, b.rightArm, u),
    rightElbow: { bend: lerp(a.rightElbow.bend, b.rightElbow.bend, u) },
    rightWrist: lerpTriple(a.rightWrist, b.rightWrist, u),
    rightFingers: { bend: lerp(a.rightFingers.bend, b.rightFingers.bend, u) },
  };
}
