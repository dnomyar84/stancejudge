import type { CanonicalRoutine } from "./types";
import type { RailChipState, RailMove } from "./playback";

export function buildLiveRail(
  canonical: CanonicalRoutine,
  moveIndex: number,
  moveGrades: Record<string, "perfect" | "good" | "miss" | "pending">,
  phase: "ready" | "performing" | "complete" | "review",
): RailMove[] {
  return canonical.moves.map((move, i) => {
    const grade = moveGrades[move.id];
    let state: RailChipState = "upcoming";
    if (phase === "ready") {
      state = i === 0 ? "active" : "upcoming";
    } else if (i < moveIndex) {
      state =
        grade === "perfect" || grade === "good"
          ? "met"
          : grade === "miss"
            ? "missed"
            : "missed";
    } else if (i === moveIndex && phase === "performing") {
      state = "scanning";
    } else if (phase === "complete" || phase === "review") {
      state =
        grade === "perfect" || grade === "good"
          ? "met"
          : grade === "miss"
            ? "missed"
            : "upcoming";
    }
    const isActive = i === moveIndex && phase === "performing";
    const duration = canonical.referenceDurationSec;
    const startSec = (i / canonical.moves.length) * duration;
    const endSec = ((i + 1) / canonical.moves.length) * duration;
    return { move, startSec, endSec, state, isActive };
  });
}

export function liveRailScrollProgress(
  moveIndex: number,
  moveCount: number,
): number {
  if (moveCount <= 1) return 0;
  return Math.min(1, moveIndex / (moveCount - 1));
}
