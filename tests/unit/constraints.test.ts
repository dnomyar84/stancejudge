import { describe, expect, it } from "vitest";
import {
  extendedFromSkeleton,
  footFromAnkleForward,
} from "@/lib/pose/coach-figure/extended-pose";
import { buildWuBuCoachSkeleton } from "@/lib/pose/coach-figure/poses-wu-bu";
import {
  evaluateStanceConstraints,
  inferTiXiSupportLeg,
  tiXiDingConstraintSet,
} from "@/lib/pose/canonical3d/constraints";

describe("stance constraints", () => {
  it("提膝: support leg straight is required", () => {
    const sk = buildWuBuCoachSkeleton("wbq-06")!;
    const support = inferTiXiSupportLeg(sk);
    const pose = extendedFromSkeleton(sk);
    const eval_ = evaluateStanceConstraints(pose, tiXiDingConstraintSet(support));
    const kneeRule = eval_.results.find(
      (r) => r.constraintId === "support-knee-straight",
    );
    expect(kneeRule?.score).toBe(100);
    expect(eval_.valid).toBe(true);
  });

  it("提膝: support foot yaw within soft band scores high", () => {
    const sk = buildWuBuCoachSkeleton("wbq-06")!;
    const support = inferTiXiSupportLeg(sk);
    const pose = extendedFromSkeleton(sk);
    const foot = footFromAnkleForward(
      support === "left" ? sk.leftAnkle : sk.rightAnkle,
      0.25,
    );
    const pose2 = {
      ...pose,
      leftFoot: support === "left" ? foot : pose.leftFoot,
      rightFoot: support === "right" ? foot : pose.rightFoot,
    };
    const eval_ = evaluateStanceConstraints(
      pose2,
      tiXiDingConstraintSet(support),
    );
    const footRule = eval_.results.find(
      (r) => r.constraintId === "support-foot-facing",
    );
    expect(footRule?.score).toBeGreaterThanOrEqual(80);
  });

  it("提膝: wildly turned support foot fails", () => {
    const sk = buildWuBuCoachSkeleton("wbq-06")!;
    const support = inferTiXiSupportLeg(sk);
    const pose = extendedFromSkeleton(sk);
    const wild = footFromAnkleForward(
      support === "left" ? sk.leftAnkle : sk.rightAnkle,
      1.4,
    );
    const pose2 = {
      ...pose,
      leftFoot: support === "left" ? wild : pose.leftFoot,
      rightFoot: support === "right" ? wild : pose.rightFoot,
    };
    const eval_ = evaluateStanceConstraints(
      pose2,
      tiXiDingConstraintSet(support),
    );
    expect(eval_.valid).toBe(false);
    const footRule = eval_.results.find(
      (r) => r.constraintId === "support-foot-facing",
    );
    expect(footRule?.score).toBe(0);
  });
});
