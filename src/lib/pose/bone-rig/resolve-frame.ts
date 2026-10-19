import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import type { CoachBonePoseV1 } from "./schema";
import { lerpCoachBonePose } from "./lerp-bone-pose";

export type BoneKeyframeLike = {
  bone?: CoachBonePoseV1;
  pose: ExtendedCoachPose;
};

/** Runtime fallback when bone was not authored — caller must compile with avatar. */
export type BonePoseResolver = (pose: ExtendedCoachPose) => CoachBonePoseV1;

export function resolveBoneAtKeyframe(
  kf: BoneKeyframeLike,
  compile: BonePoseResolver,
): CoachBonePoseV1 {
  if (kf.bone) return kf.bone;
  return compile(kf.pose);
}

export function resolveBoneBetweenKeyframes(
  from: BoneKeyframeLike,
  to: BoneKeyframeLike,
  t: number,
  compile: BonePoseResolver,
): CoachBonePoseV1 {
  const a = resolveBoneAtKeyframe(from, compile);
  const b = resolveBoneAtKeyframe(to, compile);
  if (from.bone && to.bone) {
    return lerpCoachBonePose(from.bone, to.bone, t);
  }
  return lerpCoachBonePose(a, b, t);
}
