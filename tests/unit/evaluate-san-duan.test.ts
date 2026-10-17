import { describe, expect, it } from "vitest";
import { evaluateFramesAsSanDuanChangQuan } from "@/lib/wushu/evaluate-san-duan";
import type { FrameClassification } from "@/lib/wushu/types";

function frame(
  timeSec: number,
  leg: FrameClassification["leg"],
  hand: FrameClassification["hand"],
): FrameClassification {
  return {
    timeSec,
    leg,
    hand,
    legScore: 100,
    handScore: 100,
    legConfidence: 0.8,
    handConfidence: 0.8,
  };
}

describe("evaluateFramesAsSanDuanChangQuan", () => {
  it("scores higher when leg timeline follows 起势→弓步→马步 pattern", () => {
    const good: FrameClassification[] = [
      frame(0, "feet_together", "salute"),
      frame(1, "gong_bu", "guard_chest"),
      frame(2, "ma_bu", "punch_forward"),
      frame(3, "gong_bu", "punch_forward"),
      frame(4, "feet_together", "salute"),
    ];
    const ev = evaluateFramesAsSanDuanChangQuan(good, 5);
    expect(ev.sequenceScore).toBeGreaterThan(5);
    expect(ev.legCoverage).toBeGreaterThan(0.4);
  });

  it("scores lower for random / sword-like hands only", () => {
    const jianLike: FrameClassification[] = [
      frame(0, "feet_together", "jian_guard"),
      frame(1, "xu_bu", "jian_point"),
      frame(2, "xu_bu", "jian_point"),
      frame(3, "gong_bu", "jian_guard"),
    ];
    const ev = evaluateFramesAsSanDuanChangQuan(jianLike, 4);
    expect(ev.handCoverage).toBeLessThan(0.5);
  });
});
