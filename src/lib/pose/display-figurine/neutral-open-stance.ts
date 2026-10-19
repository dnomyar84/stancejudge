import { extendedToCoachFigurinePose } from "@/lib/pose/mannequin-adapter/coach-pose-to-mannequin";
import { getMoveChoreography } from "@/lib/pose/choreography/registry";
import {
  LEFT_ARM_BESIDE_EAR,
  RIGHT_ARM_BESIDE_EAR,
} from "./arm-beside-ear";
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

function figurineFromKeyframe(
  moveId: string,
  phaseId: string,
  keyframeIndex = -1,
): CoachFigurinePoseV1 {
  const ch = getMoveChoreography("wu-bu-quan", moveId);
  const phase = ch?.phases.find((p) => p.id === phaseId);
  const kf =
    keyframeIndex >= 0
      ? phase?.keyframes[keyframeIndex]
      : phase?.keyframes.at(-1);
  if (!kf) {
    throw new Error(`Missing keyframe ${moveId}/${phaseId}`);
  }
  if (kf.figurine) return kf.figurine;
  return extendedToCoachFigurinePose(kf.pose);
}

let refLeftKneeRaised: CoachFigurinePoseV1 | undefined;
let refRightKneeRaised: CoachFigurinePoseV1 | undefined;

function kneeRefs() {
  refLeftKneeRaised ??= figurineFromKeyframe("wbq-06", "ti_xi_chuan", -1);
  refRightKneeRaised ??= figurineFromKeyframe("wbq-03", "chamber", 1);
  return { refLeftKneeRaised, refRightKneeRaised };
}

function copyLeftLeg(target: CoachFigurinePoseV1, from: CoachFigurinePoseV1) {
  target.leftLeg = { ...from.leftLeg };
  target.leftKnee = { ...from.leftKnee };
  target.leftAnkle = { ...from.leftAnkle };
}

function copyRightLeg(target: CoachFigurinePoseV1, from: CoachFigurinePoseV1) {
  target.rightLeg = { ...from.rightLeg };
  target.rightKnee = { ...from.rightKnee };
  target.rightAnkle = { ...from.rightAnkle };
}

export type FigurineControlToggles = {
  leftHandRaised: boolean;
  rightHandRaised: boolean;
  leftKneeRaised: boolean;
  rightKneeRaised: boolean;
};

export function figurineWithControlToggles(
  base: CoachFigurinePoseV1,
  toggles: FigurineControlToggles,
): CoachFigurinePoseV1 {
  const f = structuredClone(base);

  if (toggles.leftHandRaised) {
    Object.assign(f, structuredClone(LEFT_ARM_BESIDE_EAR));
  }
  if (toggles.rightHandRaised) {
    Object.assign(f, structuredClone(RIGHT_ARM_BESIDE_EAR));
  }
  const r = kneeRefs();
  if (toggles.leftKneeRaised) {
    copyLeftLeg(f, r.refLeftKneeRaised);
  }
  if (toggles.rightKneeRaised) {
    copyRightLeg(f, r.refRightKneeRaised);
  }

  return f;
}
