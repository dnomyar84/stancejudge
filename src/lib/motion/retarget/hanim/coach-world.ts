import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import { settlePoseOnFloor } from "@/lib/pose/coach-figure/gravity";
import type { CoachSkeleton } from "@/lib/pose/coach-figure/skeleton";
import type { Vec3 } from "@/lib/pose/coach-figure/vec3";
import { lerp3 } from "@/lib/pose/coach-figure/vec3";
import type * as THREE from "three";

/** Coach skeleton height (nose up) ≈ 0.92 → Xbot ~1.75 m in scene. */
export const COACH_SCENE_SCALE = 1.88;

export function coachToWorld(
  THREE: typeof import("three"),
  p: Vec3,
): THREE.Vector3 {
  const s = COACH_SCENE_SCALE;
  return new THREE.Vector3(p.lat * s, p.up * s, p.fwd * s);
}

export function midVec3(
  THREE: typeof import("three"),
  a: Vec3,
  b: Vec3,
): THREE.Vector3 {
  return coachToWorld(THREE, lerp3(a, b, 0.5));
}

export type CoachWorldTargets = {
  grounded: ExtendedCoachPose;
  sk: CoachSkeleton;
  hipMid: THREE.Vector3;
  leftHip: THREE.Vector3;
  rightHip: THREE.Vector3;
  leftKnee: THREE.Vector3;
  rightKnee: THREE.Vector3;
  leftAnkle: THREE.Vector3;
  rightAnkle: THREE.Vector3;
  leftShoulder: THREE.Vector3;
  rightShoulder: THREE.Vector3;
  leftElbow: THREE.Vector3;
  rightElbow: THREE.Vector3;
  leftWrist: THREE.Vector3;
  rightWrist: THREE.Vector3;
};

export function coachWorldTargets(
  THREE: typeof import("three"),
  pose: ExtendedCoachPose,
): CoachWorldTargets {
  const grounded = settlePoseOnFloor(pose);
  const sk = grounded.skeleton;
  return {
    grounded,
    sk,
    hipMid: midVec3(THREE, sk.leftHip, sk.rightHip),
    leftHip: coachToWorld(THREE, sk.leftHip),
    rightHip: coachToWorld(THREE, sk.rightHip),
    leftKnee: coachToWorld(THREE, sk.leftKnee),
    rightKnee: coachToWorld(THREE, sk.rightKnee),
    leftAnkle: coachToWorld(THREE, sk.leftAnkle),
    rightAnkle: coachToWorld(THREE, sk.rightAnkle),
    leftShoulder: coachToWorld(THREE, sk.leftShoulder),
    rightShoulder: coachToWorld(THREE, sk.rightShoulder),
    leftElbow: coachToWorld(THREE, sk.leftElbow),
    rightElbow: coachToWorld(THREE, sk.rightElbow),
    leftWrist: coachToWorld(THREE, sk.leftWrist),
    rightWrist: coachToWorld(THREE, sk.rightWrist),
  };
}
