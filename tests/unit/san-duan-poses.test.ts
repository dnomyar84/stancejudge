import { describe, expect, it } from "vitest";
import { buildSanDuanCoachSkeleton } from "@/lib/pose/coach-figure/poses-san-duan";
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

  it("xie bu sits lower than xu bu in 3D coach model", () => {
    const xie = buildSanDuanCoachSkeleton("sdcq-11")!;
    const xu = buildSanDuanCoachSkeleton("sdcq-10")!;
    const xieHip = (xie.leftHip.up + xie.rightHip.up) / 2;
    const xuHip = (xu.leftHip.up + xu.rightHip.up) / 2;
    expect(xieHip).toBeLessThan(xuHip - 0.08);
  });

  it("salute holds wrists in front of chest in 3D", () => {
    const open = buildSanDuanCoachSkeleton("sdcq-01")!;
    expect(open.leftWrist.fwd).toBeGreaterThan(0.2);
    expect(open.rightWrist.fwd).toBeGreaterThan(0.2);
  });
});
