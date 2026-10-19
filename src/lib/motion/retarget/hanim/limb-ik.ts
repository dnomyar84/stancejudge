import type * as THREE from "three";
import { clampInteriorFlex } from "./joint-limits";

type LimbBind = {
  upper: THREE.Bone;
  lower: THREE.Bone;
  end: THREE.Bone;
  upperBindDir: THREE.Vector3;
  lowerBindDir: THREE.Vector3;
};

export function worldPointToParentLocal(
  THREE: typeof import("three"),
  parent: THREE.Object3D,
  world: THREE.Vector3,
): THREE.Vector3 {
  parent.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(parent.matrixWorld).invert();
  return world.clone().applyMatrix4(inv);
}

export function captureLimbBind(
  THREE: typeof import("three"),
  upper: THREE.Bone,
  lower: THREE.Bone,
  end: THREE.Bone,
): LimbBind {
  return {
    upper,
    lower,
    end,
    upperBindDir: lower.position.clone().normalize(),
    lowerBindDir: end.position.clone().normalize(),
  };
}

function setBoneLocalDirection(
  THREE: typeof import("three"),
  bone: THREE.Bone,
  bindDirLocal: THREE.Vector3,
  worldDir: THREE.Vector3,
): void {
  const parent = bone.parent;
  if (!parent) return;
  parent.updateMatrixWorld(true);
  const invParent = new THREE.Quaternion();
  parent.getWorldQuaternion(invParent).invert();
  const localDir = worldDir.clone().applyQuaternion(invParent).normalize();
  if (localDir.lengthSq() < 1e-8 || bindDirLocal.lengthSq() < 1e-8) return;
  const q = new THREE.Quaternion().setFromUnitVectors(
    bindDirLocal.clone().normalize(),
    localDir,
  );
  bone.quaternion.copy(q);
}

function interiorAngleDeg(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
): number {
  const ba = a.clone().sub(b);
  const bc = c.clone().sub(b);
  const m = ba.length() * bc.length();
  if (m < 1e-8) return 180;
  const cos = Math.max(-1, Math.min(1, ba.dot(bc) / m));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Aim upper→lower→end toward coach targets using actual bone joint world positions
 * (keeps skinned mesh connected).
 */
export function solveLimbToTargets(
  THREE: typeof import("three"),
  limb: LimbBind,
  mid: THREE.Vector3,
  end: THREE.Vector3,
  hingeKind: "knee" | "elbow",
): void {
  const upperWorld = new THREE.Vector3();
  const lowerWorld = new THREE.Vector3();

  limb.upper.updateMatrixWorld(true);
  limb.upper.getWorldPosition(upperWorld);
  const upperDir = mid.clone().sub(upperWorld);
  if (upperDir.lengthSq() < 1e-10) return;

  setBoneLocalDirection(THREE, limb.upper, limb.upperBindDir, upperDir);
  limb.upper.updateMatrixWorld(true);

  limb.lower.getWorldPosition(lowerWorld);
  const lowerDir = end.clone().sub(lowerWorld);
  if (lowerDir.lengthSq() < 1e-10) return;

  setBoneLocalDirection(THREE, limb.lower, limb.lowerBindDir, lowerDir);

  clampInteriorFlex(interiorAngleDeg(upperWorld, lowerWorld, end), hingeKind);
}
