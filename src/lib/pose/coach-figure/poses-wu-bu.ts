import { wbq01EndPose } from "../choreography/wbq-01-opening";
import {
  skeletonGongBuChongQuan,
  skeletonMaBuJiaDaDing,
  skeletonTanTiChongQuanDing,
  skeletonTiXiShouShiDing,
  skeletonXieBuChongQuanDing,
} from "../choreography/wbq-standard";
import type { CoachSkeleton } from "./skeleton";

/** Map 五步拳 move ids to coach skeleton recipes (国标左式定势). */
export function buildWuBuCoachSkeleton(moveId: string): CoachSkeleton | null {
  switch (moveId) {
    case "wbq-01":
      return wbq01EndPose().skeleton;
    case "wbq-02":
      return skeletonGongBuChongQuan();
    case "wbq-03":
      return skeletonTanTiChongQuanDing();
    case "wbq-04":
      return skeletonMaBuJiaDaDing();
    case "wbq-05":
      return skeletonXieBuChongQuanDing();
    case "wbq-06":
      return skeletonTiXiShouShiDing();
    default:
      return null;
  }
}
