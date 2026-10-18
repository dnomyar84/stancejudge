import type { RoutineDefinition } from "../types";

/** 武术段位制 — 三段长拳单练 (22 actions). */
export const sanDuanChangQuan: RoutineDefinition = {
  id: "san-duan-chang-quan",
  name: "San Duan Chang Quan",
  nameZh: "三段长拳",
  weapon: "unarmed",
  description:
    "22-move duanwei changquan solo: strikes, grabs, jumps, and five basic stances.",
  moves: [
    { id: "sdcq-01", order: 1, name: "Opening posture", nameZh: "起势", expectedLeg: "feet_together", expectedHand: "salute", coachTip: "Centered start, calm posture." },
    { id: "sdcq-02", order: 2, name: "Right bow stance block elbow", nameZh: "右弓步格肘", expectedLeg: "gong_bu", expectedHand: "guard_chest", coachTip: "Right bow, elbow block clear." },
    { id: "sdcq-03", order: 3, name: "Embrace fist snap kick", nameZh: "抱拳弹腿", expectedLeg: "xu_bu", expectedHand: "fist_waist", coachTip: "Snap kick with stable guard." },
    { id: "sdcq-04", order: 4, name: "Golden silk wrist wrap", nameZh: "金丝缠腕", expectedLeg: "gong_bu", expectedHand: "guard_chest", coachTip: "Circular wrist control, steady base." },
    { id: "sdcq-05", order: 5, name: "Horse stance punch", nameZh: "马步冲拳", expectedLeg: "ma_bu", expectedHand: "punch_forward", coachTip: "Wide ma bu, punch along center." },
    { id: "sdcq-06", order: 6, name: "Turn sweep palm push", nameZh: "转身平扫前推掌", expectedLeg: "gong_bu", expectedHand: "punch_forward", coachTip: "Turn, sweep, then push palm." },
    { id: "sdcq-07", order: 7, name: "Right bow raise fist", nameZh: "右弓步挑拳", expectedLeg: "gong_bu", expectedHand: "punch_forward", coachTip: "Bow stance, lifting strike." },
    { id: "sdcq-08", order: 8, name: "Waist flip knee push palm", nameZh: "翻腰提膝推掌", expectedLeg: "xu_bu", expectedHand: "punch_forward", coachTip: "Flip waist, knee up, push palm." },
    { id: "sdcq-09", order: 9, name: "Whirlwind kick", nameZh: "旋风脚", expectedLeg: "walking", expectedHand: "arms_spread", coachTip: "Jumping spin — full body visible." },
    { id: "sdcq-10", order: 10, name: "Empty stance guard palm", nameZh: "虚步护身掌", expectedLeg: "xu_bu", expectedHand: "guard_chest", coachTip: "Empty stance protecting palm." },
    { id: "sdcq-11", order: 11, name: "Cross stance punch", nameZh: "歇步冲拳", expectedLeg: "xu_bu", expectedHand: "punch_forward", coachTip: "歇步 seated low — crossed legs, hips near floor, then punch." },
    { id: "sdcq-12", order: 12, name: "Right bow block elbow", nameZh: "右弓步格肘", expectedLeg: "gong_bu", expectedHand: "guard_chest", coachTip: "Repeat block section — mirror first." },
    { id: "sdcq-13", order: 13, name: "Horse stance cut palm", nameZh: "马步切掌", expectedLeg: "ma_bu", expectedHand: "punch_forward", coachTip: "Ma bu, cutting palm down." },
    { id: "sdcq-14", order: 14, name: "Right bow punch", nameZh: "右弓步冲拳", expectedLeg: "gong_bu", expectedHand: "punch_forward", coachTip: "Straight punch in bow stance." },
    { id: "sdcq-15", order: 15, name: "Left bow diagonal push", nameZh: "左弓步斜推掌", expectedLeg: "gong_bu", expectedHand: "punch_forward", coachTip: "Diagonal palm push." },
    { id: "sdcq-16", order: 16, name: "Stamp bow double push", nameZh: "震脚弓步双推掌", expectedLeg: "gong_bu", expectedHand: "punch_forward", coachTip: "Stamp then double palm push." },
    { id: "sdcq-17", order: 17, name: "Left bow push palm", nameZh: "左弓步推掌", expectedLeg: "gong_bu", expectedHand: "punch_forward", coachTip: "Push palm from left bow." },
    { id: "sdcq-18", order: 18, name: "Turning chop palm", nameZh: "翻身劈掌", expectedLeg: "gong_bu", expectedHand: "punch_forward", coachTip: "Turn and chop palm." },
    { id: "sdcq-19", order: 19, name: "Jump flying kick", nameZh: "腾空飞脚", expectedLeg: "walking", expectedHand: "arms_spread", coachTip: "Jump kick — give camera space." },
    { id: "sdcq-20", order: 20, name: "Right bow punch", nameZh: "右弓步冲拳", expectedLeg: "gong_bu", expectedHand: "punch_forward", coachTip: "Land into bow punch." },
    { id: "sdcq-21", order: 21, name: "Horse stance guard fist", nameZh: "马步看拳", expectedLeg: "ma_bu", expectedHand: "fist_waist", coachTip: "Ma bu, guard at waist." },
    { id: "sdcq-22", order: 22, name: "Closing posture", nameZh: "收势", expectedLeg: "feet_together", expectedHand: "salute", coachTip: "Return to center and close." },
  ],
};
