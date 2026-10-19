import type { ExtendedCoachPose } from "../coach-figure/extended-pose";
import { coachWorldTargets } from "./coach-world";
import { captureLimbBind, solveLimbToTargets } from "./limb-ik";
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

export function applyCoachPoseToMixamo(
  THREE: typeof import("three"),
  avatar: MixamoAvatar,
  pose: ExtendedCoachPose,
): void {
  const t = coachWorldTargets(THREE, pose);
  const { bones, mesh } = avatar;

  mesh.skeleton.pose();

  const hipMid = t.hipMid.clone();
  bones.hips.position.copy(hipMid);

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

  mesh.skeleton.update();

  avatar.root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(avatar.root);
  const floorDelta = -box.min.y;
  if (Math.abs(floorDelta) > 1e-5) {
    bones.hips.position.y += floorDelta;
  }
  mesh.skeleton.update();
  avatar.root.updateMatrixWorld(true);
}
