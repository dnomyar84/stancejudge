import {
  angleAtVertex,
  distance,
  leanFromVertical,
  midpoint,
  scoreBand,
} from "./geometry";
import { getKeypoint, hasFullLowerBody, KP } from "./keypoints";
import type { PoseKeypoint } from "./types";

export type StanceMode = "athletic" | "boxing";

export type CriterionStatus = "good" | "warn" | "bad" | "unknown";

export type StanceCriterion = {
  id: string;
  label: string;
  detail: string;
  score: number;
  status: CriterionStatus;
};

export type StanceAnalysis = {
  overall: number;
  criteria: StanceCriterion[];
  ready: boolean;
  headline: string;
};

function statusFromScore(score: number): CriterionStatus {
  if (score >= 75) return "good";
  if (score >= 45) return "warn";
  return "bad";
}

function criterion(
  id: string,
  label: string,
  detail: string,
  score: number,
): StanceCriterion {
  return { id, label, detail, score, status: statusFromScore(score) };
}

export function analyzeStance(
  keypoints: PoseKeypoint[],
  mode: StanceMode,
): StanceAnalysis {
  if (!hasFullLowerBody(keypoints)) {
    return {
      overall: 0,
      criteria: [],
      ready: false,
      headline: "Step back so your full body is visible in frame.",
    };
  }

  const ls = getKeypoint(keypoints, KP.left_shoulder)!;
  const rs = getKeypoint(keypoints, KP.right_shoulder)!;
  const lh = getKeypoint(keypoints, KP.left_hip)!;
  const rh = getKeypoint(keypoints, KP.right_hip)!;
  const lk = getKeypoint(keypoints, KP.left_knee)!;
  const rk = getKeypoint(keypoints, KP.right_knee)!;
  const la = getKeypoint(keypoints, KP.left_ankle)!;
  const ra = getKeypoint(keypoints, KP.right_ankle)!;

  const shoulderMid = midpoint(ls, rs);
  const hipMid = midpoint(lh, rh);
  const torsoLen = Math.max(distance(shoulderMid, hipMid), 1);

  const shoulderWidth = distance(ls, rs);
  const ankleWidth = distance(la, ra);
  const baseRatio = shoulderWidth > 0 ? ankleWidth / shoulderWidth : 0;

  const idealBase = mode === "boxing" ? 1.35 : 1.25;
  const baseScore = scoreBand(baseRatio, idealBase, 0.2, 0.9);

  const leftKneeAngle = angleAtVertex(lh, lk, la);
  const rightKneeAngle = angleAtVertex(rh, rk, ra);
  const avgKnee = (leftKneeAngle + rightKneeAngle) / 2;
  const idealKnee = mode === "boxing" ? 155 : 165;
  const kneeScore = scoreBand(avgKnee, idealKnee, 12, 45);

  const hipTilt = Math.abs(lh.y - rh.y) / torsoLen;
  const hipScore = scoreBand(hipTilt, 0, 0.04, 0.14);

  const shoulderTilt = Math.abs(ls.y - rs.y) / torsoLen;
  const shoulderScore = scoreBand(shoulderTilt, 0, 0.04, 0.12);

  const torsoLean = leanFromVertical(hipMid, shoulderMid);
  const leanScore = scoreBand(torsoLean, mode === "boxing" ? 8 : 5, 6, 28);

  const criteria: StanceCriterion[] = [
    criterion(
      "base",
      "Stance width",
      `Feet are ${baseRatio.toFixed(2)}× shoulder width (target ~${idealBase.toFixed(2)}×).`,
      baseScore,
    ),
    criterion(
      "knees",
      "Knee bend",
      `Average knee angle ${avgKnee.toFixed(0)}° — stay athletic, not locked or squatting.`,
      kneeScore,
    ),
    criterion(
      "hips",
      "Level hips",
      `Hip line tilt ${(hipTilt * 100).toFixed(0)}% of torso height.`,
      hipScore,
    ),
    criterion(
      "shoulders",
      "Level shoulders",
      `Shoulder line tilt ${(shoulderTilt * 100).toFixed(0)}% of torso height.`,
      shoulderScore,
    ),
    criterion(
      "posture",
      "Upright torso",
      `Lean ${torsoLean.toFixed(0)}° from vertical.`,
      leanScore,
    ),
  ];

  if (mode === "boxing") {
    const lw = getKeypoint(keypoints, KP.left_wrist);
    const rw = getKeypoint(keypoints, KP.right_wrist);
    const nose = getKeypoint(keypoints, KP.nose);
    let guardScore = 0;
    let guardDetail = "Raise both hands — wrists should sit near chin height.";
    if (lw && rw && nose) {
      const chinY = nose.y + torsoLen * 0.08;
      const leftOk = lw.y <= chinY + torsoLen * 0.15;
      const rightOk = rw.y <= chinY + torsoLen * 0.15;
      const elbowsIn =
        distance(lw, ls) < torsoLen * 1.1 && distance(rw, rs) < torsoLen * 1.1;
      guardScore = leftOk && rightOk && elbowsIn ? 95 : leftOk || rightOk ? 55 : 25;
      guardDetail = leftOk && rightOk
        ? "Hands up near guard position."
        : "Bring wrists up toward chin level.";
    }
    criteria.push(
      criterion("guard", "Hand guard", guardDetail, guardScore),
    );
  }

  const overall = Math.round(
    criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length,
  );

  let headline = "Solid foundation — keep refining the details.";
  if (overall >= 85) headline = "Strong stance. Hold it steady.";
  else if (overall >= 65) headline = "Good base — check the yellow items.";
  else if (overall >= 40) headline = "Adjust width, bend, and posture.";
  else headline = "Reset feet and shoulders, then try again.";

  return { overall, criteria, ready: true, headline };
}
