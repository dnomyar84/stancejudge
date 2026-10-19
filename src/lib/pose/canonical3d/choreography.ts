import type { ExtendedCoachPose } from "../coach-figure/extended-pose";
import { lerpExtendedPose } from "../coach-figure/interpolate-pose";

/** Body layer a coaching cue applies to. */
export type ChoreographyLayer =
  | "legs"
  | "feet"
  | "arms"
  | "hands"
  | "torso"
  | "whole";

/** Human-readable coaching step (shown in lab; drives authoring). */
export type ChoreographyCue = {
  id: string;
  layer: ChoreographyLayer;
  labelZh: string;
  labelEn: string;
  descriptionZh: string;
};

/** One instant in a move — full rig including hands and feet. */
export type RigKeyframe = {
  id: string;
  /** 0…1 within the parent phase. */
  t: number;
  labelZh: string;
  labelEn?: string;
  pose: ExtendedCoachPose;
  /** Cues the athlete is executing *toward* this keyframe. */
  activeCueIds?: string[];
};

/**
 * Sub-sequence inside one syllabus move (e.g. 起势 = 并步 phase + 抱拳 phase).
 * Each phase has its own keyframe rail; phases run in order when sampling the move.
 */
export type ChoreographyPhase = {
  id: string;
  nameZh: string;
  nameEn: string;
  cues: ChoreographyCue[];
  keyframes: RigKeyframe[];
  /** Duration weights between consecutive keyframes in this phase. */
  segmentWeights: number[];
};

export type MoveChoreographySpec = {
  routineId: string;
  moveId: string;
  nameZh: string;
  nameEn: string;
  phases: ChoreographyPhase[];
  /** Playback length for this move in the visual coach (ms). */
  durationMs: number;
  /** Hold on final keyframe (定形), ms. */
  pauseMinMs?: number;
};

export type RoutineVisualCoachSpec = {
  routineId: string;
  nameZh: string;
  moves: MoveChoreographySpec[];
};

export type SampledCoachFrame = {
  pose: ExtendedCoachPose;
  moveId: string;
  moveNameZh: string;
  phaseId: string | null;
  phaseNameZh: string | null;
  keyframeLabelZh: string | null;
  activeCues: ChoreographyCue[];
  /** 0…1 within current move. */
  moveT: number;
  /** 0…1 across entire routine playback. */
  routineT: number;
};

function flattenPhaseKeyframes(
  phase: ChoreographyPhase,
): { t: number; keyframe: RigKeyframe; phase: ChoreographyPhase }[] {
  return phase.keyframes.map((kf) => ({
    t: kf.t,
    keyframe: kf,
    phase,
  }));
}

/** Sample one move at normalized time 0…1 (phases concatenated by segment weights). */
export function sampleMoveChoreography(
  spec: MoveChoreographySpec,
  moveT: number,
): SampledCoachFrame {
  const clamped = Math.max(0, Math.min(1, moveT));
  const phases = spec.phases;
  if (phases.length === 0) {
    throw new Error(`No phases for ${spec.moveId}`);
  }

  const phaseCount = phases.length;
  const phaseWeight = 1 / phaseCount;
  const phaseIndex = Math.min(
    phaseCount - 1,
    Math.floor(clamped / phaseWeight),
  );
  const localT = (clamped - phaseIndex * phaseWeight) / phaseWeight;
  const phase = phases[phaseIndex];
  const kfs = phase.keyframes;
  if (kfs.length === 0) {
    throw new Error(`No keyframes in phase ${phase.id}`);
  }
  if (kfs.length === 1) {
    return frameResult(spec, phase, kfs[0], clamped, clamped, []);
  }

  const weights = phase.segmentWeights;
  if (weights.length !== kfs.length - 1) {
    throw new Error(`segmentWeights length mismatch in ${phase.id}`);
  }
  const totalW = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  let seg = 0;
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] / totalW;
    if (localT <= acc + w || i === weights.length - 1) {
      seg = i;
      break;
    }
    acc += w;
  }
  const w = weights[seg] / totalW;
  const segT = w > 0 ? (localT - acc) / w : 1;
  const from = kfs[seg];
  const to = kfs[seg + 1];
  const pose = lerpExtendedPose(from.pose, to.pose, Math.max(0, Math.min(1, segT)));
  const cueIds = to.activeCueIds ?? [];
  const activeCues = phase.cues.filter((c) => cueIds.includes(c.id));

  return {
    pose,
    moveId: spec.moveId,
    moveNameZh: spec.nameZh,
    phaseId: phase.id,
    phaseNameZh: phase.nameZh,
    keyframeLabelZh: segT < 0.5 ? from.labelZh : to.labelZh,
    activeCues,
    moveT: clamped,
    routineT: clamped,
  };
}

function frameResult(
  spec: MoveChoreographySpec,
  phase: ChoreographyPhase,
  kf: RigKeyframe,
  moveT: number,
  routineT: number,
  activeCues: ChoreographyCue[],
): SampledCoachFrame {
  return {
    pose: kf.pose,
    moveId: spec.moveId,
    moveNameZh: spec.nameZh,
    phaseId: phase.id,
    phaseNameZh: phase.nameZh,
    keyframeLabelZh: kf.labelZh,
    activeCues,
    moveT,
    routineT,
  };
}

/** Walk entire routine visual coach timeline (moves play in order). */
export function sampleRoutineVisualCoach(
  spec: RoutineVisualCoachSpec,
  routineT: number,
): SampledCoachFrame {
  const t = Math.max(0, Math.min(1, routineT));
  const totalMs = spec.moves.reduce((s, m) => s + m.durationMs, 0);
  let ms = t * totalMs;
  for (const move of spec.moves) {
    if (ms <= move.durationMs) {
      const moveT = move.durationMs > 0 ? ms / move.durationMs : 1;
      const frame = sampleMoveChoreography(move, moveT);
      return { ...frame, routineT: t };
    }
    ms -= move.durationMs;
  }
  const last = spec.moves[spec.moves.length - 1];
  const frame = sampleMoveChoreography(last, 1);
  return { ...frame, routineT: 1 };
}

export function listPhaseCues(spec: MoveChoreographySpec): ChoreographyCue[] {
  return spec.phases.flatMap((p) => p.cues);
}
