import type { MoveChoreographySpec } from "../canonical3d/choreography";
import { inferTiXiSupportLeg, tiXiDingConstraintSet } from "../canonical3d/constraints";
import { extendedFromSkeleton } from "../coach-figure/extended-pose";
import {
  armsBlockElbow,
  armsFistWaist,
  armsPunchForward,
  baseStandingTorso,
  legsGongBu,
  legsMaBu,
  legsRightSnapKickChamber,
  legsRightSnapKickStrike,
  legsXieBu,
  mergeSkeleton,
} from "../coach-figure/skeleton";
import { wbq01EndPose } from "./wbq-01-opening";
import { wbqDingPose } from "./wbq-poses";
import {
  armsChongQuanFromGongBu,
  skeletonTiXiShouShiDing,
  WBQ_GONG_BU_LEAD,
} from "./wbq-standard";

function skPose(
  legs: Partial<ReturnType<typeof mergeSkeleton>>,
  arms: Partial<ReturnType<typeof mergeSkeleton>>,
) {
  return extendedFromSkeleton(mergeSkeleton([baseStandingTorso(), legs, arms]));
}

function moveSpec(
  moveId: string,
  nameZh: string,
  nameEn: string,
  durationMs: number,
  phases: MoveChoreographySpec["phases"],
  extra?: Partial<MoveChoreographySpec>,
): MoveChoreographySpec {
  return {
    routineId: "wu-bu-quan",
    moveId,
    nameZh,
    nameEn,
    durationMs,
    phases,
    ...extra,
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

const gongBuLegs = () => legsGongBu(WBQ_GONG_BU_LEAD);

export const wbq02Choreography: MoveChoreographySpec = moveSpec(
  "wbq-02",
  "弓步冲拳",
  "Bow stance punch",
  4500,
  [
    twoKeyframePhase(
      "step_punch",
      "上步冲拳",
      wbq01EndPose(),
      wbqDingPose("wbq-02"),
      "抱拳",
      "弓步冲拳",
    ),
    {
      id: "chong_quan",
      nameZh: "冲拳",
      nameEn: "Punch flow",
      cues: [],
      keyframes: [
        {
          id: "k0",
          t: 0,
          labelZh: "抱腰",
          pose: skPose(gongBuLegs(), armsFistWaist()),
        },
        {
          id: "k1",
          t: 0.5,
          labelZh: "右冲拳中段",
          pose: skPose(
            gongBuLegs(),
            armsChongQuanFromGongBu(WBQ_GONG_BU_LEAD),
          ),
        },
        {
          id: "k2",
          t: 1,
          labelZh: "定拳",
          pose: wbqDingPose("wbq-02"),
        },
      ],
      segmentWeights: [1.1, 0.9],
    },
  ],
);

const wbq03Chamber = skPose(
  legsRightSnapKickChamber(),
  armsPunchForward("left"),
);
const wbq03Kick = skPose(
  legsRightSnapKickStrike(),
  armsPunchForward("left"),
);

export const wbq03Choreography: MoveChoreographySpec = moveSpec(
  "wbq-03",
  "弹踢冲拳",
  "Snap kick punch",
  5200,
  [
    twoKeyframePhase(
      "chamber",
      "提膝",
      wbqDingPose("wbq-02"),
      wbq03Chamber,
      "弓步冲拳",
      "右腿提膝",
      tiXiDingConstraintSet(
        inferTiXiSupportLeg(wbq03Chamber.skeleton),
      ),
    ),
    twoKeyframePhase(
      "tan_ti",
      "弹踢",
      wbq03Chamber,
      wbq03Kick,
      "右腿提膝",
      "弹踢出腿",
    ),
    twoKeyframePhase(
      "ding",
      "定势",
      wbq03Kick,
      wbqDingPose("wbq-03"),
      "弹踢",
      "弹踢冲拳定势",
    ),
  ],
);

export const wbq04Choreography: MoveChoreographySpec = moveSpec(
  "wbq-04",
  "马步架打",
  "Horse stance block",
  4000,
  [
    twoKeyframePhase(
      "ma_bu",
      "马步架打",
      wbqDingPose("wbq-03"),
      wbqDingPose("wbq-04"),
      "弹踢冲拳",
      "马步架打",
    ),
    twoKeyframePhase(
      "jia_da",
      "架打",
      skPose(legsMaBu(), armsBlockElbow()),
      wbqDingPose("wbq-04"),
      "架打预备",
      "架打定势",
    ),
  ],
);

export const wbq05Choreography: MoveChoreographySpec = moveSpec(
  "wbq-05",
  "歇步冲拳",
  "Cross stance punch",
  4800,
  [
    twoKeyframePhase(
      "gai_zhang",
      "盖掌",
      wbqDingPose("wbq-04"),
      skPose(legsXieBu(), armsBlockElbow()),
      "马步架打",
      "后插步盖掌",
    ),
    twoKeyframePhase(
      "xie_bu",
      "歇步冲拳",
      skPose(legsXieBu(), armsFistWaist()),
      wbqDingPose("wbq-05"),
      "歇步下蹲",
      "左冲拳定势",
    ),
  ],
);

const wbq06TiXi = extendedFromSkeleton(skeletonTiXiShouShiDing());

export const wbq06Choreography: MoveChoreographySpec = moveSpec(
  "wbq-06",
  "提膝收势",
  "Knee lift close",
  4200,
  [
    twoKeyframePhase(
      "ti_xi_shou",
      "提膝收势",
      wbqDingPose("wbq-05"),
      wbq06TiXi,
      "歇步冲拳",
      "提膝收势",
      tiXiDingConstraintSet(inferTiXiSupportLeg(wbq06TiXi.skeleton)),
    ),
    twoKeyframePhase(
      "ding",
      "收势定势",
      wbq06TiXi,
      wbqDingPose("wbq-06"),
      "提膝",
      "收势",
    ),
  ],
);
