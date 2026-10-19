import type * as THREE from "three";
import type { ExtendedCoachPose } from "./extended-pose";
import { settlePoseOnFloor } from "./gravity";
import {
  coachMeshFromExtendedPose,
  type CoachMeshSpec,
  type Vec3Display,
} from "./mesh-from-skeleton";

const SKIN = 0xb8d4e8;
const TORSO = 0x9ec5dc;
const HAND = 0xc9e4f5;
const FOOT = 0x6a7f8c;

function v3(THREE: typeof import("three"), p: Vec3Display): THREE.Vector3 {
  return new THREE.Vector3(p.x, p.y, p.z);
}

function addCylinderBone(
  group: THREE.Group,
  from: Vec3Display,
  to: Vec3Display,
  radius: number,
  material: THREE.MeshStandardMaterial,
  THREE: typeof import("three"),
): void {
  const a = v3(THREE, from);
  const b = v3(THREE, to);
  const dir = b.clone().sub(a);
  const len = dir.length();
  if (len < 1e-5) return;
  const geom = new THREE.CylinderGeometry(radius, radius, len, 10);
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.normalize(),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  group.add(mesh);
}

function addSphere(
  group: THREE.Group,
  center: Vec3Display,
  radius: number,
  material: THREE.MeshStandardMaterial,
  THREE: typeof import("three"),
): void {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 12),
    material,
  );
  mesh.position.copy(v3(THREE, center));
  mesh.castShadow = true;
  group.add(mesh);
}

function addFoot(
  group: THREE.Group,
  foot: CoachMeshSpec["leftFoot"],
  material: THREE.MeshStandardMaterial,
  THREE: typeof import("three"),
): void {
  addCylinderBone(group, foot.heel, foot.toe, 0.028, material, THREE);
  addSphere(group, foot.ankle, 0.022, material, THREE);
}

function addHand(
  group: THREE.Group,
  hand: CoachMeshSpec["leftHand"],
  material: THREE.MeshStandardMaterial,
  THREE: typeof import("three"),
): void {
  addCylinderBone(group, hand.wrist, hand.knuckle, hand.radius, material, THREE);
  addSphere(group, hand.palm, hand.radius * 0.85, material, THREE);
}

function addTorso(
  group: THREE.Group,
  spec: CoachMeshSpec,
  material: THREE.MeshStandardMaterial,
  THREE: typeof import("three"),
): void {
  const pts = spec.torsoCorners.map((p) => v3(THREE, p));
  const box = new THREE.Box3().setFromPoints(pts);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size.x, size.y, size.z),
    material,
  );
  mesh.position.copy(center);
  mesh.castShadow = true;
  group.add(mesh);
}

export function disposeCoachMeshGroup(group: THREE.Group): void {
  for (const child of [...group.children]) {
    group.remove(child);
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    }
  }
}

/** Build a Three.js figure that matches authored coach skeleton (lat/up/fwd → XYZ). */
export function buildCoachMeshFigure(
  pose: ExtendedCoachPose,
  THREE: typeof import("three"),
): THREE.Group {
  const grounded = settlePoseOnFloor(pose);
  const spec = coachMeshFromExtendedPose(grounded);
  const root = new THREE.Group();
  root.name = "CoachFigure";

  const limbMat = new THREE.MeshStandardMaterial({
    color: SKIN,
    roughness: 0.62,
    metalness: 0.05,
  });
  const torsoMat = new THREE.MeshStandardMaterial({
    color: TORSO,
    roughness: 0.7,
    metalness: 0.02,
  });
  const handMat = new THREE.MeshStandardMaterial({
    color: HAND,
    roughness: 0.55,
  });
  const footMat = new THREE.MeshStandardMaterial({
    color: FOOT,
    roughness: 0.85,
  });

  for (const bone of spec.bones) {
    addCylinderBone(root, bone.from, bone.to, bone.radius, limbMat, THREE);
  }
  addCylinderBone(
    root,
    spec.neckFrom,
    spec.neckTo,
    spec.neckRadius,
    limbMat,
    THREE,
  );
  addTorso(root, spec, torsoMat, THREE);
  addSphere(root, spec.headCenter, spec.headRadius, limbMat, THREE);
  addHand(root, spec.leftHand, handMat, THREE);
  addHand(root, spec.rightHand, handMat, THREE);
  addFoot(root, spec.leftFoot, footMat, THREE);
  addFoot(root, spec.rightFoot, footMat, THREE);

  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;

  return root;
}
