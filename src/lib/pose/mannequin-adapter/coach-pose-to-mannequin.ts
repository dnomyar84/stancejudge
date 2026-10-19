import { settlePoseOnFloor } from "../coach-figure/gravity";
import type { ExtendedCoachPose } from "../coach-figure/extended-pose";
import type { Vec3 } from "../coach-figure/vec3";
import * as THREE from "three";

type MannequinLike = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
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

const DEG = 180 / Math.PI;
/** Male() resting leg straddle offset in mannequin-js. */
const MALE_LEG_STRADDLE_REST = 6;
const MALE_ARM_STRADDLE_REST = 7;
const MALE_ARM_RAISE_REST = -5;
const BODY_TURN_DEG = -90;

function v3(p: Vec3): THREE.Vector3 {
  return new THREE.Vector3(p.lat, p.up, p.fwd);
}

/**
 * Coach frame: +X left, +Y up, +Z forward (camera).
 * Mannequin body.turn = -90° → pelvis +Z coach maps to limb solve space.
 */
function coachDirToPelvis(dir: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(dir.z, dir.y, -dir.x);
}

function interiorAngleDeg(a: Vec3, b: Vec3, c: Vec3): number {
  const ba = v3(a).sub(v3(b));
  const bc = v3(c).sub(v3(b));
  const m = ba.length() * bc.length();
  if (m < 1e-8) return 180;
  const cos = Math.max(-1, Math.min(1, ba.dot(bc) / m));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Leg mesh has an X-flip; solve in pelvis space with down/abduct/sagittal. */
function aimMannequinLeg(
  joint: LimbJoint,
  dirCoach: THREE.Vector3,
  side: 1 | -1,
): void {
  const p = coachDirToPelvis(dirCoach);
  const m = p.length();
  if (m < 1e-8) return;
  p.divideScalar(m);

  const down = Math.max(0.08, -p.y);
  const abduct = p.x * side;
  const sagittal = p.z;

  joint.straddle = THREE.MathUtils.clamp(
    Math.atan2(abduct, down) * DEG + MALE_LEG_STRADDLE_REST,
    -70,
    85,
  );
  joint.raise = THREE.MathUtils.clamp(Math.atan2(sagittal, down) * DEG, -78, 78);
  joint.turn = 0;
}

/** Arm mesh differs from leg; keep near Male rest pose, modulate from skeleton. */
function aimMannequinArm(
  joint: LimbJoint,
  dirCoach: THREE.Vector3,
  side: 1 | -1,
): void {
  const p = coachDirToPelvis(dirCoach);
  const m = p.length();
  if (m < 1e-8) return;
  p.divideScalar(m);

  const down = Math.max(0.08, -p.y);
  const abduct = p.x * side;
  const forward = p.z;

  joint.straddle = THREE.MathUtils.clamp(
    MALE_ARM_STRADDLE_REST + Math.atan2(abduct, down) * DEG * 0.9,
    -15,
    55,
  );
  joint.raise = THREE.MathUtils.clamp(
    MALE_ARM_RAISE_REST + Math.atan2(forward, down) * DEG * 0.55,
    -55,
    75,
  );
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
  groundLift = 0,
): void {
  const grounded = settlePoseOnFloor(pose);
  const sk = grounded.skeleton;
  const hipMid = v3(sk.leftHip).add(v3(sk.rightHip)).multiplyScalar(0.5);
  const shoulderMid = v3(sk.leftShoulder)
    .add(v3(sk.rightShoulder))
    .multiplyScalar(0.5);

  man.body.turn = BODY_TURN_DEG;
  man.body.y = 0;
  man.torso.bend = THREE.MathUtils.clamp(
    (shoulderMid.z - hipMid.z) * 40,
    -15,
    25,
  );

  const noseDir = v3(sk.nose).sub(shoulderMid);
  man.head.nod = THREE.MathUtils.clamp(-noseDir.y * 80, -35, 25);
  man.head.turn = THREE.MathUtils.clamp(noseDir.x * 50, -40, 40);

  aimMannequinLeg(
    man.l_leg,
    v3(sk.leftKnee).sub(v3(sk.leftHip)),
    -1,
  );
  aimMannequinLeg(
    man.r_leg,
    v3(sk.rightKnee).sub(v3(sk.rightHip)),
    1,
  );

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
    DEG *
    0.4;
  man.r_ankle.turn =
    Math.atan2(
      grounded.rightFoot.toe.lat - grounded.rightFoot.heel.lat,
      grounded.rightFoot.toe.fwd - grounded.rightFoot.heel.fwd,
    ) *
    DEG *
    0.4;

  aimMannequinArm(
    man.l_arm,
    v3(sk.leftElbow).sub(v3(sk.leftShoulder)),
    -1,
  );
  aimMannequinArm(
    man.r_arm,
    v3(sk.rightElbow).sub(v3(sk.rightShoulder)),
    1,
  );

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

  man.position.x = hipMid.x * 0.85;
  man.position.z = hipMid.z * 0.85;

  man.stepOnGround();
  man.updateMatrixWorld(true);

  let rootY = man.position.y;
  if (groundLift !== 0) {
    rootY += groundLift;
  }

  const prevRootY = man.__coachRootY;
  if (prevRootY === undefined || Math.abs(rootY - prevRootY) > 0.4) {
    man.position.y = rootY;
  } else {
    man.position.y = prevRootY + (rootY - prevRootY) * ROOT_Y_SMOOTH;
  }
  man.__coachRootY = man.position.y;
  man.updateMatrixWorld(true);
}
