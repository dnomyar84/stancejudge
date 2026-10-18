import { scoreHandMatch, scoreLegMatch } from "./classify";
import { scoreMoveAlignment } from "./move-alignment";
import type { HandProfileType, LegStanceType } from "./types";
import type { PoseKeypoint } from "@/lib/pose/types";

export type MoveGrade = "perfect" | "good" | "miss";

export function gradeFromScores(
  legScore: number,
  handScore: number,
  shallowStance: boolean,
): MoveGrade {
  if (shallowStance && legScore < 70) return "miss";
  const avg = (legScore + handScore) / 2;
  if (avg >= 85 && legScore >= 75 && handScore >= 75) return "perfect";
  if (avg >= 52) return "good";
  return "miss";
}

export function scoresForExpected(
  detectedLeg: LegStanceType,
  detectedHand: HandProfileType,
  expectedLeg: LegStanceType,
  expectedHand: HandProfileType,
): { legScore: number; handScore: number } {
  return {
    legScore: scoreLegMatch(detectedLeg, expectedLeg),
    handScore: scoreHandMatch(detectedHand, expectedHand),
  };
}

/** Per-move scoring: template similarity for 三段长拳, enums elsewhere. */
export function scoresForMove(
  routineId: string,
  moveId: string,
  keypoints: PoseKeypoint[],
  expectedLeg: LegStanceType,
  expectedHand: HandProfileType,
  weapon: "unarmed" | "jian",
): { legScore: number; handScore: number } {
  const aligned = scoreMoveAlignment(
    routineId,
    moveId,
    expectedLeg,
    expectedHand,
    keypoints,
    weapon,
  );
  return { legScore: aligned.legScore, handScore: aligned.handScore };
}

export function gradePoints(grade: MoveGrade): number {
  if (grade === "perfect") return 100;
  if (grade === "good") return 65;
  return 0;
}
