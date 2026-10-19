import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import { coachWorldTargets } from "./coach-world";
import {
  captureLimbBind,
  solveLimbToTargets,
  worldPointToParentLocal,
} from "./limb-ik";
import { indexMixamoBones, type MixamoBoneMap } from "./mixamo-bones";
import type * as THREE from "three";

/** glTF bind height for Mixamo Xbot in this repo (~0.018 m). */
export const MIXAMO_TARGET_HEIGHT_M = 1.75;

export type MixamoAvatar = {
  root: THREE.Group;
  mesh: THREE.SkinnedMesh;
  bones: MixamoBoneMap;
  leftLeg: ReturnType<typeof captureLimbBind>;
  rightLeg: ReturnType<typeof captureLimbBind>;
  leftArm: ReturnType<typeof captureLimbBind>;
  rightArm: ReturnType<typeof captureLimbBind>;
  bindHipsY: number;
  sceneScale: number;
};

function brightenAvatarMaterials(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const standard = mat as THREE.MeshStandardMaterial;
      if (standard.color) {
        standard.color.offsetHSL(0, 0, 0.08);
      }
      standard.metalness = Math.min(standard.metalness ?? 0, 0.15);
      standard.roughness = Math.max(standard.roughness ?? 0.5, 0.45);
    }
  });
}

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
  brightenAvatarMaterials(scene);
  scene.updateMatrixWorld(true);
  const bindBox = new THREE.Box3().setFromObject(scene);
  const bindSize = bindBox.getSize(new THREE.Vector3());
  const bindHeight = bindSize.y;
  let sceneScale = 1;
  if (bindHeight > 1e-6) {
    sceneScale = MIXAMO_TARGET_HEIGHT_M / bindHeight;
    scene.scale.setScalar(sceneScale);
    scene.updateMatrixWorld(true);
  }

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
    sceneScale,
  };
}

/** Fit camera to the retargeted figure (world space). */
export function frameAvatarInView(
  THREE: typeof import("three"),
  root: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3; update: () => void },
): void {
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.y, size.z, 0.5);
  controls.target.copy(center);
  camera.position.set(
    center.x,
    center.y + span * 0.12,
    center.z + span * 1.55,
  );
  camera.near = Math.max(0.02, span / 50);
  camera.far = Math.max(50, span * 20);
  camera.updateProjectionMatrix();
  controls.update();
}

export function applyCoachPoseToMixamo(
  THREE: typeof import("three"),
  avatar: MixamoAvatar,
  pose: ExtendedCoachPose,
): void {
  const t = coachWorldTargets(THREE, pose);
  const { bones, mesh } = avatar;

  avatar.root.position.set(0, 0, 0);
  avatar.root.rotation.y = Math.PI;
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

  mesh.skeleton.update();
  avatar.root.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(avatar.root);
  if (!box.isEmpty()) {
    const floorDelta = -box.min.y;
    if (Math.abs(floorDelta) > 1e-5) {
      avatar.root.position.y += floorDelta;
    }
  }
  mesh.skeleton.update();
  avatar.root.updateMatrixWorld(true);
}
