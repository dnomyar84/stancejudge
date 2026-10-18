import { describe, expect, it } from "vitest";
import { KP } from "@/lib/pose/keypoints";
import { buildMoveTemplateKeypoints } from "@/lib/pose/move-pose-template";

describe("san-duan move thumbnails", () => {
  it("uses distinct silhouettes for raise fist vs thrust punch", () => {
    const raise = buildMoveTemplateKeypoints(
      "san-duan-chang-quan",
      "sdcq-07",
      "gong_bu",
      "punch_forward",
    );
    const punch = buildMoveTemplateKeypoints(
      "san-duan-chang-quan",
      "sdcq-14",
      "gong_bu",
      "punch_forward",
    );
    expect(raise[KP.right_wrist]!.y).toBeLessThan(punch[KP.right_wrist]!.y);
  });

  it("salute uses both hands high for opening", () => {
    const open = buildMoveTemplateKeypoints(
      "san-duan-chang-quan",
      "sdcq-01",
      "feet_together",
      "salute",
    );
    expect(open[KP.left_wrist]!.y).toBeLessThan(40);
    expect(open[KP.right_wrist]!.y).toBeLessThan(40);
  });
});
