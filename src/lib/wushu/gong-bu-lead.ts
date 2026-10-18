/** Which leg leads for 弓步 (forward / bent knee) in syllabus moves. */
export type GongBuLead = "left" | "right";

export function gongBuLeadForSanDuanMove(moveId: string): GongBuLead {
  if (moveId === "sdcq-15" || moveId === "sdcq-17") return "left";
  return "right";
}

export function gongBuLeadForMove(
  routineId: string,
  moveId: string,
): GongBuLead | null {
  if (routineId !== "san-duan-chang-quan") return null;
  if (!moveId.startsWith("sdcq-")) return null;
  return gongBuLeadForSanDuanMove(moveId);
}
