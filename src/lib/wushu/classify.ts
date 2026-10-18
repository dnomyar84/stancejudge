import { angleAtVertex, distance, midpoint } from "@/lib/pose/geometry";
import {
  bodyLocalKeypoints,
  estimateBodyAxes,
  toBodyLocal,
} from "@/lib/pose/body-frame";
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

  const axes = estimateBodyAxes(keypoints);
  if (!axes) {
    return { leg: "unknown", confidence: 0 };
  }

  const laB = toBodyLocal(la, axes);
  const raB = toBodyLocal(ra, axes);
  const lateralWidth = Math.abs(laB.lat - raB.lat);
  const fwdSep = Math.abs(laB.fwd - raB.fwd);

  const kneeDiff = Math.abs(leftKnee - rightKnee);
  const avgKnee = (leftKnee + rightKnee) / 2;
  const minKnee = Math.min(leftKnee, rightKnee);

  if (lateralWidth < 0.28 && fwdSep < 0.25) {
    return { leg: "feet_together", confidence: 0.85 };
  }

  const hipMid = midpoint(lh, rh);
  const hipB = toBodyLocal(hipMid, axes);
  const laUp = laB.up;
  const raUp = raB.up;
  const avgAnkleUp = (laUp + raUp) / 2;
  const hipDrop = avgAnkleUp - hipB.up;
  const bothKneesDeep = avgKnee < 128 && minKnee < 135;

  if (
    bothKneesDeep &&
    hipDrop < 0.42 &&
    lateralWidth > 0.22 &&
    fwdSep < 0.55
  ) {
    return { leg: "xie_bu", confidence: 0.76 };
  }

  const leftKneeUp = lk ? toBodyLocal(lk, axes).up : null;
  const rightKneeUp = rk ? toBodyLocal(rk, axes).up : null;
  if (leftKneeUp !== null && rightKneeUp !== null) {
    const kneeLift = Math.max(leftKneeUp, rightKneeUp) - hipB.up;
    if (kneeLift > 0.38 && kneeDiff > 42 && minKnee < 118) {
      return { leg: "ti_xi", confidence: 0.74 };
    }
  }

  if (lateralWidth > 0.72 && avgKnee < 162 && kneeDiff < 32) {
    return { leg: "ma_bu", confidence: 0.78 };
  }

  if (fwdSep > 0.32 && lateralWidth > 0.34) {
    if (minKnee < 155 && kneeDiff > 16) {
      return { leg: "gong_bu", confidence: 0.74 };
    }
    if (minKnee > 148 || kneeDiff < 30) {
      return { leg: "xu_bu", confidence: 0.7 };
    }
    return { leg: "gong_bu", confidence: 0.65 };
  }

  if (lateralWidth > 0.38 && kneeDiff > 28) {
    const frontBent = Math.min(leftKnee, rightKnee);
    if (frontBent < 150) {
      return { leg: "gong_bu", confidence: 0.68 };
    }
    return { leg: "xu_bu", confidence: 0.62 };
  }

  if (kneeDiff > 12 && minKnee < 158 && lateralWidth > 0.3) {
    return { leg: "gong_bu", confidence: 0.58 };
  }

  if (lateralWidth > 0.35) {
    return { leg: "walking", confidence: 0.52 };
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

  const axes = estimateBodyAxes(keypoints);
  if (!axes) {
    return { hand: "unknown", confidence: 0 };
  }

  const local = bodyLocalKeypoints(keypoints, axes);
  const lwB = local.get(KP.left_wrist);
  const rwB = local.get(KP.right_wrist);
  const lsB = local.get(KP.left_shoulder);
  const rsB = local.get(KP.right_shoulder);
  const leB = local.get(KP.left_elbow);
  const reB = local.get(KP.right_elbow);
  if (!lwB || !rwB || !lsB || !rsB || !leB || !reB) {
    return { hand: "unknown", confidence: 0 };
  }
  const hipB = toBodyLocal(midpoint(lh, rh), axes);
  const noseB = toBodyLocal(nose, axes);

  const wristLatSpread = Math.abs(lwB.lat - rwB.lat);
  const wristsHigh =
    lwB.up > hipB.up + 0.35 && rwB.up > hipB.up + 0.35;

  const atWaist =
    Math.abs(lwB.up - hipB.up) < 0.28 &&
    Math.abs(rwB.up - hipB.up) < 0.28 &&
    Math.abs(lwB.fwd - hipB.fwd) < 0.5 &&
    Math.abs(rwB.fwd - hipB.fwd) < 0.5;
  if (atWaist && wristLatSpread < 1.15) {
    return { hand: "fist_waist", confidence: 0.72 };
  }

  if (wristLatSpread > 1.55 && wristsHigh) {
    return { hand: "arms_spread", confidence: 0.72 };
  }

  const salute =
    wristLatSpread < 0.68 &&
    lwB.up > hipB.up + 0.38 &&
    rwB.up > hipB.up + 0.38 &&
    Math.abs(lwB.fwd - rwB.fwd) < 0.35;
  if (salute) {
    return { hand: "salute", confidence: 0.78 };
  }

  if (weapon === "jian") {
    const leftExt =
      distance(lw, le) + distance(le, ls) + distance(lw, ls);
    const rightExt =
      distance(rw, re) + distance(re, rs) + distance(rw, rs);
    const torso = axes.scale;
    const extended = leftExt > torso * 2.2 || rightExt > torso * 2.2;
    const nearShoulder =
      Math.abs(lwB.lat - rsB.lat) < 0.5 || Math.abs(rwB.lat - lsB.lat) < 0.5;
    if (extended) {
      return { hand: "jian_point", confidence: 0.72 };
    }
    if (nearShoulder) {
      return { hand: "jian_guard", confidence: 0.68 };
    }
  }

  const wristLat = Math.abs(lwB.lat - rwB.lat);
  const bothForward =
    lwB.fwd - lsB.fwd > 0.42 && rwB.fwd - rsB.fwd > 0.42;
  const palmsOpen =
    wristLat > 0.28 &&
    lwB.up > hipB.up + 0.12 &&
    rwB.up > hipB.up + 0.12 &&
    Math.abs(lwB.fwd - rwB.fwd) < 0.22;
  if (bothForward && palmsOpen) {
    return { hand: "double_push_palm", confidence: 0.72 };
  }

  const leftPunch = lwB.fwd - lsB.fwd > 0.55;
  const rightPunch = rwB.fwd - rsB.fwd > 0.55;
  const punchWristHigh =
    (leftPunch && lwB.up < noseB.up + 0.08) ||
    (rightPunch && rwB.up < noseB.up + 0.08);
  if (punchWristHigh) {
    return { hand: "lift_fist", confidence: 0.7 };
  }
  if (leftPunch || rightPunch) {
    const palmLike =
      wristLat > 0.55 &&
      (leftPunch ? lwB.up > leB.up - 0.05 : rwB.up > reB.up - 0.05);
    if (palmLike) {
      return { hand: "push_palm", confidence: 0.7 };
    }
    const chopLike =
      (rightPunch && rwB.up > reB.up + 0.12) ||
      (leftPunch && lwB.up > leB.up + 0.12);
    if (chopLike) {
      return { hand: "chop_palm", confidence: 0.68 };
    }
    return { hand: "punch_forward", confidence: 0.74 };
  }

  const wristsClose =
    Math.hypot(lwB.lat - rwB.lat, lwB.fwd - rwB.fwd) < 0.35;
  if (
    wristsClose &&
    lwB.up > hipB.up + 0.1 &&
    rwB.up > hipB.up + 0.1 &&
    lwB.up < noseB.up + 0.15
  ) {
    return { hand: "wrist_wrap", confidence: 0.66 };
  }

  const blockElbow =
    (leB.up < noseB.up && lwB.up > leB.up - 0.08 && lwB.fwd > lsB.fwd + 0.2) ||
    (reB.up < noseB.up && rwB.up > reB.up - 0.08 && rwB.fwd > rsB.fwd + 0.2);
  if (blockElbow) {
    return { hand: "block_elbow", confidence: 0.67 };
  }

  const guard =
    lwB.up > hipB.up + 0.15 &&
    rwB.up > hipB.up + 0.15 &&
    lwB.up < noseB.up + 0.25 &&
    rwB.up < noseB.up + 0.25;
  if (guard) {
    return { hand: "guard_chest", confidence: 0.65 };
  }

  if (
    lwB.up > hipB.up + 0.35 &&
    rwB.up > hipB.up + 0.35 &&
    wristLatSpread < 0.7
  ) {
    return { hand: "fist_waist", confidence: 0.55 };
  }

  if (lwB.fwd > lsB.fwd + 0.32 || rwB.fwd > rsB.fwd + 0.32) {
    return { hand: "punch_forward", confidence: 0.55 };
  }

  const chestBand =
    lwB.up > hipB.up + 0.22 &&
    rwB.up > hipB.up + 0.22 &&
    wristLatSpread < 0.95;
  if (chestBand) {
    return { hand: "guard_chest", confidence: 0.52 };
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
    xu_bu: ["gong_bu", "feet_together", "walking", "ti_xi"],
    xie_bu: ["ma_bu", "xu_bu"],
    ti_xi: ["xu_bu", "walking", "gong_bu"],
    walking: ["gong_bu", "xu_bu", "feet_together", "ti_xi"],
    unknown: [],
  };
  if (similar[expected]?.includes(detected)) return 78;
  return 20;
}

export function scoreHandMatch(
  detected: HandProfileType,
  expected: HandProfileType,
): number {
  if (detected === expected) return 100;
  if (detected === "unknown" || expected === "unknown") return 48;
  const similar: Record<HandProfileType, HandProfileType[]> = {
    salute: ["guard_chest", "fist_waist"],
    fist_waist: ["guard_chest", "salute"],
    punch_forward: ["guard_chest", "jian_point", "push_palm", "lift_fist"],
    push_palm: ["punch_forward", "double_push_palm", "guard_chest"],
    chop_palm: ["punch_forward", "push_palm"],
    double_push_palm: ["push_palm", "punch_forward"],
    block_elbow: ["guard_chest", "wrist_wrap"],
    lift_fist: ["punch_forward"],
    wrist_wrap: ["guard_chest", "block_elbow"],
    guard_chest: ["fist_waist", "salute", "punch_forward", "block_elbow"],
    jian_point: ["punch_forward", "arms_spread"],
    jian_guard: ["guard_chest"],
    arms_spread: ["jian_point", "punch_forward"],
    unknown: [],
  };
  if (similar[expected]?.includes(detected)) return 78;
  return 22;
}
