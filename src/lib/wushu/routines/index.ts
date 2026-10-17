import { sanDuanChangQuan } from "./san-duan-chang-quan";
import { siDuanJian } from "./si-duan-jian";
import type { RoutineDefinition } from "../types";

export const ROUTINES: RoutineDefinition[] = [sanDuanChangQuan, siDuanJian];

export function getRoutineById(id: string): RoutineDefinition | undefined {
  return ROUTINES.find((r) => r.id === id);
}
