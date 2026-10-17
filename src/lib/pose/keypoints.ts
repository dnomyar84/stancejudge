import type { PoseKeypoint } from "./types";

/** BlazePose landmark indices (33-point model). */
export const KP = {
  nose: 0,
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28,
} as const;

const MIN_SCORE = 0.35;

export function getKeypoint(
  keypoints: PoseKeypoint[],
  index: number,
): { x: number; y: number } | null {
  const kp = keypoints[index];
  if (!kp) return null;
  const score = kp.score ?? 1;
  if (score < MIN_SCORE) return null;
  return { x: kp.x, y: kp.y };
}

export function hasFullLowerBody(keypoints: PoseKeypoint[]): boolean {
  return (
    getKeypoint(keypoints, KP.left_hip) !== null &&
    getKeypoint(keypoints, KP.right_hip) !== null &&
    getKeypoint(keypoints, KP.left_knee) !== null &&
    getKeypoint(keypoints, KP.right_knee) !== null &&
    getKeypoint(keypoints, KP.left_ankle) !== null &&
    getKeypoint(keypoints, KP.right_ankle) !== null
  );
}

export function landmarksToKeypoints(
  landmarks: { x: number; y: number; visibility?: number }[],
  width: number,
  height: number,
): PoseKeypoint[] {
  return landmarks.map((lm) => ({
    x: lm.x * width,
    y: lm.y * height,
    score: lm.visibility ?? 1,
  }));
}
