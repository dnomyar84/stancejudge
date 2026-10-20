import { WUBUQUAN } from "./routines/wubuquan";

export type PoseCategory =
  | "五步拳"
  | "Foundations"
  | "Stances & techniques"
  | "Transition keyframes"
  | "Hand gestures";

export type PoseDefinition = {
  id: string;
  name: string;
  chinese: string;
  category: PoseCategory;
  description: string;
  program: string;
  transitional?: boolean;
  /** Named routine this pose belongs to. Previous and Next follow library order. */
  routine?: string;
  /** Short label inside the routine, such as "起势", "3", or "收势". */
  step?: string;
};

const pose = (
  id: string,
  name: string,
  chinese: string,
  category: PoseCategory,
  description: string,
  program: string,
  transitional = false,
): PoseDefinition => ({ id, name, chinese, category, description, program: program.trim(), transitional });

const MA_BU = `
joint hips flex 20
joint l_thigh flex 45 abduct 38 twist -12
joint l_shin flex 72
joint l_foot flex 22 abduct 8
joint r_thigh flex 45 abduct 38 twist -12
joint r_shin flex 72
joint r_foot flex 22 abduct 8`;

const LEFT_XU_BU = `
joint hips flex 18 twist -8
joint r_thigh flex 42 abduct 20
joint r_shin flex 68
joint r_foot flex 20
joint l_thigh flex 68 abduct 12
joint l_shin flex 88
joint l_foot flex -12`;

const RIGHT_XU_BU = LEFT_XU_BU
  .replaceAll("r_", "TEMP_")
  .replaceAll("l_", "r_")
  .replaceAll("TEMP_", "l_")
  .replace("twist -8", "twist 8");

const GUARD = `
joint l_upper_arm flex 62 abduct 24 twist -35
joint l_forearm flex 92 twist -35
joint l_hand flex 12
joint r_upper_arm flex 62 abduct 24 twist -35
joint r_forearm flex 92 twist -35
joint r_hand flex 12
hand left palm
hand right palm`;

export const POSE_LIBRARY: PoseDefinition[] = [
  ...WUBUQUAN,
  pose("wuji", "Neutral stance", "无极式", "Foundations", "Relaxed standing reference pose.", `stand`),
  pose("kaibu", "Ready stance", "开步预备式", "Foundations", "Open ready stance with fists chambered by the waist.", `
    stand
    joint l_thigh abduct 10
    joint r_thigh abduct 10
    joint l_upper_arm flex -35 abduct 4
    joint r_upper_arm flex -35 abduct 4
    joint l_forearm flex 105
    joint r_forearm flex 105
    hand left fist
    hand right fist`),
  pose("baoquan", "Fist-palm salute", "抱拳礼", "Foundations", "Traditional greeting: right fist covered by the left palm.", `
    stand
    joint l_upper_arm flex 62 abduct 28 twist -35
    joint l_forearm flex 105 twist -55
    joint l_hand flex 12
    joint r_upper_arm flex 58 abduct 18 twist -55
    joint r_forearm flex 110 twist 55
    joint r_hand flex 8
    hand left palm
    hand right fist`),

  pose("mabu-guard", "Horse stance guard", "马步架掌", "Stances & techniques", "Low horse stance with an open two-hand guard.", `stand\n${MA_BU}\n${GUARD}`),
  pose("mabu-chamber", "Horse stance chamber", "马步抱拳", "Stances & techniques", "Horse stance with both fists chambered at the hips.", `
    stand
    ${MA_BU}
    joint l_upper_arm flex -45
    joint l_forearm flex 110
    joint r_upper_arm flex -45
    joint r_forearm flex 110
    hand left fist
    hand right fist`),
  pose("mabu-left-punch", "Horse stance left punch", "马步左冲拳", "Stances & techniques", "Level left punch from horse stance.", `
    stand
    ${MA_BU}
    joint l_upper_arm flex 82 twist -80
    joint l_forearm flex 8 twist -80
    joint r_upper_arm flex -45
    joint r_forearm flex 110
    hand left fist
    hand right fist`),
  pose("mabu-right-punch", "Horse stance right punch", "马步右冲拳", "Stances & techniques", "Level right punch from horse stance.", `
    stand
    ${MA_BU}
    joint r_upper_arm flex 82 twist -80
    joint r_forearm flex 8 twist -80
    joint l_upper_arm flex -45
    joint l_forearm flex 110
    hand left fist
    hand right fist`),
  pose("right-gongbu-left-punch", "Right bow stance, left punch", "右弓步左冲拳", "Stances & techniques", "Right leg leads; left fist punches and right fist chambers.", `stand\nright gong bu left punch`),
  pose("left-gongbu-right-punch", "Left bow stance, right punch", "左弓步右冲拳", "Stances & techniques", "Left leg leads; right fist punches and left fist chambers.", `stand\nleft gong bu right punch`),
  pose("right-gongbu-left-palm", "Right bow stance, left palm", "右弓步左推掌", "Stances & techniques", "Right bow stance with a forward left palm strike.", `
    stand
    right gong bu left punch
    joint l_hand flex -12
    hand left palm`),
  pose("left-gongbu-right-palm", "Left bow stance, right palm", "左弓步右推掌", "Stances & techniques", "Left bow stance with a forward right palm strike.", `
    stand
    left gong bu right punch
    joint r_hand flex -12
    hand right palm`),
  pose("left-xubu", "Left empty stance guard", "左虚步亮掌", "Stances & techniques", "Weight stays on the rear leg; the left toes touch lightly.", `stand\n${LEFT_XU_BU}\n${GUARD}`),
  pose("right-xubu", "Right empty stance guard", "右虚步亮掌", "Stances & techniques", "Weight stays on the rear leg; the right toes touch lightly.", `stand\n${RIGHT_XU_BU}\n${GUARD}`),
  pose("left-pubu", "Left drop stance palm", "左仆步穿掌", "Stances & techniques", "Deep right squat with the left leg extended and left palm threading outward.", `
    stand
    joint hips flex 28 twist -18
    joint spine flex 26 abduct -18
    joint r_thigh flex 112 abduct 30 twist -18
    joint r_shin flex 125
    joint r_foot flex 30
    joint l_thigh flex 12 abduct 45 twist 18
    joint l_shin flex 8
    joint l_foot flex -6
    joint l_upper_arm flex 72 abduct 62 twist -35
    joint l_forearm flex 10
    joint r_upper_arm flex 35 abduct 25
    joint r_forearm flex 85
    hand left palm
    hand right palm`),
  pose("right-pubu", "Right drop stance palm", "右仆步穿掌", "Stances & techniques", "Deep left squat with the right leg extended and right palm threading outward.", `
    stand
    joint hips flex 28 twist 18
    joint spine flex 26 abduct 18
    joint l_thigh flex 112 abduct 30 twist -18
    joint l_shin flex 125
    joint l_foot flex 30
    joint r_thigh flex 12 abduct 45 twist 18
    joint r_shin flex 8
    joint r_foot flex -6
    joint r_upper_arm flex 72 abduct 62 twist -35
    joint r_forearm flex 10
    joint l_upper_arm flex 35 abduct 25
    joint l_forearm flex 85
    hand left palm
    hand right palm`),
  pose("left-xiebu", "Left cross stance guard", "左歇步架掌", "Stances & techniques", "Crossed low stance with the left leg wrapping in front.", `
    stand
    joint hips flex 28 twist -22
    joint l_thigh flex 74 abduct -18 twist -30
    joint l_shin flex 105
    joint r_thigh flex 82 abduct 22 twist 25
    joint r_shin flex 118
    ${GUARD}`),
  pose("right-xiebu", "Right cross stance guard", "右歇步架掌", "Stances & techniques", "Crossed low stance with the right leg wrapping in front.", `
    stand
    joint hips flex 28 twist 22
    joint r_thigh flex 74 abduct -18 twist -30
    joint r_shin flex 105
    joint l_thigh flex 82 abduct 22 twist 25
    joint l_shin flex 118
    ${GUARD}`),
  pose("left-duli", "Left one-leg stance", "左独立步", "Stances & techniques", "Balance on the right leg with the left knee raised.", `
    stand
    joint l_thigh flex 82 abduct 12
    joint l_shin flex 105
    joint l_foot flex -12
    joint r_thigh flex 8
    joint r_shin flex 12
    ${GUARD}`),
  pose("right-duli", "Right one-leg stance", "右独立步", "Stances & techniques", "Balance on the left leg with the right knee raised.", `
    stand
    joint r_thigh flex 82 abduct 12
    joint r_shin flex 105
    joint r_foot flex -12
    joint l_thigh flex 8
    joint l_shin flex 12
    ${GUARD}`),
  pose("left-side-stance", "Left side stance", "左横裆步", "Stances & techniques", "Wide lateral stance facing over the left side.", `
    stand
    joint hips flex 16 twist -25
    joint chest twist -18
    joint l_thigh flex 66 abduct 38 twist -24
    joint l_shin flex 80
    joint r_thigh flex 10 abduct 42 twist 20
    joint r_shin flex 12
    ${GUARD}`),
  pose("right-side-stance", "Right side stance", "右横裆步", "Stances & techniques", "Wide lateral stance facing over the right side.", `
    stand
    joint hips flex 16 twist 25
    joint chest twist 18
    joint r_thigh flex 66 abduct 38 twist -24
    joint r_shin flex 80
    joint l_thigh flex 10 abduct 42 twist 20
    joint l_shin flex 12
    ${GUARD}`),

  pose("kf-double-chamber", "Keyframe: double chamber", "过渡：双抱拳", "Transition keyframes", "Preparation keyframe before alternating punches.", `
    stand
    joint hips flex 12
    joint l_upper_arm flex -50
    joint l_forearm flex 112
    joint r_upper_arm flex -50
    joint r_forearm flex 112
    hand left fist
    hand right fist`, true),
  pose("kf-shift-right", "Keyframe: weight shift right", "过渡：右移重心", "Transition keyframes", "Intermediate weight transfer before entering a right bow stance.", `
    stand
    joint hips flex 20 twist 10
    joint spine flex -8
    joint l_thigh flex 25 abduct 20
    joint l_shin flex 35
    joint r_thigh flex 72 abduct 12
    joint r_shin flex 70
    ${GUARD}`, true),
  pose("kf-shift-left", "Keyframe: weight shift left", "过渡：左移重心", "Transition keyframes", "Intermediate weight transfer before entering a left bow stance.", `
    stand
    joint hips flex 20 twist -10
    joint spine flex -8
    joint r_thigh flex 25 abduct 20
    joint r_shin flex 35
    joint l_thigh flex 72 abduct 12
    joint l_shin flex 70
    ${GUARD}`, true),
  pose("kf-left-punch-extension", "Keyframe: left punch extension", "过渡：左拳半出", "Transition keyframes", "Midpoint with the left punch halfway extended.", `
    stand
    joint l_upper_arm flex 48 abduct 8 twist -45
    joint l_forearm flex 62 twist -45
    joint r_upper_arm flex -42
    joint r_forearm flex 108
    hand left fist
    hand right fist`, true),
  pose("kf-right-punch-extension", "Keyframe: right punch extension", "过渡：右拳半出", "Transition keyframes", "Midpoint with the right punch halfway extended.", `
    stand
    joint r_upper_arm flex 48 abduct 8 twist -45
    joint r_forearm flex 62 twist -45
    joint l_upper_arm flex -42
    joint l_forearm flex 108
    hand left fist
    hand right fist`, true),

  pose("gesture-palm", "Open palm", "掌", "Hand gestures", "Both open palms displayed forward.", `stand\narms forward\nboth palms`),
  pose("gesture-fist", "Closed fist", "拳", "Hand gestures", "Both fists displayed forward.", `stand\narms forward\nboth fists`),
  pose("gesture-sword", "Sword fingers", "剑指", "Hand gestures", "Index and middle fingers extended; remaining fingers folded.", `stand\narms forward\nsword fingers`),
  pose("gesture-hook", "Hook hand", "勾手", "Hand gestures", "Fingers gathered with the wrists sharply flexed to show hook hands.", `
    stand
    joint l_upper_arm flex 25 abduct 78 twist -20
    joint l_forearm flex 18
    joint l_hand flex 78
    joint r_upper_arm flex 25 abduct 78 twist -20
    joint r_forearm flex 18
    joint r_hand flex 78
    hand left hook
    hand right hook`),
];

const poseIds = new Set<string>();
for (const entry of POSE_LIBRARY) {
  if (poseIds.has(entry.id)) throw new Error(`Duplicate pose id ${entry.id}`);
  poseIds.add(entry.id);
}
if (WUBUQUAN.length < 8) throw new Error("五步拳 is missing postures");
