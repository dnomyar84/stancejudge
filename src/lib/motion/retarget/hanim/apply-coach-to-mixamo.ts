import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import { coachWorldTargets } from "./coach-world";
import {
  captureLimbBind,
  solveLimbToTargets,
  worldPointToParentLocal,
} from "./limb-ik";
import { indexMixamoBones, type MixamoBoneMap } from "./mixamo-bones";
import type * as THREE from "three";

export type MixamoAvatar = {
  root: THREE.Group;
  mesh: THREE.SkinnedMesh;
  bones: MixamoBoneMap;
  leftLeg: ReturnType<typeof captureLimbBind>;
  rightLeg: ReturnType<typeof captureLimbBind>;
  leftArm: ReturnType<typeof captureLimbBind>;
  rightArm: ReturnType<typeof captureLimbBind>;
  bindHipsY: number;
};

export function prepareMixamoAvatar(
  THREE: typeof import("three"),
  scene: THREE.Group,
): MixamoAvatar {
  let skinned: THREE.SkinnedMesh | undefined;
  scene.traverse((obj) => {
    const o = obj as THREE.SkinnedMesh;
    if (o.isSkinnedMesh && !skinned) skinned = o;
  });
  if (!skinned) throw new Error("No SkinnedMesh in avatar glTF");
  const mesh = skinned;

  mesh.frustumCulled = false;
  const bones = indexMixamoBones(mesh.skeleton);
  mesh.skeleton.pose();

  const leftLeg = captureLimbBind(
    THREE,
    bones.leftUpLeg,
    bones.leftLeg,
    bones.leftFoot,
  );
  const rightLeg = captureLimbBind(
    THREE,
    bones.rightUpLeg,
    bones.rightLeg,
    bones.rightFoot,
  );
  const leftArm = captureLimbBind(
    THREE,
    bones.leftArm,
    bones.leftForeArm,
    bones.leftHand,
  );
  const rightArm = captureLimbBind(
    THREE,
    bones.rightArm,
    bones.rightForeArm,
    bones.rightHand,
  );

  const bindHipsY = bones.hips.position.y;

  return {
    root: scene,
    mesh,
    bones,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    bindHipsY,
  };
}

function aimBoneWorldDirection(
  THREE: typeof import("three"),
  bone: THREE.Bone,
  bindDirLocal: THREE.Vector3,
  fromWorld: THREE.Vector3,
  toWorld: THREE.Vector3,
): void {
  const dir = toWorld.clone().sub(fromWorld);
  if (dir.lengthSq() < 1e-10) return;
  const parent = bone.parent;
  if (!parent) return;
  parent.updateMatrixWorld(true);
  const invParent = new THREE.Quaternion();
  parent.getWorldQuaternion(invParent).invert();
  const localDir = dir.normalize().applyQuaternion(invParent);
  if (bindDirLocal.lengthSq() < 1e-8) return;
  const q = new THREE.Quaternion().setFromUnitVectors(
    bindDirLocal.clone().normalize(),
    localDir,
  );
  bone.quaternion.copy(q);
}

export function applyCoachPoseToMixamo(
  THREE: typeof import("three"),
  avatar: MixamoAvatar,
  pose: ExtendedCoachPose,
): void {
  const t = coachWorldTargets(THREE, pose);
  const { bones, mesh } = avatar;

  avatar.root.position.set(0, 0, 0);
  mesh.skeleton.pose();

  const hipsParent = bones.hips.parent;
  if (hipsParent) {
    bones.hips.position.copy(
      worldPointToParentLocal(THREE, hipsParent, t.hipMid),
    );
  } else {
    bones.hips.position.copy(t.hipMid);
  }

  solveLimbToTargets(
    THREE,
    avatar.leftLeg,
    t.leftHip,
    t.leftKnee,
    t.leftAnkle,
    "knee",
  );
  solveLimbToTargets(
    THREE,
    avatar.rightLeg,
    t.rightHip,
    t.rightKnee,
    t.rightAnkle,
    "knee",
  );
  solveLimbToTargets(
    THREE,
    avatar.leftArm,
    t.leftShoulder,
    t.leftElbow,
    t.leftWrist,
    "elbow",
  );
  solveLimbToTargets(
    THREE,
    avatar.rightArm,
    t.rightShoulder,
    t.rightElbow,
    t.rightWrist,
    "elbow",
  );

  bones.hips.updateMatrixWorld(true);
  const hipsWorld = new THREE.Vector3();
  bones.hips.getWorldPosition(hipsWorld);
  aimBoneWorldDirection(
    THREE,
    bones.spine,
    new THREE.Vector3(0, 1, 0),
    hipsWorld,
    t.chest,
  );
  bones.spine.updateMatrixWorld(true);
  const spine1World = new THREE.Vector3();
  bones.spine1.getWorldPosition(spine1World);
  aimBoneWorldDirection(
    THREE,
    bones.spine1,
    new THREE.Vector3(0, 1, 0),
    spine1World,
    t.chest,
  );
  bones.spine1.updateMatrixWorld(true);
  const neckBase = new THREE.Vector3();
  bones.spine2.getWorldPosition(neckBase);
  aimBoneWorldDirection(
    THREE,
    bones.neck,
    new THREE.Vector3(0, 1, 0),
    neckBase,
    t.nose,
  );

  mesh.skeleton.update();
  avatar.root.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(avatar.root);
  const floorDelta = -box.min.y;
  if (Math.abs(floorDelta) > 1e-5) {
    avatar.root.position.y += floorDelta;
  }
  mesh.skeleton.update();
  avatar.root.updateMatrixWorld(true);
}
