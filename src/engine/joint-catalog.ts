/** Joint ids used in pose grammar (stable public API). */
export const JOINT_IDS = [
  "root",
  "hips",
  "spine",
  "chest",
  "neck",
  "head",
  "l_shoulder",
  "l_upper_arm",
  "l_forearm",
  "l_hand",
  "r_shoulder",
  "r_upper_arm",
  "r_forearm",
  "r_hand",
  "l_hip",
  "l_thigh",
  "l_shin",
  "l_foot",
  "r_hip",
  "r_thigh",
  "r_shin",
  "r_foot",
] as const;

export type JointId = (typeof JOINT_IDS)[number];

export type AxisName = "flex" | "abduct" | "twist";

export type JointCatalogEntry = {
  id: JointId;
  /** Euler component: 0=x flex, 1=y twist, 2=z abduct */
  flex: 0 | 1 | 2;
  abduct: 0 | 1 | 2;
  twist: 0 | 1 | 2;
  /** +1 keeps the grammar angle; −1 mirrors the right or left side. */
  flexSign: number;
  abductSign: number;
  twistSign: number;
};

function torso(id: JointId): JointCatalogEntry {
  return {
    id,
    flex: 0,
    abduct: 2,
    twist: 1,
    flexSign: 1,
    abductSign: 1,
    twistSign: 1,
  };
}

/** Left side: +abduct swings the limb away from the body (out to −X). */
function leftLimb(id: JointId): JointCatalogEntry {
  return {
    id,
    flex: 0,
    abduct: 2,
    twist: 1,
    flexSign: -1,
    abductSign: -1,
    twistSign: 1,
  };
}

/** Right side: +abduct swings the limb away from the body (out to +X). */
function rightLimb(id: JointId): JointCatalogEntry {
  return {
    id,
    flex: 0,
    abduct: 2,
    twist: 1,
    flexSign: -1,
    abductSign: 1,
    twistSign: -1,
  };
}

export const JOINT_CATALOG: Record<JointId, JointCatalogEntry> = {
  root: torso("root"),
  hips: torso("hips"),
  spine: torso("spine"),
  chest: torso("chest"),
  neck: torso("neck"),
  head: torso("head"),
  l_shoulder: leftLimb("l_shoulder"),
  l_upper_arm: leftLimb("l_upper_arm"),
  l_forearm: leftLimb("l_forearm"),
  l_hand: leftLimb("l_hand"),
  r_shoulder: rightLimb("r_shoulder"),
  r_upper_arm: rightLimb("r_upper_arm"),
  r_forearm: rightLimb("r_forearm"),
  r_hand: rightLimb("r_hand"),
  l_hip: leftLimb("l_hip"),
  l_thigh: leftLimb("l_thigh"),
  l_shin: leftLimb("l_shin"),
  l_foot: leftLimb("l_foot"),
  r_hip: rightLimb("r_hip"),
  r_thigh: rightLimb("r_thigh"),
  r_shin: rightLimb("r_shin"),
  r_foot: rightLimb("r_foot"),
};

export function isJointId(s: string): s is JointId {
  return (JOINT_IDS as readonly string[]).includes(s);
}

/** Standing 开步 applied by `reset`. +flex is forward, +abduct is away from midline. */
export const NEUTRAL_STANCE_DEG: Partial<
  Record<JointId, { flex?: number; abduct?: number; twist?: number }>
> = {
  l_upper_arm: { abduct: 8, flex: 4 },
  r_upper_arm: { abduct: 8, flex: 4 },
  l_forearm: { flex: 8 },
  r_forearm: { flex: 8 },
  l_thigh: { abduct: 6 },
  r_thigh: { abduct: 6 },
};
