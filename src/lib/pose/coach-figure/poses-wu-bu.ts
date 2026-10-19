import { wbq01EndPose } from "../choreography/wbq-01-opening";
import type { CoachSkeleton } from "./skeleton";
import {
  armsBlockElbow,
  armsFistWaist,
  armsPunchForward,
  baseStandingTorso,
  legsGongBu,
  legsMaBu,
  legsTiXi,
  legsXieBu,
  mergeSkeleton,
} from "./skeleton";

function pose(
  legs: Partial<CoachSkeleton>,
  arms: Partial<CoachSkeleton>,
): CoachSkeleton {
  return mergeSkeleton([baseStandingTorso(), legs, arms]);
}

/** Map 五步拳 move ids to coach skeleton recipes (reuse changquan builders). */
export function buildWuBuCoachSkeleton(moveId: string): CoachSkeleton | null {
  switch (moveId) {
    case "wbq-01":
      return wbq01EndPose().skeleton;
    case "wbq-02":
      return pose(legsGongBu("right"), armsPunchForward("right"));
    case "wbq-03":
      return pose(legsTiXi(), armsPunchForward("right"));
    case "wbq-04":
      return pose(legsMaBu(), armsBlockElbow());
    case "wbq-05":
      return pose(legsXieBu(), armsPunchForward("right"));
    case "wbq-06":
      return pose(legsTiXi(), armsFistWaist());
    default:
      return null;
  }
}
