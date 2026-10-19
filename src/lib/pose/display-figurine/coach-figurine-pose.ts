/** Display driver for the default visual coach (mannequin-js Male 1.75 m). */
export const COACH_FIGURINE_POSE_SCHEMA = "coach-figurine-pose/v1" as const;
export const COACH_FIGURINE_DRIVER_MANNEQUIN_MALE =
  "mannequin-male-1.75" as const;

export type FigurineTriple = { tilt: number; turn: number; bend: number };
export type FigurineHead = { tilt: number; turn: number; nod: number };
export type FigurineLimb = { straddle: number; turn: number; raise: number };
export type FigurineAnkle = { tilt: number; turn: number; bend: number };
export type FigurineWrist = { tilt: number; turn: number; bend: number };

/**
 * Authoritative display state for the 3D figurine.
 * Values are mannequin-js public joint angles (degrees), same as the posture editor.
 * Renderers apply this record directly — no inverse kinematics.
 */
export type CoachFigurinePoseV1 = {
  schema: typeof COACH_FIGURINE_POSE_SCHEMA;
  driver: typeof COACH_FIGURINE_DRIVER_MANNEQUIN_MALE;
  root: { x: number; y: number; z: number };
  body: FigurineTriple;
  torso: FigurineTriple;
  head: FigurineHead;
  leftLeg: FigurineLimb;
  leftKnee: { bend: number };
  leftAnkle: FigurineAnkle;
  rightLeg: FigurineLimb;
  rightKnee: { bend: number };
  rightAnkle: FigurineAnkle;
  leftArm: FigurineLimb;
  leftElbow: { bend: number };
  leftWrist: FigurineWrist;
  leftFingers: { bend: number };
  rightArm: FigurineLimb;
  rightElbow: { bend: number };
  rightWrist: FigurineWrist;
  rightFingers: { bend: number };
};

export function isCoachFigurinePoseV1(
  value: unknown,
): value is CoachFigurinePoseV1 {
  if (!value || typeof value !== "object") return false;
  const o = value as CoachFigurinePoseV1;
  return (
    o.schema === COACH_FIGURINE_POSE_SCHEMA &&
    o.driver === COACH_FIGURINE_DRIVER_MANNEQUIN_MALE &&
    typeof o.root === "object" &&
    typeof o.leftLeg === "object"
  );
}

export function assertCoachFigurinePoseV1(pose: CoachFigurinePoseV1): void {
  if (!isCoachFigurinePoseV1(pose)) {
    throw new Error("Invalid coach-figurine-pose/v1");
  }
}
