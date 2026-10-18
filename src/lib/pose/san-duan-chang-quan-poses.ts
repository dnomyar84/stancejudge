import { buildCoachFigureKeypoints } from "./coach-figure";
import type { PoseKeypoint } from "./types";

export function buildSanDuanMoveKeypoints(moveId: string): PoseKeypoint[] | null {
  return buildCoachFigureKeypoints("san-duan-chang-quan", moveId);
}
