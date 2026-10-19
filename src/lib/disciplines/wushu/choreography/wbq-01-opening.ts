import type { MoveChoreographySpec } from "@/lib/pose/canonical3d/choreography";
import {
  extendedFromSkeleton,
  footFromAnkleForward,
  handAtSidePalmIn,
  handBaoQuanAtSide,
  type ExtendedCoachPose,
} from "@/lib/pose/coach-figure/extended-pose";
import { ANATOMY, statureUnits } from "@/lib/pose/coach-figure/anatomy";
import {
  baseStandingTorso,
  legsFeetTogether,
  mergeSkeleton,
} from "@/lib/pose/coach-figure/skeleton";
import { v } from "@/lib/pose/coach-figure/vec3";

/** Arms at sides, palms toward body — elbows beside torso, not behind. */
function armsHangPalmsIn(): Partial<
  import("@/lib/pose/coach-figure/skeleton").CoachSkeleton
> {
  const sy = ANATOMY.shoulderUp;
  const sw = ANATOMY.shoulderHalfWidth;
  return {
    leftElbow: v(-(sw + 0.04), 0.02, sy - 0.14),
    rightElbow: v(sw + 0.04, 0.02, sy - 0.14),
    leftWrist: v(-sw, 0.04, sy - 0.28),
    rightWrist: v(sw, 0.04, sy - 0.28),
  };
}

function poseWideBingBuStart(): ExtendedCoachPose {
  const stepHalf = ANATOMY.shoulderHalfWidth + statureUnits(0.02);
  const sk = mergeSkeleton([
    baseStandingTorso(),
    {
      leftKnee: v(-stepHalf, 0, ANATOMY.kneeUp),
      rightKnee: v(stepHalf, 0, ANATOMY.kneeUp),
      leftAnkle: v(-stepHalf, 0.02, ANATOMY.ankleUp),
      rightAnkle: v(stepHalf, 0.02, ANATOMY.ankleUp),
    },
    armsHangPalmsIn(),
  ]);
  return {
    skeleton: sk,
    leftHand: handAtSidePalmIn("left"),
    rightHand: handAtSidePalmIn("right"),
    leftFoot: footFromAnkleForward(sk.leftAnkle, 0),
    rightFoot: footFromAnkleForward(sk.rightAnkle, 0),
  };
}

function poseBingBuEnd(): ExtendedCoachPose {
  const sk = mergeSkeleton([baseStandingTorso(), legsFeetTogether(), armsHangPalmsIn()]);
  return {
    skeleton: sk,
    leftHand: handAtSidePalmIn("left"),
    rightHand: handAtSidePalmIn("right"),
    leftFoot: footFromAnkleForward(sk.leftAnkle, 0),
    rightFoot: footFromAnkleForward(sk.rightAnkle, 0),
  };
}

function poseBaoQuanEnd(): ExtendedCoachPose {
  const hy = 0.52;
  const sk = mergeSkeleton([
    baseStandingTorso(),
    legsFeetTogether(),
    {
      leftElbow: v(-0.12, 0.06, hy + 0.08),
      rightElbow: v(0.12, 0.06, hy + 0.08),
      leftWrist: v(-0.12, 0.08, hy - 0.02),
      rightWrist: v(0.12, 0.08, hy - 0.02),
    },
  ]);
  const lh = handBaoQuanAtSide("left");
  const rh = handBaoQuanAtSide("right");
  return {
    skeleton: sk,
    leftHand: { ...lh, wrist: sk.leftWrist },
    rightHand: { ...rh, wrist: sk.rightWrist },
    leftFoot: footFromAnkleForward(sk.leftAnkle, 0),
    rightFoot: footFromAnkleForward(sk.rightAnkle, 0),
  };
}

export const wbq01OpeningChoreography: MoveChoreographySpec = {
  routineId: "wu-bu-quan",
  moveId: "wbq-01",
  nameZh: "起势",
  nameEn: "Opening posture",
  durationMs: 5000,
  pauseMinMs: 800,
  phases: [
    {
      id: "bing_bu",
      nameZh: "并步",
      nameEn: "Feet together",
      cues: [
        {
          id: "bing-legs-apart",
          layer: "legs",
          labelZh: "开步站立",
          labelEn: "Start apart",
          descriptionZh:
            "两脚分开站立，腿伸直，脚尖朝前，身体正直面向前方。",
        },
        {
          id: "bing-close",
          layer: "legs",
          labelZh: "收脚并步",
          labelEn: "Close to 并步",
          descriptionZh:
            "两腿从分开向中间收拢至并步，膝伸直，双脚并拢，脚尖仍朝前。",
        },
      ],
      keyframes: [
        {
          id: "bing-k0",
          t: 0,
          labelZh: "分开站立",
          labelEn: "Feet apart",
          pose: poseWideBingBuStart(),
          activeCueIds: ["bing-legs-apart"],
        },
        {
          id: "bing-k1",
          t: 1,
          labelZh: "并步定势",
          labelEn: "Feet together",
          pose: poseBingBuEnd(),
          activeCueIds: ["bing-close"],
        },
      ],
      segmentWeights: [1],
    },
    {
      id: "bao_quan",
      nameZh: "抱拳",
      nameEn: "Embrace fists",
      cues: [
        {
          id: "bao-palm-side",
          layer: "hands",
          labelZh: "体侧立掌",
          labelEn: "Palms at sides",
          descriptionZh: "两臂体侧，掌心朝向身体，自然下垂。",
        },
        {
          id: "bao-fist-45",
          layer: "hands",
          labelZh: "抱拳定势",
          labelEn: "Fists forward, elbow 45°",
          descriptionZh:
            "仍贴体侧，翻为拳，拳心朝前；侧面看肘部抬约四十五度。",
        },
      ],
      keyframes: [
        {
          id: "bao-k0",
          t: 0,
          labelZh: "体侧立掌",
          pose: poseBingBuEnd(),
          activeCueIds: ["bao-palm-side"],
        },
        {
          id: "bao-k1",
          t: 1,
          labelZh: "抱拳",
          pose: poseBaoQuanEnd(),
          activeCueIds: ["bao-fist-45"],
        },
      ],
      segmentWeights: [1],
    },
  ],
};

/** Static end pose for rail / fallback. */
export function wbq01EndPose(): ExtendedCoachPose {
  return poseBaoQuanEnd();
}
