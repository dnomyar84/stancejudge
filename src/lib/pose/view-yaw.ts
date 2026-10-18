import {
  estimateBodyAxes,
  toBodyLocal,
  type BodyAxes,
  type BodyLocal,
} from "./body-frame";
import type { PoseKeypoint } from "./types";
import type { LegStanceType } from "@/lib/wushu/types";
import { gongBuLeadForSanDuanMove } from "@/lib/wushu/gong-bu-lead";

export function fromBodyLocal(
  local: BodyLocal,
  axes: BodyAxes,
): { x: number; y: number } {
  const scaledLat = local.lat * axes.scale;
  const scaledFwd = local.fwd * axes.scale;
  return {
    x:
      axes.origin.x +
      scaledLat * axes.lateral.x +
      scaledFwd * axes.forward.x,
    y:
      axes.origin.y -
      local.up * axes.scale +
      scaledLat * axes.lateral.y +
      scaledFwd * axes.forward.y,
  };
}

/** Rotate skeleton around body-up axis (horizontal swipe / yaw degrees). */
export function rotateKeypointsYaw(
  keypoints: PoseKeypoint[],
  yawDeg: number,
): PoseKeypoint[] {
  if (Math.abs(yawDeg) < 0.01) return keypoints;
  const axes = estimateBodyAxes(keypoints);
  if (!axes) return keypoints;
  const rad = (yawDeg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);

  return keypoints.map((kp) => {
    if (!kp) return kp;
    const local = toBodyLocal(kp, axes);
    const lat2 = local.lat * c - local.fwd * s;
    const fwd2 = local.lat * s + local.fwd * c;
    const p = fromBodyLocal({ lat: lat2, fwd: fwd2, up: local.up }, axes);
    return { ...kp, x: p.x, y: p.y };
  });
}

const LEG_DEFAULT_YAW: Partial<Record<LegStanceType, number>> = {
  feet_together: 22,
  gong_bu: 62,
  ma_bu: 48,
  xu_bu: 54,
  xie_bu: 58,
  ti_xi: 50,
  walking: 38,
};

/** Side-biased coach view for rail (not front-on). */
export function defaultThumbnailYaw(
  leg: LegStanceType,
  routineId?: string,
  moveId?: string,
): number {
  if (leg === "gong_bu" && routineId === "san-duan-chang-quan" && moveId) {
    const lead = gongBuLeadForSanDuanMove(moveId);
    return lead === "left" ? 58 : 62;
  }
  return LEG_DEFAULT_YAW[leg] ?? 40;
}

export const THUMBNAIL_YAW_MIN = 0;
export const THUMBNAIL_YAW_MAX = 88;
