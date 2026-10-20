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
  angles: Record<JointId, JointAnglesDeg>;
  restRotations: Map<THREE.Bone, THREE.Euler>;
};

const DEG = Math.PI / 180;

function makeBone(id: JointId, x = 0, y = 0, z = 0): THREE.Bone {
  const b = new THREE.Bone();
  b.name = id;
  b.position.set(x, y, z);
  return b;
}

function buildHand(
  hand: THREE.Bone,
  side: "l" | "r",
  mk: (id: JointId, x?: number, y?: number, z?: number) => THREE.Bone,
) {
  // Thumb is radial / lateral: +X on the figure's left hand, −X on the right.
  // Index sits beside the thumb; pinky is toward the midline.
  const lateral = side === "l" ? 1 : -1;
  const palmEnd = -0.0785;

  const fingers: Array<[string, number, number, number]> = [
    ["index", lateral * 0.016, palmEnd + 0.0025, 0.052],
    ["middle", 0, palmEnd, 0.058],
    ["ring", lateral * -0.014, palmEnd + 0.0035, 0.05],
    ["pinky", lateral * -0.028, palmEnd + 0.0095, 0.042],
  ];
  for (const [name, x, y, len] of fingers) {
    const prox = mk(`${side}_${name}` as JointId, x, y, 0.006);
    const tip = mk(`${side}_${name}_tip` as JointId, 0, -len, 0);
    hand.add(prox);
    prox.add(tip);
  }

  const thumb = mk(`${side}_thumb` as JointId, lateral * 0.036, -0.026, 0.004);
  const thumbTip = mk(`${side}_thumb_tip` as JointId, 0, -0.038, 0);
  hand.add(thumb);
  thumb.add(thumbTip);
  // Local −Y is the thumb shaft. Open sits beside the index (radial).
  // Closed crosses the palm toward the ring and into the fingers.
  // +Y in this frame runs back toward the wrist, so a bend must not aim there.
  const openDir = new THREE.Vector3(lateral * 0.45, -0.86, 0.16).normalize();
  const closedDir = new THREE.Vector3(lateral * -0.72, -0.4, 0.56).normalize();
  const localX = new THREE.Vector3().crossVectors(openDir, closedDir).normalize().multiplyScalar(-1);
  const localY = openDir.clone().multiplyScalar(-1);
  const localZ = new THREE.Vector3().crossVectors(localX, localY).normalize();
  const localYOrtho = new THREE.Vector3().crossVectors(localZ, localX).normalize();
  thumb.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(localX, localYOrtho, localZ));
  thumb.userData.oppose = true;
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
  const lShoulder = mk("l_shoulder", 0.2, 0.02, 0);
  const lUpper = mk("l_upper_arm", 0, 0, 0);
  const lFore = mk("l_forearm", 0, -0.32, 0);
  const lHand = mk("l_hand", 0, -0.26, 0);

  const rShoulder = mk("r_shoulder", -0.2, 0.02, 0);
  const rUpper = mk("r_upper_arm", 0, 0, 0);
  const rFore = mk("r_forearm", 0, -0.32, 0);
  const rHand = mk("r_hand", 0, -0.26, 0);

  const lHip = mk("l_hip", 0.1, -0.02, 0);
  const lThigh = mk("l_thigh", 0, 0, 0);
  const lShin = mk("l_shin", 0, -0.44, 0);
  const lFoot = mk("l_foot", 0, -0.42, 0.02);

  const rHip = mk("r_hip", -0.1, -0.02, 0);
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

  buildHand(lHand, "l", mk);
  buildHand(rHand, "r", mk);

  rootGroup.add(root);
  rootGroup.updateMatrixWorld(true);

  const boneList = Object.values(bones);
  const skeleton = new THREE.Skeleton(boneList);

  const restRotations = new Map<THREE.Bone, THREE.Euler>();
  for (const b of boneList) {
    if (b.userData.oppose) b.userData.restQuat = b.quaternion.clone();
    restRotations.set(b, b.rotation.clone());
  }

  const angles = {} as Record<JointId, JointAnglesDeg>;
  for (const id of Object.keys(JOINT_CATALOG) as JointId[]) {
    angles[id] = { flex: 0, abduct: 0, twist: 0 };
  }

  return { root: rootGroup, bones, skeleton, angles, restRotations };
}

function applyAnglesToBone(
  bone: THREE.Bone,
  entry: JointCatalogEntry,
  angles: JointAnglesDeg,
  rest: THREE.Euler,
): void {
  if (bone.userData.oppose) {
    const restQ = bone.userData.restQuat as THREE.Quaternion;
    const q = restQ.clone();
    q.multiply(
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        angles.flex * entry.flexSign * DEG,
      ),
    );
    q.multiply(
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1),
        angles.abduct * entry.abductSign * DEG,
      ),
    );
    bone.quaternion.copy(q);
    return;
  }
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

/** Keep both ankle joints on or above the floor. The figure is lines, so the joint is the sole. */
const SOLE_CLEARANCE = 0.008;
const footPoint = new THREE.Vector3();

export function groundDummy(dummy: WoodenDummy): void {
  dummy.root.updateMatrixWorld(true);
  let lowest = Infinity;
  for (const id of ["l_foot", "r_foot"] as const) {
    dummy.bones[id].getWorldPosition(footPoint);
    lowest = Math.min(lowest, footPoint.y);
  }
  if (!Number.isFinite(lowest)) return;
  dummy.root.position.y += SOLE_CLEARANCE - lowest;
  dummy.root.updateMatrixWorld(true);
}
