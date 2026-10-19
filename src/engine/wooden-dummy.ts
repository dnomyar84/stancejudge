import * as THREE from "three";
import {
  JOINT_CATALOG,
  NEUTRAL_STANCE_DEG,
  type JointId,
  type JointCatalogEntry,
} from "./joint-catalog";
import type { JointPoseStmt, PoseProgram } from "./pose-grammar";

export type JointAnglesDeg = {
  flex: number;
  abduct: number;
  twist: number;
};

export type WoodenDummy = {
  root: THREE.Group;
  bones: Record<JointId, THREE.Bone>;
  skeleton: THREE.Skeleton;
  skinnedMeshes: THREE.SkinnedMesh[];
  angles: Record<JointId, JointAnglesDeg>;
  restRotations: Map<THREE.Bone, THREE.Euler>;
};

const DEG = Math.PI / 180;

const WOOD = new THREE.MeshStandardMaterial({
  color: 0xd4b483,
  roughness: 0.68,
  metalness: 0.04,
});
const WOOD_DARK = new THREE.MeshStandardMaterial({
  color: 0xa67c52,
  roughness: 0.72,
  metalness: 0.05,
});
const JOINT_MAT = new THREE.MeshStandardMaterial({
  color: 0x5c3d1e,
  roughness: 0.55,
  metalness: 0.12,
});

function makeBone(id: JointId, x = 0, y = 0, z = 0): THREE.Bone {
  const b = new THREE.Bone();
  b.name = id;
  b.position.set(x, y, z);
  return b;
}

const _yUp = new THREE.Vector3(0, 1, 0);

/** Cylinder skinned parent→child, aligned to child.position (not forced +Y). */
function skinnedSegment(
  skeleton: THREE.Skeleton,
  parentIndex: number,
  childIndex: number,
  parent: THREE.Bone,
  child: THREE.Bone,
  radiusProx: number,
  radiusDist: number,
  radial = 14,
): THREE.SkinnedMesh {
  const dir = child.position.clone();
  const len = dir.length();
  const dirN =
    len > 1e-6 ? dir.clone().multiplyScalar(1 / len) : new THREE.Vector3(0, 1, 0);
  const geom = new THREE.CylinderGeometry(radiusProx, radiusDist, len, radial, 3);
  geom.translate(0, len / 2, 0);

  const quat = new THREE.Quaternion().setFromUnitVectors(_yUp, dirN);
  geom.applyQuaternion(quat);
  geom.translate(dir.x * 0.5, dir.y * 0.5, dir.z * 0.5);

  const pos = geom.attributes.position as THREE.BufferAttribute;
  const skinIndex = new Uint16Array(pos.count * 4);
  const skinWeight = new Float32Array(pos.count * 4);

  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    const t = len > 1e-6 ? THREE.MathUtils.clamp(v.dot(dirN) / len, 0, 1) : 0;
    const wChild = t;
    const wParent = 1 - wChild;
    skinIndex[i * 4] = parentIndex;
    skinWeight[i * 4] = wParent;
    skinIndex[i * 4 + 1] = childIndex;
    skinWeight[i * 4 + 1] = wChild;
  }

  geom.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndex, 4));
  geom.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeight, 4));
  geom.computeVertexNormals();

  const mesh = new THREE.SkinnedMesh(geom, WOOD);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  mesh.bind(skeleton);
  parent.add(mesh);
  return mesh;
}

function jointBall(radius: number, parent: THREE.Bone, y = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), JOINT_MAT);
  m.position.y = y;
  m.castShadow = true;
  parent.add(m);
  return m;
}

function rigidBox(
  parent: THREE.Bone,
  sx: number,
  sy: number,
  sz: number,
  mat: THREE.Material,
  oy = 0,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.y = oy;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function createWoodenDummy(): WoodenDummy {
  const rootGroup = new THREE.Group();
  rootGroup.name = "wooden-dummy";

  const bones = {} as Record<JointId, THREE.Bone>;
  const mk = (id: JointId, x = 0, y = 0, z = 0) => {
    const b = makeBone(id, x, y, z);
    bones[id] = b;
    return b;
  };

  // ~1.72 m, Y-up, faces +Z
  const root = mk("root");
  const hips = mk("hips", 0, 0.94, 0);
  const spine = mk("spine", 0, 0.2, 0);
  const chest = mk("chest", 0, 0.24, 0);
  const neck = mk("neck", 0, 0.16, 0);
  const head = mk("head", 0, 0.12, 0);

  const shoulderW = 0.2;
  const lShoulder = mk("l_shoulder", -shoulderW, 0.06, 0);
  const lUpper = mk("l_upper_arm", 0, -0.3, 0);
  const lFore = mk("l_forearm", 0, -0.28, 0);
  const lHand = mk("l_hand", 0, -0.1, 0);

  const rShoulder = mk("r_shoulder", shoulderW, 0.06, 0);
  const rUpper = mk("r_upper_arm", 0, -0.3, 0);
  const rFore = mk("r_forearm", 0, -0.28, 0);
  const rHand = mk("r_hand", 0, -0.1, 0);

  const hipW = 0.11;
  const lHip = mk("l_hip", -hipW, 0, 0);
  const lThigh = mk("l_thigh", 0, -0.44, 0);
  const lShin = mk("l_shin", 0, -0.42, 0);
  const lFoot = mk("l_foot", 0, -0.05, 0.1);

  const rHip = mk("r_hip", hipW, 0, 0);
  const rThigh = mk("r_thigh", 0, -0.44, 0);
  const rShin = mk("r_shin", 0, -0.42, 0);
  const rFoot = mk("r_foot", 0, -0.05, 0.1);

  root.add(hips);
  hips.add(spine);
  spine.add(chest);
  chest.add(neck);
  neck.add(head);

  rigidBox(hips, 0.34, 0.16, 0.2, WOOD_DARK, -0.04);
  jointBall(0.07, chest, 0.02);
  jointBall(0.11, head, 0.06);
  rigidBox(head, 0.2, 0.22, 0.22, WOOD, 0.08);

  chest.add(lShoulder);
  lShoulder.add(lUpper);
  lUpper.add(lFore);
  lFore.add(lHand);
  jointBall(0.05, lShoulder);
  jointBall(0.042, lUpper, -0.3);
  rigidBox(lHand, 0.06, 0.1, 0.04, WOOD_DARK, -0.05);

  chest.add(rShoulder);
  rShoulder.add(rUpper);
  rUpper.add(rFore);
  rFore.add(rHand);
  jointBall(0.05, rShoulder);
  jointBall(0.042, rUpper, -0.3);
  rigidBox(rHand, 0.06, 0.1, 0.04, WOOD_DARK, -0.05);

  hips.add(lHip);
  lHip.add(lThigh);
  lThigh.add(lShin);
  lShin.add(lFoot);
  jointBall(0.055, lHip);
  jointBall(0.05, lThigh, -0.44);
  rigidBox(lFoot, 0.1, 0.05, 0.22, WOOD_DARK, -0.02);

  hips.add(rHip);
  rHip.add(rThigh);
  rThigh.add(rShin);
  rShin.add(rFoot);
  jointBall(0.055, rHip);
  jointBall(0.05, rThigh, -0.44);
  rigidBox(rFoot, 0.1, 0.05, 0.22, WOOD_DARK, -0.02);

  rootGroup.add(root);

  const boneList = Object.values(bones);
  const boneIndex = new Map<THREE.Bone, number>();
  boneList.forEach((b, i) => boneIndex.set(b, i));
  const skeleton = new THREE.Skeleton(boneList);

  const skinnedMeshes: THREE.SkinnedMesh[] = [];
  const seg = (
    a: JointId,
    b: JointId,
    r0: number,
    r1: number,
  ) => {
    const mesh = skinnedSegment(
      skeleton,
      boneIndex.get(bones[a])!,
      boneIndex.get(bones[b])!,
      bones[a],
      bones[b],
      r0,
      r1,
    );
    skinnedMeshes.push(mesh);
  };

  seg("hips", "spine", 0.12, 0.11);
  seg("spine", "chest", 0.13, 0.14);
  seg("chest", "neck", 0.08, 0.07);
  seg("neck", "head", 0.065, 0.075);
  seg("l_shoulder", "l_upper_arm", 0.06, 0.055);
  seg("l_upper_arm", "l_forearm", 0.052, 0.046);
  seg("l_forearm", "l_hand", 0.042, 0.036);
  seg("r_shoulder", "r_upper_arm", 0.06, 0.055);
  seg("r_upper_arm", "r_forearm", 0.052, 0.046);
  seg("r_forearm", "r_hand", 0.042, 0.036);
  seg("l_hip", "l_thigh", 0.072, 0.065);
  seg("l_thigh", "l_shin", 0.062, 0.055);
  seg("l_shin", "l_foot", 0.05, 0.044);
  seg("r_hip", "r_thigh", 0.072, 0.065);
  seg("r_thigh", "r_shin", 0.062, 0.055);
  seg("r_shin", "r_foot", 0.05, 0.044);

  const restRotations = new Map<THREE.Bone, THREE.Euler>();
  for (const b of boneList) {
    restRotations.set(b, b.rotation.clone());
  }

  const angles = {} as Record<JointId, JointAnglesDeg>;
  for (const id of Object.keys(JOINT_CATALOG) as JointId[]) {
    angles[id] = { flex: 0, abduct: 0, twist: 0 };
  }

  return {
    root: rootGroup,
    bones,
    skeleton,
    skinnedMeshes,
    angles,
    restRotations,
  };
}

function applyAnglesToBone(
  bone: THREE.Bone,
  entry: JointCatalogEntry,
  angles: JointAnglesDeg,
  rest: THREE.Euler,
): void {
  const euler = new THREE.Euler(rest.x, rest.y, rest.z, "XYZ");
  const add = (axis: 0 | 1 | 2, deg: number) => {
    if (axis === 0) euler.x += deg * DEG;
    else if (axis === 1) euler.y += deg * DEG;
    else euler.z += deg * DEG;
  };
  add(entry.flex, angles.flex);
  add(entry.abduct, angles.abduct);
  add(entry.twist, angles.twist);
  bone.rotation.copy(euler);
}

export function applyJointStatement(dummy: WoodenDummy, stmt: JointPoseStmt): void {
  const a = dummy.angles[stmt.joint];
  if (stmt.flex !== undefined) a.flex = stmt.flex;
  if (stmt.abduct !== undefined) a.abduct = stmt.abduct;
  if (stmt.twist !== undefined) a.twist = stmt.twist;
}

export function resetPoseAngles(dummy: WoodenDummy): void {
  for (const id of Object.keys(dummy.angles) as JointId[]) {
    dummy.angles[id] = { flex: 0, abduct: 0, twist: 0 };
  }
  for (const [id, preset] of Object.entries(NEUTRAL_STANCE_DEG) as [
    JointId,
    { flex?: number; abduct?: number; twist?: number },
  ][]) {
    const a = dummy.angles[id];
    if (preset.flex !== undefined) a.flex = preset.flex;
    if (preset.abduct !== undefined) a.abduct = preset.abduct;
    if (preset.twist !== undefined) a.twist = preset.twist;
  }
}

export function syncBonesFromAngles(dummy: WoodenDummy): void {
  for (const id of Object.keys(JOINT_CATALOG) as JointId[]) {
    const bone = dummy.bones[id];
    const entry = JOINT_CATALOG[id];
    const rest = dummy.restRotations.get(bone)!;
    applyAnglesToBone(bone, entry, dummy.angles[id], rest);
  }
  dummy.skeleton.update();
}

export function executePoseProgram(dummy: WoodenDummy, program: PoseProgram): void {
  for (const stmt of program.statements) {
    if (stmt.kind === "reset") {
      resetPoseAngles(dummy);
      continue;
    }
    applyJointStatement(dummy, stmt);
  }
  syncBonesFromAngles(dummy);
}

export function groundDummy(dummy: WoodenDummy): void {
  dummy.root.position.y = 0;
  dummy.root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(dummy.root);
  if (box.isEmpty()) return;
  dummy.root.position.y -= box.min.y;
  dummy.root.updateMatrixWorld(true);
}
