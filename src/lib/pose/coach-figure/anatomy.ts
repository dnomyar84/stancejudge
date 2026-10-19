/**
 * Coach rig proportions vs standing stature (floor → chin ≈ `chin` on +up axis).
 * Lateral widths follow adult anthropometry (~26% biacromial, ~17% biiliac of stature).
 */
export const ANATOMY = {
  headTop: 1.0,
  chin: 0.92,
  shoulderUp: 0.78,
  hipUp: 0.52,
  kneeUp: 0.28,
  ankleUp: 0.0,
  /** Half of biacromial breadth (~26% of stature). */
  shoulderHalfWidth: 0.12,
  /** Half of bi-iliac breadth (~17% of stature). */
  hipHalfWidth: 0.078,
  thigh: 0.24,
  shin: 0.26,
  upperArm: 0.18,
  forearm: 0.15,
} as const;

/** Vertical stature used for ratio checks (same units as joint `.up`). */
export const COACH_STATURE_UP = ANATOMY.chin;

/** Convert a fraction of stature (0…1) to coach-space units on the up/lat axes. */
export function statureUnits(fractionOfStature: number): number {
  return COACH_STATURE_UP * fractionOfStature;
}
