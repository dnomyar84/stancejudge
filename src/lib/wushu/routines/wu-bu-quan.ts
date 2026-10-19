import type { RoutineDefinition } from "../types";

/** 五步拳 — short QA routine for 3D pose lab (names to confirm with coach). */
export const wuBuQuan: RoutineDefinition = {
  id: "wu-bu-quan",
  name: "Wu Bu Quan (五步拳)",
  nameZh: "五步拳",
  weapon: "unarmed",
  description:
    "Foundational five-step fist form for stance and hand-shape checks in the 3D pose lab.",
  moves: [
    {
      id: "wbq-01",
      order: 1,
      name: "Opening — feet together, salute",
      nameZh: "起势并步抱拳",
      expectedLeg: "feet_together",
      expectedHand: "salute",
      coachTip: "并步，抱拳于胸前，立身中正。",
    },
    {
      id: "wbq-02",
      order: 2,
      name: "Bow stance punch",
      nameZh: "弓步冲拳",
      expectedLeg: "gong_bu",
      expectedHand: "punch_forward",
      coachTip: "左弓步，右冲拳，拳眼向上，后腿绷直。",
    },
    {
      id: "wbq-03",
      order: 3,
      name: "Snap kick punch",
      nameZh: "弹踢冲拳",
      expectedLeg: "ti_xi",
      expectedHand: "punch_forward",
      coachTip: "弹踢高度适中，落脚成弓步冲拳。",
    },
    {
      id: "wbq-04",
      order: 4,
      name: "Horse stance block",
      nameZh: "马步架打",
      expectedLeg: "ma_bu",
      expectedHand: "block_elbow",
      coachTip: "马步开立，两臂交叉架打。",
    },
    {
      id: "wbq-05",
      order: 5,
      name: "Cross stance punch",
      nameZh: "歇步冲拳",
      expectedLeg: "xie_bu",
      expectedHand: "punch_forward",
      coachTip: "歇步坐实，冲拳与胯同向。",
    },
    {
      id: "wbq-06",
      order: 6,
      name: "Closing — knee lift",
      nameZh: "提膝收势",
      expectedLeg: "ti_xi",
      expectedHand: "fist_waist",
      coachTip: "提膝平衡，收拳收势。",
    },
  ],
};
