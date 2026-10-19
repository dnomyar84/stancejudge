/**
 * 五步拳 — 武术段位 / 国标入门套路（左式）定势要点。
 * QA routine uses a shortened move list (wbq-01…06); poses follow the standard left-side form.
 */
import type { CoachSkeleton } from "../coach-figure/skeleton";
import {
  armsBlockElbow,
  armsFistWaist,
  armsPunchForward,
  baseStandingTorso,
  legsGongBu,
  legsMaBu,
  legsRightSnapKickChamber,
  legsRightSnapKickStrike,
  legsTiXi,
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

/** 弹腿冲拳定势：右腿弹击，左拳前冲，右拳抱腰。 */
export function skeletonTanTiChongQuanDing(): CoachSkeleton {
  return mergeSkeleton([
    baseStandingTorso(),
    legsRightSnapKickStrike(),
    armsPunchForward("left"),
  ]);
}

/** 马步架打定势：左掌上架，右拳侧向冲拳。 */
export function skeletonMaBuJiaDaDing(): CoachSkeleton {
  return mergeSkeleton([baseStandingTorso(), legsMaBu(), armsBlockElbow()]);
}

/** 歇步冲拳定势（歇步盖打之冲拳）：左拳平冲，右拳抱腰。 */
export function skeletonXieBuChongQuanDing(): CoachSkeleton {
  return mergeSkeleton([
    baseStandingTorso(),
    legsXieBu(),
    armsPunchForward("left"),
  ]);
}

/** 提膝收势（缩写收势）：左提膝，双拳抱腰。 */
export function skeletonTiXiShouShiDing(): CoachSkeleton {
  return mergeSkeleton([
    baseStandingTorso(),
    legsTiXi("left"),
    armsFistWaist(),
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

export { legsRightSnapKickChamber, legsRightSnapKickStrike };
