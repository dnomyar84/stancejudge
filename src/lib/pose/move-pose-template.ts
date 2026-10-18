import { buildSanDuanMoveKeypoints } from "./san-duan-chang-quan-poses";
import { buildStanceTemplateKeypoints } from "./stance-template";
import type { HandProfileType, LegStanceType } from "@/lib/wushu/types";
import type { PoseKeypoint } from "./types";

export function buildMoveTemplateKeypoints(
  routineId: string,
  moveId: string,
  leg: LegStanceType,
  hand: HandProfileType,
): PoseKeypoint[] {
  if (routineId === "san-duan-chang-quan") {
    const custom = buildSanDuanMoveKeypoints(moveId);
    if (custom) return custom;
  }
  return buildStanceTemplateKeypoints(leg, hand);
}
