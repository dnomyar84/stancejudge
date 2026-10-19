import type { MoveChoreographySpec } from "../canonical3d/choreography";
import { inferTiXiSupportLeg, tiXiDingConstraintSet } from "../canonical3d/constraints";
import { extendedFromSkeleton } from "../coach-figure/extended-pose";
import {
  armsFistWaist,
  armsTiXiChuanZhang,
  armsXuBuTiaoZhang,
  baseStandingTorso,
  legsFeetTogether,
  legsPuBu,
  legsWuBuRightXuBu,
  mergeSkeleton,
} from "../coach-figure/skeleton";
import { wbq01EndPose } from "./wbq-01-opening";
import { wbqDingPose } from "./wbq-poses";
import {
  skeletonPuBuChuanZhangDing,
  skeletonTiXiChuanZhangDing,
  skeletonXuBuTiaoZhangDing,
} from "./wbq-standard";

function moveSpec(
  moveId: string,
  nameZh: string,
  nameEn: string,
  durationMs: number,
  phases: MoveChoreographySpec["phases"],
): MoveChoreographySpec {
  return {
    routineId: "wu-bu-quan",
    moveId,
    nameZh,
    nameEn,
    durationMs,
    phases,
  };
}

function twoKeyframePhase(
  id: string,
  nameZh: string,
  from: ReturnType<typeof extendedFromSkeleton>,
  to: ReturnType<typeof extendedFromSkeleton>,
  labelStart: string,
  labelEnd: string,
  stanceConstraints?: MoveChoreographySpec["phases"][0]["stanceConstraints"],
) {
  return {
    id,
    nameZh,
    nameEn: nameZh,
    cues: [],
    keyframes: [
      { id: "k0", t: 0, labelZh: labelStart, pose: from },
      { id: "k1", t: 1, labelZh: labelEnd, pose: to },
    ],
    segmentWeights: [1],
    stanceConstraints,
  };
}

function skLegsArms(
  legs: Partial<ReturnType<typeof mergeSkeleton>>,
  arms: Partial<ReturnType<typeof mergeSkeleton>>,
) {
  return extendedFromSkeleton(mergeSkeleton([baseStandingTorso(), legs, arms]));
}

const wbq06TiXi = extendedFromSkeleton(skeletonTiXiChuanZhangDing());
const wbq06Stand = skLegsArms(legsFeetTogether(), armsTiXiChuanZhang());

export const wbq06Choreography: MoveChoreographySpec = moveSpec(
  "wbq-06",
  "提膝穿掌",
  "Knee lift palm thrust",
  4800,
  [
    twoKeyframePhase(
      "qi_li",
      "起立转体",
      wbqDingPose("wbq-05"),
      wbq06Stand,
      "歇步冲拳",
      "起立穿掌预备",
    ),
    twoKeyframePhase(
      "ti_xi_chuan",
      "提膝穿掌",
      wbq06Stand,
      wbq06TiXi,
      "预备",
      "提膝穿掌",
      tiXiDingConstraintSet(inferTiXiSupportLeg(wbq06TiXi.skeleton)),
    ),
    twoKeyframePhase(
      "ding",
      "定势",
      wbq06TiXi,
      wbqDingPose("wbq-06"),
      "穿掌",
      "提膝穿掌定势",
      tiXiDingConstraintSet(inferTiXiSupportLeg(wbq06TiXi.skeleton)),
    ),
  ],
);

const wbq07PuBu = extendedFromSkeleton(skeletonPuBuChuanZhangDing());

export const wbq07Choreography: MoveChoreographySpec = moveSpec(
  "wbq-07",
  "仆步穿掌",
  "Drop stance palm thrust",
  4600,
  [
    twoKeyframePhase(
      "luo_jiao",
      "落步",
      wbqDingPose("wbq-06"),
      skLegsArms(legsPuBu("left"), armsTiXiChuanZhang()),
      "提膝穿掌",
      "仆步下落",
    ),
    twoKeyframePhase(
      "chuan",
      "穿掌",
      skLegsArms(legsPuBu("left"), armsTiXiChuanZhang()),
      wbq07PuBu,
      "下落",
      "仆步穿掌定势",
    ),
  ],
);

const wbq08XuBu = extendedFromSkeleton(skeletonXuBuTiaoZhangDing());

export const wbq08Choreography: MoveChoreographySpec = moveSpec(
  "wbq-08",
  "虚步挑掌",
  "Empty stance rising palm",
  4400,
  [
    twoKeyframePhase(
      "shang_bu",
      "上步",
      wbqDingPose("wbq-07"),
      skLegsArms(legsWuBuRightXuBu(), armsXuBuTiaoZhang()),
      "仆步穿掌",
      "起身虚步",
    ),
    twoKeyframePhase(
      "tiao",
      "挑掌",
      skLegsArms(legsWuBuRightXuBu(), armsXuBuTiaoZhang()),
      wbq08XuBu,
      "虚步",
      "虚步挑掌定势",
    ),
  ],
);

const wbq09BingBu = skLegsArms(legsFeetTogether(), armsFistWaist());

export const wbq09Choreography: MoveChoreographySpec = moveSpec(
  "wbq-09",
  "并步抱拳",
  "Close — feet together, embrace fists",
  4000,
  [
    twoKeyframePhase(
      "bing_bu",
      "并步",
      wbqDingPose("wbq-08"),
      wbq09BingBu,
      "虚步挑掌",
      "收脚并步",
    ),
    twoKeyframePhase(
      "bao_quan",
      "抱拳收势",
      wbq09BingBu,
      wbq01EndPose(),
      "并步",
      "抱拳收势",
    ),
  ],
);
