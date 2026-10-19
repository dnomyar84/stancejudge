import * as THREE from "three";
import {
  JOINT_CATALOG,
  NEUTRAL_STANCE_DEG,
  type JointCatalogEntry,
  type JointId,
} from "./joint-catalog";
import { applyHandShape } from "./hand-shapes";
import { clampToAnatomy, type ClampNote } from "./joint-limits";
import type { HandShapeStmt, JointPoseStmt, PoseProgram } from "./pose-grammar";

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

const SKIN = new THREE.MeshStandardMaterial({
  color: 0xd7b48a,
  roughness: 0.62,
  metalness: 0.02,
});
const WOOD = new THREE.MeshStandardMaterial({
  color: 0xc49a6c,
  roughness: 0.7,
  metalness: 0.04,
});
const JOINT = new THREE.MeshStandardMaterial({
  color: 0x4a3424,
  roughness: 0.45,
  metalness: 0.15,
});
const EYE = new THREE.MeshStandardMaterial({
  color: 0x1a120c,
  roughness: 0.4,
});

function makeBone(id: JointId, x = 0, y = 0, z = 0): THREE.Bone {
  const b = new THREE.Bone();
  b.name = id;
  b.position.set(x, y, z);
  return b;
}

/** Bind-pose world position (identity rotations). */
function bindWorld(bone: THREE.Object3D): THREE.Vector3 {
  const chain: THREE.Vector3[] = [];
  let node: THREE.Object3D | null = bone;
  while (node) {
    chain.push(node.position.clone());
    node = node.parent;
  }
  const out = new THREE.Vector3();
  for (let i = chain.length - 1; i >= 0; i--) out.add(chain[i]);
  return out;
}

const Y_UP = new THREE.Vector3(0, 1, 0);

/**
 * Limb volume in group space, skinned parent→child.
 * Mesh stays a sibling of the skeleton root — never a child of a bone
 * (parenting + skinning double-transforms and destroys the silhouette).
 */
function addSkinnedSegment(
  rootGroup: THREE.Group,
  skeleton: THREE.Skeleton,
  parentIndex: number,
  childIndex: number,
  parent: THREE.Bone,
  child: THREE.Bone,
  radiusNear: number,
  radiusFar: number,
): THREE.SkinnedMesh {
  const p0 = bindWorld(parent);
  const p1 = bindWorld(child);
  const delta = new THREE.Vector3().subVectors(p1, p0);
  const len = Math.max(delta.length(), 1e-4);
  const dir = delta.clone().multiplyScalar(1 / len);

  const geom = new THREE.CylinderGeometry(radiusNear, radiusFar, len, 16, 6, false);
  geom.translate(0, len / 2, 0);
  geom.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y_UP, dir));
  geom.translate(p0.x, p0.y, p0.z);

  const pos = geom.attributes.position as THREE.BufferAttribute;
  const skinIndex = new Uint16Array(pos.count * 4);
  const skinWeight = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    const along = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(p0).dot(dir);
    const t = THREE.MathUtils.clamp(along / len, 0, 1);
    skinIndex[i * 4] = parentIndex;
    skinWeight[i * 4] = 1 - t;
    skinIndex[i * 4 + 1] = childIndex;
    skinWeight[i * 4 + 1] = t;
  }
  geom.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndex, 4));
  geom.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeight, 4));
  geom.computeVertexNormals();

  const mesh = new THREE.SkinnedMesh(geom, SKIN);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  rootGroup.add(mesh);
  rootGroup.updateMatrixWorld(true);
  mesh.bind(skeleton);
  return mesh;
}

function ball(parent: THREE.Object3D, r: number, x = 0, y = 0, z = 0, mat: THREE.Material = JOINT) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}

/** Rigid stick from this bone's origin toward `child` (local). */
function stickToward(parent: THREE.Bone, child: THREE.Bone, radius: number, mat: THREE.Material) {
  const len = child.position.length();
  if (len < 1e-4) return;
  const dir = child.position.clone().multiplyScalar(1 / len);
  const geom = new THREE.CylinderGeometry(radius, radius * 0.82, len, 7);
  geom.translate(0, len / 2, 0);
  geom.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y_UP, dir));
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  parent.add(mesh);
}

function stickDown(parent: THREE.Bone, len: number, radius: number, mat: THREE.Material) {
  const geom = new THREE.CylinderGeometry(radius, radius * 0.7, len, 7);
  geom.translate(0, -len / 2, 0);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  parent.add(mesh);
}

function box(
  parent: THREE.Object3D,
  sx: number,
  sy: number,
  sz: number,
  x = 0,
  y = 0,
  z = 0,
  mat: THREE.Material = WOOD,
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function buildHand(
  hand: THREE.Bone,
  side: "l" | "r",
  mk: (id: JointId, x?: number, y?: number, z?: number) => THREE.Bone,
) {
  const s = side === "l" ? 1 : -1;
  box(hand, 0.08, 0.095, 0.022, 0, -0.05, 0, WOOD);

  const fingers: Array<[string, number, number, number]> = [
    ["index", s * -0.014, -0.095, 0.052],
    ["middle", 0, -0.098, 0.058],
    ["ring", s * 0.015, -0.094, 0.05],
    ["pinky", s * 0.03, -0.088, 0.042],
  ];
  for (const [name, x, y, len] of fingers) {
    const prox = mk(`${side}_${name}` as JointId, x, y, 0.006);
    const tip = mk(`${side}_${name}_tip` as JointId, 0, -len, 0);
    hand.add(prox);
    prox.add(tip);
    stickToward(prox, tip, 0.009, SKIN);
    stickDown(tip, len * 0.75, 0.0075, SKIN);
  }

  const thumb = mk(`${side}_thumb` as JointId, s * 0.04, -0.028, 0.014);
  const thumbTip = mk(`${side}_thumb_tip` as JointId, s * 0.014, -0.036, 0.008);
  hand.add(thumb);
  thumb.add(thumbTip);
  stickToward(thumb, thumbTip, 0.01, WOOD);
  stickDown(thumbTip, 0.03, 0.008, WOOD);
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

  // Adult ~1.75 m. +Y up, +Z forward, +X figure's left (viewer's right when facing camera).
  // Foot bones sit on the floor (y = 0) so grounding is the sole.
  const root = mk("root");
  const hips = mk("hips", 0, 0.96, 0);
  const spine = mk("spine", 0, 0.18, 0);
  const chest = mk("chest", 0, 0.22, 0);
  const neck = mk("neck", 0, 0.18, 0);
  const head = mk("head", 0, 0.1, 0);

  // Limb bone sits at the joint that swings the segment below it.
  const lShoulder = mk("l_shoulder", -0.2, 0.02, 0);
  const lUpper = mk("l_upper_arm", 0, 0, 0);
  const lFore = mk("l_forearm", 0, -0.32, 0);
  const lHand = mk("l_hand", 0, -0.26, 0);

  const rShoulder = mk("r_shoulder", 0.2, 0.02, 0);
  const rUpper = mk("r_upper_arm", 0, 0, 0);
  const rFore = mk("r_forearm", 0, -0.32, 0);
  const rHand = mk("r_hand", 0, -0.26, 0);

  const lHip = mk("l_hip", -0.1, -0.02, 0);
  const lThigh = mk("l_thigh", 0, 0, 0);
  const lShin = mk("l_shin", 0, -0.44, 0);
  const lFoot = mk("l_foot", 0, -0.42, 0.02);

  const rHip = mk("r_hip", 0.1, -0.02, 0);
  const rThigh = mk("r_thigh", 0, 0, 0);
  const rShin = mk("r_shin", 0, -0.44, 0);
  const rFoot = mk("r_foot", 0, -0.42, 0.02);

  root.add(hips);
  hips.add(spine);
  spine.add(chest);
  chest.add(neck);
  neck.add(head);

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

  // Solid parts that must keep their shape (not skinned).
  box(hips, 0.28, 0.14, 0.18, 0, -0.02, 0);
  ball(chest, 0.05, -0.2, 0.02, 0);
  ball(chest, 0.05, 0.2, 0.02, 0);
  ball(head, 0.11, 0, 0.06, 0, SKIN);
  ball(head, 0.018, -0.035, 0.08, 0.09, EYE);
  ball(head, 0.018, 0.035, 0.08, 0.09, EYE);
  buildHand(lHand, "l", mk);
  buildHand(rHand, "r", mk);
  box(lFoot, 0.09, 0.05, 0.22, 0, 0.025, 0.06, WOOD);
  box(rFoot, 0.09, 0.05, 0.22, 0, 0.025, 0.06, WOOD);
  ball(lUpper, 0.04, 0, 0, 0);
  ball(rUpper, 0.04, 0, 0, 0);
  ball(lFore, 0.035, 0, 0, 0);
  ball(rFore, 0.035, 0, 0, 0);
  ball(lThigh, 0.05, 0, 0, 0);
  ball(rThigh, 0.05, 0, 0, 0);
  ball(lShin, 0.04, 0, 0, 0);
  ball(rShin, 0.04, 0, 0, 0);

  rootGroup.add(root);
  rootGroup.updateMatrixWorld(true);

  const boneList = Object.values(bones);
  const indexOf = new Map<THREE.Bone, number>();
  boneList.forEach((b, i) => indexOf.set(b, i));
  const skeleton = new THREE.Skeleton(boneList);

  const skinnedMeshes: THREE.SkinnedMesh[] = [];
  const seg = (a: JointId, b: JointId, r0: number, r1: number) => {
    skinnedMeshes.push(
      addSkinnedSegment(
        rootGroup,
        skeleton,
        indexOf.get(bones[a])!,
        indexOf.get(bones[b])!,
        bones[a],
        bones[b],
        r0,
        r1,
      ),
    );
  };

  seg("hips", "spine", 0.13, 0.11);
  seg("spine", "chest", 0.12, 0.15);
  seg("chest", "neck", 0.07, 0.055);
  seg("neck", "head", 0.05, 0.06);
  seg("l_upper_arm", "l_forearm", 0.055, 0.045);
  seg("l_forearm", "l_hand", 0.042, 0.034);
  seg("r_upper_arm", "r_forearm", 0.055, 0.045);
  seg("r_forearm", "r_hand", 0.042, 0.034);
  seg("l_thigh", "l_shin", 0.075, 0.055);
  seg("l_shin", "l_foot", 0.05, 0.04);
  seg("r_thigh", "r_shin", 0.075, 0.055);
  seg("r_shin", "r_foot", 0.05, 0.04);

  const restRotations = new Map<THREE.Bone, THREE.Euler>();
  for (const b of boneList) restRotations.set(b, b.rotation.clone());

  const angles = {} as Record<JointId, JointAnglesDeg>;
  for (const id of Object.keys(JOINT_CATALOG) as JointId[]) {
    angles[id] = { flex: 0, abduct: 0, twist: 0 };
  }

  return { root: rootGroup, bones, skeleton, skinnedMeshes, angles, restRotations };
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
  add(entry.flex, angles.flex * entry.flexSign);
  add(entry.abduct, angles.abduct * entry.abductSign);
  add(entry.twist, angles.twist * entry.twistSign);
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

export function syncBonesFromAngles(dummy: WoodenDummy): ClampNote[] {
  const clamped = clampToAnatomy(dummy.angles);
  for (const id of Object.keys(JOINT_CATALOG) as JointId[]) {
    applyAnglesToBone(
      dummy.bones[id],
      JOINT_CATALOG[id],
      dummy.angles[id],
      dummy.restRotations.get(dummy.bones[id])!,
    );
  }
  dummy.skeleton.update();
  return clamped;
}

export function executePoseProgram(dummy: WoodenDummy, program: PoseProgram): ClampNote[] {
  for (const stmt of program.statements) {
    if (stmt.kind === "reset") resetPoseAngles(dummy);
    else if (stmt.kind === "hand") applyHandShape(dummy.angles, stmt.side, stmt.shape);
    else applyJointStatement(dummy, stmt);
  }
  return syncBonesFromAngles(dummy);
}

/** Drop the lower sole onto y = 0. Foot boxes sit on the foot bone origin. */
export function groundDummy(dummy: WoodenDummy): void {
  dummy.root.position.y = 0;
  dummy.root.updateMatrixWorld(true);
  const footY = (id: JointId) => {
    const p = new THREE.Vector3();
    dummy.bones[id].getWorldPosition(p);
    return p.y;
  };
  const lowest = Math.min(footY("l_foot"), footY("r_foot"));
  dummy.root.position.y -= lowest;
  dummy.root.updateMatrixWorld(true);
}
