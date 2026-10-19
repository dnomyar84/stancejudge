import type { RoutineDefinition } from "../types";

/** 五步拳 — 武术段位 / 国标入门左式（完整九段）。 */
export const wuBuQuan: RoutineDefinition = {
  id: "wu-bu-quan",
  name: "Wu Bu Quan (五步拳)",
  nameZh: "五步拳",
  weapon: "unarmed",
  description:
    "Full national introductory 五步拳 (left-side form) for 3D visual coach and stance QA.",
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
      name: "Knee lift, palm thrust",
      nameZh: "提膝穿掌",
      expectedLeg: "ti_xi",
      expectedHand: "push_palm",
      coachTip:
        "两腿起立左转；左拳变掌收至右腋下，右拳变掌经左手背向前穿出，手心向上；同时左腿屈膝提起，目视右掌。",
    },
    {
      id: "wbq-07",
      order: 7,
      name: "Drop stance palm along leg",
      nameZh: "仆步穿掌",
      expectedLeg: "walking",
      expectedHand: "push_palm",
      coachTip:
        "左脚落地成仆步；左掌指朝前，沿左腿内侧穿至左脚面，目视左掌。",
    },
    {
      id: "wbq-08",
      order: 8,
      name: "Empty stance, rising palm",
      nameZh: "虚步挑掌",
      expectedLeg: "xu_bu",
      expectedHand: "chop_palm",
      coachTip:
        "左腿屈膝前弓，右脚前上成右虚步；左手向后划弧成勾手，右手顺右腿外侧向上挑掌，目视前方。",
    },
    {
      id: "wbq-09",
      order: 9,
      name: "Close — feet together, embrace fists",
      nameZh: "并步抱拳",
      expectedLeg: "feet_together",
      expectedHand: "fist_waist",
      coachTip:
        "左脚向右脚并拢成并步；左勾手、右掌变拳，回收抱于腰间，目视前方。",
    },
  ],
};
