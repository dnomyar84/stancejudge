import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import { coachWorldTargets } from "@/lib/motion/retarget/hanim/coach-world";
import type * as THREE from "three";

const JOINT_RADIUS = 0.035;
const BONE_RADIUS = 0.018;

type Limb = [
  keyof ReturnType<typeof coachWorldTargets>,
  keyof ReturnType<typeof coachWorldTargets>,
];

const LIMBS: Limb[] = [
  ["leftShoulder", "leftElbow"],
  ["leftElbow", "leftWrist"],
  ["rightShoulder", "rightElbow"],
  ["rightElbow", "rightWrist"],
  ["leftHip", "leftKnee"],
  ["leftKnee", "leftAnkle"],
  ["rightHip", "rightKnee"],
  ["rightKnee", "rightAnkle"],
  ["leftShoulder", "rightShoulder"],
  ["leftHip", "rightHip"],
  ["hipMid", "chest"],
  ["chest", "nose"],
];

const JOINT_KEYS = [
  ...new Set(LIMBS.flatMap(([a, b]) => [a, b])),
] as (keyof ReturnType<typeof coachWorldTargets>)[];

export type CoachSceneOverlay = {
  root: THREE.Group;
  joints: Map<string, THREE.Mesh>;
  bones: THREE.Mesh[];
  dispose: () => void;
};

export function createCoachSceneOverlay(
  THREE: typeof import("three"),
): CoachSceneOverlay {
  const root = new THREE.Group();
  root.name = "coach-scene-overlay";

  const jointGeo = new THREE.SphereGeometry(JOINT_RADIUS, 10, 10);
  const boneGeo = new THREE.CylinderGeometry(BONE_RADIUS, BONE_RADIUS, 1, 8);
  boneGeo.translate(0, 0.5, 0);

  const jointMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x0a3040,
    emissiveIntensity: 0.6,
    roughness: 0.4,
  });
  const boneMat = new THREE.MeshStandardMaterial({
    color: 0x8ecae0,
    emissive: 0x102030,
    emissiveIntensity: 0.4,
    roughness: 0.5,
  });

  const joints = new Map<string, THREE.Mesh>();
  for (const key of JOINT_KEYS) {
    const mesh = new THREE.Mesh(jointGeo, jointMat);
    root.add(mesh);
    joints.set(key, mesh);
  }

  const bones: THREE.Mesh[] = [];
  for (let i = 0; i < LIMBS.length; i++) {
    const mesh = new THREE.Mesh(boneGeo, boneMat);
    root.add(mesh);
    bones.push(mesh);
  }

  return {
    root,
    joints,
    bones,
    dispose: () => {
      jointGeo.dispose();
      boneGeo.dispose();
      jointMat.dispose();
      boneMat.dispose();
    },
  };
}

export function updateCoachSceneOverlay(
  THREE: typeof import("three"),
  overlay: CoachSceneOverlay,
  pose: ExtendedCoachPose | null,
): void {
  if (!pose) {
    overlay.root.visible = false;
    return;
  }
  overlay.root.visible = true;

  const t = coachWorldTargets(THREE, pose);
  const up = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3();

  for (const key of JOINT_KEYS) {
    const mesh = overlay.joints.get(key);
    const p = t[key];
    if (mesh && p instanceof THREE.Vector3) {
      mesh.position.copy(p);
      mesh.visible = true;
    }
  }

  for (let i = 0; i < LIMBS.length; i++) {
    const [a, b] = LIMBS[i];
    const mesh = overlay.bones[i];
    const p0 = t[a] as THREE.Vector3;
    const p1 = t[b] as THREE.Vector3;
    dir.subVectors(p1, p0);
    const len = dir.length();
    if (len < 1e-4) {
      mesh.visible = false;
      continue;
    }
    mesh.visible = true;
    mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
    mesh.scale.set(1, len, 1);
    mesh.quaternion.setFromUnitVectors(up, dir.normalize());
  }
}
