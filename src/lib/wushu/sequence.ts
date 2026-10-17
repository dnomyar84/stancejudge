import {
  classifyPose,
  scoreHandMatch,
  scoreLegMatch,
} from "./classify";
import { scaledWindow } from "./canonical";
import type {
  CanonicalMove,
  CanonicalRoutine,
  FrameClassification,
  MoveAlignmentStatus,
  MoveReport,
  RoutineAnalysisReport,
  RoutineDefinition,
} from "./types";
import { landmarksToKeypoints } from "@/lib/pose/keypoints";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";

const SAMPLE_INTERVAL_SEC = 0.45;
const MAX_VIDEO_SEC = 600;

function waitForSeek(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      reject(new Error("Video seek failed."));
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
  });
}

export async function sampleVideoPoses(
  video: HTMLVideoElement,
  landmarker: PoseLandmarker,
  weapon: "unarmed" | "jian",
  onProgress: (ratio: number) => void,
): Promise<FrameClassification[]> {
  const duration = Math.min(video.duration || 0, MAX_VIDEO_SEC);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Could not read video length.");
  }

  video.pause();
  const frames: FrameClassification[] = [];
  const steps = Math.max(1, Math.ceil(duration / SAMPLE_INTERVAL_SEC));

  for (let i = 0; i <= steps; i++) {
    const timeSec = Math.min(i * SAMPLE_INTERVAL_SEC, duration);
    video.currentTime = timeSec;
    await waitForSeek(video);

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) continue;

    const result = landmarker.detectForVideo(video, performance.now());
    const landmarks = result.landmarks[0];
    if (!landmarks) continue;

    const keypoints = landmarksToKeypoints(landmarks, w, h);
    const classified = classifyPose(keypoints, weapon);
    const legScore = scoreLegMatch(classified.leg, classified.leg);
    const handScore = scoreHandMatch(classified.hand, classified.hand);

    frames.push({
      timeSec,
      leg: classified.leg,
      hand: classified.hand,
      legScore,
      handScore,
      legConfidence: classified.legConfidence,
      handConfidence: classified.handConfidence,
    });
    onProgress(timeSec / duration);
  }

  onProgress(1);
  return frames;
}

function bestFrameForMove(
  frames: FrameClassification[],
  move: CanonicalMove,
  canonical: CanonicalRoutine,
  studentDurationSec: number,
): FrameClassification | null {
  if (frames.length === 0) return null;
  const { start: windowStart, end: windowEnd } = scaledWindow(
    canonical,
    move,
    studentDurationSec,
  );

  const inWindow = frames.filter(
    (f) => f.timeSec >= windowStart && f.timeSec <= windowEnd,
  );
  const pool = inWindow.length > 0 ? inWindow : frames;

  let best: FrameClassification | null = null;
  let bestScore = -1;
  for (const f of pool) {
    const leg = scoreLegMatch(f.leg, move.expectedLeg);
    const hand = scoreHandMatch(f.hand, move.expectedHand);
    const combined =
      leg * 0.5 + hand * 0.5 + f.legConfidence * 10 + f.handConfidence * 10;
    if (combined > bestScore) {
      bestScore = combined;
      best = f;
    }
  }
  return best;
}

function collapseLegTimeline(
  frames: FrameClassification[],
): { leg: FrameClassification["leg"]; timeSec: number }[] {
  const out: { leg: FrameClassification["leg"]; timeSec: number }[] = [];
  for (const f of frames) {
    if (f.leg === "unknown" || f.leg === "walking") continue;
    const last = out[out.length - 1];
    if (!last || last.leg !== f.leg) {
      out.push({ leg: f.leg, timeSec: f.timeSec });
    }
  }
  return out;
}

function sequenceOrderScore(
  canonical: CanonicalRoutine,
  frames: FrameClassification[],
): { score: number; wrongOrder: number } {
  const expected = canonical.moves.map((m) => m.expectedLeg);
  const detected = collapseLegTimeline(frames).map((s) => s.leg);
  if (detected.length === 0) return { score: 0, wrongOrder: expected.length };

  let matched = 0;
  let wrongOrder = 0;
  let d = 0;
  for (const exp of expected) {
    while (d < detected.length && detected[d] !== exp) {
      wrongOrder++;
      d++;
    }
    if (d < detected.length) {
      matched++;
      d++;
    }
  }
  const missed = expected.length - matched;
  wrongOrder += missed;
  const score = Math.round((matched / expected.length) * 100);
  return { score, wrongOrder };
}

function statusForMove(
  legScore: number,
  handScore: number,
  orderOk: boolean,
): MoveAlignmentStatus {
  if (!orderOk) return "wrong_sequence";
  if (legScore < 45 && handScore < 45) return "missing";
  if (legScore < 55 || handScore < 55) return "wrong_stance";
  return "correct";
}

export function buildRoutineReport(
  canonical: CanonicalRoutine,
  frames: FrameClassification[],
  studentDurationSec: number,
): RoutineAnalysisReport {
  const { score: sequenceScore, wrongOrder } = sequenceOrderScore(
    canonical,
    frames,
  );
  const collapsed = collapseLegTimeline(frames);
  let detectIdx = 0;

  const moves: MoveReport[] = canonical.moves.map((move) => {
    const frame = bestFrameForMove(
      frames,
      move,
      canonical,
      studentDurationSec,
    );

    const detectedLeg = frame?.leg ?? "unknown";
    const detectedHand = frame?.hand ?? "unknown";
    const legScore = frame
      ? scoreLegMatch(detectedLeg, move.expectedLeg)
      : 0;
    const handScore = frame
      ? scoreHandMatch(detectedHand, move.expectedHand)
      : 0;

    let orderOk = true;
    while (
      detectIdx < collapsed.length &&
      collapsed[detectIdx].leg !== move.expectedLeg
    ) {
      detectIdx++;
    }
    if (detectIdx >= collapsed.length) {
      orderOk = false;
    } else {
      detectIdx++;
    }

    const status = statusForMove(legScore, handScore, orderOk);
    let notes = move.coachTip;
    if (status === "missing") {
      notes = `This section was hard to see — check camera angle and lighting. ${move.coachTip}`;
    } else if (status === "wrong_sequence") {
      notes = `Leg stance order may be off before “${move.name}”. ${move.coachTip}`;
    } else if (status === "wrong_stance") {
      notes = `Adjust legs (${detectedLeg}) and hands (${detectedHand}) toward ${move.expectedLeg} / ${move.expectedHand}.`;
    }

    return {
      move,
      status,
      matchedTimeSec: frame?.timeSec ?? null,
      legScore,
      handScore,
      detectedLeg,
      detectedHand,
      notes,
    };
  });

  const legScore = Math.round(
    moves.reduce((s, m) => s + m.legScore, 0) / moves.length,
  );
  const handScore = Math.round(
    moves.reduce((s, m) => s + m.handScore, 0) / moves.length,
  );
  const missedCount = moves.filter((m) => m.status === "missing").length;
  const wrongOrderCount = moves.filter(
    (m) => m.status === "wrong_sequence",
  ).length;

  const overallScore = Math.round(
    sequenceScore * 0.35 + legScore * 0.35 + handScore * 0.3,
  );

  let summary =
    "Good effort — use the move list below to practice weak sections.";
  if (overallScore >= 80) {
    summary = "Strong routine flow. Polish the yellow items for competition.";
  } else if (missedCount >= 3) {
    summary =
      "Several sections were missed on camera — film from the front with full body visible.";
  } else if (wrongOrderCount >= 2) {
    summary =
      "Work on step order: drill each move name in sequence before speed.";
  }

  return {
    routineId: canonical.routineId,
    overallScore,
    sequenceScore,
    legScore,
    handScore,
    moves,
    summary,
    missedCount,
    wrongOrderCount,
  };
}

export async function analyzeRoutineVideo(
  video: HTMLVideoElement,
  canonical: CanonicalRoutine,
  weapon: "unarmed" | "jian",
  landmarker: PoseLandmarker,
  onProgress: (ratio: number) => void,
): Promise<RoutineAnalysisReport> {
  const frames = await sampleVideoPoses(
    video,
    landmarker,
    weapon,
    onProgress,
  );
  const studentDurationSec = Math.min(video.duration || 0, MAX_VIDEO_SEC);
  return buildRoutineReport(canonical, frames, studentDurationSec);
}
