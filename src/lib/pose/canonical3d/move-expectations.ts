import type { HandProfileType, LegStanceType } from "@/lib/wushu/types";
import type { FootAimKind, HandShapeKind, LegStanceKind } from "./vocabulary";

const LEG_MAP: Record<LegStanceType, LegStanceKind> = {
  feet_together: "bing_bu",
  gong_bu: "gong_bu",
  ma_bu: "ma_bu",
  xu_bu: "xu_bu",
  xie_bu: "xie_bu",
  ti_xi: "ti_xi",
  walking: "unknown",
  unknown: "unknown",
};

const HAND_MAP: Record<HandProfileType, HandShapeKind> = {
  salute: "bao_quan",
  fist_waist: "quan",
  punch_forward: "quan",
  push_palm: "tui_zhang",
  chop_palm: "zhang",
  double_push_palm: "tui_zhang",
  block_elbow: "jia_shou",
  lift_fist: "quan",
  wrist_wrap: "gou_shou",
  guard_chest: "zhang",
  jian_point: "jian_zhi",
  jian_guard: "chi_jian",
  arms_spread: "liang_zhang",
  unknown: "unknown",
};

export function legStanceFromProfile(leg: LegStanceType): LegStanceKind {
  return LEG_MAP[leg];
}

export function handShapeFromProfile(hand: HandProfileType): HandShapeKind {
  return HAND_MAP[hand];
}

/** Default foot aim hints until per-move 3D records exist. */
export function defaultFootAimForLeg(leg: LegStanceKind): {
  left: FootAimKind;
  right: FootAimKind;
} {
  switch (leg) {
    case "gong_bu":
      return { left: "toe_forward", right: "toe_forward" };
    case "ma_bu":
      return { left: "toe_out_45", right: "toe_out_45" };
    case "xu_bu":
      return { left: "foot_flat", right: "ball_of_foot" };
    case "xie_bu":
      return { left: "foot_flat", right: "foot_flat" };
    case "bing_bu":
      return { left: "toe_forward", right: "toe_forward" };
    case "ti_xi":
      return { left: "foot_flat", right: "heel_lift" };
    default:
      return { left: "unknown", right: "unknown" };
  }
}
