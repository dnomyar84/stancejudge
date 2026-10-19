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

/**
 * Limb joint axes (local, bind pose):
 * - flex (X): forward / backward swing
 * - abduct (Z): lift away from body (coronal)
 * - twist (Y): roll
 */
export type JointCatalogEntry = {
  id: JointId;
  flex: 0 | 1 | 2;
  abduct: 0 | 1 | 2;
  twist: 0 | 1 | 2;
};

function entry(id: JointId): JointCatalogEntry {
  return { id, flex: 0, abduct: 2, twist: 1 };
}

export const JOINT_CATALOG: Record<JointId, JointCatalogEntry> = {
  root: entry("root"),
  hips: entry("hips"),
  spine: entry("spine"),
  chest: entry("chest"),
  neck: entry("neck"),
  head: entry("head"),
  l_shoulder: entry("l_shoulder"),
  l_upper_arm: entry("l_upper_arm"),
  l_forearm: entry("l_forearm"),
  l_hand: entry("l_hand"),
  r_shoulder: entry("r_shoulder"),
  r_upper_arm: entry("r_upper_arm"),
  r_forearm: entry("r_forearm"),
  r_hand: entry("r_hand"),
  l_hip: entry("l_hip"),
  l_thigh: entry("l_thigh"),
  l_shin: entry("l_shin"),
  l_foot: entry("l_foot"),
  r_hip: entry("r_hip"),
  r_thigh: entry("r_thigh"),
  r_shin: entry("r_shin"),
  r_foot: entry("r_foot"),
};

export function isJointId(s: string): s is JointId {
  return (JOINT_IDS as readonly string[]).includes(s);
}

/** Default standing pose baked into `reset` (开步). */
export const NEUTRAL_STANCE_DEG: Partial<
  Record<JointId, { flex?: number; abduct?: number; twist?: number }>
> = {
  l_upper_arm: { abduct: 14 },
  r_upper_arm: { abduct: -14 },
  l_thigh: { abduct: 10, flex: 4 },
  r_thigh: { abduct: -10, flex: 4 },
};
