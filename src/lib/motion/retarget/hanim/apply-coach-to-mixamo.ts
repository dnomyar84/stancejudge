import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import { coachWorldTargets } from "./coach-world";
import { captureLimbBind, solveLimbToTargets } from "./limb-ik";
import { indexMixamoBones, type MixamoBoneMap } from "./mixamo-bones";
import { DoubleSide, type MeshStandardMaterial } from "three";
import type * as THREE from "three";

/** Measured bind height of `public/models/xbot.glb` (meters in glTF units). */
export const MIXAMO_BIND_HEIGHT_M = 0.01806;
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
      const standard = mat as MeshStandardMaterial;
      if (standard.color) {
        standard.color.setHex(0xb8c8d8);
      }
      standard.emissive?.setHex(0x1a2838);
      standard.emissiveIntensity = 0.55;
      standard.metalness = 0.05;
      standard.roughness = 0.55;
      standard.side = DoubleSide;
    }
  });
}

/** SkinnedMesh bind boxes are often wrong; use measured fallback when tiny. */
export function mixamoSceneScaleFactor(measuredHeightM: number): number {
  const h =
    measuredHeightM > 0.05 ? measuredHeightM : MIXAMO_BIND_HEIGHT_M;
  return MIXAMO_TARGET_HEIGHT_M / h;
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
  const sceneScale = mixamoSceneScaleFactor(bindSize.y);
  scene.scale.setScalar(sceneScale);
  scene.rotation.y = Math.PI;
  scene.updateMatrixWorld(true);

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

export function frameAvatarInView(
  THREE: typeof import("three"),
  root: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3; update: () => void },
): void {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.y, size.z, 0.5);
  controls.target.copy(center);
  camera.position.set(
    center.x,
    center.y + span * 0.15,
    center.z + span * 1.45,
  );
  camera.near = Math.max(0.02, span / 80);
  camera.far = Math.max(50, span * 25);
  camera.updateProjectionMatrix();
  controls.update();
}

function settleAvatarOnFloor(
  THREE: typeof import("three"),
  avatar: MixamoAvatar,
): void {
  avatar.root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(avatar.root);
  if (!box.isEmpty()) {
    avatar.root.position.y = -box.min.y;
  }
  avatar.mesh.skeleton.update();
  avatar.root.updateMatrixWorld(true);
}

/** Bind pose only — guaranteed visible while limb IK is tuned. */
export function applyBindPose(
  THREE: typeof import("three"),
  avatar: MixamoAvatar,
): void {
  avatar.root.position.set(0, 0, 0);
  avatar.mesh.skeleton.pose();
  avatar.mesh.skeleton.update();
  settleAvatarOnFloor(THREE, avatar);
}

/** Light spine / head aim from coach chest & nose (compile-time retarget). */
function applyTorsoAndHeadAim(
  THREE: typeof import("three"),
  bones: MixamoBoneMap,
  t: import("./coach-world").CoachWorldTargets,
): void {
  const lean = (t.chest.z - t.hipMid.z) * 1.4;
  const pitch = THREE.MathUtils.clamp(lean, -0.45, 0.35);
  bones.spine.rotation.x = pitch * 0.35;
  bones.spine1.rotation.x = pitch * 0.45;
  bones.spine2.rotation.x = pitch * 0.55;

  const neckBase = t.chest.clone();
  const look = t.nose.clone().sub(neckBase);
  if (look.lengthSq() < 1e-6) return;
  look.normalize();
  bones.neck.rotation.y = THREE.MathUtils.clamp(look.x * 0.9, -0.5, 0.5);
  bones.neck.rotation.x = THREE.MathUtils.clamp(-look.y * 0.7, -0.35, 0.35);
  bones.head.rotation.x = THREE.MathUtils.clamp(-look.y * 0.35, -0.25, 0.2);
  bones.head.rotation.y = THREE.MathUtils.clamp(look.x * 0.4, -0.35, 0.35);
}

function alignPelvisToCoach(
  THREE: typeof import("three"),
  avatar: MixamoAvatar,
  hipMidWorld: THREE.Vector3,
): void {
  const hipsWorld = new THREE.Vector3();
  avatar.bones.hips.updateMatrixWorld(true);
  avatar.bones.hips.getWorldPosition(hipsWorld);
  const shift = hipMidWorld.clone().sub(hipsWorld);
  avatar.root.position.add(shift);
  avatar.root.updateMatrixWorld(true);
}

export function applyCoachPoseToMixamo(
  THREE: typeof import("three"),
  avatar: MixamoAvatar,
  pose: ExtendedCoachPose,
): void {
  applyBindPose(THREE, avatar);

  const t = coachWorldTargets(THREE, pose);
  const { mesh } = avatar;

  solveLimbToTargets(THREE, avatar.leftLeg, t.leftKnee, t.leftAnkle, "knee");
  solveLimbToTargets(THREE, avatar.rightLeg, t.rightKnee, t.rightAnkle, "knee");
  solveLimbToTargets(THREE, avatar.leftArm, t.leftElbow, t.leftWrist, "elbow");
  solveLimbToTargets(
    THREE,
    avatar.rightArm,
    t.rightElbow,
    t.rightWrist,
    "elbow",
  );

  applyTorsoAndHeadAim(THREE, avatar.bones, t);

  mesh.skeleton.update();
  avatar.root.updateMatrixWorld(true);
  alignPelvisToCoach(THREE, avatar, t.hipMid);
  mesh.skeleton.update();
  settleAvatarOnFloor(THREE, avatar);
}
