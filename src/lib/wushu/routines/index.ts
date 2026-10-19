import { getCanonicalRoutine } from "../canonical-store";
import { sanDuanChangQuan } from "./san-duan-chang-quan";
import { siDuanJian } from "./si-duan-jian";
import { wuBuQuan } from "./wu-bu-quan";
import type { CanonicalRoutine, RoutineDefinition } from "../types";

export const ROUTINES: RoutineDefinition[] = [
  sanDuanChangQuan,
  siDuanJian,
  wuBuQuan,
];

export function routineFromCanonical(
  canonical: CanonicalRoutine,
): RoutineDefinition {
  const template = ROUTINES.find((r) => r.id === canonical.routineId);
  if (!template) {
    throw new Error(`No template for ${canonical.routineId}`);
  }
  return {
    ...template,
    description: canonical.calibrated
      ? "Sequence and stances from the selected reference YouTube performance."
      : template.description,
    moves: canonical.moves.map(({ startSec: _s, endSec: _e, ...move }) => move),
  };
}

export function getRoutineById(id: string): RoutineDefinition | undefined {
  try {
    return routineFromCanonical(getCanonicalRoutine(id));
  } catch {
    return ROUTINES.find((r) => r.id === id);
  }
}

export function getRoutinePackage(id: string): {
  routine: RoutineDefinition;
  canonical: CanonicalRoutine;
} {
  const canonical = getCanonicalRoutine(id);
  return { routine: routineFromCanonical(canonical), canonical };
}
