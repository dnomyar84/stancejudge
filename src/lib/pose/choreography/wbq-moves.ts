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
import {
  WBQ02_PUNCH_FLOW_CUES,
  WBQ02_STEP_CUES,
  WBQ03_CHAMBER_CUES,
  WBQ03_DING_CUES,
  WBQ03_KICK_CUES,
  WBQ04_JIA_DA_CUES,
  WBQ04_MA_BU_CUES,
  WBQ05_GAI_CUES,
  WBQ05_XIE_CUES,
} from "./wbq-cues";
import { wbqPhase, wbqTwoKeyframePhase } from "./wbq-phase-builders";
import { wbq01EndPose } from "./wbq-01-opening";
import { wbqDingPose } from "./wbq-poses";
import { armsChongQuanFromGongBu, WBQ_GONG_BU_LEAD } from "./wbq-standard";

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

const gongBuLegs = () => legsGongBu(WBQ_GONG_BU_LEAD);

export const wbq02Choreography: MoveChoreographySpec = moveSpec(
  "wbq-02",
  "弓步冲拳",
  "Bow stance punch",
  4500,
  [
    wbqTwoKeyframePhase(
      "step_punch",
      "上步冲拳",
      "Step and punch",
      WBQ02_STEP_CUES,
      wbq01EndPose(),
      wbqDingPose("wbq-02"),
      "抱拳",
      "弓步冲拳",
      {
        startCueIds: ["02-leg-step"],
        endCueIds: ["02-leg-step", "02-hand-lou", "02-punch-right"],
      },
    ),
    wbqPhase(
      "chong_quan",
      "冲拳",
      "Punch flow",
      WBQ02_PUNCH_FLOW_CUES,
      [
        {
          id: "k0",
          t: 0,
          labelZh: "抱腰",
          pose: skPose(gongBuLegs(), armsFistWaist()),
          activeCueIds: ["02-waist-guard"],
        },
        {
          id: "k1",
          t: 0.5,
          labelZh: "右冲拳中段",
          pose: skPose(
            gongBuLegs(),
            armsChongQuanFromGongBu(WBQ_GONG_BU_LEAD),
          ),
          activeCueIds: ["02-punch-extend"],
        },
        {
          id: "k2",
          t: 1,
          labelZh: "定拳",
          pose: wbqDingPose("wbq-02"),
          activeCueIds: ["02-ding"],
        },
      ],
      [1.1, 0.9],
    ),
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
    wbqTwoKeyframePhase(
      "chamber",
      "提膝",
      "Chamber",
      WBQ03_CHAMBER_CUES,
      wbqDingPose("wbq-02"),
      wbq03Chamber,
      "弓步冲拳",
      "右腿提膝",
      {
        startCueIds: ["03-weight-left"],
        endCueIds: ["03-knee-right", "03-punch-left"],
        stanceConstraints: tiXiDingConstraintSet(
          inferTiXiSupportLeg(wbq03Chamber.skeleton),
        ),
      },
    ),
    wbqTwoKeyframePhase(
      "tan_ti",
      "弹踢",
      "Snap kick",
      WBQ03_KICK_CUES,
      wbq03Chamber,
      wbq03Kick,
      "右腿提膝",
      "弹踢出腿",
      {
        startCueIds: ["03-knee-right"],
        endCueIds: ["03-snap-kick", "03-upright"],
      },
    ),
    wbqTwoKeyframePhase(
      "ding",
      "定势",
      "Finish",
      WBQ03_DING_CUES,
      wbq03Kick,
      wbqDingPose("wbq-03"),
      "弹踢",
      "弹踢冲拳定势",
      { endCueIds: ["03-ding"] },
    ),
  ],
);

export const wbq04Choreography: MoveChoreographySpec = moveSpec(
  "wbq-04",
  "马步架打",
  "Horse stance block",
  4000,
  [
    wbqTwoKeyframePhase(
      "ma_bu",
      "马步架打",
      "Horse stance entry",
      WBQ04_MA_BU_CUES,
      wbqDingPose("wbq-03"),
      wbqDingPose("wbq-04"),
      "弹踢冲拳",
      "马步架打",
      {
        startCueIds: ["04-land-turn"],
        endCueIds: ["04-land-turn", "04-jia-zhang", "04-punch-right"],
      },
    ),
    wbqTwoKeyframePhase(
      "jia_da",
      "架打",
      "Block and strike",
      WBQ04_JIA_DA_CUES,
      skPose(legsMaBu(), armsBlockElbow()),
      wbqDingPose("wbq-04"),
      "架打预备",
      "架打定势",
      {
        startCueIds: ["04-ma-ding"],
        endCueIds: ["04-jia-da"],
      },
    ),
  ],
);

export const wbq05Choreography: MoveChoreographySpec = moveSpec(
  "wbq-05",
  "歇步冲拳",
  "Cross stance punch",
  4800,
  [
    wbqTwoKeyframePhase(
      "gai_zhang",
      "盖掌",
      "Covering palm",
      WBQ05_GAI_CUES,
      wbqDingPose("wbq-04"),
      skPose(legsXieBu(), armsBlockElbow()),
      "马步架打",
      "后插步盖掌",
      {
        startCueIds: ["05-insert-step"],
        endCueIds: ["05-gai-zhang", "05-left-waist"],
      },
    ),
    wbqTwoKeyframePhase(
      "xie_bu",
      "歇步冲拳",
      "Cross stance punch",
      WBQ05_XIE_CUES,
      skPose(legsXieBu(), armsFistWaist()),
      wbqDingPose("wbq-05"),
      "歇步下蹲",
      "左冲拳定势",
      {
        startCueIds: ["05-xie-bu"],
        endCueIds: ["05-xie-bu", "05-punch-left"],
      },
    ),
  ],
);
