import type * as THREE from "three";

/** Mixamo / H-Anim–aligned naming (Xbot glTF). */
export const MIXAMO_BONES = {
  hips: "mixamorigHips",
  spine: "mixamorigSpine",
  spine1: "mixamorigSpine1",
  spine2: "mixamorigSpine2",
  neck: "mixamorigNeck",
  head: "mixamorigHead",
  leftUpLeg: "mixamorigLeftUpLeg",
  leftLeg: "mixamorigLeftLeg",
  leftFoot: "mixamorigLeftFoot",
  rightUpLeg: "mixamorigRightUpLeg",
  rightLeg: "mixamorigRightLeg",
  rightFoot: "mixamorigRightFoot",
  leftArm: "mixamorigLeftArm",
  leftForeArm: "mixamorigLeftForeArm",
  leftHand: "mixamorigLeftHand",
  rightArm: "mixamorigRightArm",
  rightForeArm: "mixamorigRightForeArm",
  rightHand: "mixamorigRightHand",
} as const;

export type MixamoBoneMap = Record<keyof typeof MIXAMO_BONES, THREE.Bone>;

export function indexMixamoBones(skeleton: THREE.Skeleton): MixamoBoneMap {
  const byName = new Map(skeleton.bones.map((b) => [b.name, b]));
  const out = {} as MixamoBoneMap;
  for (const [key, name] of Object.entries(MIXAMO_BONES) as [
    keyof typeof MIXAMO_BONES,
    string,
  ][]) {
    const bone = byName.get(name);
    if (!bone) throw new Error(`Mixamo rig missing bone: ${name}`);
    out[key] = bone;
  }
  return out;
}
