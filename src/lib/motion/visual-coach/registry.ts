import type {
  MoveChoreographySpec,
  RoutineVisualCoachSpec,
} from "@/lib/pose/canonical3d/choreography";
import { totalRoutineDurationMs } from "@/lib/motion/choreography/move-boundaries";
import { ensureMotionDisciplinesRegistered } from "@/lib/motion/bootstrap";

export type VisualCoachRoutineRegistration = {
  routineId: string;
  getRoutineVisualCoach: () => RoutineVisualCoachSpec;
  getMoveChoreography?: (moveId: string) => MoveChoreographySpec | null;
};

const routines = new Map<string, VisualCoachRoutineRegistration>();

export function registerVisualCoachRoutine(
  registration: VisualCoachRoutineRegistration,
): void {
  routines.set(registration.routineId, registration);
}

export function getRoutineVisualCoach(
  routineId: string,
): RoutineVisualCoachSpec | null {
  ensureMotionDisciplinesRegistered();
  const reg = routines.get(routineId);
  if (!reg) return null;
  return reg.getRoutineVisualCoach();
}

export function getMoveChoreography(
  routineId: string,
  moveId: string,
): MoveChoreographySpec | null {
  ensureMotionDisciplinesRegistered();
  const reg = routines.get(routineId);
  if (!reg?.getMoveChoreography) return null;
  return reg.getMoveChoreography(moveId);
}

export function routineVisualCoachDurationMs(
  spec: RoutineVisualCoachSpec,
): number {
  return totalRoutineDurationMs(spec.moves, spec.transitionMs);
}
