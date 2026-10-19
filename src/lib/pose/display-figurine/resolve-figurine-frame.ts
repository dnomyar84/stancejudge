import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import { extendedToCoachFigurinePose } from "@/lib/pose/mannequin-adapter/coach-pose-to-mannequin";
import type { CoachFigurinePoseV1 } from "./coach-figurine-pose";
import { lerpCoachFigurinePose } from "./lerp-coach-figurine-pose";

export type FigurineKeyframeLike = {
  figurine?: CoachFigurinePoseV1;
  pose: ExtendedCoachPose;
};

/**
 * Display path: use stored figurine when present; otherwise compile once from semantic skeleton.
 */
export function resolveFigurineAtKeyframe(kf: FigurineKeyframeLike): CoachFigurinePoseV1 {
  if (kf.figurine) return kf.figurine;
  return extendedToCoachFigurinePose(kf.pose);
}

export function resolveFigurineBetweenKeyframes(
  from: FigurineKeyframeLike,
  to: FigurineKeyframeLike,
  t: number,
): CoachFigurinePoseV1 {
  const a = resolveFigurineAtKeyframe(from);
  const b = resolveFigurineAtKeyframe(to);
  if (from.figurine && to.figurine) {
    return lerpCoachFigurinePose(from.figurine, to.figurine, t);
  }
  return lerpCoachFigurinePose(a, b, t);
}
