import type { PoseDefinition } from "../pose-library";

/**
 * 五步拳, in the order used by Chinese school wushu.
 * Named lines are the postures textbooks stop on. The steps between them
 * follow the usual teaching count: step, lift the knee, land, cross behind,
 * lift again, then shift forward before the empty stance.
 */

const CHAMBER = `
joint l_upper_arm flex -46
joint l_forearm flex 110
joint r_upper_arm flex -46
joint r_forearm flex 110
hand left fist
hand right fist`;

function step(
  id: string,
  stepLabel: string,
  name: string,
  chinese: string,
  description: string,
  program: string,
  transitional = false,
): PoseDefinition {
  return {
    id,
    name,
    chinese,
    category: "五步拳",
    description,
    program: program.trim(),
    transitional,
    routine: "五步拳",
    step: stepLabel,
  };
}

export const WUBUQUAN: PoseDefinition[] = [
  step(
    "wbq-ready",
    "起势",
    "Ready, fists at the waist",
    "并步抱拳",
    "Feet together. Both fists chamber at the waist, palms up. Eyes forward.",
    `stand
    joint l_thigh abduct 3
    joint r_thigh abduct 3
    ${CHAMBER}`,
  ),
  step(
    "wbq-step-bow",
    "1",
    "Step in, punch leaving the waist",
    "上步",
    "Left foot steps forward while the right fist leaves the waist. The elbow is still bent. Teaching step into the bow punch.",
    `stand
    joint hips flex 14
    joint spine flex -8
    joint l_thigh flex 62 abduct 8
    joint l_shin flex 48
    joint l_foot flex 12
    joint r_thigh flex 10 abduct 12 twist 8
    joint r_shin flex 20
    joint r_foot flex 24
    joint r_upper_arm flex 38 abduct 6 twist -40
    joint r_forearm flex 62 twist -40
    joint l_upper_arm flex -44
    joint l_forearm flex 108
    hand left fist
    hand right fist`,
    true,
  ),
  step(
    "wbq-bow-punch",
    "1",
    "Left bow, right punch",
    "拗弓步冲拳",
    "Left bow stance. The right fist punches forward and the left fist stays at the waist. Eyes on the right fist.",
    `stand
    left gong bu right punch
    joint head flex -6`,
  ),
  step(
    "wbq-knee-chamber",
    "2",
    "Lift the right knee, fists home",
    "提膝收拳",
    "The left leg straightens to stand. The right knee lifts, and both fists return to the waist before the snap kick.",
    `stand
    joint hips flex 6
    joint l_thigh flex 16 abduct 4
    joint l_shin flex 14
    joint l_foot flex 6
    joint r_thigh flex 86 abduct 10
    joint r_shin flex 108
    joint r_foot flex -6
    ${CHAMBER}`,
    true,
  ),
  step(
    "wbq-snap-kick",
    "2",
    "Right snap kick, left punch",
    "弹腿冲拳",
    "The right shin snaps straight to hip height. The left fist punches as the right fist chambers. Eyes on the left fist.",
    `stand
    joint hips flex 4
    joint spine flex -6
    joint l_thigh flex 12 abduct 4
    joint l_shin flex 10
    joint l_foot flex 6
    joint r_thigh flex 76 abduct 8
    joint r_shin flex 8
    joint r_foot flex -18
    joint l_upper_arm flex 80 abduct -4 twist -80
    joint l_forearm flex 10 twist -85
    joint r_upper_arm flex -48
    joint r_forearm flex 108
    hand left fist
    hand right fist
    joint head flex -4`,
  ),
  step(
    "wbq-land-horse",
    "3",
    "Right foot lands toward horse stance",
    "落步",
    "The right foot comes down and both knees bend. The left arm starts upward and the right fist is ready to punch to the side.",
    `stand
    joint hips flex 16 twist 18
    joint chest twist 12
    joint l_thigh flex 38 abduct 30
    joint l_shin flex 42
    joint l_foot flex 12
    joint r_thigh flex 42 abduct 24
    joint r_shin flex 38
    joint r_foot flex 14
    joint l_upper_arm flex 36 abduct 78 twist -16
    joint l_forearm flex 36
    joint l_hand flex -8
    joint r_upper_arm flex -16
    joint r_forearm flex 92
    hand left palm
    hand right fist`,
    true,
  ),
  step(
    "wbq-horse-frame",
    "3",
    "Horse stance, frame and punch",
    "马步架打",
    "Horse stance, chest turned toward the right. The left palm frames above the forehead and the right fist punches to the side. Eyes on the right fist.",
    `stand
    joint hips flex 18 twist 24
    joint spine twist 10
    joint chest twist 28
    joint l_thigh flex 50 abduct 38 twist -8
    joint l_shin flex 80
    joint l_foot flex 18 abduct 8
    joint r_thigh flex 50 abduct 38 twist -8
    joint r_shin flex 80
    joint r_foot flex 18 abduct 8
    joint l_upper_arm flex 18 abduct 156 twist -28
    joint l_forearm flex 86 twist -16
    joint l_hand flex -18
    joint r_upper_arm flex 76 abduct 20 twist -72
    joint r_forearm flex 12 twist -68
    hand left palm
    hand right fist
    joint head twist 16
    joint neck twist 10`,
  ),
  step(
    "wbq-cross-behind",
    "4",
    "Left foot crosses behind",
    "插步",
    "The left foot steps behind the right. The right palm starts to cover downward and the left fist is still near the waist.",
    `stand
    joint hips flex 24 twist 10
    joint l_thigh flex 68 abduct -6 twist -14
    joint l_shin flex 82
    joint r_thigh flex 58 abduct 14 twist 12
    joint r_shin flex 74
    joint r_upper_arm flex 48 abduct -16 twist -18
    joint r_forearm flex 78
    joint r_hand flex 12
    joint l_upper_arm flex 8
    joint l_forearm flex 86
    hand left fist
    hand right palm`,
    true,
  ),
  step(
    "wbq-rest-cover",
    "4",
    "Resting stance, cover and punch",
    "歇步盖打",
    "Resting stance, left foot behind. The right palm covers down across the body and the left fist punches out. Eyes on the left fist.",
    `stand
    joint hips flex 28 twist 20
    joint r_thigh flex 74 abduct -16 twist -28
    joint r_shin flex 108
    joint l_thigh flex 82 abduct 20 twist 22
    joint l_shin flex 118
    joint r_upper_arm flex 38 abduct -24 twist -12
    joint r_forearm flex 118 twist 10
    joint r_hand flex 26
    joint l_upper_arm flex 68 abduct 34 twist -62
    joint l_forearm flex 14 twist -48
    hand right palm
    hand left fist
    joint head twist -18`,
  ),
  step(
    "wbq-lift-again",
    "5",
    "Fists home, right knee lifts",
    "提膝",
    "Both hands close to fists at the waist and the right knee lifts. This is the first half of threading into the drop stance.",
    `stand
    joint l_thigh flex 12 abduct 4
    joint l_shin flex 10
    joint l_foot flex 4
    joint r_thigh flex 84 abduct 8
    joint r_shin flex 102
    joint r_foot flex -8
    ${CHAMBER}`,
    true,
  ),
  step(
    "wbq-drop-thread",
    "5",
    "Left drop stance, threading palm",
    "仆步穿掌",
    "The right leg squats and the left leg extends. The left palm threads forward, palm up, and the right hand draws back. Eyes on the left palm.",
    `stand
    joint hips flex 28 twist -16
    joint spine flex 24 abduct -16
    joint r_thigh flex 112 abduct 30 twist -16
    joint r_shin flex 125
    joint r_foot flex 28
    joint l_thigh flex 10 abduct 46 twist 16
    joint l_shin flex 8
    joint l_foot flex -6
    joint l_upper_arm flex 70 abduct 8 twist 46
    joint l_forearm flex 8 twist 40
    joint l_hand flex -10
    joint r_upper_arm flex 18 abduct 18
    joint r_forearm flex 72
    hand left palm
    hand right palm
    joint head twist -16
    joint neck abduct -8`,
  ),
  step(
    "wbq-shift-forward",
    "6",
    "Weight shifts into a passing bow",
    "前移",
    "Weight moves onto the left leg into a passing bow. The right palm begins to rise and the left palm comes back.",
    `stand
    joint hips flex 18 twist -6
    joint spine flex -6
    joint l_thigh flex 80 abduct 8
    joint l_shin flex 68
    joint l_foot flex 8
    joint r_thigh flex 22 abduct 16 twist 8
    joint r_shin flex 18
    joint r_foot flex 28
    joint l_upper_arm flex 28 abduct 18
    joint l_forearm flex 64
    joint r_upper_arm flex 50 abduct 6 twist -18
    joint r_forearm flex 42
    hand left palm
    hand right palm`,
    true,
  ),
  step(
    "wbq-empty-lift",
    "6",
    "Right empty stance, lifting palm",
    "虚步挑掌",
    "Weight stays on the left leg. The right toes touch in front, the right palm lifts before the face, and the left palm rests by the right elbow.",
    `stand
    joint hips flex 18 twist 8
    joint l_thigh flex 50 abduct 16
    joint l_shin flex 74
    joint l_foot flex 16
    joint r_thigh flex 34 abduct 8
    joint r_shin flex 16
    joint r_foot flex 42
    joint r_upper_arm flex 92 abduct 10 twist -30
    joint r_forearm flex 24 twist -20
    joint r_hand flex -30
    joint l_upper_arm flex 46 abduct 24 twist -16
    joint l_forearm flex 96
    joint l_hand flex 6
    hand left palm
    hand right palm
    joint head flex -8`,
  ),
  step(
    "wbq-feet-together",
    "收势",
    "Right foot draws in, fists home",
    "并步抱拳",
    "The right foot draws beside the left and both fists chamber at the waist before the arms lower.",
    `stand
    joint l_thigh abduct 3
    joint r_thigh flex 14 abduct 6
    joint r_shin flex 16
    ${CHAMBER}`,
    true,
  ),
  step(
    "wbq-close",
    "收势",
    "Close, arms at the sides",
    "并步直立",
    "Feet together and the arms hang. End of the form.",
    `stand
    joint l_thigh abduct 2
    joint r_thigh abduct 2
    joint l_upper_arm flex 0 abduct 4
    joint r_upper_arm flex 0 abduct 4
    joint l_forearm flex 0
    joint r_forearm flex 0`,
  ),
];
