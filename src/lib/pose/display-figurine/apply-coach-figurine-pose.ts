import type { CoachFigurinePoseV1 } from "./coach-figurine-pose";
import { assertCoachFigurinePoseV1 } from "./coach-figurine-pose";

export type MannequinFigurineTarget = {
  position: { x: number; y: number; z: number };
  __coachRootY?: number;
  body: { y: number; turn: number; tilt: number; bend: number };
  torso: { bend: number; tilt: number; turn: number };
  head: { nod: number; turn: number; tilt: number };
  l_leg: { raise: number; straddle: number; turn: number };
  l_knee: { bend: number };
  l_ankle: { bend: number; tilt: number; turn: number };
  r_leg: { raise: number; straddle: number; turn: number };
  r_knee: { bend: number };
  r_ankle: { bend: number; tilt: number; turn: number };
  l_arm: { raise: number; straddle: number; turn: number };
  l_elbow: { bend: number };
  l_wrist: { bend: number; tilt: number; turn: number };
  r_arm: { raise: number; straddle: number; turn: number };
  r_elbow: { bend: number };
  r_wrist: { bend: number; tilt: number; turn: number };
  l_fingers: { bend: number };
  r_fingers: { bend: number };
  stepOnGround: () => void;
  updateMatrixWorld: (force?: boolean) => void;
};

const ROOT_Y_SMOOTH = 0.42;

/**
 * Apply stored figurine pose to mannequin-js — 1:1 mapping, no IK.
 */
export function applyCoachFigurinePoseToMannequin(
  man: MannequinFigurineTarget,
  pose: CoachFigurinePoseV1,
  options?: { groundLift?: number; smoothRootY?: boolean },
): void {
  assertCoachFigurinePoseV1(pose);

  man.position.x = pose.root.x;
  man.position.z = pose.root.z;

  man.body.tilt = pose.body.tilt;
  man.body.turn = pose.body.turn;
  man.body.bend = pose.body.bend;

  man.torso.tilt = pose.torso.tilt;
  man.torso.turn = pose.torso.turn;
  man.torso.bend = pose.torso.bend;

  man.head.tilt = pose.head.tilt;
  man.head.turn = pose.head.turn;
  man.head.nod = pose.head.nod;

  man.l_leg.raise = pose.leftLeg.raise;
  man.l_leg.straddle = pose.leftLeg.straddle;
  man.l_leg.turn = pose.leftLeg.turn;
  man.r_leg.raise = pose.rightLeg.raise;
  man.r_leg.straddle = pose.rightLeg.straddle;
  man.r_leg.turn = pose.rightLeg.turn;

  man.l_knee.bend = pose.leftKnee.bend;
  man.r_knee.bend = pose.rightKnee.bend;

  man.l_ankle.bend = pose.leftAnkle.bend;
  man.l_ankle.tilt = pose.leftAnkle.tilt;
  man.l_ankle.turn = pose.leftAnkle.turn;
  man.r_ankle.bend = pose.rightAnkle.bend;
  man.r_ankle.tilt = pose.rightAnkle.tilt;
  man.r_ankle.turn = pose.rightAnkle.turn;

  man.l_arm.raise = pose.leftArm.raise;
  man.l_arm.straddle = pose.leftArm.straddle;
  man.l_arm.turn = pose.leftArm.turn;
  man.r_arm.raise = pose.rightArm.raise;
  man.r_arm.straddle = pose.rightArm.straddle;
  man.r_arm.turn = pose.rightArm.turn;

  man.l_elbow.bend = pose.leftElbow.bend;
  man.r_elbow.bend = pose.rightElbow.bend;

  man.l_wrist.bend = pose.leftWrist.bend;
  man.l_wrist.tilt = pose.leftWrist.tilt;
  man.l_wrist.turn = pose.leftWrist.turn;
  man.r_wrist.bend = pose.rightWrist.bend;
  man.r_wrist.tilt = pose.rightWrist.tilt;
  man.r_wrist.turn = pose.rightWrist.turn;

  man.l_fingers.bend = pose.leftFingers.bend;
  man.r_fingers.bend = pose.rightFingers.bend;

  man.stepOnGround();
  man.updateMatrixWorld(true);

  let rootY = pose.root.y;
  const groundLift = options?.groundLift ?? 0;
  if (groundLift !== 0) rootY += groundLift;

  const smooth = options?.smoothRootY ?? true;
  const prevRootY = man.__coachRootY;
  if (!smooth || prevRootY === undefined || Math.abs(rootY - prevRootY) > 0.4) {
    man.position.y = rootY;
  } else {
    man.position.y = prevRootY + (rootY - prevRootY) * ROOT_Y_SMOOTH;
  }
  man.__coachRootY = man.position.y;
  man.updateMatrixWorld(true);
}
