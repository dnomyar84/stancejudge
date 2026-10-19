import type { ExtendedCoachPose } from "../coach-figure/extended-pose";
import type { FootEndEffector } from "../coach-figure/extended-pose";
import type { CoachSkeleton } from "../coach-figure/skeleton";
import { sub, type Vec3 } from "../coach-figure/vec3";

/** `required` = must pass or pose is invalid; `preferred` = graded tolerance (soft). */
export type ConstraintStrength = "required" | "preferred";

export type LegRole = "support" | "lift";

export type SupportLegStraightConstraint = {
  id: string;
  strength: "required";
  /** Which leg carries weight in this stance. */
  support: "left" | "right";
  /** Interior knee angle (degrees) — hip–knee–ankle. */
  minKneeAngleDeg: number;
  labelZh: string;
};

/**
 * Support (or any) foot toe line on the floor plane.
 * `preferred` strength: OK within soft band; score falls off; `rejectBeyondDeg` = wildly wrong.
 */
export type FootToeYawConstraint = {
  id: string;
  strength: "preferred";
  side: "left" | "right";
  /** Ideal toe direction in floor plane (radians, 0 = +fwd). */
  preferredToeYawRad: number;
  /** Full credit within ± this (degrees). */
  softToleranceDeg: number;
  /** Beyond ± this from preferred → treat as fail / wild. */
  rejectBeyondDeg: number;
  labelZh: string;
};

export type StanceConstraint =
  | SupportLegStraightConstraint
  | FootToeYawConstraint;

export type StanceConstraintSet = {
  id: string;
  nameZh: string;
  constraints: StanceConstraint[];
};

export type ConstraintViolation = {
  constraintId: string;
  strength: ConstraintStrength;
  messageZh: string;
  /** 0…100 for preferred constraints; required failures are 0. */
  score: number;
};

export type ConstraintEvaluation = {
  valid: boolean;
  /** Min score across constraints (100 = all satisfied). */
  overallScore: number;
  results: ConstraintViolation[];
};

function kneeInteriorAngleDeg(hip: Vec3, knee: Vec3, ankle: Vec3): number {
  const a = sub(hip, knee);
  const b = sub(ankle, knee);
  const la = Math.hypot(a.lat, a.fwd, a.up);
  const lb = Math.hypot(b.lat, b.fwd, b.up);
  if (la < 1e-6 || lb < 1e-6) return 0;
  const dot = (a.lat * b.lat + a.fwd * b.fwd + a.up * b.up) / (la * lb);
  const clamped = Math.max(-1, Math.min(1, dot));
  return (Math.acos(clamped) * 180) / Math.PI;
}

function toeYawRadFromFoot(foot: FootEndEffector): number {
  const dLat = foot.toe.lat - foot.heel.lat;
  const dFwd = foot.toe.fwd - foot.heel.fwd;
  return Math.atan2(dLat, dFwd);
}

function angleDiffDeg(a: number, b: number): number {
  let d = Math.abs(a - b) * (180 / Math.PI);
  while (d > 180) d = 360 - d;
  return d;
}

function legJoints(sk: CoachSkeleton, side: "left" | "right") {
  if (side === "left") {
    return { hip: sk.leftHip, knee: sk.leftKnee, ankle: sk.leftAnkle };
  }
  return { hip: sk.rightHip, knee: sk.rightKnee, ankle: sk.rightAnkle };
}

function footForSide(pose: ExtendedCoachPose, side: "left" | "right"): FootEndEffector {
  return side === "left" ? pose.leftFoot : pose.rightFoot;
}

function evalSupportStraight(
  c: SupportLegStraightConstraint,
  sk: CoachSkeleton,
): ConstraintViolation {
  const { hip, knee, ankle } = legJoints(sk, c.support);
  const ang = kneeInteriorAngleDeg(hip, knee, ankle);
  const ok = ang >= c.minKneeAngleDeg;
  return {
    constraintId: c.id,
    strength: c.strength,
    messageZh: ok
      ? `${c.labelZh}（约 ${Math.round(ang)}°）`
      : `${c.labelZh}：支撑膝应 ≥ ${c.minKneeAngleDeg}°（当前约 ${Math.round(ang)}°）`,
    score: ok ? 100 : 0,
  };
}

function evalFootYaw(c: FootToeYawConstraint, foot: FootEndEffector): ConstraintViolation {
  const yaw = toeYawRadFromFoot(foot);
  const diff = angleDiffDeg(yaw, c.preferredToeYawRad);
  if (diff > c.rejectBeyondDeg) {
    return {
      constraintId: c.id,
      strength: c.strength,
      messageZh: `${c.labelZh}：脚尖朝向偏差过大（约 ${Math.round(diff)}°）`,
      score: 0,
    };
  }
  if (diff <= c.softToleranceDeg) {
    return {
      constraintId: c.id,
      strength: c.strength,
      messageZh: `${c.labelZh}（偏差约 ${Math.round(diff)}°，在允许范围内）`,
      score: 100,
    };
  }
  const span = c.rejectBeyondDeg - c.softToleranceDeg;
  const t = span > 0 ? (diff - c.softToleranceDeg) / span : 1;
  const score = Math.round(100 * (1 - t));
  return {
    constraintId: c.id,
    strength: c.strength,
    messageZh: `${c.labelZh}（偏差约 ${Math.round(diff)}°，略偏但仍可接受）`,
    score,
  };
}

export function evaluateStanceConstraints(
  pose: ExtendedCoachPose,
  set: StanceConstraintSet,
): ConstraintEvaluation {
  const results: ConstraintViolation[] = [];
  for (const c of set.constraints) {
    if (c.strength === "required" && "minKneeAngleDeg" in c) {
      results.push(evalSupportStraight(c, pose.skeleton));
    } else if ("preferredToeYawRad" in c) {
      results.push(evalFootYaw(c, footForSide(pose, c.side)));
    }
  }
  const requiredFail = results.some(
    (r) => r.strength === "required" && r.score < 100,
  );
  const overallScore = results.length
    ? Math.min(...results.map((r) => r.score))
    : 100;
  return {
    valid: !requiredFail && results.every((r) => r.score > 0),
    overallScore,
    results,
  };
}

/**
 * 提膝定势 — owner rules:
 * - Support leg straight: required.
 * - Support foot facing: preferred ~forward, soft ±35°, reject beyond ±70°.
 */
/** Higher knee (up) ≈ lifted leg; the other is support. */
export function inferTiXiSupportLeg(sk: CoachSkeleton): "left" | "right" {
  return sk.leftKnee.up >= sk.rightKnee.up ? "right" : "left";
}

export function tiXiDingConstraintSet(support: "left" | "right"): StanceConstraintSet {
  return {
    id: "ti_xi_ding",
    nameZh: "提膝定势",
    constraints: [
      {
        id: "support-knee-straight",
        strength: "required",
        support,
        minKneeAngleDeg: 165,
        labelZh: "支撑腿伸直",
      },
      {
        id: "support-foot-facing",
        strength: "preferred",
        side: support,
        preferredToeYawRad: 0,
        softToleranceDeg: 35,
        rejectBeyondDeg: 70,
        labelZh: "支撑脚脚尖朝向（宜朝前，允许小幅外八）",
      },
    ],
  };
}
