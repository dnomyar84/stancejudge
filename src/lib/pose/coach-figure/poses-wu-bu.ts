import { wbq01EndPose } from "@/lib/disciplines/wushu/choreography/wbq-01-opening";
import {
  skeletonGongBuChongQuan,
  skeletonMaBuJiaDaDing,
  skeletonPuBuChuanZhangDing,
  skeletonTanTiChongQuanDing,
  skeletonTiXiChuanZhangDing,
  skeletonXieBuChongQuanDing,
  skeletonXuBuTiaoZhangDing,
} from "@/lib/disciplines/wushu/choreography/wbq-standard";
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
      return skeletonTiXiChuanZhangDing();
    case "wbq-07":
      return skeletonPuBuChuanZhangDing();
    case "wbq-08":
      return skeletonXuBuTiaoZhangDing();
    case "wbq-09":
      return wbq01EndPose().skeleton;
    default:
      return null;
  }
}
