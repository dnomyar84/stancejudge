import { buildWuBuCoachSkeleton } from "../coach-figure/poses-wu-bu";
import {
  defaultFeetForSkeleton,
  defaultHandsForSkeleton,
  extendedFromSkeleton,
  type ExtendedCoachPose,
} from "../coach-figure/extended-pose";
import { wbq01EndPose } from "./wbq-01-opening";

export function wbqDingPose(moveId: string): ExtendedCoachPose {
  if (moveId === "wbq-01") return wbq01EndPose();
  const sk = buildWuBuCoachSkeleton(moveId);
  if (!sk) return wbq01EndPose();
  const hands = defaultHandsForSkeleton(sk);
  const feet = defaultFeetForSkeleton(sk);
  return {
    skeleton: sk,
    leftHand: hands.left,
    rightHand: hands.right,
    leftFoot: feet.left,
    rightFoot: feet.right,
  };
}

export function wbqDingPoseFromSkeleton(
  sk: NonNullable<ReturnType<typeof buildWuBuCoachSkeleton>>,
): ExtendedCoachPose {
  return extendedFromSkeleton(sk);
}
