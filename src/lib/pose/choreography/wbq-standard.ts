/**
 * 五步拳 — 武术段位 / 国标入门套路（左式）定势要点。
 */
import type { CoachSkeleton } from "../coach-figure/skeleton";
import {
  armsBlockElbow,
  armsPuBuChuanZhang,
  armsPunchForward,
  armsTiXiChuanZhang,
  armsXuBuTiaoZhang,
  baseStandingTorso,
  legsGongBu,
  legsMaBu,
  legsPuBu,
  legsRightSnapKickStrike,
  legsTiXi,
  legsWuBuRightXuBu,
  legsXieBu,
  mergeSkeleton,
} from "../coach-figure/skeleton";

/** Front bow leg in the standard left-side 五步拳 chain. */
export const WBQ_GONG_BU_LEAD: "left" | "right" = "left";

/** Opposite-side straight punch from a bow stance (左弓步 → 右冲拳). */
export function armsChongQuanFromGongBu(lead: "left" | "right"): Pick<
  CoachSkeleton,
  "leftElbow" | "rightElbow" | "leftWrist" | "rightWrist"
> {
  const punchSide = lead === "left" ? "right" : "left";
  return armsPunchForward(punchSide);
}

export function skeletonGongBuChongQuan(
  lead: "left" | "right" = WBQ_GONG_BU_LEAD,
): CoachSkeleton {
  return mergeSkeleton([
    baseStandingTorso(),
    legsGongBu(lead),
    armsChongQuanFromGongBu(lead),
  ]);
}

export function skeletonTanTiChongQuanDing(): CoachSkeleton {
  return mergeSkeleton([
    baseStandingTorso(),
    legsRightSnapKickStrike(),
    armsPunchForward("left"),
  ]);
}

export function skeletonMaBuJiaDaDing(): CoachSkeleton {
  return mergeSkeleton([baseStandingTorso(), legsMaBu(), armsBlockElbow()]);
}

export function skeletonXieBuChongQuanDing(): CoachSkeleton {
  return mergeSkeleton([
    baseStandingTorso(),
    legsXieBu(),
    armsPunchForward("left"),
  ]);
}

/** 提膝穿掌定势：左提膝，右穿掌。 */
export function skeletonTiXiChuanZhangDing(): CoachSkeleton {
  return mergeSkeleton([
    baseStandingTorso(),
    legsTiXi("left"),
    armsTiXiChuanZhang(),
  ]);
}

/** 仆步穿掌定势：左仆步，左掌穿至脚面。 */
export function skeletonPuBuChuanZhangDing(): CoachSkeleton {
  return mergeSkeleton([
    baseStandingTorso(),
    legsPuBu("left"),
    armsPuBuChuanZhang(),
  ]);
}

/** 虚步挑掌定势：右虚步，左勾右挑。 */
export function skeletonXuBuTiaoZhangDing(): CoachSkeleton {
  return mergeSkeleton([
    baseStandingTorso(),
    legsWuBuRightXuBu(),
    armsXuBuTiaoZhang(),
  ]);
}

export function isLeftGongBuFront(sk: CoachSkeleton): boolean {
  return sk.leftAnkle.fwd > sk.rightAnkle.fwd + 0.15;
}

export function isRightPunchExtended(sk: CoachSkeleton): boolean {
  return sk.rightWrist.fwd > sk.leftWrist.fwd + 0.2;
}

export function isLeftPunchExtended(sk: CoachSkeleton): boolean {
  return sk.leftWrist.fwd > sk.rightWrist.fwd + 0.2;
}
