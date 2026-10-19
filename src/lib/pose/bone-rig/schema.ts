/** Display pose for Three.js `Bone.rotation` (local Euler, degrees). */
export const COACH_BONE_POSE_SCHEMA = "coach-bone-pose/v1" as const;
export const COACH_BONE_DRIVER_MIXAMO_XBOT = "mixamo-xbot-1.75" as const;

export type BoneEulerDeg = {
  x: number;
  y: number;
  z: number;
  order: "XYZ";
};

export type CoachBonePoseV1 = {
  schema: typeof COACH_BONE_POSE_SCHEMA;
  driver: typeof COACH_BONE_DRIVER_MIXAMO_XBOT;
  /** Avatar root group position (meters, Y-up). */
  root: { x: number; y: number; z: number };
  /** Keyed by glTF bone name (e.g. `mixamorigLeftArm`). */
  rotations: Record<string, BoneEulerDeg>;
};

export function isCoachBonePoseV1(value: unknown): value is CoachBonePoseV1 {
  if (!value || typeof value !== "object") return false;
  const o = value as CoachBonePoseV1;
  return (
    o.schema === COACH_BONE_POSE_SCHEMA &&
    o.driver === COACH_BONE_DRIVER_MIXAMO_XBOT &&
    typeof o.rotations === "object"
  );
}
