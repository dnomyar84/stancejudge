export type Point2D = { x: number; y: number };

export function distance(a: Point2D, b: Point2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Angle at vertex `b` in degrees (0–180). */
export function angleAtVertex(a: Point2D, b: Point2D, c: Point2D): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (mag === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Deviation from vertical for segment a→b, in degrees (0 = upright). */
export function leanFromVertical(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return Math.abs(angle);
}

export function midpoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Map value into 0–100 where `ideal` is best and edges fall off linearly. */
export function scoreBand(
  value: number,
  ideal: number,
  tolerance: number,
  hardLimit: number,
): number {
  const diff = Math.abs(value - ideal);
  if (diff <= tolerance) return 100;
  if (diff >= hardLimit) return 0;
  return Math.round(100 * (1 - (diff - tolerance) / (hardLimit - tolerance)));
}
