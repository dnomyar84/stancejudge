import { describe, expect, it } from "vitest";
import { buildMoveTemplateKeypoints } from "@/lib/pose/move-pose-template";
import { scoreMoveAlignment } from "@/lib/wushu/move-alignment";
import { sanDuanChangQuan } from "@/lib/wushu/routines/san-duan-chang-quan";

describe("move template alignment (三段长拳)", () => {
  it("scores ~100 when keypoints match the move template", () => {
    const move = sanDuanChangQuan.moves.find((m) => m.id === "sdcq-11")!;
    const template = buildMoveTemplateKeypoints(
      "san-duan-chang-quan",
      move.id,
      move.expectedLeg,
      move.expectedHand,
    );
    const scores = scoreMoveAlignment(
      "san-duan-chang-quan",
      move.id,
      move.expectedLeg,
      move.expectedHand,
      template,
      "unarmed",
    );
    expect(scores.templateScore).toBeGreaterThanOrEqual(95);
    expect(scores.legScore).toBeGreaterThanOrEqual(90);
    expect(scores.handScore).toBeGreaterThanOrEqual(90);
  });

  it("uses xie_bu expectation for 歇步冲拳", () => {
    const move = sanDuanChangQuan.moves[10];
    expect(move.nameZh).toBe("歇步冲拳");
    expect(move.expectedLeg).toBe("xie_bu");
  });
});
