import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import { coachWorldTargets } from "@/lib/motion/retarget/hanim/coach-world";
import type * as THREE from "three";

const JOINT_RADIUS = 0.035;
const BONE_RADIUS = 0.018;

type Limb = [keyof ReturnType<typeof coachWorldTargets>, keyof ReturnType<typeof coachWorldTargets>];

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

export type CoachSceneOverlay = THREE.Group;

export function createCoachSceneOverlay(
  THREE: typeof import("three"),
): CoachSceneOverlay {
  const group = new THREE.Group();
  group.name = "coach-scene-overlay";
  return group;
}

export function updateCoachSceneOverlay(
  THREE: typeof import("three"),
  group: CoachSceneOverlay,
  pose: ExtendedCoachPose | null,
): void {
  group.clear();
  if (!pose) return;

  const t = coachWorldTargets(THREE, pose);
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

  const jointMesh = (pos: THREE.Vector3) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(JOINT_RADIUS, 10, 10),
      jointMat,
    );
    m.position.copy(pos);
    return m;
  };

  const keys = new Set<string>();
  for (const [a, b] of LIMBS) {
    keys.add(a);
    keys.add(b);
  }
  for (const key of keys) {
    const p = t[key as keyof typeof t];
    if (p instanceof THREE.Vector3) group.add(jointMesh(p));
  }

  for (const [a, b] of LIMBS) {
    const p0 = t[a as keyof typeof t] as THREE.Vector3;
    const p1 = t[b as keyof typeof t] as THREE.Vector3;
    const dir = p1.clone().sub(p0);
    const len = dir.length();
    if (len < 1e-4) continue;
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(BONE_RADIUS, BONE_RADIUS, len, 8),
      boneMat,
    );
    cyl.position.copy(p0.clone().add(p1).multiplyScalar(0.5));
    cyl.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    group.add(cyl);
  }
}
