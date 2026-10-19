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
  /** Euler axis index on the bone: 0=x, 1=y, 2=z */
  flex: 0 | 1 | 2;
  abduct: 0 | 1 | 2;
  twist: 0 | 1 | 2;
  /** Sign multiplier per axis (anatomical mirroring). */
  flexSign: number;
  abductSign: number;
  twistSign: number;
};

/** Maps grammar axes to bone local Euler components (radians applied in XYZ order). */
export const JOINT_CATALOG: Record<JointId, JointCatalogEntry> = {
  root: { id: "root", flex: 0, abduct: 2, twist: 1, flexSign: 1, abductSign: 1, twistSign: 1 },
  hips: { id: "hips", flex: 0, abduct: 2, twist: 1, flexSign: 1, abductSign: 1, twistSign: 1 },
  spine: { id: "spine", flex: 0, abduct: 2, twist: 1, flexSign: 1, abductSign: 1, twistSign: 1 },
  chest: { id: "chest", flex: 0, abduct: 2, twist: 1, flexSign: 1, abductSign: 1, twistSign: 1 },
  neck: { id: "neck", flex: 0, abduct: 2, twist: 1, flexSign: 1, abductSign: 1, twistSign: 1 },
  head: { id: "head", flex: 0, abduct: 2, twist: 1, flexSign: 1, abductSign: 1, twistSign: 1 },
  l_shoulder: {
    id: "l_shoulder",
    flex: 2,
    abduct: 0,
    twist: 1,
    flexSign: 1,
    abductSign: 1,
    twistSign: 1,
  },
  l_upper_arm: {
    id: "l_upper_arm",
    flex: 2,
    abduct: 0,
    twist: 1,
    flexSign: 1,
    abductSign: 1,
    twistSign: 1,
  },
  l_forearm: {
    id: "l_forearm",
    flex: 0,
    abduct: 1,
    twist: 2,
    flexSign: 1,
    abductSign: 1,
    twistSign: 1,
  },
  l_hand: {
    id: "l_hand",
    flex: 0,
    abduct: 2,
    twist: 1,
    flexSign: 1,
    abductSign: 1,
    twistSign: 1,
  },
  r_shoulder: {
    id: "r_shoulder",
    flex: 2,
    abduct: 0,
    twist: 1,
    flexSign: -1,
    abductSign: -1,
    twistSign: -1,
  },
  r_upper_arm: {
    id: "r_upper_arm",
    flex: 2,
    abduct: 0,
    twist: 1,
    flexSign: -1,
    abductSign: -1,
    twistSign: -1,
  },
  r_forearm: {
    id: "r_forearm",
    flex: 0,
    abduct: 1,
    twist: 2,
    flexSign: -1,
    abductSign: -1,
    twistSign: -1,
  },
  r_hand: {
    id: "r_hand",
    flex: 0,
    abduct: 2,
    twist: 1,
    flexSign: -1,
    abductSign: -1,
    twistSign: -1,
  },
  l_hip: { id: "l_hip", flex: 0, abduct: 2, twist: 1, flexSign: 1, abductSign: 1, twistSign: 1 },
  l_thigh: { id: "l_thigh", flex: 0, abduct: 2, twist: 1, flexSign: 1, abductSign: 1, twistSign: 1 },
  l_shin: { id: "l_shin", flex: 0, abduct: 1, twist: 2, flexSign: 1, abductSign: 1, twistSign: 1 },
  l_foot: { id: "l_foot", flex: 0, abduct: 2, twist: 1, flexSign: 1, abductSign: 1, twistSign: 1 },
  r_hip: { id: "r_hip", flex: 0, abduct: 2, twist: 1, flexSign: -1, abductSign: -1, twistSign: -1 },
  r_thigh: { id: "r_thigh", flex: 0, abduct: 2, twist: 1, flexSign: -1, abductSign: -1, twistSign: -1 },
  r_shin: { id: "r_shin", flex: 0, abduct: 1, twist: 2, flexSign: -1, abductSign: -1, twistSign: -1 },
  r_foot: { id: "r_foot", flex: 0, abduct: 2, twist: 1, flexSign: -1, abductSign: -1, twistSign: -1 },
};

export function isJointId(s: string): s is JointId {
  return (JOINT_IDS as readonly string[]).includes(s);
}
