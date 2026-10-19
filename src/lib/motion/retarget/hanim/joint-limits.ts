/** Flexion limits (degrees) for major hinge joints — conservative human ranges. */
export const JOINT_LIMITS_DEG = {
  knee: { min: 0, max: 150 },
  elbow: { min: 5, max: 150 },
  ankle: { min: -25, max: 35 },
} as const;

export function clampDeg(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Clamp knee/elbow flexion from interior angle at joint (degrees). */
export function clampInteriorFlex(
  angleDeg: number,
  kind: "knee" | "elbow",
): number {
  const { min, max } = JOINT_LIMITS_DEG[kind];
  const flex = 180 - angleDeg;
  return clampDeg(flex, min, max);
}
