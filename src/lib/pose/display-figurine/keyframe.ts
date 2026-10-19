import type { RigKeyframe } from "@/lib/pose/canonical3d/choreography";
import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import { extendedToCoachFigurinePose } from "@/lib/pose/mannequin-adapter/coach-pose-to-mannequin";
import type { CoachFigurinePoseV1 } from "./coach-figurine-pose";

type KeyframeInit = Omit<RigKeyframe, "pose" | "figurine"> & {
  pose: ExtendedCoachPose;
  /** When omitted, figurine is compiled from `pose` once at authoring time. */
  figurine?: CoachFigurinePoseV1;
};

/**
 * Build a choreography keyframe with paired semantic + display layers.
 * For display truth, pass an explicit `figurine` (tuned in lab / posture editor).
 */
export function rigKeyframe(init: KeyframeInit): RigKeyframe {
  return {
    ...init,
    figurine: init.figurine ?? extendedToCoachFigurinePose(init.pose),
  };
}
