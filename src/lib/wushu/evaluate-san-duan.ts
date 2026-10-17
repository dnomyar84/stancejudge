import { placeholderCanonical } from "./canonical";
import { sanDuanChangQuan } from "./routines/san-duan-chang-quan";
import {
  buildRoutineReport,
  collapseLegTimeline,
  sequenceOrderScore,
} from "./sequence";
import {
  SAN_DUAN_EXPECTED_LEGS,
  SAN_DUAN_EXPECTED_HANDS,
} from "./san-duan-expectations";
import type { FrameClassification, RoutineAnalysisReport } from "./types";

export type SanDuanVideoEvaluation = {
  sequenceScore: number;
  wrongOrder: number;
  overallScore: number;
  report: RoutineAnalysisReport;
  /** Share of syllabus leg stances observed in timeline (0–1). */
  legCoverage: number;
  /** Share of syllabus hand profiles observed in any frame (0–1). */
  handCoverage: number;
  frameCount: number;
};

export function evaluateFramesAsSanDuanChangQuan(
  frames: FrameClassification[],
  studentDurationSec: number,
): SanDuanVideoEvaluation {
  const canonical = placeholderCanonical(sanDuanChangQuan, {
    youtubeId: null,
    youtubeUrl: null,
    label: "test-fixture",
  });

  const { score: sequenceScore, wrongOrder } = sequenceOrderScore(
    canonical,
    frames,
  );
  const report = buildRoutineReport(canonical, frames, studentDurationSec);

  const legsSeen = new Set(
    collapseLegTimeline(frames).map((s) => s.leg),
  );
  const handsSeen = new Set(
    frames.filter((f) => f.hand !== "unknown").map((f) => f.hand),
  );

  const legCoverage =
    SAN_DUAN_EXPECTED_LEGS.filter((l) => legsSeen.has(l)).length /
    SAN_DUAN_EXPECTED_LEGS.length;

  const handCoverage =
    SAN_DUAN_EXPECTED_HANDS.filter((h) => handsSeen.has(h)).length /
    SAN_DUAN_EXPECTED_HANDS.length;

  return {
    sequenceScore,
    wrongOrder,
    overallScore: report.overallScore,
    report,
    legCoverage,
    handCoverage,
    frameCount: frames.length,
  };
}
