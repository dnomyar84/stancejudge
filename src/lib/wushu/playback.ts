import { scaledWindow } from "./canonical";
import type {
  CanonicalMove,
  CanonicalRoutine,
  MoveReport,
  RoutineAnalysisReport,
} from "./types";

export type RailChipState = "upcoming" | "active" | "met" | "missed" | "scanning";

export type RailMove = {
  move: CanonicalMove;
  startSec: number;
  endSec: number;
  state: RailChipState;
  isActive: boolean;
};

export function isMoveMet(report: MoveReport): boolean {
  if (report.status === "correct") return true;
  if (report.status === "wrong_stance") {
    return report.legScore >= 48 && report.handScore >= 48;
  }
  return false;
}

export function buildRailFromReport(
  canonical: CanonicalRoutine,
  report: RoutineAnalysisReport | null,
  currentTimeSec: number,
  studentDurationSec: number,
  scanComplete: boolean,
): RailMove[] {
  const metById = new Map<string, boolean>();
  if (report) {
    for (const m of report.moves) {
      metById.set(m.move.id, isMoveMet(m));
    }
  }

  return canonical.moves.map((move) => {
    const { start, end } = scaledWindow(canonical, move, studentDurationSec);
    const isActive = currentTimeSec >= start && currentTimeSec <= end;
    let state: RailChipState = "upcoming";

    if (currentTimeSec > end) {
      state =
        scanComplete && metById.get(move.id) ? "met" : "missed";
    } else if (isActive) {
      state = scanComplete
        ? metById.get(move.id)
          ? "met"
          : "missed"
        : "scanning";
    }

    return { move, startSec: start, endSec: end, state, isActive };
  });
}

export function railScrollProgress(
  currentTimeSec: number,
  studentDurationSec: number,
): number {
  if (studentDurationSec <= 0) return 0;
  return Math.min(1, Math.max(0, currentTimeSec / studentDurationSec));
}
