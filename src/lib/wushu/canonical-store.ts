import { getCanonicalOverride } from "@/lib/admin/store";
import siDuanJianCanonical from "@/data/canonical/si-duan-jian.json";
import sanDuanChangQuanCanonical from "@/data/canonical/san-duan-chang-quan.json";
import type { CanonicalRoutine } from "./types";

const BY_ID: Record<string, CanonicalRoutine> = {
  "si-duan-jian": siDuanJianCanonical as CanonicalRoutine,
  "san-duan-chang-quan": sanDuanChangQuanCanonical as CanonicalRoutine,
};

export function getCanonicalRoutine(routineId: string): CanonicalRoutine {
  const override =
    typeof window !== "undefined" ? getCanonicalOverride(routineId) : null;
  if (override) return override;

  const c = BY_ID[routineId];
  if (!c) {
    throw new Error(`No canonical routine for ${routineId}`);
  }
  return c;
}
