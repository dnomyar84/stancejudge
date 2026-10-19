import { describe, expect, it } from "vitest";
import { sampleMoveChoreography } from "@/lib/pose/canonical3d/choreography";
import { wbq01OpeningChoreography } from "@/lib/pose/choreography/wbq-01-opening";
import { lerpExtendedPose } from "@/lib/pose/coach-figure/interpolate-pose";

describe("wbq-01 opening choreography", () => {
  it("has 并步 and 抱拳 phases", () => {
    expect(wbq01OpeningChoreography.phases.map((p) => p.id)).toEqual([
      "bing_bu",
      "bao_quan",
    ]);
  });

  it("interpolates feet closer at mid 并步", () => {
    const start = sampleMoveChoreography(wbq01OpeningChoreography, 0);
    const mid = sampleMoveChoreography(wbq01OpeningChoreography, 0.2);
    const endBing = sampleMoveChoreography(wbq01OpeningChoreography, 0.49);
    const ankleSpreadStart =
      Math.abs(start.pose.skeleton.leftAnkle.lat - start.pose.skeleton.rightAnkle.lat);
    const ankleSpreadMid =
      Math.abs(mid.pose.skeleton.leftAnkle.lat - mid.pose.skeleton.rightAnkle.lat);
    const ankleSpreadEnd =
      Math.abs(endBing.pose.skeleton.leftAnkle.lat - endBing.pose.skeleton.rightAnkle.lat);
    expect(ankleSpreadMid).toBeLessThan(ankleSpreadStart);
    expect(ankleSpreadEnd).toBeLessThan(ankleSpreadStart);
  });

  it("keeps ankles on floor plane while interpolating", () => {
    const a = sampleMoveChoreography(wbq01OpeningChoreography, 0).pose;
    const b = sampleMoveChoreography(wbq01OpeningChoreography, 1).pose;
    const mid = lerpExtendedPose(a, b, 0.5);
    expect(mid.skeleton.leftAnkle.up).toBeGreaterThanOrEqual(0.02);
    expect(mid.skeleton.rightAnkle.up).toBeGreaterThanOrEqual(0.02);
  });

  it("ends in 抱拳 with knuckles forward of wrists", () => {
    const end = sampleMoveChoreography(wbq01OpeningChoreography, 1);
    expect(end.pose.rightHand.knuckle.fwd).toBeGreaterThan(
      end.pose.rightHand.wrist.fwd,
    );
    expect(end.phaseNameZh).toBe("抱拳");
  });
});
