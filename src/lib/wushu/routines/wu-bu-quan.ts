import type { RoutineDefinition } from "../types";

/**
 * 五步拳 — 武术段位 / 国标入门左式。
 * This app uses a shortened six-move chain for 3D QA; poses follow the standard
 * 左弓步右冲拳 → 右腿弹踢左冲拳 → 马步架打 → 歇步盖冲左拳 → 提膝收势（完整套路另有仆步穿掌、虚步挑掌、并步抱拳）。
 */
export const wuBuQuan: RoutineDefinition = {
  id: "wu-bu-quan",
  name: "Wu Bu Quan (五步拳)",
  nameZh: "五步拳",
  weapon: "unarmed",
  description:
    "National introductory 五步拳 (left-side form): bow punch, snap kick punch, horse block-strike, cross-stance punch, knee lift close.",
  moves: [
    {
      id: "wbq-01",
      order: 1,
      name: "Opening — feet together + embrace fists",
      nameZh: "起势",
      expectedLeg: "feet_together",
      expectedHand: "fist_waist",
      coachTip:
        "并步：由开步收至两脚并拢，腿直，脚尖朝前。抱拳：体侧立掌→翻拳，拳朝前，肘侧视约45°。",
    },
    {
      id: "wbq-02",
      order: 2,
      name: "Left bow stance, right punch",
      nameZh: "弓步冲拳",
      expectedLeg: "gong_bu",
      expectedHand: "punch_forward",
      coachTip:
        "左弓步：左腿屈膝前弓、右腿蹬直。左手收抱腰间，右拳向前平冲（拳心向下），目视前方。",
    },
    {
      id: "wbq-03",
      order: 3,
      name: "Right snap kick, left punch",
      nameZh: "弹踢冲拳",
      expectedLeg: "ti_xi",
      expectedHand: "punch_forward",
      coachTip:
        "重心前移，右腿屈膝向前弹踢，脚面绷平；同时左拳前冲、右拳收抱腰间，上身正直，目视前方。",
    },
    {
      id: "wbq-04",
      order: 4,
      name: "Horse stance block and punch",
      nameZh: "马步架打",
      expectedLeg: "ma_bu",
      expectedHand: "block_elbow",
      coachTip:
        "右脚落地，左转成马步；左拳变掌屈臂上架，右拳向右侧冲拳，目视右方。",
    },
    {
      id: "wbq-05",
      order: 5,
      name: "Cross stance cover and left punch",
      nameZh: "歇步冲拳",
      expectedLeg: "xie_bu",
      expectedHand: "punch_forward",
      coachTip:
        "歇步盖打：左脚向右脚后插步，右掌向左下盖；两腿交叉下蹲成歇步，左拳平冲，右拳抱腰，目视左拳。",
    },
    {
      id: "wbq-06",
      order: 6,
      name: "Knee lift close (abbrev.)",
      nameZh: "提膝收势",
      expectedLeg: "ti_xi",
      expectedHand: "fist_waist",
      coachTip:
        "提膝收势（本应用缩写）：左腿提膝，双拳抱于腰间。完整国标套路此后接仆步穿掌、虚步挑掌、并步抱拳。",
    },
  ],
};
