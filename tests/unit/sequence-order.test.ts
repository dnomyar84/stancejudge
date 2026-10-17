import { describe, expect, it } from "vitest";
import {
  collapseExpectedLegSequence,
  sequenceOrderScore,
} from "@/lib/wushu/sequence";
import type { CanonicalRoutine, FrameClassification } from "@/lib/wushu/types";

function frame(leg: FrameClassification["leg"], time = 0): FrameClassification {
  return {
    timeSec: time,
    leg,
    hand: "guard_chest",
    legScore: 80,
    handScore: 80,
    legConfidence: 0.8,
    handConfidence: 0.8,
  };
}

describe("collapseExpectedLegSequence", () => {
  it("merges repeated syllabus stances", () => {
    const legs = collapseExpectedLegSequence([
      { expectedLeg: "feet_together" },
      { expectedLeg: "gong_bu" },
      { expectedLeg: "gong_bu" },
      { expectedLeg: "ma_bu" },
    ]);
    expect(legs).toEqual(["feet_together", "gong_bu", "ma_bu"]);
  });
});

describe("sequenceOrderScore", () => {
  const miniCanonical = {
    moves: [
      { expectedLeg: "feet_together" },
      { expectedLeg: "gong_bu" },
      { expectedLeg: "gong_bu" },
      { expectedLeg: "ma_bu" },
      { expectedLeg: "feet_together" },
    ],
  } as CanonicalRoutine;

  it("scores higher when collapsed leg order matches", () => {
    const frames = [
      frame("feet_together", 0),
      frame("gong_bu", 1),
      frame("ma_bu", 2),
      frame("feet_together", 3),
    ];
    const { score } = sequenceOrderScore(miniCanonical, frames);
    expect(score).toBeGreaterThanOrEqual(75);
  });
});
