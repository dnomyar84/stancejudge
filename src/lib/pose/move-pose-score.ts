import { estimateBodyAxes, toBodyLocal } from "./body-frame";
import { getKeypoint, KP } from "./keypoints";
import type { PoseKeypoint } from "./types";
import { buildMoveTemplateKeypoints } from "./move-pose-template";

const JOINTS = [
  KP.left_shoulder,
  KP.right_shoulder,
  KP.left_elbow,
  KP.right_elbow,
  KP.left_wrist,
  KP.right_wrist,
  KP.left_hip,
  KP.right_hip,
  KP.left_knee,
  KP.right_knee,
  KP.left_ankle,
  KP.right_ankle,
] as const;

/**
 * 0–100 similarity of live/video pose to the syllabus stick template for this move.
 * Same geometry source as rail thumbnails — scoring and UI aligned.
 */
export function scoreMoveTemplateSimilarity(
  routineId: string,
  moveId: string,
  keypoints: PoseKeypoint[],
  fallbackLeg: Parameters<typeof buildMoveTemplateKeypoints>[2],
  fallbackHand: Parameters<typeof buildMoveTemplateKeypoints>[3],
): number | null {
  const template = buildMoveTemplateKeypoints(
    routineId,
    moveId,
    fallbackLeg,
    fallbackHand,
  );
  const axes = estimateBodyAxes(keypoints);
  if (!axes) return null;

  const templateAxes = estimateBodyAxes(template);
  if (!templateAxes) return null;

  let err = 0;
  let n = 0;
  for (const idx of JOINTS) {
    const live = getKeypoint(keypoints, idx);
    const ref = getKeypoint(template, idx);
    if (!live || !ref) continue;
    const a = toBodyLocal(live, axes);
    const b = toBodyLocal(ref, templateAxes);
    const d = Math.hypot(a.lat - b.lat, a.fwd - b.fwd, a.up - b.up);
    err += d;
    n++;
  }
  if (n < 6) return null;
  const mean = err / n;
  return Math.round(Math.max(0, Math.min(100, 100 - mean * 55)));
}
