import type { HandProfileType, LegStanceType } from "./types";

const LEG_LABELS: Record<LegStanceType, { en: string; zh: string }> = {
  feet_together: { en: "Feet together", zh: "并步" },
  gong_bu: { en: "Bow stance", zh: "弓步" },
  ma_bu: { en: "Horse stance", zh: "马步" },
  xu_bu: { en: "Empty stance", zh: "虚步" },
  xie_bu: { en: "Seated cross stance", zh: "歇步" },
  ti_xi: { en: "Raised knee", zh: "提膝" },
  walking: { en: "Step / jump", zh: "行步/跳跃" },
  unknown: { en: "—", zh: "—" },
};

const HAND_LABELS: Record<HandProfileType, { en: string; zh: string }> = {
  salute: { en: "Salute", zh: "抱拳礼" },
  fist_waist: { en: "Fists at waist", zh: "抱拳" },
  punch_forward: { en: "Punch forward", zh: "冲拳" },
  push_palm: { en: "Push palm", zh: "推掌" },
  chop_palm: { en: "Chop palm", zh: "劈掌/切掌" },
  double_push_palm: { en: "Double push", zh: "双推掌" },
  block_elbow: { en: "Block elbow", zh: "格肘" },
  lift_fist: { en: "Raising fist", zh: "挑拳" },
  wrist_wrap: { en: "Wrist wrap", zh: "缠腕" },
  guard_chest: { en: "Guard", zh: "护身掌" },
  jian_point: { en: "Sword point", zh: "点/刺剑" },
  jian_guard: { en: "Sword guard", zh: "持剑" },
  arms_spread: { en: "Arms spread", zh: "展臂" },
  unknown: { en: "—", zh: "—" },
};

export function legLabel(leg: LegStanceType, lang: "en" | "zh" = "zh"): string {
  return LEG_LABELS[leg][lang];
}

export function handLabel(hand: HandProfileType, lang: "en" | "zh" = "zh"): string {
  return HAND_LABELS[hand][lang];
}

/** Syllabus-specific leg names where enum is a coarse scorer bucket. */
export function legLabelForMove(
  moveId: string | undefined,
  leg: LegStanceType,
  lang: "en" | "zh" = "zh",
): string {
  return legLabel(leg, lang);
}
