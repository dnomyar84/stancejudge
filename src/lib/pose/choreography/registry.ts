import type { MoveChoreographySpec, RoutineVisualCoachSpec } from "../canonical3d/choreography";
import { extendedFromSkeleton } from "../coach-figure/extended-pose";
import { buildCoachFigureSkeleton } from "../coach-figure";
import { wbq01OpeningChoreography } from "./wbq-01-opening";
import { wuBuQuan } from "@/lib/wushu/routines/wu-bu-quan";

const MOVE_CHOREOGRAPHY: Record<string, MoveChoreographySpec> = {
  "wbq-01": wbq01OpeningChoreography,
};

export function getMoveChoreography(
  routineId: string,
  moveId: string,
): MoveChoreographySpec | null {
  const spec = MOVE_CHOREOGRAPHY[moveId];
  if (!spec || spec.routineId !== routineId) return null;
  return spec;
}

/** Full-routine visual coach timeline (choreographed moves + static holds for others). */
export function getRoutineVisualCoach(
  routineId: string,
): RoutineVisualCoachSpec | null {
  if (routineId !== "wu-bu-quan") return null;

  const moves: MoveChoreographySpec[] = wuBuQuan.moves.map((m) => {
    const choreo = getMoveChoreography(routineId, m.id);
    if (choreo) return choreo;
    const sk = buildCoachFigureSkeleton(routineId, m.id);
    const pose = sk ? extendedFromSkeleton(sk) : extendedFromSkeleton(
      buildCoachFigureSkeleton(routineId, "wbq-01")!,
    );
    return {
      routineId,
      moveId: m.id,
      nameZh: m.nameZh,
      nameEn: m.name,
      durationMs: 2000,
      phases: [
        {
          id: "hold",
          nameZh: "定势",
          nameEn: "Hold",
          cues: [],
          keyframes: [
            {
              id: "hold-1",
              t: 0,
              labelZh: m.nameZh,
              pose,
            },
          ],
          segmentWeights: [],
        },
      ],
    };
  });

  return {
    routineId,
    nameZh: wuBuQuan.nameZh,
    moves,
  };
}
