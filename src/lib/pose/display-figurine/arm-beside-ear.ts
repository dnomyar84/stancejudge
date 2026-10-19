import type { CoachFigurinePoseV1 } from "./coach-figurine-pose";

/** One arm vertical beside the same-side ear (开步站立, body.turn −90°). */
export type FigurineArmSlice = Pick<
  CoachFigurinePoseV1,
  "leftArm" | "leftElbow" | "leftWrist" | "leftFingers"
>;

/**
 * Mannequin-js shoulder Euler (raise/straddle/turn) with body.turn = −90°.
 * Symmetric straddle; raise keeps the small L/R rest asymmetry from Male() defaults.
 */
/** +~85° shoulder flexion from neutral open stance (straddle stays near rest ~7°). */
const RAISE_DELTA_FROM_NEUTRAL = 85;

export const LEFT_ARM_BESIDE_EAR: FigurineArmSlice = {
  leftArm: {
    raise: 3.77 + RAISE_DELTA_FROM_NEUTRAL,
    straddle: 7,
    turn: 0,
  },
  leftElbow: { bend: 12 },
  leftWrist: { bend: 0, tilt: 0, turn: 0 },
  leftFingers: { bend: 10 },
};

export const RIGHT_ARM_BESIDE_EAR: Pick<
  CoachFigurinePoseV1,
  "rightArm" | "rightElbow" | "rightWrist" | "rightFingers"
> = {
  rightArm: {
    raise: -13.77 + RAISE_DELTA_FROM_NEUTRAL,
    straddle: 7,
    turn: 0,
  },
  rightElbow: { bend: 12 },
  rightWrist: { bend: 0, tilt: 0, turn: 0 },
  rightFingers: { bend: 10 },
};
