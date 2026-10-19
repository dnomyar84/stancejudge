import type { CoachBonePoseV1 } from "./schema";

/** Filled at runtime after first avatar load (bind pose snapshot). */
let cachedBindPose: CoachBonePoseV1 | null = null;

export function setCachedBindBonePose(pose: CoachBonePoseV1): void {
  cachedBindPose = pose;
}

export function getCachedBindBonePose(): CoachBonePoseV1 | null {
  return cachedBindPose;
}
