import { ANATOMY } from "./anatomy";
import { lerp3, v, type Vec3 } from "./vec3";

export type CoachSkeleton = {
  nose: Vec3;
  leftShoulder: Vec3;
  rightShoulder: Vec3;
  leftElbow: Vec3;
  rightElbow: Vec3;
  leftWrist: Vec3;
  rightWrist: Vec3;
  leftHip: Vec3;
  rightHip: Vec3;
  leftKnee: Vec3;
  rightKnee: Vec3;
  leftAnkle: Vec3;
  rightAnkle: Vec3;
};

function shoulderY(): number {
  return ANATOMY.shoulderUp;
}

export function hipY(): number {
  return ANATOMY.hipUp;
}

export function baseStandingTorso(): Pick<
  CoachSkeleton,
  "nose" | "leftShoulder" | "rightShoulder" | "leftHip" | "rightHip"
> {
  const sy = shoulderY();
  const hy = hipY();
  return {
    nose: v(0, 0.06, ANATOMY.chin),
    leftShoulder: v(-ANATOMY.shoulderHalfWidth, 0.02, sy),
    rightShoulder: v(ANATOMY.shoulderHalfWidth, 0.02, sy),
    leftHip: v(-ANATOMY.hipHalfWidth, 0, hy),
    rightHip: v(ANATOMY.hipHalfWidth, 0, hy),
  };
}

export function legChain(
  hip: Vec3,
  knee: Vec3,
  ankle: Vec3,
): { knee: Vec3; ankle: Vec3 } {
  return { knee, ankle };
}

/** Feet together, ankles on floor plane. */
export function legsFeetTogether(): Pick<
  CoachSkeleton,
  "leftKnee" | "rightKnee" | "leftAnkle" | "rightAnkle"
> {
  const lk = v(-0.06, 0, ANATOMY.kneeUp);
  const rk = v(0.06, 0, ANATOMY.kneeUp);
  const la = v(-0.06, 0.02, ANATOMY.ankleUp);
  const ra = v(0.06, 0.02, ANATOMY.ankleUp);
  return { leftKnee: lk, rightKnee: rk, leftAnkle: la, rightAnkle: ra };
}

/** 弓步: lead leg bent ~90° in sagittal (fwd–up) plane; rear leg straight back. */
export function legsGongBu(lead: "left" | "right"): Pick<
  CoachSkeleton,
  "leftKnee" | "rightKnee" | "leftAnkle" | "rightAnkle"
> {
  const hy = hipY();
  const thigh = ANATOMY.thigh;
  const shin = ANATOMY.shin;

  if (lead === "right") {
    const rKnee = v(ANATOMY.hipHalfWidth + 0.02, 0.4, hy - thigh * 0.92);
    const rAnkle = v(ANATOMY.hipHalfWidth + 0.05, 0.44, ANATOMY.ankleUp);
    const lAnkle = v(-ANATOMY.hipHalfWidth - 0.3, -0.55, ANATOMY.ankleUp);
    const lHip = v(-ANATOMY.hipHalfWidth, 0, hy);
    const lKnee = lerp3(lHip, lAnkle, thigh / (thigh + shin));
    return {
      leftKnee: lKnee,
      rightKnee: rKnee,
      leftAnkle: lAnkle,
      rightAnkle: rAnkle,
    };
  }

  const lKnee = v(-ANATOMY.hipHalfWidth - 0.02, 0.4, hy - thigh * 0.92);
  const lAnkle = v(-ANATOMY.hipHalfWidth - 0.05, 0.44, ANATOMY.ankleUp);
  const rHip = v(ANATOMY.hipHalfWidth, 0, hy);
  const rAnkle = v(ANATOMY.hipHalfWidth + 0.3, -0.55, ANATOMY.ankleUp);
  const rKnee = lerp3(rHip, rAnkle, thigh / (thigh + shin));
  return {
    leftKnee: lKnee,
    rightKnee: rKnee,
    leftAnkle: lAnkle,
    rightAnkle: rAnkle,
  };
}

export function legsMaBu(): Pick<
  CoachSkeleton,
  "leftKnee" | "rightKnee" | "leftAnkle" | "rightAnkle"
> {
  const spread = 0.32;
  const lk = v(-spread, 0, ANATOMY.kneeUp + 0.02);
  const rk = v(spread, 0, ANATOMY.kneeUp + 0.02);
  const la = v(-spread - 0.02, 0, ANATOMY.ankleUp);
  const ra = v(spread + 0.02, 0, ANATOMY.ankleUp);
  return { leftKnee: lk, rightKnee: rk, leftAnkle: la, rightAnkle: ra };
}

export function legsXuBu(): Pick<
  CoachSkeleton,
  "leftKnee" | "rightKnee" | "leftAnkle" | "rightAnkle"
> {
  const lk = v(-0.12, 0.08, ANATOMY.kneeUp);
  const rk = v(0.14, -0.22, ANATOMY.kneeUp + 0.04);
  const la = v(-0.1, 0.12, ANATOMY.ankleUp);
  const ra = v(0.1, -0.38, ANATOMY.ankleUp);
  return { leftKnee: lk, rightKnee: rk, leftAnkle: la, rightAnkle: ra };
}

export function legsXieBu(): Pick<
  CoachSkeleton,
  "leftKnee" | "rightKnee" | "leftAnkle" | "rightAnkle"
> {
  const hy = hipY() - 0.2;
  return {
    leftKnee: v(-0.2, -0.08, hy - 0.12),
    rightKnee: v(0.08, 0.06, hy - 0.1),
    leftAnkle: v(-0.24, -0.12, ANATOMY.ankleUp),
    rightAnkle: v(0.12, 0.1, ANATOMY.ankleUp),
  };
}

/** 提膝: support leg straight (hip–knee–ankle line); other knee raised. */
/** 弹踢：右腿屈膝提起（左支撑），国标五步拳弹腿冲拳。 */
export function legsRightSnapKickChamber(): Pick<
  CoachSkeleton,
  "leftKnee" | "rightKnee" | "leftAnkle" | "rightAnkle"
> {
  const lifted = legsTiXi("right");
  return lifted;
}

/** 弹踢击出：左腿支撑，右腿向前弹击。 */
export function legsRightSnapKickStrike(): Pick<
  CoachSkeleton,
  "leftKnee" | "rightKnee" | "leftAnkle" | "rightAnkle"
> {
  const hy = hipY();
  const thigh = ANATOMY.thigh;
  const shin = ANATOMY.shin;
  const lHip = v(-ANATOMY.hipHalfWidth, 0, hy);
  const lAnkle = v(-ANATOMY.hipHalfWidth - 0.02, 0.02, ANATOMY.ankleUp);
  const lKnee = lerp3(lHip, lAnkle, thigh / (thigh + shin));
  const rKnee = v(0.06, 0.28, hy - 0.1);
  const rAnkle = v(0.08, 0.44, hy - 0.2);
  return {
    leftKnee: lKnee,
    leftAnkle: lAnkle,
    rightKnee: rKnee,
    rightAnkle: rAnkle,
  };
}

export function legsTiXi(lift: "left" | "right" = "left"): Pick<
  CoachSkeleton,
  "leftKnee" | "rightKnee" | "leftAnkle" | "rightAnkle"
> {
  const hy = hipY();
  const thigh = ANATOMY.thigh;
  const shin = ANATOMY.shin;

  const support = (side: "left" | "right") => {
    const sign = side === "left" ? -1 : 1;
    const hip = v(sign * ANATOMY.hipHalfWidth, 0, hy);
    const ankle = v(sign * (ANATOMY.hipHalfWidth + 0.02), 0.05, ANATOMY.ankleUp);
    const knee = lerp3(hip, ankle, thigh / (thigh + shin));
    return { knee, ankle };
  };

  const lifted = (side: "left" | "right") => {
    const sign = side === "left" ? -1 : 1;
    return {
      knee: v(sign * 0.08, 0.2, hy - 0.06),
      ankle: v(sign * 0.1, 0.14, hy - 0.26),
    };
  };

  const s = support(lift === "left" ? "right" : "left");
  const l = lifted(lift);
  if (lift === "left") {
    return {
      leftKnee: l.knee,
      leftAnkle: l.ankle,
      rightKnee: s.knee,
      rightAnkle: s.ankle,
    };
  }
  return {
    leftKnee: s.knee,
    leftAnkle: s.ankle,
    rightKnee: l.knee,
    rightAnkle: l.ankle,
  };
}

/** 起势 / 收势 — fists or palms in front of chest, not on body surface. */
export function armsSalute(): Pick<
  CoachSkeleton,
  "leftElbow" | "rightElbow" | "leftWrist" | "rightWrist"
> {
  const sy = shoulderY();
  return {
    leftElbow: v(-0.1, 0.18, sy - 0.12),
    rightElbow: v(0.1, 0.18, sy - 0.12),
    leftWrist: v(-0.07, 0.28, ANATOMY.chin - 0.02),
    rightWrist: v(0.07, 0.28, ANATOMY.chin - 0.02),
  };
}

export function armsFistWaist(): Pick<
  CoachSkeleton,
  "leftElbow" | "rightElbow" | "leftWrist" | "rightWrist"
> {
  const hy = hipY();
  return {
    leftElbow: v(-0.2, 0.08, hy + 0.18),
    rightElbow: v(0.2, 0.08, hy + 0.18),
    leftWrist: v(-0.14, 0.14, hy + 0.06),
    rightWrist: v(0.14, 0.14, hy + 0.06),
  };
}

export function armsPunchForward(side: "left" | "right" | "both" = "right"): Pick<
  CoachSkeleton,
  "leftElbow" | "rightElbow" | "leftWrist" | "rightWrist"
> {
  const sy = shoulderY();
  const guard = {
    leftElbow: v(-0.18, 0.06, sy - 0.14),
    leftWrist: v(-0.14, 0.1, hyGuard()),
    rightElbow: v(0.12, 0.08, sy - 0.12),
    rightWrist: v(0.1, 0.12, hyGuard()),
  };
  function hyGuard() {
    return hipY() + 0.2;
  }
  if (side === "left") {
    return {
      ...guard,
      leftElbow: v(-0.08, 0.22, sy - 0.1),
      leftWrist: v(-0.06, 0.48, sy - 0.08),
    };
  }
  if (side === "both") {
    return {
      leftElbow: v(-0.06, 0.24, sy - 0.08),
      rightElbow: v(0.06, 0.24, sy - 0.08),
      leftWrist: v(-0.08, 0.46, sy - 0.06),
      rightWrist: v(0.08, 0.46, sy - 0.06),
    };
  }
  return {
    ...guard,
    rightElbow: v(0.08, 0.22, sy - 0.1),
    rightWrist: v(0.06, 0.5, sy - 0.08),
  };
}

export function armsBlockElbow(): Pick<
  CoachSkeleton,
  "leftElbow" | "rightElbow" | "leftWrist" | "rightWrist"
> {
  const sy = shoulderY();
  return {
    leftElbow: v(-0.12, 0.2, sy - 0.02),
    leftWrist: v(-0.04, 0.26, sy + 0.04),
    rightElbow: v(0.14, 0.12, sy - 0.1),
    rightWrist: v(0.22, 0.18, sy - 0.04),
  };
}

export function armsPushPalm(side: "left" | "right" = "right"): Pick<
  CoachSkeleton,
  "leftElbow" | "rightElbow" | "leftWrist" | "rightWrist"
> {
  const base = armsPunchForward(side);
  if (side === "left") {
    return {
      ...base,
      leftWrist: v(-0.05, 0.44, shoulderY() - 0.04),
    };
  }
  return {
    ...base,
    rightWrist: v(0.05, 0.44, shoulderY() - 0.04),
  };
}

export function armsLiftFist(): Pick<
  CoachSkeleton,
  "leftElbow" | "rightElbow" | "leftWrist" | "rightWrist"
> {
  const sy = shoulderY();
  return {
    leftElbow: v(-0.16, 0.08, sy - 0.12),
    leftWrist: v(-0.12, 0.1, hipY() + 0.18),
    rightElbow: v(0.1, 0.16, sy + 0.02),
    rightWrist: v(0.08, 0.22, sy + 0.14),
  };
}

export function armsSpread(): Pick<
  CoachSkeleton,
  "leftElbow" | "rightElbow" | "leftWrist" | "rightWrist"
> {
  const sy = shoulderY();
  return {
    leftElbow: v(-0.28, 0.04, sy - 0.06),
    rightElbow: v(0.28, 0.04, sy - 0.06),
    leftWrist: v(-0.42, 0.02, sy - 0.02),
    rightWrist: v(0.42, 0.02, sy - 0.02),
  };
}

export function armsWristWrap(): Pick<
  CoachSkeleton,
  "leftElbow" | "rightElbow" | "leftWrist" | "rightWrist"
> {
  const sy = shoulderY();
  return {
    leftElbow: v(-0.14, 0.14, sy - 0.1),
    rightElbow: v(0.14, 0.14, sy - 0.1),
    leftWrist: v(-0.02, 0.22, sy - 0.06),
    rightWrist: v(0.02, 0.2, sy - 0.04),
  };
}

export function armsChopPalm(): Pick<
  CoachSkeleton,
  "leftElbow" | "rightElbow" | "leftWrist" | "rightWrist"
> {
  const sy = shoulderY();
  return {
    leftElbow: v(-0.14, 0.1, sy - 0.12),
    leftWrist: v(-0.1, 0.14, hipY() + 0.16),
    rightElbow: v(0.1, 0.18, sy - 0.04),
    rightWrist: v(0.08, 0.24, sy + 0.02),
  };
}

export function mergeSkeleton(parts: Partial<CoachSkeleton>[]): CoachSkeleton {
  const out = {} as CoachSkeleton;
  for (const p of parts) {
    Object.assign(out, p);
  }
  return out;
}
