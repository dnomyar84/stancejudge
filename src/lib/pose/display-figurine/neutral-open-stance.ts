import { extendedToCoachFigurinePose } from "@/lib/pose/mannequin-adapter/coach-pose-to-mannequin";
import { getMoveChoreography } from "@/lib/pose/choreography/registry";
import type { CoachFigurinePoseV1 } from "./coach-figurine-pose";

/** 开步站立 — feet shoulder-width, arms at sides (五步拳 起势 opening). */
export function neutralOpenStanceFigurine(): CoachFigurinePoseV1 {
  const ch = getMoveChoreography("wu-bu-quan", "wbq-01");
  const kf = ch?.phases[0]?.keyframes[0];
  if (!kf) {
    throw new Error("wbq-01 opening keyframe missing — register wushu choreography");
  }
  if (kf.figurine) return structuredClone(kf.figurine);
  return extendedToCoachFigurinePose(kf.pose);
}

export type FigurineControlToggles = {
  leftHandRaised: boolean;
  rightHandRaised: boolean;
  leftKneeRaised: boolean;
  rightKneeRaised: boolean;
};

const RAISED_ARM_RAISE = 88;
const RAISED_ARM_ELBOW = 18;
const RAISED_LEG_RAISE = 72;
const RAISED_KNEE_BEND = 95;

export function figurineWithControlToggles(
  base: CoachFigurinePoseV1,
  toggles: FigurineControlToggles,
): CoachFigurinePoseV1 {
  const f = structuredClone(base);

  if (toggles.leftHandRaised) {
    f.leftArm.raise = RAISED_ARM_RAISE;
    f.leftElbow.bend = RAISED_ARM_ELBOW;
  }
  if (toggles.rightHandRaised) {
    f.rightArm.raise = RAISED_ARM_RAISE;
    f.rightElbow.bend = RAISED_ARM_ELBOW;
  }
  if (toggles.leftKneeRaised) {
    f.leftLeg.raise = RAISED_LEG_RAISE;
    f.leftKnee.bend = RAISED_KNEE_BEND;
  }
  if (toggles.rightKneeRaised) {
    f.rightLeg.raise = RAISED_LEG_RAISE;
    f.rightKnee.bend = RAISED_KNEE_BEND;
  }

  return f;
}
