import {
  classifyPose,
  scoreHandMatch,
  scoreLegMatch,
} from "./classify";
import { scoreMoveAlignment } from "./move-alignment";
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

const SAMPLE_INTERVAL_SEC = 0.2;
const MIN_SAMPLE_INTERVAL_SEC = 0.12;
const MAX_SAMPLE_FRAMES = 220;
const MOVE_WINDOW_PAD_RATIO = 0.12;
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

async function sampleAtTimes(
  video: HTMLVideoElement,
  landmarker: PoseLandmarker,
  weapon: "unarmed" | "jian",
  times: number[],
): Promise<FrameClassification[]> {
  const frames: FrameClassification[] = [];
  for (const timeSec of times) {
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
    frames.push({
      timeSec,
      leg: classified.leg,
      hand: classified.hand,
      legScore: scoreLegMatch(classified.leg, classified.leg),
      handScore: scoreHandMatch(classified.hand, classified.hand),
      legConfidence: classified.legConfidence,
      handConfidence: classified.handConfidence,
      keypoints,
    });
  }
  return frames;
}

function mergeFrames(
  base: FrameClassification[],
  extra: FrameClassification[],
): FrameClassification[] {
  const byTime = new Map<number, FrameClassification>();
  for (const f of [...base, ...extra]) {
    const key = Math.round(f.timeSec * 100) / 100;
    byTime.set(key, f);
  }
  return [...byTime.values()].sort((a, b) => a.timeSec - b.timeSec);
}

export async function sampleVideoPoses(
  video: HTMLVideoElement,
  landmarker: PoseLandmarker,
  weapon: "unarmed" | "jian",
  onProgress: (ratio: number) => void,
  moveWindows?: { start: number; end: number }[],
): Promise<FrameClassification[]> {
  const duration = Math.min(video.duration || 0, MAX_VIDEO_SEC);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Could not read video length.");
  }

  video.pause();
  const frames: FrameClassification[] = [];
  const interval = Math.max(
    MIN_SAMPLE_INTERVAL_SEC,
    Math.min(SAMPLE_INTERVAL_SEC, duration / MAX_SAMPLE_FRAMES),
  );
  const steps = Math.max(1, Math.ceil(duration / interval));

  for (let i = 0; i <= steps; i++) {
    const timeSec = Math.min(i * interval, duration);
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
      keypoints,
    });
    onProgress(timeSec / duration);
  }

  if (moveWindows && moveWindows.length > 0) {
    const denseTimes: number[] = [];
    for (const { start, end } of moveWindows) {
      const len = Math.max(end - start, 0.12);
      const steps = Math.min(8, Math.max(3, Math.ceil(len / 0.08)));
      for (let s = 0; s <= steps; s++) {
        denseTimes.push(start + (len * s) / steps);
      }
    }
    const extra = await sampleAtTimes(video, landmarker, weapon, denseTimes);
    onProgress(1);
    return mergeFrames(frames, extra);
  }

  onProgress(1);
  return frames;
}

function paddedWindow(
  canonical: CanonicalRoutine,
  move: CanonicalMove,
  studentDurationSec: number,
): { start: number; end: number } {
  const { start, end } = scaledWindow(canonical, move, studentDurationSec);
  const len = Math.max(end - start, 0.25);
  const pad = len * MOVE_WINDOW_PAD_RATIO;
  return {
    start: Math.max(0, start - pad),
    end: Math.min(studentDurationSec, end + pad),
  };
}

function scoresForFrameMove(
  routineId: string,
  move: CanonicalMove,
  f: FrameClassification,
  weapon: "unarmed" | "jian",
): { leg: number; hand: number; detectedLeg: FrameClassification["leg"]; detectedHand: FrameClassification["hand"] } {
  if (f.keypoints && f.keypoints.length > 0) {
    const aligned = scoreMoveAlignment(
      routineId,
      move.id,
      move.expectedLeg,
      move.expectedHand,
      f.keypoints,
      weapon,
    );
    return {
      leg: aligned.legScore,
      hand: aligned.handScore,
      detectedLeg: aligned.detectedLeg,
      detectedHand: aligned.detectedHand,
    };
  }
  return {
    leg: scoreLegMatch(f.leg, move.expectedLeg),
    hand: scoreHandMatch(f.hand, move.expectedHand),
    detectedLeg: f.leg,
    detectedHand: f.hand,
  };
}

function bestFrameForMove(
  frames: FrameClassification[],
  move: CanonicalMove,
  canonical: CanonicalRoutine,
  studentDurationSec: number,
  weapon: "unarmed" | "jian",
): FrameClassification | null {
  if (frames.length === 0) return null;
  const { start: windowStart, end: windowEnd } = paddedWindow(
    canonical,
    move,
    studentDurationSec,
  );

  const inWindow = frames.filter(
    (f) => f.timeSec >= windowStart && f.timeSec <= windowEnd,
  );
  let pool = inWindow;
  if (pool.length === 0) {
    const center = (windowStart + windowEnd) / 2;
    pool = [...frames]
      .sort(
        (a, b) =>
          Math.abs(a.timeSec - center) - Math.abs(b.timeSec - center),
      )
      .slice(0, 12);
  }

  let best: FrameClassification | null = null;
  let bestScore = -1;
  for (const f of pool) {
    const scored = scoresForFrameMove(canonical.routineId, move, f, weapon);
    const unknownPenalty =
      (scored.detectedLeg === "unknown" ? 14 : 0) +
      (scored.detectedHand === "unknown" ? 14 : 0);
    const combined =
      scored.leg * 0.52 +
      scored.hand * 0.48 +
      f.legConfidence * 12 +
      f.handConfidence * 12 -
      unknownPenalty;
    if (combined > bestScore) {
      bestScore = combined;
      best = f;
    }
  }
  return best;
}

function legPresentInWindow(
  routineId: string,
  move: CanonicalMove,
  frames: FrameClassification[],
  window: { start: number; end: number },
  weapon: "unarmed" | "jian",
): boolean {
  return frames
    .filter((f) => f.timeSec >= window.start && f.timeSec <= window.end)
    .some((f) => scoresForFrameMove(routineId, move, f, weapon).leg >= 55);
}

export function collapseLegTimeline(
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

/** Consecutive duplicate stances in the syllabus count as one beat for order matching. */
export function collapseExpectedLegSequence(
  moves: { expectedLeg: FrameClassification["leg"] }[],
): FrameClassification["leg"][] {
  const out: FrameClassification["leg"][] = [];
  for (const m of moves) {
    if (m.expectedLeg === "unknown" || m.expectedLeg === "walking") continue;
    if (out[out.length - 1] === m.expectedLeg) continue;
    out.push(m.expectedLeg);
  }
  return out;
}

export function sequenceOrderScore(
  canonical: CanonicalRoutine,
  frames: FrameClassification[],
): { score: number; wrongOrder: number } {
  const expected = collapseExpectedLegSequence(canonical.moves);
  const detected = collapseLegTimeline(frames).map((s) => s.leg);
  if (detected.length === 0 || expected.length === 0) {
    return { score: 0, wrongOrder: expected.length };
  }

  const n = detected.length;
  const prev = new Array<number>(n + 1).fill(0);
  const curr = new Array<number>(n + 1).fill(0);
  let lcs = 0;
  for (let i = 1; i <= expected.length; i++) {
    for (let j = 1; j <= n; j++) {
      if (expected[i - 1] === detected[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    if (i === expected.length) lcs = curr[n];
    for (let j = 0; j <= n; j++) {
      prev[j] = curr[j];
      curr[j] = 0;
    }
  }

  const score = Math.round((lcs / expected.length) * 100);
  const wrongOrder = expected.length - lcs;
  return { score, wrongOrder };
}

function statusForMove(
  legScore: number,
  handScore: number,
  orderOk: boolean,
): MoveAlignmentStatus {
  if (legScore >= 62 && handScore >= 62) return "correct";
  if (!orderOk && legScore < 52 && handScore < 52) return "wrong_sequence";
  if (legScore < 42 && handScore < 42) return "missing";
  if (legScore < 58 || handScore < 58) return "wrong_stance";
  return "correct";
}

export function buildRoutineReport(
  canonical: CanonicalRoutine,
  frames: FrameClassification[],
  studentDurationSec: number,
  weapon: "unarmed" | "jian" = "unarmed",
): RoutineAnalysisReport {
  const { score: sequenceScore, wrongOrder } = sequenceOrderScore(
    canonical,
    frames,
  );
  const moves: MoveReport[] = canonical.moves.map((move) => {
    const frame = bestFrameForMove(
      frames,
      move,
      canonical,
      studentDurationSec,
      weapon,
    );
    const window = paddedWindow(canonical, move, studentDurationSec);

    const scored = frame
      ? scoresForFrameMove(canonical.routineId, move, frame, weapon)
      : null;
    const detectedLeg = scored?.detectedLeg ?? frame?.leg ?? "unknown";
    const detectedHand = scored?.detectedHand ?? frame?.hand ?? "unknown";
    const legScore = scored?.leg ?? 0;
    const handScore = scored?.hand ?? 0;

    const orderOk = legPresentInWindow(
      canonical.routineId,
      move,
      frames,
      window,
      weapon,
    );

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

  let overallScore = Math.round(
    sequenceScore * 0.3 + legScore * 0.35 + handScore * 0.35,
  );
  if (sequenceScore >= 92 && legScore >= 78 && handScore >= 72) {
    overallScore = Math.max(
      overallScore,
      Math.round((sequenceScore + legScore + handScore) / 3),
    );
  }
  if (
    sequenceScore >= 99 &&
    wrongOrderCount === 0 &&
    missedCount <= 1 &&
    legScore >= 78 &&
    handScore >= 78
  ) {
    overallScore = Math.max(
      overallScore,
      Math.round((sequenceScore + legScore + handScore) / 3 + 7),
    );
  }

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
  const studentDurationSec = Math.min(video.duration || 0, MAX_VIDEO_SEC);
  const moveWindows = canonical.moves.map((m) =>
    paddedWindow(canonical, m, studentDurationSec),
  );
  const frames = await sampleVideoPoses(
    video,
    landmarker,
    weapon,
    onProgress,
    moveWindows,
  );
  return buildRoutineReport(canonical, frames, studentDurationSec, weapon);
}
