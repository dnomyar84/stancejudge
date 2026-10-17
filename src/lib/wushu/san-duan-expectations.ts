import { sanDuanChangQuan } from "./routines/san-duan-chang-quan";
import type { HandProfileType, LegStanceType } from "./types";

/** Unique leg stances required across 三段长拳 (22 moves). */
export const SAN_DUAN_EXPECTED_LEGS: LegStanceType[] = [
  ...new Set(sanDuanChangQuan.moves.map((m) => m.expectedLeg)),
];

/** Unique hand profiles required across 三段长拳 (unarmed). */
export const SAN_DUAN_EXPECTED_HANDS: HandProfileType[] = [
  ...new Set(sanDuanChangQuan.moves.map((m) => m.expectedHand)),
];

export const SAN_DUAN_MOVE_COUNT = sanDuanChangQuan.moves.length;
