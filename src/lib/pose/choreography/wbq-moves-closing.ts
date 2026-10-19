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
import {
  WBQ06_DING_CUES,
  WBQ06_QI_LI_CUES,
  WBQ06_TI_XI_CUES,
  WBQ07_CHUAN_CUES,
  WBQ07_LUO_CUES,
  WBQ08_SHANG_CUES,
  WBQ08_TIAO_CUES,
  WBQ09_BAO_CUES,
  WBQ09_BING_CUES,
} from "./wbq-cues";
import { wbqTwoKeyframePhase } from "./wbq-phase-builders";
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

function skLegsArms(
  legs: Partial<ReturnType<typeof mergeSkeleton>>,
  arms: Partial<ReturnType<typeof mergeSkeleton>>,
) {
  return extendedFromSkeleton(mergeSkeleton([baseStandingTorso(), legs, arms]));
}

const wbq06TiXi = extendedFromSkeleton(skeletonTiXiChuanZhangDing());
const wbq06Stand = skLegsArms(legsFeetTogether(), armsTiXiChuanZhang());
const wbq06TiXiConstraints = tiXiDingConstraintSet(
  inferTiXiSupportLeg(wbq06TiXi.skeleton),
);

export const wbq06Choreography: MoveChoreographySpec = moveSpec(
  "wbq-06",
  "提膝穿掌",
  "Knee lift palm thrust",
  4800,
  [
    wbqTwoKeyframePhase(
      "qi_li",
      "起立转体",
      "Stand and turn",
      WBQ06_QI_LI_CUES,
      wbqDingPose("wbq-05"),
      wbq06Stand,
      "歇步冲拳",
      "起立穿掌预备",
      {
        startCueIds: ["06-stand-turn"],
        endCueIds: ["06-palm-prep"],
      },
    ),
    wbqTwoKeyframePhase(
      "ti_xi_chuan",
      "提膝穿掌",
      "Knee lift palm",
      WBQ06_TI_XI_CUES,
      wbq06Stand,
      wbq06TiXi,
      "预备",
      "提膝穿掌",
      {
        startCueIds: ["06-palm-prep"],
        endCueIds: ["06-ti-xi-left", "06-chuan-zhang"],
        stanceConstraints: wbq06TiXiConstraints,
      },
    ),
    wbqTwoKeyframePhase(
      "ding",
      "定势",
      "Finish",
      WBQ06_DING_CUES,
      wbq06TiXi,
      wbqDingPose("wbq-06"),
      "穿掌",
      "提膝穿掌定势",
      {
        endCueIds: ["06-ding"],
        stanceConstraints: wbq06TiXiConstraints,
      },
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
    wbqTwoKeyframePhase(
      "luo_jiao",
      "落步",
      "Drop step",
      WBQ07_LUO_CUES,
      wbqDingPose("wbq-06"),
      skLegsArms(legsPuBu("left"), armsTiXiChuanZhang()),
      "提膝穿掌",
      "仆步下落",
      {
        startCueIds: ["07-land-pu"],
        endCueIds: ["07-land-pu", "07-body-up"],
      },
    ),
    wbqTwoKeyframePhase(
      "chuan",
      "穿掌",
      "Palm thrust",
      WBQ07_CHUAN_CUES,
      skLegsArms(legsPuBu("left"), armsTiXiChuanZhang()),
      wbq07PuBu,
      "下落",
      "仆步穿掌定势",
      {
        startCueIds: ["07-chuan-down"],
        endCueIds: ["07-chuan-down", "07-look-left"],
      },
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
    wbqTwoKeyframePhase(
      "shang_bu",
      "上步",
      "Step up",
      WBQ08_SHANG_CUES,
      wbqDingPose("wbq-07"),
      skLegsArms(legsWuBuRightXuBu(), armsXuBuTiaoZhang()),
      "仆步穿掌",
      "起身虚步",
      {
        startCueIds: ["08-rise-step"],
        endCueIds: ["08-xu-bu"],
      },
    ),
    wbqTwoKeyframePhase(
      "tiao",
      "挑掌",
      "Rising palm",
      WBQ08_TIAO_CUES,
      skLegsArms(legsWuBuRightXuBu(), armsXuBuTiaoZhang()),
      wbq08XuBu,
      "虚步",
      "虚步挑掌定势",
      {
        startCueIds: ["08-gou-shou"],
        endCueIds: ["08-gou-shou", "08-tiao-zhang", "08-look-front"],
      },
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
    wbqTwoKeyframePhase(
      "bing_bu",
      "并步",
      "Feet together",
      WBQ09_BING_CUES,
      wbqDingPose("wbq-08"),
      wbq09BingBu,
      "虚步挑掌",
      "收脚并步",
      {
        startCueIds: ["09-close-feet"],
        endCueIds: ["09-close-feet", "09-gather-hands"],
      },
    ),
    wbqTwoKeyframePhase(
      "bao_quan",
      "抱拳收势",
      "Embrace fists",
      WBQ09_BAO_CUES,
      wbq09BingBu,
      wbq01EndPose(),
      "并步",
      "抱拳收势",
      {
        startCueIds: ["09-bao-quan"],
        endCueIds: ["09-bao-quan", "09-ding"],
      },
    ),
  ],
);
