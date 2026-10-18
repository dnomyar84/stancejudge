import { describe, expect, it } from "vitest";
import {
  SAN_DUAN_EXPECTED_HANDS,
  SAN_DUAN_EXPECTED_LEGS,
  SAN_DUAN_MOVE_COUNT,
} from "@/lib/wushu/san-duan-expectations";
import { sanDuanChangQuan } from "@/lib/wushu/routines/san-duan-chang-quan";

describe("三段长拳 syllabus stances (test oracle)", () => {
  it("has 22 moves", () => {
    expect(SAN_DUAN_MOVE_COUNT).toBe(22);
    expect(sanDuanChangQuan.moves).toHaveLength(22);
  });

  it("expects core leg stances used in duanwei changquan", () => {
    expect(SAN_DUAN_EXPECTED_LEGS).toContain("feet_together");
    expect(SAN_DUAN_EXPECTED_LEGS).toContain("gong_bu");
    expect(SAN_DUAN_EXPECTED_LEGS).toContain("ma_bu");
    expect(SAN_DUAN_EXPECTED_LEGS).toContain("xu_bu");
    expect(SAN_DUAN_EXPECTED_LEGS).toContain("xie_bu");
    expect(SAN_DUAN_EXPECTED_LEGS).toContain("ti_xi");
    expect(SAN_DUAN_EXPECTED_LEGS).toContain("walking");
  });

  it("expects unarmed hand profiles (not sword)", () => {
    expect(SAN_DUAN_EXPECTED_HANDS).toContain("salute");
    expect(SAN_DUAN_EXPECTED_HANDS).toContain("punch_forward");
    expect(SAN_DUAN_EXPECTED_HANDS).toContain("push_palm");
    expect(SAN_DUAN_EXPECTED_HANDS).toContain("block_elbow");
    expect(SAN_DUAN_EXPECTED_HANDS).toContain("guard_chest");
    expect(SAN_DUAN_EXPECTED_HANDS.every((h) => !h.startsWith("jian"))).toBe(
      true,
    );
  });

  it("opens and closes with respect postures", () => {
    const first = sanDuanChangQuan.moves[0];
    const last = sanDuanChangQuan.moves[21];
    expect(first.nameZh).toBe("起势");
    expect(first.expectedHand).toBe("salute");
    expect(last.nameZh).toBe("收势");
    expect(last.expectedHand).toBe("salute");
  });
});
