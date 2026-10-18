import type { HandProfileType, LegStanceType } from "./types";

const LEG_LABELS: Record<LegStanceType, { en: string; zh: string }> = {
  feet_together: { en: "Feet together", zh: "并步" },
  gong_bu: { en: "Bow stance", zh: "弓步" },
  ma_bu: { en: "Horse stance", zh: "马步" },
  xu_bu: { en: "Empty stance", zh: "虚步" },
  walking: { en: "Step / jump", zh: "行步/跳跃" },
  unknown: { en: "—", zh: "—" },
};

const HAND_LABELS: Record<HandProfileType, { en: string; zh: string }> = {
  salute: { en: "Salute", zh: "抱拳礼" },
  fist_waist: { en: "Fists at waist", zh: "抱拳" },
  punch_forward: { en: "Strike forward", zh: "冲拳/推掌" },
  guard_chest: { en: "Guard", zh: "格肘/护身" },
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
  if (moveId === "sdcq-11") {
    return lang === "zh" ? "歇步" : "Seated cross stance (xie bu)";
  }
  return legLabel(leg, lang);
}
