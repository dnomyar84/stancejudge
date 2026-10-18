import { getCanonicalOverride } from "@/lib/admin/store";
import siDuanJianCanonical from "@/data/canonical/si-duan-jian.json";
import sanDuanChangQuanCanonical from "@/data/canonical/san-duan-chang-quan.json";
import { sanDuanChangQuan } from "./routines/san-duan-chang-quan";
import { siDuanJian } from "./routines/si-duan-jian";
import type { CanonicalRoutine, RoutineDefinition } from "./types";

const BY_ID: Record<string, CanonicalRoutine> = {
  "si-duan-jian": siDuanJianCanonical as CanonicalRoutine,
  "san-duan-chang-quan": sanDuanChangQuanCanonical as CanonicalRoutine,
};

const DEFINITIONS: Record<string, RoutineDefinition> = {
  "san-duan-chang-quan": sanDuanChangQuan,
  "si-duan-jian": siDuanJian,
};

/** Timing from calibrated JSON; leg/hand expectations from syllabus source of truth. */
function mergeSyllabusExpectations(c: CanonicalRoutine): CanonicalRoutine {
  const def = DEFINITIONS[c.routineId];
  if (!def) return c;
  const byId = new Map(def.moves.map((m) => [m.id, m]));
  return {
    ...c,
    moves: c.moves.map((m) => {
      const syllabus = byId.get(m.id);
      if (!syllabus) return m;
      return {
        ...m,
        name: syllabus.name,
        nameZh: syllabus.nameZh,
        expectedLeg: syllabus.expectedLeg,
        expectedHand: syllabus.expectedHand,
        coachTip: syllabus.coachTip,
      };
    }),
  };
}

export function getCanonicalRoutine(routineId: string): CanonicalRoutine {
  const override =
    typeof window !== "undefined" ? getCanonicalOverride(routineId) : null;
  if (override) return mergeSyllabusExpectations(override);

  const c = BY_ID[routineId];
  if (!c) {
    throw new Error(`No canonical routine for ${routineId}`);
  }
  return mergeSyllabusExpectations(c);
}
