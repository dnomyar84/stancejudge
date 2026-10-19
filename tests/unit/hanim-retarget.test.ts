import { describe, expect, it } from "vitest";
import { sampleMoveChoreography } from "@/lib/pose/canonical3d/choreography";
import { wbq01OpeningChoreography } from "@/lib/pose/choreography/wbq-01-opening";
import { COACH_FLOOR_CONTACT_UP } from "@/lib/pose/coach-figure/gravity";
import { COACH_SCENE_SCALE } from "@/lib/pose/hanim/coach-world";
import { clampInteriorFlex } from "@/lib/pose/hanim/joint-limits";

describe("H-Anim retarget prep", () => {
  it("maps 起势 start with wide stance on coach floor", () => {
    const frame = sampleMoveChoreography(wbq01OpeningChoreography, 0);
    const sk = frame.pose.skeleton;
    const low = Math.min(sk.leftAnkle.up, sk.rightAnkle.up);
    expect(low).toBeCloseTo(COACH_FLOOR_CONTACT_UP, 3);
    const spread = Math.abs(sk.leftAnkle.lat - sk.rightAnkle.lat);
    expect(spread * COACH_SCENE_SCALE).toBeGreaterThan(0.35);
  });

  it("clamps knee flex within safety band", () => {
    expect(clampInteriorFlex(200, "knee")).toBeLessThanOrEqual(150);
    expect(clampInteriorFlex(10, "knee")).toBeGreaterThanOrEqual(0);
  });
});
