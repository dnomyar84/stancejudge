export type Vec3 = { lat: number; fwd: number; up: number };

export function v(lat: number, fwd: number, up: number): Vec3 {
  return { lat, fwd, up };
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return { lat: a.lat + b.lat, fwd: a.fwd + b.fwd, up: a.up + b.up };
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return { lat: a.lat - b.lat, fwd: a.fwd - b.fwd, up: a.up - b.up };
}

export function scale(a: Vec3, s: number): Vec3 {
  return { lat: a.lat * s, fwd: a.fwd * s, up: a.up * s };
}

export function len(a: Vec3): number {
  return Math.hypot(a.lat, a.fwd, a.up);
}

export function normalize(a: Vec3): Vec3 {
  const m = len(a);
  if (m < 1e-8) return { lat: 0, fwd: 0, up: 1 };
  return scale(a, 1 / m);
}

/** Point on segment a→b at parameter t (0=a, 1=b). */
export function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    fwd: a.fwd + (b.fwd - a.fwd) * t,
    up: a.up + (b.up - a.up) * t,
  };
}
