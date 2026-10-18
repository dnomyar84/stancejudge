import { classifyPose } from "./classify";
import { gradeFromScores, scoresForExpected, scoresForMove } from "./move-grade";
import type { CanonicalRoutine, HandProfileType, LegStanceType } from "./types";
import type { PoseKeypoint } from "@/lib/pose/types";

export type PracticePhase = "ready" | "performing" | "complete" | "review";

const STABLE_FRAMES_START = 8;
const STABLE_FRAMES_END = 10;
const STABLE_FRAMES_ADVANCE = 6;

export type LiveSessionState = {
  phase: PracticePhase;
  moveIndex: number;
  startStable: number;
  endStable: number;
  advanceStable: number;
  combo: number;
  maxCombo: number;
  totalPoints: number;
  moveGrades: Record<string, "perfect" | "good" | "miss" | "pending">;
  lastGrade: "perfect" | "good" | "miss" | null;
};

export function initialLiveSession(): LiveSessionState {
  return {
    phase: "ready",
    moveIndex: 0,
    startStable: 0,
    endStable: 0,
    advanceStable: 0,
    combo: 0,
    maxCombo: 0,
    totalPoints: 0,
    moveGrades: {},
    lastGrade: null,
  };
}

function matchesMove(
  routineId: string,
  moveId: string,
  keypoints: PoseKeypoint[],
  weapon: "unarmed" | "jian",
  expectedLeg: LegStanceType,
  expectedHand: HandProfileType,
  minLeg = 55,
  minHand = 50,
): boolean {
  const { legScore, handScore } = scoresForMove(
    routineId,
    moveId,
    keypoints,
    expectedLeg,
    expectedHand,
    weapon,
  );
  return legScore >= minLeg && handScore >= minHand;
}

function shallowForLeg(
  keypoints: PoseKeypoint[],
  expectedLeg: LegStanceType,
): boolean {
  if (expectedLeg !== "ma_bu" && expectedLeg !== "gong_bu") return false;
  const pose = classifyPose(keypoints, "unarmed");
  const { legScore } = scoresForExpected(
    pose.leg,
    pose.hand,
    expectedLeg,
    pose.hand,
  );
  return legScore < 58 && legScore > 30;
}

export type SessionTickResult = LiveSessionState & {
  gradeFlash: "perfect" | "good" | "miss" | null;
  floaterText: string | null;
};

export function tickLiveSession(
  state: LiveSessionState,
  canonical: CanonicalRoutine,
  keypoints: PoseKeypoint[] | null,
  weapon: "unarmed" | "jian",
): SessionTickResult {
  const moves = canonical.moves;
  if (!keypoints || moves.length === 0) {
    return { ...state, gradeFlash: null, floaterText: null };
  }

  let next = { ...state };
  let gradeFlash: "perfect" | "good" | "miss" | null = null;
  let floaterText: string | null = null;

  const first = moves[0];
  const last = moves[moves.length - 1];

  if (next.phase === "ready") {
    if (
      matchesMove(
        canonical.routineId,
        first.id,
        keypoints,
        weapon,
        first.expectedLeg,
        first.expectedHand,
      )
    ) {
      next.startStable += 1;
      if (next.startStable >= STABLE_FRAMES_START) {
        next.phase = "performing";
        next.moveIndex = 0;
        next.advanceStable = 0;
        floaterText = "开始!";
      }
    } else {
      next.startStable = 0;
    }
    return { ...next, gradeFlash, floaterText };
  }

  if (next.phase === "performing") {
    const move = moves[next.moveIndex];
    const aligned = scoresForMove(
      canonical.routineId,
      move.id,
      keypoints,
      move.expectedLeg,
      move.expectedHand,
      weapon,
    );
    const { legScore, handScore } = aligned;
    const shallow = shallowForLeg(keypoints, move.expectedLeg);
    const grade = gradeFromScores(legScore, handScore, shallow);

    if (
      matchesMove(
        canonical.routineId,
        move.id,
        keypoints,
        weapon,
        move.expectedLeg,
        move.expectedHand,
      )
    ) {
      next.advanceStable += 1;
    } else {
      next.advanceStable = Math.max(0, next.advanceStable - 1);
    }

    if (next.advanceStable >= STABLE_FRAMES_ADVANCE) {
      next.moveGrades[move.id] = grade;
      gradeFlash = grade;
      floaterText =
        grade === "perfect"
          ? "PERFECT!"
          : grade === "good"
            ? "Good"
            : shallow
              ? "LOW"
              : "Miss";

      const pts =
        grade === "perfect"
          ? 100
          : grade === "good"
            ? 65
            : 0;
      next.totalPoints += pts * (1 + Math.min(next.combo, 5) * 0.1);
      if (grade === "miss") {
        next.combo = 0;
      } else {
        next.combo += 1;
        next.maxCombo = Math.max(next.maxCombo, next.combo);
      }
      next.lastGrade = grade;
      next.advanceStable = 0;

      if (next.moveIndex >= moves.length - 1) {
        next.endStable += 1;
        if (next.endStable >= STABLE_FRAMES_END) {
          next.phase = "complete";
          floaterText = "收势 — 完成!";
        }
      } else {
        next.moveIndex += 1;
        next.endStable = 0;
      }
    }

    return { ...next, gradeFlash, floaterText };
  }

  return { ...next, gradeFlash: null, floaterText: null };
}

export function sessionToPhaseLabel(phase: PracticePhase): string {
  switch (phase) {
    case "ready":
      return "Ready — perform 起势 to begin";
    case "performing":
      return "Performing";
    case "complete":
      return "Complete";
    case "review":
      return "Review";
  }
}
