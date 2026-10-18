import {
  estimateBodyAxes,
  toBodyLocal,
  type BodyAxes,
  type BodyLocal,
} from "./body-frame";
import { scoreBand } from "./geometry";
import { getKeypoint, KP } from "./keypoints";
import type { PoseKeypoint } from "./types";
import type { LegStanceType } from "@/lib/wushu/types";

type Vec3 = { lat: number; fwd: number; up: number };
type LegSide = "left" | "right";

function vec3(from: BodyLocal, to: BodyLocal): Vec3 {
  return {
    lat: to.lat - from.lat,
    fwd: to.fwd - from.fwd,
    up: to.up - from.up,
  };
}

function angleBetween3d(a: Vec3, b: Vec3): number {
  const magA = Math.hypot(a.lat, a.fwd, a.up);
  const magB = Math.hypot(b.lat, b.fwd, b.up);
  if (magA < 1e-6 || magB < 1e-6) return 0;
  const dot = a.lat * b.lat + a.fwd * b.fwd + a.up * b.up;
  const cos = Math.min(1, Math.max(-1, dot / (magA * magB)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Interior knee angle in body-local 3D (hip–knee–ankle). */
export function kneeAngleBody3D(
  keypoints: PoseKeypoint[],
  axes: BodyAxes,
  side: LegSide,
): number | null {
  const hipIdx = side === "left" ? KP.left_hip : KP.right_hip;
  const kneeIdx = side === "left" ? KP.left_knee : KP.right_knee;
  const ankleIdx = side === "left" ? KP.left_ankle : KP.right_ankle;
  const h = getKeypoint(keypoints, hipIdx);
  const k = getKeypoint(keypoints, kneeIdx);
  const a = getKeypoint(keypoints, ankleIdx);
  if (!h || !k || !a) return null;
  const toHip = vec3(toBodyLocal(k, axes), toBodyLocal(h, axes));
  const toAnkle = vec3(toBodyLocal(k, axes), toBodyLocal(a, axes));
  return angleBetween3d(toHip, toAnkle);
}

/** Degrees above the body “floor” plane (lat–fwd); 0 ≈ parallel to floor. */
export function segmentTiltFromHorizontal(v: Vec3): number {
  const horiz = Math.hypot(v.lat, v.fwd);
  return (Math.atan2(Math.abs(v.up), horiz) * 180) / Math.PI;
}

/** Degrees off body-upright; 0 ≈ vertical (perpendicular to floor). */
export function segmentTiltFromVertical(v: Vec3): number {
  const vert = Math.abs(v.up);
  const horiz = Math.hypot(v.lat, v.fwd);
  return (Math.atan2(horiz, vert) * 180) / Math.PI;
}

function legChainVectors(
  keypoints: PoseKeypoint[],
  axes: BodyAxes,
  side: LegSide,
): { thigh: Vec3; shin: Vec3 } | null {
  const hipIdx = side === "left" ? KP.left_hip : KP.right_hip;
  const kneeIdx = side === "left" ? KP.left_knee : KP.right_knee;
  const ankleIdx = side === "left" ? KP.left_ankle : KP.right_ankle;
  const h = getKeypoint(keypoints, hipIdx);
  const k = getKeypoint(keypoints, kneeIdx);
  const a = getKeypoint(keypoints, ankleIdx);
  if (!h || !k || !a) return null;
  const hipL = toBodyLocal(h, axes);
  const kneeL = toBodyLocal(k, axes);
  const ankleL = toBodyLocal(a, axes);
  return {
    thigh: vec3(hipL, kneeL),
    shin: vec3(kneeL, ankleL),
  };
}

/** Leading 弓步 leg: more bent knee in body 3D (works front-on or side-on). */
function bentLeadLeg(
  keypoints: PoseKeypoint[],
  axes: BodyAxes,
): LegSide | null {
  const lk = kneeAngleBody3D(keypoints, axes, "left");
  const rk = kneeAngleBody3D(keypoints, axes, "right");
  if (lk === null || rk === null) return null;
  if (Math.abs(lk - rk) < 8) return null;
  return lk < rk ? "left" : "right";
}

export type StanceGeometryHints = {
  gongBuLead?: LegSide;
};

export function scoreGongBuGeometry(
  keypoints: PoseKeypoint[],
  lead: LegSide,
): number | null {
  const axes = estimateBodyAxes(keypoints);
  if (!axes) return null;
  const rear: LegSide = lead === "left" ? "right" : "left";

  const frontKnee = kneeAngleBody3D(keypoints, axes, lead);
  const rearKnee = kneeAngleBody3D(keypoints, axes, rear);
  const frontChain = legChainVectors(keypoints, axes, lead);
  if (frontKnee === null || rearKnee === null || !frontChain) return null;

  const kneeFront = scoreBand(frontKnee, 90, 12, 38);
  const kneeRear = scoreBand(rearKnee, 178, 10, 28);
  const thighFlat = scoreBand(
    segmentTiltFromHorizontal(frontChain.thigh),
    10,
    18,
    50,
  );
  const shinUpright = scoreBand(
    segmentTiltFromVertical(frontChain.shin),
    6,
    18,
    45,
  );

  const detectedLead = bentLeadLeg(keypoints, axes);
  const leadOk =
    detectedLead === null
      ? 78
      : detectedLead === lead
        ? 100
        : 35;

  return Math.round(
    kneeFront * 0.34 +
      kneeRear * 0.26 +
      thighFlat * 0.14 +
      shinUpright * 0.14 +
      leadOk * 0.12,
  );
}

export function scoreMaBuGeometry(keypoints: PoseKeypoint[]): number | null {
  const axes = estimateBodyAxes(keypoints);
  if (!axes) return null;
  const lk = kneeAngleBody3D(keypoints, axes, "left");
  const rk = kneeAngleBody3D(keypoints, axes, "right");
  if (lk === null || rk === null) return null;
  const la = getKeypoint(keypoints, KP.left_ankle);
  const ra = getKeypoint(keypoints, KP.right_ankle);
  if (!la || !ra) return null;
  const width = Math.abs(toBodyLocal(la, axes).lat - toBodyLocal(ra, axes).lat);

  const kneeL = scoreBand(lk, 100, 18, 45);
  const kneeR = scoreBand(rk, 100, 18, 45);
  const widthS = scoreBand(width, 0.85, 0.22, 0.55);
  return Math.round(kneeL * 0.35 + kneeR * 0.35 + widthS * 0.3);
}

export function scoreXuBuGeometry(keypoints: PoseKeypoint[]): number | null {
  const axes = estimateBodyAxes(keypoints);
  if (!axes) return null;
  const lk = kneeAngleBody3D(keypoints, axes, "left");
  const rk = kneeAngleBody3D(keypoints, axes, "right");
  if (lk === null || rk === null) return null;
  const la = getKeypoint(keypoints, KP.left_ankle);
  const ra = getKeypoint(keypoints, KP.right_ankle);
  if (!la || !ra) return null;
  const lf = toBodyLocal(la, axes);
  const rf = toBodyLocal(ra, axes);
  const fwdSep = Math.abs(lf.fwd - rf.fwd);
  const kneeDiff = Math.abs(lk - rk);
  const shallow = Math.max(lk, rk);
  const deep = Math.min(lk, rk);

  const sepS = scoreBand(fwdSep, 0.42, 0.18, 0.55);
  const asymS = scoreBand(kneeDiff, 22, 14, 40);
  const shallowS = scoreBand(shallow, 155, 18, 45);
  const deepS = scoreBand(deep, 135, 22, 50);
  return Math.round(sepS * 0.25 + asymS * 0.25 + shallowS * 0.25 + deepS * 0.25);
}

export function scoreXieBuGeometry(keypoints: PoseKeypoint[]): number | null {
  const axes = estimateBodyAxes(keypoints);
  if (!axes) return null;
  const lh = getKeypoint(keypoints, KP.left_hip);
  const rh = getKeypoint(keypoints, KP.right_hip);
  const la = getKeypoint(keypoints, KP.left_ankle);
  const ra = getKeypoint(keypoints, KP.right_ankle);
  const ls = getKeypoint(keypoints, KP.left_shoulder);
  const rs = getKeypoint(keypoints, KP.right_shoulder);
  if (!lh || !rh || !la || !ra || !ls || !rs) return null;
  const hipUp = (toBodyLocal(lh, axes).up + toBodyLocal(rh, axes).up) / 2;
  const shoulderUp =
    (toBodyLocal(ls, axes).up + toBodyLocal(rs, axes).up) / 2;
  const hipSink = shoulderUp - hipUp;
  const lk = kneeAngleBody3D(keypoints, axes, "left");
  const rk = kneeAngleBody3D(keypoints, axes, "right");
  if (lk === null || rk === null) return null;

  const lowHip = scoreBand(hipSink, 0.38, 0.16, 0.55);
  const deepKnees = scoreBand((lk + rk) / 2, 95, 25, 50);
  return Math.round(lowHip * 0.4 + deepKnees * 0.6);
}

export function scoreTiXiGeometry(keypoints: PoseKeypoint[]): number | null {
  const axes = estimateBodyAxes(keypoints);
  if (!axes) return null;
  const lk = kneeAngleBody3D(keypoints, axes, "left");
  const rk = kneeAngleBody3D(keypoints, axes, "right");
  const lku = getKeypoint(keypoints, KP.left_knee);
  const rku = getKeypoint(keypoints, KP.right_knee);
  const lh = getKeypoint(keypoints, KP.left_hip);
  const rh = getKeypoint(keypoints, KP.right_hip);
  if (!lk || !rk || !lku || !rku || !lh || !rh) return null;
  const hipUp = (toBodyLocal(lh, axes).up + toBodyLocal(rh, axes).up) / 2;
  const leftLift = toBodyLocal(lku, axes).up - hipUp;
  const rightLift = toBodyLocal(rku, axes).up - hipUp;
  const lift = Math.max(leftLift, rightLift);
  const bent = Math.min(lk, rk);
  const straight = Math.max(lk, rk);

  const liftS = scoreBand(lift, 0.42, 0.16, 0.55);
  const bentS = scoreBand(bent, 95, 20, 40);
  const straightS = scoreBand(straight, 168, 15, 35);
  return Math.round(liftS * 0.4 + bentS * 0.3 + straightS * 0.3);
}

export function scoreFeetTogetherGeometry(
  keypoints: PoseKeypoint[],
): number | null {
  const axes = estimateBodyAxes(keypoints);
  if (!axes) return null;
  const la = getKeypoint(keypoints, KP.left_ankle);
  const ra = getKeypoint(keypoints, KP.right_ankle);
  if (!la || !ra) return null;
  const lf = toBodyLocal(la, axes);
  const rf = toBodyLocal(ra, axes);
  const lat = Math.abs(lf.lat - rf.lat);
  const fwd = Math.abs(lf.fwd - rf.fwd);
  const latS = scoreBand(lat, 0.12, 0.12, 0.45);
  const fwdS = scoreBand(fwd, 0.1, 0.12, 0.4);
  return Math.round(latS * 0.55 + fwdS * 0.45);
}

export function scoreExpectedStanceGeometry(
  expectedLeg: LegStanceType,
  keypoints: PoseKeypoint[],
  hints: StanceGeometryHints = {},
): number | null {
  switch (expectedLeg) {
    case "gong_bu": {
      const axes = estimateBodyAxes(keypoints);
      if (!axes) return null;
      const lead =
        hints.gongBuLead ?? bentLeadLeg(keypoints, axes) ?? "right";
      return scoreGongBuGeometry(keypoints, lead);
    }
    case "ma_bu":
      return scoreMaBuGeometry(keypoints);
    case "xu_bu":
      return scoreXuBuGeometry(keypoints);
    case "xie_bu":
      return scoreXieBuGeometry(keypoints);
    case "ti_xi":
      return scoreTiXiGeometry(keypoints);
    case "feet_together":
      return scoreFeetTogetherGeometry(keypoints);
    case "walking":
      return 70;
    default:
      return null;
  }
}
