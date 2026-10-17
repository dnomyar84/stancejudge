import { distance, midpoint } from "@/lib/pose/geometry";
import { getKeypoint, KP } from "@/lib/pose/keypoints";
import type { PoseKeypoint } from "@/lib/pose/types";

export type BodyAxes = {
  origin: { x: number; y: number };
  lateral: { x: number; y: number };
  forward: { x: number; y: number };
  scale: number;
};

function dot(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return a.x * b.x + a.y * b.y;
}

function normalize(v: { x: number; y: number }): { x: number; y: number } {
  const m = Math.hypot(v.x, v.y);
  if (m < 1e-6) return { x: 1, y: 0 };
  return { x: v.x / m, y: v.y / m };
}

/** Hip-centered frame: lateral along shoulders, forward toward the nose. */
export function estimateBodyAxes(keypoints: PoseKeypoint[]): BodyAxes | null {
  const ls = getKeypoint(keypoints, KP.left_shoulder);
  const rs = getKeypoint(keypoints, KP.right_shoulder);
  const lh = getKeypoint(keypoints, KP.left_hip);
  const rh = getKeypoint(keypoints, KP.right_hip);
  const nose = getKeypoint(keypoints, KP.nose);
  if (!ls || !rs || !lh || !rh || !nose) return null;

  const origin = midpoint(lh, rh);
  const shoulderMid = midpoint(ls, rs);
  const scale = Math.max(distance(shoulderMid, origin), 1);

  let lateral = normalize({ x: rs.x - ls.x, y: rs.y - ls.y });
  let forward = normalize({ x: -lateral.y, y: lateral.x });

  const shoulderSpan = distance(ls, rs) / scale;
  const noseVec = { x: nose.x - origin.x, y: nose.y - origin.y };

  // Profile / side-on to camera: shoulders foreshorten — face along shoulder line.
  if (shoulderSpan < 0.42) {
    forward = lateral;
    lateral = normalize({ x: -forward.y, y: forward.x });
    if (dot(noseVec, forward) < 0) {
      forward = { x: -forward.x, y: -forward.y };
      lateral = { x: -lateral.x, y: -lateral.y };
    }
  } else if (dot(noseVec, forward) < 0) {
    forward = { x: -forward.x, y: -forward.y };
  }

  return { origin, lateral, forward, scale };
}

export type BodyLocal = { lat: number; fwd: number; up: number };

export function toBodyLocal(
  point: { x: number; y: number },
  axes: BodyAxes,
): BodyLocal {
  const rel = { x: point.x - axes.origin.x, y: point.y - axes.origin.y };
  return {
    lat: dot(rel, axes.lateral) / axes.scale,
    fwd: dot(rel, axes.forward) / axes.scale,
    up: (axes.origin.y - point.y) / axes.scale,
  };
}

export function bodyLocalKeypoints(
  keypoints: PoseKeypoint[],
  axes: BodyAxes,
): Map<number, BodyLocal> {
  const out = new Map<number, BodyLocal>();
  keypoints.forEach((kp, index) => {
    if (!kp) return;
    out.set(index, toBodyLocal(kp, axes));
  });
  return out;
}
