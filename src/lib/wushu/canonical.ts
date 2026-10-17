import { scoreLegMatch } from "./classify";
import type {
  CanonicalMove,
  CanonicalRoutine,
  FrameClassification,
  HandProfileType,
  LegStanceType,
  RoutineDefinition,
} from "./types";

function majority<T extends string>(values: T[]): T {
  const counts = new Map<T, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best = values[0];
  let bestN = 0;
  for (const [v, n] of counts) {
    if (n > bestN) {
      best = v;
      bestN = n;
    }
  }
  return best;
}

function peakTimesForMoves(
  routine: RoutineDefinition,
  frames: FrameClassification[],
  durationSec: number,
): number[] {
  const n = routine.moves.length;
  const segLen = durationSec / n;
  const peaks: number[] = [];

  for (let i = 0; i < n; i++) {
    const center = (i + 0.5) * segLen;
    const searchStart = Math.max(0, center - segLen * 0.65);
    const searchEnd = Math.min(durationSec, center + segLen * 0.65);
    const move = routine.moves[i];
    let bestT = center;
    let best = -1;
    for (const f of frames) {
      if (f.timeSec < searchStart || f.timeSec > searchEnd) continue;
      const leg = scoreLegMatch(f.leg, move.expectedLeg);
      const score = leg + f.legConfidence * 15;
      if (score > best) {
        best = score;
        bestT = f.timeSec;
      }
    }
    peaks.push(bestT);
  }
  return peaks;
}

function boundariesFromPeaks(
  peaks: number[],
  durationSec: number,
): number[] {
  const n = peaks.length;
  const bounds = [0];
  for (let i = 0; i < n - 1; i++) {
    const mid = (peaks[i] + peaks[i + 1]) / 2;
    bounds.push(Math.max(bounds[bounds.length - 1] + 0.15, mid));
  }
  bounds.push(durationSec);
  for (let i = 1; i < bounds.length - 1; i++) {
    bounds[i] = Math.min(bounds[i], durationSec - 0.15 * (bounds.length - 1 - i));
  }
  return bounds;
}

function findSplitTimes(
  frames: FrameClassification[],
  segments: number,
  durationSec: number,
): number[] {
  const transitions: { timeSec: number; weight: number }[] = [];
  let prev = frames[0]?.leg;
  for (const f of frames) {
    if (f.leg === "unknown" || f.leg === "walking") continue;
    if (prev && f.leg !== prev) {
      transitions.push({ timeSec: f.timeSec, weight: 1 });
    }
    prev = f.leg;
  }

  if (transitions.length < segments - 1 || segments <= 1) {
    const splits: number[] = [];
    for (let i = 1; i < segments; i++) {
      splits.push((durationSec * i) / segments);
    }
    return splits;
  }

  const picks: number[] = [];
  for (let i = 1; i < segments; i++) {
    const target = (durationSec * i) / segments;
    let best = transitions[0].timeSec;
    let bestDist = Infinity;
    for (const t of transitions) {
      const d = Math.abs(t.timeSec - target);
      if (d < bestDist) {
        bestDist = d;
        best = t.timeSec;
      }
    }
    picks.push(best);
  }
  return picks.sort((a, b) => a - b);
}

/** Keep syllabus enums; refresh start/end from a reference performance. */
export function buildCanonicalTimingsFromFrames(
  routine: RoutineDefinition,
  frames: FrameClassification[],
  durationSec: number,
  source: {
    youtubeId: string | null;
    youtubeUrl: string | null;
    label?: string;
  },
): CanonicalRoutine {
  const peaks = peakTimesForMoves(routine, frames, durationSec);
  const boundaries = boundariesFromPeaks(peaks, durationSec);
  const n = routine.moves.length;

  const moves: CanonicalMove[] = routine.moves.map((template, index) => ({
    ...template,
    startSec: boundaries[index] ?? 0,
    endSec: boundaries[index + 1] ?? durationSec,
  }));

  return {
    routineId: routine.id,
    calibrated: true,
    sourceYouTubeId: source.youtubeId,
    sourceYouTubeUrl: source.youtubeUrl,
    sourceLabel: source.label ?? null,
    referenceDurationSec: durationSec,
    calibratedAt: new Date().toISOString(),
    moves,
  };
}

export function buildCanonicalFromFrames(
  routine: RoutineDefinition,
  frames: FrameClassification[],
  durationSec: number,
  source: {
    youtubeId: string | null;
    youtubeUrl: string | null;
    label?: string;
  },
): CanonicalRoutine {
  const n = routine.moves.length;
  const splits = findSplitTimes(frames, n, durationSec);
  const boundaries = [0, ...splits, durationSec];

  const moves: CanonicalMove[] = routine.moves.map((template, index) => {
    const startSec = boundaries[index] ?? 0;
    const endSec = boundaries[index + 1] ?? durationSec;
    const inSegment = frames.filter(
      (f) => f.timeSec >= startSec && f.timeSec < endSec,
    );
    const pool = inSegment.length > 0 ? inSegment : frames;

    const legs = pool.map((f) => f.leg).filter((l) => l !== "unknown");
    const hands = pool.map((f) => f.hand).filter((h) => h !== "unknown");

    const expectedLeg = (
      legs.length > 0 ? majority(legs) : template.expectedLeg
    ) as LegStanceType;
    const expectedHand = (
      hands.length > 0 ? majority(hands) : template.expectedHand
    ) as HandProfileType;

    return {
      ...template,
      expectedLeg,
      expectedHand,
      startSec,
      endSec,
    };
  });

  return {
    routineId: routine.id,
    calibrated: true,
    sourceYouTubeId: source.youtubeId,
    sourceYouTubeUrl: source.youtubeUrl,
    sourceLabel: source.label ?? null,
    referenceDurationSec: durationSec,
    calibratedAt: new Date().toISOString(),
    moves,
  };
}

export function placeholderCanonical(
  routine: RoutineDefinition,
  source?: {
    youtubeId: string | null;
    youtubeUrl: string | null;
    label?: string;
  },
): CanonicalRoutine {
  const durationSec = 90;
  const n = routine.moves.length;
  return {
    routineId: routine.id,
    calibrated: false,
    sourceYouTubeId: source?.youtubeId ?? null,
    sourceYouTubeUrl: source?.youtubeUrl ?? null,
    sourceLabel: source?.label ?? null,
    referenceDurationSec: durationSec,
    calibratedAt: null,
    moves: routine.moves.map((m, i) => ({
      ...m,
      startSec: (durationSec * i) / n,
      endSec: (durationSec * (i + 1)) / n,
    })),
  };
}

export function scaledWindow(
  canonical: CanonicalRoutine,
  move: CanonicalMove,
  studentDurationSec: number,
): { start: number; end: number } {
  const scale =
    canonical.referenceDurationSec > 0
      ? studentDurationSec / canonical.referenceDurationSec
      : 1;
  return {
    start: move.startSec * scale,
    end: move.endSec * scale,
  };
}
