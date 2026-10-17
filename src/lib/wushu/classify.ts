import { angleAtVertex, distance, midpoint } from "@/lib/pose/geometry";
import { getKeypoint, KP } from "@/lib/pose/keypoints";
import type { PoseKeypoint } from "@/lib/pose/types";
import type { HandProfileType, LegStanceType } from "./types";

export type ClassifiedPose = {
  leg: LegStanceType;
  hand: HandProfileType;
  legConfidence: number;
  handConfidence: number;
};

function kneeAngle(
  keypoints: PoseKeypoint[],
  hip: number,
  knee: number,
  ankle: number,
): number | null {
  const h = getKeypoint(keypoints, hip);
  const k = getKeypoint(keypoints, knee);
  const a = getKeypoint(keypoints, ankle);
  if (!h || !k || !a) return null;
  return angleAtVertex(h, k, a);
}

export function classifyLegStance(keypoints: PoseKeypoint[]): {
  leg: LegStanceType;
  confidence: number;
} {
  const la = getKeypoint(keypoints, KP.left_ankle);
  const ra = getKeypoint(keypoints, KP.right_ankle);
  const lk = getKeypoint(keypoints, KP.left_knee);
  const rk = getKeypoint(keypoints, KP.right_knee);
  const lh = getKeypoint(keypoints, KP.left_hip);
  const rh = getKeypoint(keypoints, KP.right_hip);
  if (!la || !ra || !lk || !rk || !lh || !rh) {
    return { leg: "unknown", confidence: 0 };
  }

  const ls = getKeypoint(keypoints, KP.left_shoulder);
  const rs = getKeypoint(keypoints, KP.right_shoulder);
  if (!ls || !rs) {
    return { leg: "unknown", confidence: 0 };
  }

  const ankleWidth = distance(la, ra);
  const shoulderMid = midpoint(ls, rs);
  const hipMid = midpoint(lh, rh);
  const scale = Math.max(distance(shoulderMid, hipMid), 1);
  const widthRatio = ankleWidth / scale;

  const leftKnee = kneeAngle(keypoints, KP.left_hip, KP.left_knee, KP.left_ankle);
  const rightKnee = kneeAngle(
    keypoints,
    KP.right_hip,
    KP.right_knee,
    KP.right_ankle,
  );
  if (leftKnee === null || rightKnee === null) {
    return { leg: "unknown", confidence: 0 };
  }

  if (widthRatio < 0.35) {
    return { leg: "feet_together", confidence: 0.85 };
  }

  const kneeDiff = Math.abs(leftKnee - rightKnee);
  const avgKnee = (leftKnee + rightKnee) / 2;

  if (widthRatio > 0.9 && avgKnee < 155 && kneeDiff < 25) {
    return { leg: "ma_bu", confidence: 0.75 };
  }

  if (kneeDiff > 35 && widthRatio > 0.45) {
    const frontBent = Math.min(leftKnee, rightKnee);
    if (frontBent < 150) {
      return { leg: "gong_bu", confidence: 0.7 };
    }
    return { leg: "xu_bu", confidence: 0.65 };
  }

  if (widthRatio > 0.4) {
    return { leg: "walking", confidence: 0.5 };
  }

  return { leg: "unknown", confidence: 0.3 };
}

export function classifyHandProfile(
  keypoints: PoseKeypoint[],
  weapon: "unarmed" | "jian",
): { hand: HandProfileType; confidence: number } {
  const ls = getKeypoint(keypoints, KP.left_shoulder);
  const rs = getKeypoint(keypoints, KP.right_shoulder);
  const lw = getKeypoint(keypoints, KP.left_wrist);
  const rw = getKeypoint(keypoints, KP.right_wrist);
  const le = getKeypoint(keypoints, KP.left_elbow);
  const re = getKeypoint(keypoints, KP.right_elbow);
  const nose = getKeypoint(keypoints, KP.nose);
  const lh = getKeypoint(keypoints, KP.left_hip);
  const rh = getKeypoint(keypoints, KP.right_hip);
  if (!ls || !rs || !lw || !rw || !le || !re || !nose || !lh || !rh) {
    return { hand: "unknown", confidence: 0 };
  }

  const shoulderMid = midpoint(ls, rs);
  const hipMid = midpoint(lh, rh);
  const torso = Math.max(distance(shoulderMid, hipMid), 1);

  const wristSpread = distance(lw, rw);
  if (wristSpread > torso * 1.4 && lw.y < shoulderMid.y + torso * 0.3) {
    return { hand: "arms_spread", confidence: 0.7 };
  }

  const salute =
    lw.y < nose.y + torso * 0.05 &&
    rw.y < nose.y + torso * 0.05 &&
    distance(lw, rw) < torso * 0.5;
  if (salute) {
    return { hand: "salute", confidence: 0.75 };
  }

  if (weapon === "jian") {
    const leftExt = distance(lw, le) + distance(le, ls);
    const rightExt = distance(rw, re) + distance(re, rs);
    const extended = leftExt > torso * 1.1 || rightExt > torso * 1.1;
    const nearShoulder =
      distance(lw, rs) < torso * 0.45 || distance(rw, ls) < torso * 0.45;
    if (extended) {
      return { hand: "jian_point", confidence: 0.72 };
    }
    if (nearShoulder) {
      return { hand: "jian_guard", confidence: 0.68 };
    }
  }

  const punch =
    distance(lw, shoulderMid) > torso * 0.85 ||
    distance(rw, shoulderMid) > torso * 0.85;
  if (punch) {
    return { hand: "punch_forward", confidence: 0.7 };
  }

  const atWaist =
    Math.abs(lw.y - hipMid.y) < torso * 0.25 &&
    Math.abs(rw.y - hipMid.y) < torso * 0.25;
  if (atWaist) {
    return { hand: "fist_waist", confidence: 0.65 };
  }

  const guard =
    lw.y < hipMid.y && rw.y < hipMid.y && lw.y > nose.y && rw.y > nose.y;
  if (guard) {
    return { hand: "guard_chest", confidence: 0.6 };
  }

  return { hand: "unknown", confidence: 0.35 };
}

export function classifyPose(
  keypoints: PoseKeypoint[],
  weapon: "unarmed" | "jian",
): ClassifiedPose {
  const leg = classifyLegStance(keypoints);
  const hand = classifyHandProfile(keypoints, weapon);
  return {
    leg: leg.leg,
    hand: hand.hand,
    legConfidence: leg.confidence,
    handConfidence: hand.confidence,
  };
}

export function scoreLegMatch(
  detected: LegStanceType,
  expected: LegStanceType,
): number {
  if (detected === expected) return 100;
  if (detected === "unknown" || expected === "unknown") return 40;
  const similar: Record<LegStanceType, LegStanceType[]> = {
    feet_together: ["xu_bu"],
    gong_bu: ["walking", "xu_bu"],
    ma_bu: ["gong_bu"],
    xu_bu: ["gong_bu", "feet_together"],
    walking: ["gong_bu", "xu_bu"],
    unknown: [],
  };
  if (similar[expected]?.includes(detected)) return 55;
  return 20;
}

export function scoreHandMatch(
  detected: HandProfileType,
  expected: HandProfileType,
): number {
  if (detected === expected) return 100;
  if (detected === "unknown" || expected === "unknown") return 45;
  const similar: Record<HandProfileType, HandProfileType[]> = {
    salute: ["guard_chest"],
    fist_waist: ["guard_chest"],
    punch_forward: ["jian_point"],
    guard_chest: ["fist_waist", "salute"],
    jian_point: ["punch_forward", "arms_spread"],
    jian_guard: ["guard_chest"],
    arms_spread: ["jian_point"],
    unknown: [],
  };
  if (similar[expected]?.includes(detected)) return 58;
  return 22;
}
