import type {
  ChoreographyCue,
  ChoreographyPhase,
  RigKeyframe,
} from "@/lib/pose/canonical3d/choreography";
import type { StanceConstraintSet } from "@/lib/pose/canonical3d/constraints";
import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";

export function wbqTwoKeyframePhase(
  id: string,
  nameZh: string,
  nameEn: string,
  cues: ChoreographyCue[],
  from: ExtendedCoachPose,
  to: ExtendedCoachPose,
  labelStart: string,
  labelEnd: string,
  options?: {
    startCueIds?: string[];
    endCueIds?: string[];
    stanceConstraints?: StanceConstraintSet;
  },
): ChoreographyPhase {
  return {
    id,
    nameZh,
    nameEn,
    cues,
    keyframes: [
      {
        id: `${id}-k0`,
        t: 0,
        labelZh: labelStart,
        labelEn: labelStart,
        pose: from,
        activeCueIds: options?.startCueIds,
      },
      {
        id: `${id}-k1`,
        t: 1,
        labelZh: labelEnd,
        labelEn: labelEnd,
        pose: to,
        activeCueIds: options?.endCueIds,
      },
    ],
    segmentWeights: [1],
    stanceConstraints: options?.stanceConstraints,
  };
}

export function wbqPhase(
  id: string,
  nameZh: string,
  nameEn: string,
  cues: ChoreographyCue[],
  keyframes: RigKeyframe[],
  segmentWeights: number[],
  stanceConstraints?: StanceConstraintSet,
): ChoreographyPhase {
  return {
    id,
    nameZh,
    nameEn,
    cues,
    keyframes,
    segmentWeights,
    stanceConstraints,
  };
}
