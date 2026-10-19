import { settlePoseOnFloor } from "../coach-figure/gravity";
import type { ExtendedCoachPose } from "../coach-figure/extended-pose";
import type { Vec3 } from "../coach-figure/vec3";
import * as THREE from "three";

type MannequinLike = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  /** Smoothed vertical root (reduces bbox flicker while poses interpolate). */
  __coachRootY?: number;
  body: { y: number; turn: number };
  torso: { bend: number };
  head: { nod: number; turn: number };
  l_leg: LimbJoint;
  l_knee: BendJoint;
  l_ankle: AnkleJoint;
  r_leg: LimbJoint;
  r_knee: BendJoint;
  r_ankle: AnkleJoint;
  l_arm: LimbJoint;
  l_elbow: BendJoint;
  l_wrist: BendJoint;
  r_arm: LimbJoint;
  r_elbow: BendJoint;
  r_wrist: BendJoint;
  l_fingers: { bend: number };
  r_fingers: { bend: number };
  stepOnGround: () => void;
  updateMatrixWorld: (force?: boolean) => void;
};

type LimbJoint = { raise: number; straddle: number; turn: number };
type BendJoint = { bend: number };
type AnkleJoint = { bend: number; tilt: number; turn: number };

function v3(p: Vec3): THREE.Vector3 {
  return new THREE.Vector3(p.lat, p.up, p.fwd);
}

function interiorAngleDeg(a: Vec3, b: Vec3, c: Vec3): number {
  const ba = v3(a).sub(v3(b));
  const bc = v3(c).sub(v3(b));
  const m = ba.length() * bc.length();
  if (m < 1e-8) return 180;
  const cos = Math.max(-1, Math.min(1, ba.dot(bc) / m));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Map bone direction (hip→knee / shoulder→elbow) to mannequin raise/straddle (degrees).
 * Coach skeleton uses mostly vertical segments (small fwd); atan2(x, z) is unstable there.
 */
function aimLimb(joint: LimbJoint, dir: THREE.Vector3, side: 1 | -1): void {
  const d = dir.clone();
  const mag = d.length();
  if (mag < 1e-8) return;
  d.divideScalar(mag);

  const horiz = Math.sqrt(d.x * d.x + d.z * d.z);
  const raise = Math.atan2(d.y, horiz) * (180 / Math.PI);
  const spreadPlane = Math.hypot(d.z, -d.y);
  const spreadDenom = Math.max(spreadPlane, horiz * 0.2, 0.06);
  const straddle =
    Math.atan2(d.x, spreadDenom) * (180 / Math.PI) * side;

  joint.raise = THREE.MathUtils.clamp(raise * 1.05, -120, 120);
  joint.straddle = THREE.MathUtils.clamp(straddle * 0.9, -75, 75);
  joint.turn = 0;
}

function setHandShape(
  man: MannequinLike,
  side: "left" | "right",
  shape: ExtendedCoachPose["leftHand"]["shape"],
): void {
  const curl = shape === "zhang" || shape === "tui_zhang" ? 5 : 35;
  if (side === "left") {
    man.l_fingers.bend = curl;
    man.l_wrist.bend = shape === "bao_quan" || shape === "quan" ? 10 : 0;
  } else {
    man.r_fingers.bend = curl;
    man.r_wrist.bend = shape === "bao_quan" || shape === "quan" ? 10 : 0;
  }
}

const ROOT_Y_SMOOTH = 0.42;

/** Fit mannequin-js figure to coach skeleton (client-side IK heuristic). */
export function applyCoachPoseToMannequin(
  man: MannequinLike,
  pose: ExtendedCoachPose,
  /** Scene floor alignment after stepOnGround (set once per viewer). */
  groundLift = 0,
): void {
  const grounded = settlePoseOnFloor(pose);
  const sk = grounded.skeleton;
  const hipMid = v3(sk.leftHip).add(v3(sk.rightHip)).multiplyScalar(0.5);
  const shoulderMid = v3(sk.leftShoulder)
    .add(v3(sk.rightShoulder))
    .multiplyScalar(0.5);

  const bodyYaw =
    Math.atan2(
      shoulderMid.x - hipMid.x,
      shoulderMid.z - hipMid.z,
    ) *
    (180 / Math.PI);

  man.body.turn = -90 + bodyYaw;
  man.body.y = 0;
  man.torso.bend = THREE.MathUtils.clamp(
    (shoulderMid.z - hipMid.z) * 40,
    -15,
    25,
  );

  const noseDir = v3(sk.nose).sub(shoulderMid);
  man.head.nod = THREE.MathUtils.clamp(-noseDir.y * 80, -35, 25);
  man.head.turn = THREE.MathUtils.clamp(noseDir.x * 50, -40, 40);

  const lThigh = v3(sk.leftKnee).sub(v3(sk.leftHip));
  const rThigh = v3(sk.rightKnee).sub(v3(sk.rightHip));
  aimLimb(man.l_leg, lThigh, -1);
  aimLimb(man.r_leg, rThigh, 1);

  man.l_knee.bend = THREE.MathUtils.clamp(
    180 - interiorAngleDeg(sk.leftHip, sk.leftKnee, sk.leftAnkle),
    0,
    150,
  );
  man.r_knee.bend = THREE.MathUtils.clamp(
    180 - interiorAngleDeg(sk.rightHip, sk.rightKnee, sk.rightAnkle),
    0,
    150,
  );

  const lShank = v3(sk.leftAnkle).sub(v3(sk.leftKnee));
  const rShank = v3(sk.rightAnkle).sub(v3(sk.rightKnee));
  man.l_ankle.bend = THREE.MathUtils.clamp(-lShank.y * 30, -25, 35);
  man.r_ankle.bend = THREE.MathUtils.clamp(-rShank.y * 30, -25, 35);
  man.l_ankle.turn =
    Math.atan2(
      grounded.leftFoot.toe.lat - grounded.leftFoot.heel.lat,
      grounded.leftFoot.toe.fwd - grounded.leftFoot.heel.fwd,
    ) *
    (180 / Math.PI) *
    0.4;
  man.r_ankle.turn =
    Math.atan2(
      grounded.rightFoot.toe.lat - grounded.rightFoot.heel.lat,
      grounded.rightFoot.toe.fwd - grounded.rightFoot.heel.fwd,
    ) *
    (180 / Math.PI) *
    0.4;

  const lUpper = v3(sk.leftElbow).sub(v3(sk.leftShoulder));
  const rUpper = v3(sk.rightElbow).sub(v3(sk.rightShoulder));
  aimLimb(man.l_arm, lUpper, -1);
  aimLimb(man.r_arm, rUpper, 1);

  man.l_elbow.bend = THREE.MathUtils.clamp(
    180 - interiorAngleDeg(sk.leftShoulder, sk.leftElbow, sk.leftWrist),
    5,
    150,
  );
  man.r_elbow.bend = THREE.MathUtils.clamp(
    180 - interiorAngleDeg(sk.rightShoulder, sk.rightElbow, sk.rightWrist),
    5,
    150,
  );

  const lFore = v3(sk.leftWrist).sub(v3(sk.leftElbow));
  const rFore = v3(sk.rightWrist).sub(v3(sk.rightElbow));
  man.l_wrist.bend = THREE.MathUtils.clamp(lFore.y * 25, -30, 40);
  man.r_wrist.bend = THREE.MathUtils.clamp(rFore.y * 25, -30, 40);

  setHandShape(man, "left", grounded.leftHand.shape);
  setHandShape(man, "right", grounded.rightHand.shape);

  man.position.x = hipMid.x * 0.9;
  man.position.z = hipMid.z * 0.9;

  man.stepOnGround();
  man.updateMatrixWorld(true);

  let rootY = man.position.y;
  if (groundLift !== 0) {
    rootY += groundLift;
  }

  const prevRootY = man.__coachRootY;
  if (
    prevRootY === undefined ||
    Math.abs(rootY - prevRootY) > 0.4
  ) {
    man.position.y = rootY;
  } else {
    man.position.y = prevRootY + (rootY - prevRootY) * ROOT_Y_SMOOTH;
  }
  man.__coachRootY = man.position.y;
  man.updateMatrixWorld(true);
}
