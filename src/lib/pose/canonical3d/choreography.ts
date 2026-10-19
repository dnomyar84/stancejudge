import {
  getMoveEndPose,
  getMoveStartPose,
  totalRoutineDurationMs,
} from "../choreography/move-boundaries";
import { settlePoseOnFloor } from "../coach-figure/gravity";
import type { ExtendedCoachPose } from "../coach-figure/extended-pose";
import { lerpExtendedPose } from "../coach-figure/interpolate-pose";
import type { CoachBonePoseV1 } from "../bone-rig/schema";
import { lerpCoachBonePose } from "../bone-rig/lerp-bone-pose";
import type { CoachFigurinePoseV1 } from "../display-figurine/coach-figurine-pose";
import {
  resolveFigurineAtKeyframe,
  resolveFigurineBetweenKeyframes,
} from "../display-figurine/resolve-figurine-frame";
import { extendedToCoachFigurinePose } from "../mannequin-adapter/coach-pose-to-mannequin";
import type { StanceConstraintSet } from "./constraints";

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
  /** Semantic rig (scoring, 2D projection, cues). */
  pose: ExtendedCoachPose;
  /**
   * Display truth for the 3D figurine (mannequin DOFs).
   * When set, the viewer applies this directly — no IK.
   */
  figurine?: CoachFigurinePoseV1;
  /** Native bone rotations (Three.js display truth). */
  bone?: CoachBonePoseV1;
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
  /**
   * Optional 定势 checks (hard + soft). Applied to interpolated pose while this phase plays.
   * Example: 提膝 — support leg straight (required), support toe yaw (preferred band).
   */
  stanceConstraints?: StanceConstraintSet;
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
  /** Cross-fade between moves (ms). */
  transitionMs: number;
};

export type SampledCoachFrame = {
  pose: ExtendedCoachPose;
  /** Resolved display pose for the figurine at this instant. */
  figurine: CoachFigurinePoseV1;
  /** Present when keyframes store `bone` or after client compile. */
  bone?: CoachBonePoseV1;
  moveId: string;
  moveNameZh: string;
  phaseId: string | null;
  phaseNameZh: string | null;
  keyframeLabelZh: string | null;
  activeCues: ChoreographyCue[];
  stanceConstraints: StanceConstraintSet | null;
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
  const blendT = Math.max(0, Math.min(1, segT));
  const pose = lerpExtendedPose(from.pose, to.pose, blendT);
  const figurine = resolveFigurineBetweenKeyframes(from, to, blendT);
  const bone =
    from.bone && to.bone
      ? lerpCoachBonePose(from.bone, to.bone, blendT)
      : undefined;
  const cueIds =
    segT < 0.5
      ? (from.activeCueIds ?? to.activeCueIds ?? [])
      : (to.activeCueIds ?? from.activeCueIds ?? []);
  const activeCues = phase.cues.filter((c) => cueIds.includes(c.id));

  return {
    pose,
    figurine,
    bone,
    moveId: spec.moveId,
    moveNameZh: spec.nameZh,
    phaseId: phase.id,
    phaseNameZh: phase.nameZh,
    keyframeLabelZh: segT < 0.5 ? from.labelZh : to.labelZh,
    activeCues,
    stanceConstraints: phase.stanceConstraints ?? null,
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
    pose: settlePoseOnFloor(kf.pose),
    figurine: resolveFigurineAtKeyframe(kf),
    bone: kf.bone,
    moveId: spec.moveId,
    moveNameZh: spec.nameZh,
    phaseId: phase.id,
    phaseNameZh: phase.nameZh,
    keyframeLabelZh: kf.labelZh,
    activeCues,
    stanceConstraints: phase.stanceConstraints ?? null,
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
  const totalMs = totalRoutineDurationMs(spec.moves, spec.transitionMs);
  let ms = t * totalMs;
  const moves = spec.moves;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    if (ms <= move.durationMs) {
      const moveT = move.durationMs > 0 ? ms / move.durationMs : 1;
      const frame = sampleMoveChoreography(move, moveT);
      return { ...frame, routineT: t };
    }
    ms -= move.durationMs;

    if (i < moves.length - 1 && spec.transitionMs > 0) {
      if (ms <= spec.transitionMs) {
        const from = getMoveEndPose(move);
        const to = getMoveStartPose(moves[i + 1]);
        const blend = ms / spec.transitionMs;
        const pose = lerpExtendedPose(from, to, blend);
        const figurine = resolveFigurineBetweenKeyframes(
          { pose: from, figurine: extendedToCoachFigurinePose(from) },
          { pose: to, figurine: extendedToCoachFigurinePose(to) },
          blend,
        );
        const next = moves[i + 1];
        return {
          pose,
          figurine,
          moveId: next.moveId,
          moveNameZh: next.nameZh,
          phaseId: null,
          phaseNameZh: "过渡",
          keyframeLabelZh: "动作衔接",
          activeCues: [],
          stanceConstraints: null,
          moveT: 0,
          routineT: t,
        };
      }
      ms -= spec.transitionMs;
    }
  }

  const last = moves[moves.length - 1];
  const frame = sampleMoveChoreography(last, 1);
  return { ...frame, routineT: 1 };
}

export function listPhaseCues(spec: MoveChoreographySpec): ChoreographyCue[] {
  return spec.phases.flatMap((p) => p.cues);
}
