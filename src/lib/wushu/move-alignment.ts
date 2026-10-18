import { scoreMoveTemplateSimilarity } from "@/lib/pose/move-pose-score";
import { buildSanDuanMoveKeypoints } from "@/lib/pose/san-duan-chang-quan-poses";
import type { PoseKeypoint } from "@/lib/pose/types";
import { classifyPose, scoreHandMatch, scoreLegMatch } from "./classify";
import type { HandProfileType, LegStanceType } from "./types";

export type MoveAlignmentScores = {
  legScore: number;
  handScore: number;
  detectedLeg: LegStanceType;
  detectedHand: HandProfileType;
  templateScore: number | null;
};

const TEMPLATE_ROUTINES = new Set(["san-duan-chang-quan"]);

/** Blend syllabus stick template with coarse enum match (san-duan uses template-first). */
export function scoreMoveAlignment(
  routineId: string,
  moveId: string,
  expectedLeg: LegStanceType,
  expectedHand: HandProfileType,
  keypoints: PoseKeypoint[],
  weapon: "unarmed" | "jian",
): MoveAlignmentScores {
  const pose = classifyPose(keypoints, weapon);
  const enumLeg = scoreLegMatch(pose.leg, expectedLeg);
  const enumHand = scoreHandMatch(pose.hand, expectedHand);

  let templateScore: number | null = null;
  if (TEMPLATE_ROUTINES.has(routineId) && buildSanDuanMoveKeypoints(moveId)) {
    templateScore = scoreMoveTemplateSimilarity(
      routineId,
      moveId,
      keypoints,
      expectedLeg,
      expectedHand,
    );
  }

  if (templateScore !== null) {
    const legScore = Math.round(templateScore * 0.88 + enumLeg * 0.12);
    const handScore = Math.round(templateScore * 0.88 + enumHand * 0.12);
    return {
      legScore,
      handScore,
      detectedLeg: pose.leg,
      detectedHand: pose.hand,
      templateScore,
    };
  }

  return {
    legScore: enumLeg,
    handScore: enumHand,
    detectedLeg: pose.leg,
    detectedHand: pose.hand,
    templateScore: null,
  };
}

export function combinedMoveScore(scores: MoveAlignmentScores): number {
  return Math.round((scores.legScore + scores.handScore) / 2);
}
