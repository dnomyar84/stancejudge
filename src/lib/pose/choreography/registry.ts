import type { MoveChoreographySpec, RoutineVisualCoachSpec } from "../canonical3d/choreography";
import { getMoveEndPose, totalRoutineDurationMs } from "./move-boundaries";
import { wbq01OpeningChoreography } from "./wbq-01-opening";
import {
  wbq06Choreography,
  wbq07Choreography,
  wbq08Choreography,
  wbq09Choreography,
} from "./wbq-moves-closing";
import {
  wbq02Choreography,
  wbq03Choreography,
  wbq04Choreography,
  wbq05Choreography,
} from "./wbq-moves";
import { wuBuQuan } from "@/lib/wushu/routines/wu-bu-quan";

const MOVE_CHOREOGRAPHY: Record<string, MoveChoreographySpec> = {
  "wbq-01": wbq01OpeningChoreography,
  "wbq-02": wbq02Choreography,
  "wbq-03": wbq03Choreography,
  "wbq-04": wbq04Choreography,
  "wbq-05": wbq05Choreography,
  "wbq-06": wbq06Choreography,
  "wbq-07": wbq07Choreography,
  "wbq-08": wbq08Choreography,
  "wbq-09": wbq09Choreography,
};

export const WU_BU_TRANSITION_MS = 600;

export function getMoveChoreography(
  routineId: string,
  moveId: string,
): MoveChoreographySpec | null {
  const spec = MOVE_CHOREOGRAPHY[moveId];
  if (!spec || spec.routineId !== routineId) return null;
  return spec;
}

/** Chain moves so each starts from previous 定势 (except 起势). */
function chainWuBuMoves(): MoveChoreographySpec[] {
  const ordered = wuBuQuan.moves.map((m) => {
    const spec = MOVE_CHOREOGRAPHY[m.id];
    if (!spec) throw new Error(`Missing choreography for ${m.id}`);
    return spec;
  });

  for (let i = 1; i < ordered.length; i++) {
    const prevEnd = getMoveEndPose(ordered[i - 1]);
    const spec = ordered[i];
    const phase0 = spec.phases[0];
    if (phase0.keyframes.length > 0) {
      const k0 = phase0.keyframes.reduce((a, b) => (a.t <= b.t ? a : b));
      k0.pose = prevEnd;
    }
  }
  return ordered;
}

export function getRoutineVisualCoach(
  routineId: string,
): RoutineVisualCoachSpec | null {
  if (routineId !== "wu-bu-quan") return null;

  return {
    routineId,
    nameZh: wuBuQuan.nameZh,
    moves: chainWuBuMoves(),
    transitionMs: WU_BU_TRANSITION_MS,
  };
}

export function routineVisualCoachDurationMs(
  spec: RoutineVisualCoachSpec,
): number {
  return totalRoutineDurationMs(spec.moves, spec.transitionMs);
}
