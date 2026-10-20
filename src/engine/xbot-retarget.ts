import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { JointId } from "./joint-catalog";
import type { WoodenDummy } from "./wooden-dummy";

/**
 * Xbot is a Mixamo body in T-pose: arms out, palms down, legs already down.
 * Studio bones hang in anatomical position: arms down, palms forward.
 *
 * `align` is the Xbot bone quaternion that makes the bind mesh match a studio
 * bone at rest. Posed: xbotLocal = inv(parentAlign) * studioLocal * align.
 * Shoulders stay out (identity align). The upper arm carries the hang-and-palm
 * roll, and every child with the same align stays straight until its own joint moves.
 */

const IDENTITY = new THREE.Quaternion();

const ALIGN_LEFT = new THREE.Quaternion().setFromRotationMatrix(
  new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(1, 0, 0),
  ),
);

const ALIGN_RIGHT = new THREE.Quaternion().setFromRotationMatrix(
  new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(-1, 0, 0),
  ),
);

type PoseMode = "joint" | "thumb" | "thumb-tip";

type Step = {
  bone: string;
  joint: JointId;
  align: THREE.Quaternion;
  /** Share one studio quaternion across several Mixamo bones (spine, fingertip). */
  weight: number;
  mode: PoseMode;
};

const DIGITS = [
  ["Index", "index"],
  ["Middle", "middle"],
  ["Ring", "ring"],
  ["Pinky", "pinky"],
] as const;

function armSteps(side: "Left" | "Right", prefix: "l" | "r", align: THREE.Quaternion): Step[] {
  const steps: Step[] = [
    { bone: `${side}Shoulder`, joint: `${prefix}_shoulder`, align: IDENTITY, weight: 1, mode: "joint" },
    { bone: `${side}Arm`, joint: `${prefix}_upper_arm`, align, weight: 1, mode: "joint" },
    { bone: `${side}ForeArm`, joint: `${prefix}_forearm`, align, weight: 1, mode: "joint" },
    { bone: `${side}Hand`, joint: `${prefix}_hand`, align, weight: 1, mode: "joint" },
    { bone: `${side}HandThumb1`, joint: `${prefix}_thumb`, align, weight: 1, mode: "thumb" },
    { bone: `${side}HandThumb2`, joint: `${prefix}_thumb_tip`, align, weight: 0.55, mode: "thumb-tip" },
    { bone: `${side}HandThumb3`, joint: `${prefix}_thumb_tip`, align, weight: 0.45, mode: "thumb-tip" },
  ];
  for (const [mixamo, studio] of DIGITS) {
    steps.push(
      { bone: `${side}Hand${mixamo}1`, joint: `${prefix}_${studio}`, align, weight: 1, mode: "joint" },
      { bone: `${side}Hand${mixamo}2`, joint: `${prefix}_${studio}_tip`, align, weight: 0.58, mode: "joint" },
      { bone: `${side}Hand${mixamo}3`, joint: `${prefix}_${studio}_tip`, align, weight: 0.42, mode: "joint" },
    );
  }
  return steps;
}

const STEPS: Step[] = [
  { bone: "Hips", joint: "hips", align: IDENTITY, weight: 1, mode: "joint" },
  { bone: "Spine", joint: "spine", align: IDENTITY, weight: 0.5, mode: "joint" },
  { bone: "Spine1", joint: "spine", align: IDENTITY, weight: 0.5, mode: "joint" },
  { bone: "Spine2", joint: "chest", align: IDENTITY, weight: 1, mode: "joint" },
  { bone: "Neck", joint: "neck", align: IDENTITY, weight: 1, mode: "joint" },
  { bone: "Head", joint: "head", align: IDENTITY, weight: 1, mode: "joint" },
  ...armSteps("Left", "l", ALIGN_LEFT),
  ...armSteps("Right", "r", ALIGN_RIGHT),
  { bone: "LeftUpLeg", joint: "l_thigh", align: IDENTITY, weight: 1, mode: "joint" },
  { bone: "LeftLeg", joint: "l_shin", align: IDENTITY, weight: 1, mode: "joint" },
  { bone: "LeftFoot", joint: "l_foot", align: IDENTITY, weight: 1, mode: "joint" },
  { bone: "RightUpLeg", joint: "r_thigh", align: IDENTITY, weight: 1, mode: "joint" },
  { bone: "RightLeg", joint: "r_shin", align: IDENTITY, weight: 1, mode: "joint" },
  { bone: "RightFoot", joint: "r_foot", align: IDENTITY, weight: 1, mode: "joint" },
];

/** GLTFLoader strips the colon, so `mixamorig:Hips` arrives as `mixamorigHips`. */
function mixamoName(bone: string) {
  return `mixamorig${bone}`;
}

const ALIGN_BY_BONE = new Map<string, THREE.Quaternion>(
  STEPS.map((step) => [mixamoName(step.bone), step.align]),
);

const _weighted = new THREE.Quaternion();
const _local = new THREE.Quaternion();
const _source = new THREE.Quaternion();
const _aux = new THREE.Quaternion();
const _sole = new THREE.Vector3();

function studioQuaternion(dummy: WoodenDummy, step: Step): THREE.Quaternion {
  const bone = dummy.bones[step.joint];
  if (step.mode === "joint") return _source.copy(bone.quaternion);
  if (step.mode === "thumb") {
    const rest = bone.userData.restQuat as THREE.Quaternion | undefined;
    // Hand-frame rotation of the opposed thumb away from its open rest.
    if (!rest) return _source.copy(bone.quaternion);
    return _source.copy(bone.quaternion).multiply(_aux.copy(rest).invert());
  }
  const thumb = dummy.bones[step.joint.replace(/_tip$/, "") as JointId];
  const rest = thumb.userData.restQuat as THREE.Quaternion | undefined;
  if (!rest) return _source.copy(bone.quaternion);
  // Tip bend is authored in the opposed thumb frame. This is already an Xbot local quaternion.
  return _source
    .copy(rest)
    .invert()
    .multiply(step.align)
    .multiply(bone.quaternion)
    .multiply(_aux.copy(step.align).invert())
    .multiply(rest);
}

/** Write Mixamo local quaternions from the studio pose. Bone translations stay in the bind pose. */
export function applyXbotPose(model: THREE.Object3D, dummy: WoodenDummy): void {
  for (const step of STEPS) {
    const xbone = model.getObjectByName(mixamoName(step.bone));
    if (!xbone) continue;
    const parentAlign = (xbone.parent && ALIGN_BY_BONE.get(xbone.parent.name)) || IDENTITY;
    const source = studioQuaternion(dummy, step);
    _weighted.identity().slerpQuaternions(IDENTITY, source, step.weight);
    if (step.mode === "thumb-tip") {
      xbone.quaternion.copy(_weighted);
      continue;
    }
    _local.copy(parentAlign).invert().multiply(_weighted).multiply(step.align);
    xbone.quaternion.copy(_local);
  }
}

const SOLE_CLEARANCE = 0.008;

function collectSoleVertices(geometry: THREE.BufferGeometry): number[] {
  const pos = geometry.getAttribute("position");
  const buckets = new Map<string, { index: number; y: number }[]>();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (Math.abs(x) < 0.03) continue;
    const key = `${x > 0 ? "l" : "r"}${z > 0.02 ? "f" : "b"}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = [];
      buckets.set(key, bucket);
    }
    if (bucket.length < 8) {
      bucket.push({ index: i, y });
    } else {
      let highest = 0;
      for (let k = 1; k < bucket.length; k++) if (bucket[k].y > bucket[highest].y) highest = k;
      if (y < bucket[highest].y) bucket[highest] = { index: i, y };
    }
  }
  return [...buckets.values()].flat().map((entry) => entry.index);
}

export type XbotBody = {
  object: THREE.Object3D;
  apply: (dummy: WoodenDummy) => void;
};

export function loadXbotBody(url: string): Promise<XbotBody> {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.name = "xbot";
        const joints = model.getObjectByName("Beta_Joints");
        if (joints) joints.visible = false;
        const surface = model.getObjectByName("Beta_Surface");
        if (!(surface instanceof THREE.SkinnedMesh)) {
          reject(new Error("Xbot is missing its surface mesh."));
          return;
        }
        surface.castShadow = true;
        surface.frustumCulled = false;
        const sole = collectSoleVertices(surface.geometry);
        const position = surface.geometry.getAttribute("position");

        resolve({
          object: model,
          apply(dummy) {
            applyXbotPose(model, dummy);
            model.position.y = 0;
            model.updateMatrixWorld(true);
            let lowest = Infinity;
            for (const index of sole) {
              _sole.fromBufferAttribute(position, index);
              surface.applyBoneTransform(index, _sole);
              surface.localToWorld(_sole);
              if (_sole.y < lowest) lowest = _sole.y;
            }
            if (Number.isFinite(lowest)) model.position.y = SOLE_CLEARANCE - lowest;
            model.updateMatrixWorld(true);
          },
        });
      },
      undefined,
      (error) => reject(error),
    );
  });
}
