import { describe, expect, it } from "vitest";
import { ANATOMY, COACH_STATURE_UP, statureUnits } from "@/lib/pose/coach-figure/anatomy";
import { baseStandingTorso } from "@/lib/pose/coach-figure/skeleton";

describe("coach anatomy proportions", () => {
  it("shoulder breadth is ~26% of stature", () => {
    const span = ANATOMY.shoulderHalfWidth * 2;
    expect(span / COACH_STATURE_UP).toBeGreaterThan(0.24);
    expect(span / COACH_STATURE_UP).toBeLessThan(0.28);
  });

  it("hip breadth is ~17% of stature", () => {
    const span = ANATOMY.hipHalfWidth * 2;
    expect(span / COACH_STATURE_UP).toBeGreaterThan(0.15);
    expect(span / COACH_STATURE_UP).toBeLessThan(0.19);
  });

  it("hips are narrower than shoulders", () => {
    expect(ANATOMY.hipHalfWidth).toBeLessThan(ANATOMY.shoulderHalfWidth);
  });

  it("torso uses anatomy widths", () => {
    const t = baseStandingTorso();
    expect(Math.abs(t.leftShoulder.lat)).toBeCloseTo(ANATOMY.shoulderHalfWidth, 4);
    expect(Math.abs(t.leftHip.lat)).toBeCloseTo(ANATOMY.hipHalfWidth, 4);
  });

  it("statureUnits scales fractions consistently", () => {
    expect(statureUnits(0.5)).toBeCloseTo(COACH_STATURE_UP * 0.5, 5);
  });
});
