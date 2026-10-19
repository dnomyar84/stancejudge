import * as THREE from "three";
import {
  JOINT_CATALOG,
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
  color: 0xc9a66b,
  roughness: 0.82,
  metalness: 0.05,
});
const JOINT_CAP = new THREE.MeshStandardMaterial({
  color: 0x8b6914,
  roughness: 0.75,
  metalness: 0.08,
});

function makeBone(id: JointId, y = 0, x = 0, z = 0): THREE.Bone {
  const b = new THREE.Bone();
  b.name = id;
  b.position.set(x, y, z);
  return b;
}

function skinnedCylinderSegment(
  skeleton: THREE.Skeleton,
  parentIndex: number,
  childIndex: number,
  parent: THREE.Bone,
  child: THREE.Bone,
  radius: number,
): THREE.SkinnedMesh {
  const len = child.position.length();
  const geom = new THREE.CylinderGeometry(radius, radius * 0.92, len, 8, 1);
  geom.translate(0, len / 2, 0);

  const pos = geom.attributes.position as THREE.BufferAttribute;
  const skinIndex = new Uint16Array(pos.count * 4);
  const skinWeight = new Float32Array(pos.count * 4);

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = len > 1e-6 ? y / len : 0;
    const wChild = THREE.MathUtils.clamp(t, 0, 1);
    const wParent = 1 - wChild;
    skinIndex[i * 4] = parentIndex;
    skinWeight[i * 4] = wParent;
    skinIndex[i * 4 + 1] = childIndex;
    skinWeight[i * 4 + 1] = wChild;
  }

  geom.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndex, 4));
  geom.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeight, 4));

  const mesh = new THREE.SkinnedMesh(geom, WOOD);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.bind(skeleton);
  parent.add(mesh);
  mesh.position.set(0, 0, 0);
  return mesh;
}

function jointSphere(radius = 0.035): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), JOINT_CAP);
  m.castShadow = true;
  return m;
}

export function createWoodenDummy(): WoodenDummy {
  const rootGroup = new THREE.Group();
  rootGroup.name = "wooden-dummy";

  const bones = {} as Record<JointId, THREE.Bone>;
  const mk = (id: JointId, y = 0, x = 0, z = 0) => {
    const b = makeBone(id, y, x, z);
    bones[id] = b;
    return b;
  };

  const root = mk("root");
  const hips = mk("hips", 0.92);
  const spine = mk("spine", 0.22);
  const chest = mk("chest", 0.24);
  const neck = mk("neck", 0.2);
  const head = mk("head", 0.14);

  const lShoulder = mk("l_shoulder", 0.02, -0.1);
  const lUpper = mk("l_upper_arm", 0, 0, -0.28);
  const lFore = mk("l_forearm", 0, 0, -0.26);
  const lHand = mk("l_hand", 0, 0, -0.12);

  const rShoulder = mk("r_shoulder", 0.02, 0.1);
  const rUpper = mk("r_upper_arm", 0, 0, -0.28);
  const rFore = mk("r_forearm", 0, 0, -0.26);
  const rHand = mk("r_hand", 0, 0, -0.12);

  const lHip = mk("l_hip", 0, -0.11);
  const lThigh = mk("l_thigh", 0, 0, -0.42);
  const lShin = mk("l_shin", 0, 0, -0.4);
  const lFoot = mk("l_foot", 0, -0.06, -0.08);

  const rHip = mk("r_hip", 0, 0.11);
  const rThigh = mk("r_thigh", 0, 0, -0.42);
  const rShin = mk("r_shin", 0, 0, -0.4);
  const rFoot = mk("r_foot", 0, -0.06, -0.08);

  root.add(hips);
  hips.add(spine);
  spine.add(chest);
  chest.add(neck);
  neck.add(head);
  head.add(jointSphere(0.09));

  chest.add(lShoulder);
  lShoulder.add(lUpper);
  lUpper.add(lFore);
  lFore.add(lHand);

  chest.add(rShoulder);
  rShoulder.add(rUpper);
  rUpper.add(rFore);
  rFore.add(rHand);

  hips.add(lHip);
  lHip.add(lThigh);
  lThigh.add(lShin);
  lShin.add(lFoot);

  hips.add(rHip);
  rHip.add(rThigh);
  rThigh.add(rShin);
  rShin.add(rFoot);

  rootGroup.add(root);

  const boneList = Object.values(bones);
  const boneIndex = new Map<THREE.Bone, number>();
  boneList.forEach((b, i) => boneIndex.set(b, i));

  const skeleton = new THREE.Skeleton(boneList);

  const skinnedMeshes: THREE.SkinnedMesh[] = [];
  const segment = (parentId: JointId, childId: JointId, radius: number) => {
    const parent = bones[parentId];
    const child = bones[childId];
    const mesh = skinnedCylinderSegment(
      skeleton,
      boneIndex.get(parent)!,
      boneIndex.get(child)!,
      parent,
      child,
      radius,
    );
    skinnedMeshes.push(mesh);
  };

  segment("hips", "spine", 0.11);
  segment("spine", "chest", 0.12);
  segment("chest", "neck", 0.07);
  segment("neck", "head", 0.085);
  segment("l_shoulder", "l_upper_arm", 0.055);
  segment("l_upper_arm", "l_forearm", 0.048);
  segment("l_forearm", "l_hand", 0.04);
  segment("r_shoulder", "r_upper_arm", 0.055);
  segment("r_upper_arm", "r_forearm", 0.048);
  segment("r_forearm", "r_hand", 0.04);
  segment("l_hip", "l_thigh", 0.065);
  segment("l_thigh", "l_shin", 0.058);
  segment("l_shin", "l_foot", 0.05);
  segment("r_hip", "r_thigh", 0.065);
  segment("r_thigh", "r_shin", 0.058);
  segment("r_shin", "r_foot", 0.05);

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
  const setAxis = (axisIndex: 0 | 1 | 2, rad: number) => {
    if (axisIndex === 0) euler.x += rad;
    else if (axisIndex === 1) euler.y += rad;
    else euler.z += rad;
  };

  setAxis(entry.flex, angles.flex * entry.flexSign * DEG);
  setAxis(entry.abduct, angles.abduct * entry.abductSign * DEG);
  setAxis(entry.twist, angles.twist * entry.twistSign * DEG);

  bone.rotation.copy(euler);
}

export function applyJointStatement(
  dummy: WoodenDummy,
  stmt: JointPoseStmt,
): void {
  const a = dummy.angles[stmt.joint];
  if (stmt.flex !== undefined) a.flex = stmt.flex;
  if (stmt.abduct !== undefined) a.abduct = stmt.abduct;
  if (stmt.twist !== undefined) a.twist = stmt.twist;
}

export function resetPoseAngles(dummy: WoodenDummy): void {
  for (const id of Object.keys(dummy.angles) as JointId[]) {
    dummy.angles[id] = { flex: 0, abduct: 0, twist: 0 };
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
  dummy.root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(dummy.root);
  if (box.isEmpty()) return;
  dummy.root.position.y -= box.min.y;
  dummy.root.updateMatrixWorld(true);
}
