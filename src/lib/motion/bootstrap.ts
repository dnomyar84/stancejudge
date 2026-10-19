import { registerWushuDiscipline } from "@/lib/disciplines/wushu/register";

let registered = false;

/** Idempotent: loads discipline packs (wushu first; TKD, dance, etc. later). */
export function ensureMotionDisciplinesRegistered(): void {
  if (registered) return;
  registerWushuDiscipline();
  registered = true;
}
