import type { MoveChoreographySpec } from "../canonical3d/choreography";
import type { ExtendedCoachPose } from "../coach-figure/extended-pose";

function firstKeyframePose(spec: MoveChoreographySpec): ExtendedCoachPose {
  const phase = spec.phases[0];
  const kf = phase.keyframes.reduce((a, b) => (a.t <= b.t ? a : b));
  return kf.pose;
}

function lastKeyframePose(spec: MoveChoreographySpec): ExtendedCoachPose {
  const phase = spec.phases[spec.phases.length - 1];
  const kf = phase.keyframes.reduce((a, b) => (a.t >= b.t ? a : b));
  return kf.pose;
}

export function getMoveStartPose(spec: MoveChoreographySpec): ExtendedCoachPose {
  return firstKeyframePose(spec);
}

export function getMoveEndPose(spec: MoveChoreographySpec): ExtendedCoachPose {
  return lastKeyframePose(spec);
}

export function totalRoutineDurationMs(
  moves: MoveChoreographySpec[],
  transitionMs: number,
): number {
  const moveSum = moves.reduce((s, m) => s + m.durationMs, 0);
  const gaps = Math.max(0, moves.length - 1) * transitionMs;
  return moveSum + gaps;
}
