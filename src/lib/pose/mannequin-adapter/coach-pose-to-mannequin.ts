import {
  applyCoachFigurinePoseToMannequin,
  type MannequinFigurineTarget,
} from "../display-figurine/apply-coach-figurine-pose";
import type { CoachFigurinePoseV1 } from "../display-figurine/coach-figurine-pose";
import {
  COACH_FIGURINE_DRIVER_MANNEQUIN_MALE,
  COACH_FIGURINE_POSE_SCHEMA,
} from "../display-figurine/coach-figurine-pose";
import { settlePoseOnFloor } from "../coach-figure/gravity";
import type { ExtendedCoachPose } from "../coach-figure/extended-pose";
import type { Vec3 } from "../coach-figure/vec3";
import * as THREE from "three";

const DEG = 180 / Math.PI;
/** Male() resting leg straddle offset in mannequin-js. */
const MALE_LEG_STRADDLE_REST = 6;
const MALE_ARM_STRADDLE_REST = 7;
const MALE_ARM_RAISE_REST = -5;
const BODY_TURN_DEG = -90;

function v3(p: Vec3): THREE.Vector3 {
  return new THREE.Vector3(p.lat, p.up, p.fwd);
}

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

function solveLeg(
  dirCoach: THREE.Vector3,
  side: 1 | -1,
): { raise: number; straddle: number; turn: number } {
  const joint = { raise: 0, straddle: 0, turn: 0 };
  const p = coachDirToPelvis(dirCoach);
  const m = p.length();
  if (m < 1e-8) return joint;
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
  return joint;
}

function solveArm(
  dirCoach: THREE.Vector3,
  side: 1 | -1,
): { raise: number; straddle: number; turn: number } {
  const joint = { raise: 0, straddle: 0, turn: 0 };
  const p = coachDirToPelvis(dirCoach);
  const m = p.length();
  if (m < 1e-8) return joint;
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
  return joint;
}

function handFingersAndWrist(
  shape: ExtendedCoachPose["leftHand"]["shape"],
): { fingers: number; wristBend: number } {
  const curl = shape === "zhang" || shape === "tui_zhang" ? 5 : 35;
  const wristBend = shape === "bao_quan" || shape === "quan" ? 10 : 0;
  return { fingers: curl, wristBend };
}

/**
 * Legacy compile: semantic skeleton → figurine DOFs (heuristic).
 * Prefer authoring `CoachFigurinePoseV1` directly in keyframes for display truth.
 */
export function extendedToCoachFigurinePose(
  pose: ExtendedCoachPose,
): CoachFigurinePoseV1 {
  const grounded = settlePoseOnFloor(pose);
  const sk = grounded.skeleton;
  const hipMid = v3(sk.leftHip).add(v3(sk.rightHip)).multiplyScalar(0.5);
  const shoulderMid = v3(sk.leftShoulder)
    .add(v3(sk.rightShoulder))
    .multiplyScalar(0.5);

  const noseDir = v3(sk.nose).sub(shoulderMid);
  const lShank = v3(sk.leftAnkle).sub(v3(sk.leftKnee));
  const rShank = v3(sk.rightAnkle).sub(v3(sk.rightKnee));
  const lFore = v3(sk.leftWrist).sub(v3(sk.leftElbow));
  const rFore = v3(sk.rightWrist).sub(v3(sk.rightElbow));
  const lHand = handFingersAndWrist(grounded.leftHand.shape);
  const rHand = handFingersAndWrist(grounded.rightHand.shape);

  return {
    schema: COACH_FIGURINE_POSE_SCHEMA,
    driver: COACH_FIGURINE_DRIVER_MANNEQUIN_MALE,
    root: {
      x: hipMid.x * 0.85,
      y: 0,
      z: hipMid.z * 0.85,
    },
    body: { tilt: 0, turn: BODY_TURN_DEG, bend: 0 },
    torso: {
      tilt: 0,
      turn: 0,
      bend: THREE.MathUtils.clamp((shoulderMid.z - hipMid.z) * 40, -15, 25),
    },
    head: {
      tilt: 0,
      turn: THREE.MathUtils.clamp(noseDir.x * 50, -40, 40),
      nod: THREE.MathUtils.clamp(-noseDir.y * 80, -35, 25),
    },
    leftLeg: solveLeg(v3(sk.leftKnee).sub(v3(sk.leftHip)), -1),
    leftKnee: {
      bend: THREE.MathUtils.clamp(
        180 - interiorAngleDeg(sk.leftHip, sk.leftKnee, sk.leftAnkle),
        0,
        150,
      ),
    },
    leftAnkle: {
      tilt: 0,
      bend: THREE.MathUtils.clamp(-lShank.y * 30, -25, 35),
      turn:
        Math.atan2(
          grounded.leftFoot.toe.lat - grounded.leftFoot.heel.lat,
          grounded.leftFoot.toe.fwd - grounded.leftFoot.heel.fwd,
        ) *
        DEG *
        0.4,
    },
    rightLeg: solveLeg(v3(sk.rightKnee).sub(v3(sk.rightHip)), 1),
    rightKnee: {
      bend: THREE.MathUtils.clamp(
        180 - interiorAngleDeg(sk.rightHip, sk.rightKnee, sk.rightAnkle),
        0,
        150,
      ),
    },
    rightAnkle: {
      tilt: 0,
      bend: THREE.MathUtils.clamp(-rShank.y * 30, -25, 35),
      turn:
        Math.atan2(
          grounded.rightFoot.toe.lat - grounded.rightFoot.heel.lat,
          grounded.rightFoot.toe.fwd - grounded.rightFoot.heel.fwd,
        ) *
        DEG *
        0.4,
    },
    leftArm: solveArm(v3(sk.leftElbow).sub(v3(sk.leftShoulder)), -1),
    leftElbow: {
      bend: THREE.MathUtils.clamp(
        180 - interiorAngleDeg(sk.leftShoulder, sk.leftElbow, sk.leftWrist),
        5,
        150,
      ),
    },
    leftWrist: {
      tilt: 0,
      turn: 0,
      bend:
        lHand.wristBend > 0
          ? lHand.wristBend
          : THREE.MathUtils.clamp(lFore.y * 25, -30, 40),
    },
    leftFingers: { bend: lHand.fingers },
    rightArm: solveArm(v3(sk.rightElbow).sub(v3(sk.rightShoulder)), 1),
    rightElbow: {
      bend: THREE.MathUtils.clamp(
        180 - interiorAngleDeg(sk.rightShoulder, sk.rightElbow, sk.rightWrist),
        5,
        150,
      ),
    },
    rightWrist: {
      tilt: 0,
      turn: 0,
      bend:
        rHand.wristBend > 0
          ? rHand.wristBend
          : THREE.MathUtils.clamp(rFore.y * 25, -30, 40),
    },
    rightFingers: { bend: rHand.fingers },
  };
}

/** @deprecated Prefer `figurine` on keyframes + `applyCoachFigurinePoseToMannequin`. */
export function applyCoachPoseToMannequin(
  man: MannequinFigurineTarget,
  pose: ExtendedCoachPose,
  groundLift = 0,
): void {
  const figurine = extendedToCoachFigurinePose(pose);
  applyCoachFigurinePoseToMannequin(man, figurine, { groundLift });
}
