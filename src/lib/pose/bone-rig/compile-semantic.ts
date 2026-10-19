import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import type { MixamoAvatar } from "@/lib/motion/retarget/hanim/apply-coach-to-mixamo";
import { applyCoachPoseToMixamo } from "@/lib/motion/retarget/hanim/apply-coach-to-mixamo";
import type * as THREE from "three";
import { captureCoachBonePose } from "./capture-apply";
import type { CoachBonePoseV1 } from "./schema";

/**
 * One-time compile: semantic coach pose → Mixamo limb IK → bone snapshot.
 * Author `bone` on keyframes directly when this compile is not good enough.
 */
export function compileCoachBonePoseFromSemantic(
  THREE: typeof import("three"),
  avatar: MixamoAvatar,
  pose: ExtendedCoachPose,
): CoachBonePoseV1 {
  applyCoachPoseToMixamo(THREE, avatar, pose);
  return captureCoachBonePose(avatar);
}
