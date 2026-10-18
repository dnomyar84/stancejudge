import { scoreMoveTemplateSimilarity } from "@/lib/pose/move-pose-score";
import { scoreExpectedStanceGeometry } from "@/lib/pose/stance-geometry";
import { buildSanDuanMoveKeypoints } from "@/lib/pose/san-duan-chang-quan-poses";
import type { PoseKeypoint } from "@/lib/pose/types";
import { classifyPose, scoreHandMatch, scoreLegMatch } from "./classify";
import { gongBuLeadForMove } from "./gong-bu-lead";
import type { HandProfileType, LegStanceType } from "./types";

export type MoveAlignmentScores = {
  legScore: number;
  handScore: number;
  detectedLeg: LegStanceType;
  detectedHand: HandProfileType;
  templateScore: number | null;
  geometryLegScore: number | null;
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

  const gongLead = gongBuLeadForMove(routineId, moveId);
  const geometryLegScore = scoreExpectedStanceGeometry(expectedLeg, keypoints, {
    gongBuLead: gongLead ?? undefined,
  });

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

  const geom =
    geometryLegScore !== null && geometryLegScore >= 20
      ? geometryLegScore
      : enumLeg;
  const legScore = templateScore !== null
    ? Math.round(geom * 0.5 + templateScore * 0.32 + enumLeg * 0.18)
    : Math.round(geom * 0.72 + enumLeg * 0.28);

  const handScore =
    templateScore !== null
      ? Math.round(templateScore * 0.82 + enumHand * 0.18)
      : enumHand;

  return {
    legScore,
    handScore,
    detectedLeg: pose.leg,
    detectedHand: pose.hand,
    templateScore,
    geometryLegScore,
  };
}

export function combinedMoveScore(scores: MoveAlignmentScores): number {
  return Math.round((scores.legScore + scores.handScore) / 2);
}
