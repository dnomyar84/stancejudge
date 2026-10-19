import { describe, expect, it } from "vitest";
import {
  MIXAMO_BIND_HEIGHT_M,
  MIXAMO_TARGET_HEIGHT_M,
  mixamoSceneScaleFactor,
} from "@/lib/motion/retarget/hanim/apply-coach-to-mixamo";

describe("Mixamo scene scale", () => {
  it("uses fallback when measured bind height is bogus", () => {
    expect(mixamoSceneScaleFactor(0)).toBeCloseTo(
      MIXAMO_TARGET_HEIGHT_M / MIXAMO_BIND_HEIGHT_M,
      0,
    );
    expect(mixamoSceneScaleFactor(0.0001)).toBeCloseTo(
      MIXAMO_TARGET_HEIGHT_M / MIXAMO_BIND_HEIGHT_M,
      0,
    );
  });

  it("scales measured human-height binds ~1:1", () => {
    expect(mixamoSceneScaleFactor(1.75)).toBeCloseTo(1, 2);
  });
});
