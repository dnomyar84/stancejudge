import type { Vec3 } from "./vec3";

export type CoachCamera = {
  /** Horizontal orbit around body (degrees). ~40 = 3/4 coach view. */
  azimuthDeg: number;
  /** Tilt down toward floor (degrees). */
  elevationDeg: number;
};

const DEFAULT_CAMERA: CoachCamera = {
  azimuthDeg: 38,
  elevationDeg: 6,
};

export function defaultCoachCamera(): CoachCamera {
  return { ...DEFAULT_CAMERA };
}

/** Orthographic 3D body → canvas (upright, no skew). */
export function projectCoachPoint(
  p: Vec3,
  camera: CoachCamera,
  canvasSize: number,
): { x: number; y: number } {
  const az = (camera.azimuthDeg * Math.PI) / 180;
  const el = (camera.elevationDeg * Math.PI) / 180;
  const ca = Math.cos(az);
  const sa = Math.sin(az);
  const ce = Math.cos(el);
  const se = Math.sin(el);

  const xBody = p.lat * ca - p.fwd * sa;
  const zDepth = p.lat * sa + p.fwd * ca;
  const yBody = p.up * ce + zDepth * se;

  const scale = canvasSize * 0.52;
  const cx = canvasSize / 2;
  const footPad = canvasSize * 0.08;

  return {
    x: cx + xBody * scale,
    y: canvasSize - footPad - yBody * scale,
  };
}

export function alignFigureToFloor(
  points: { x: number; y: number }[],
  canvasSize: number,
  floorMargin = 0.06,
): { x: number; y: number }[] {
  const floorY = canvasSize * (1 - floorMargin);
  const maxY = Math.max(...points.map((p) => p.y));
  const shift = floorY - maxY;
  return points.map((p) => ({ x: p.x, y: p.y + shift }));
}
