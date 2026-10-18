import { describe, expect, it } from "vitest";
import { buildMoveTemplateKeypoints } from "@/lib/pose/move-pose-template";
import {
  kneeAngleBody3D,
  scoreExpectedStanceGeometry,
  scoreGongBuGeometry,
} from "@/lib/pose/stance-geometry";
import { buildStanceTemplateKeypoints } from "@/lib/pose/stance-template";
import { estimateBodyAxes } from "@/lib/pose/body-frame";

describe("stance geometry (body-local 3D)", () => {
  it("right 弓步 template: front knee ~90°, rear leg straight in 3D", () => {
    const kps = buildStanceTemplateKeypoints("gong_bu", "punch_forward", {
      gongBuLead: "right",
    });
    const axes = estimateBodyAxes(kps);
    expect(axes).not.toBeNull();
    const front = kneeAngleBody3D(kps, axes!, "right")!;
    const rear = kneeAngleBody3D(kps, axes!, "left")!;
    expect(front).toBeGreaterThan(78);
    expect(front).toBeLessThan(108);
    expect(rear).toBeGreaterThan(155);
    expect(scoreGongBuGeometry(kps, "right")).toBeGreaterThan(72);
  });

  it("sdcq-14 scores high on expected gong_bu geometry", () => {
    const kps = buildMoveTemplateKeypoints(
      "san-duan-chang-quan",
      "sdcq-14",
      "gong_bu",
      "punch_forward",
    );
    const score = scoreExpectedStanceGeometry("gong_bu", kps, {
      gongBuLead: "right",
    });
    expect(score).toBeGreaterThan(48);
  });

  it("shallow symmetric pose scores low for gong_bu", () => {
    const kps = buildStanceTemplateKeypoints("ma_bu", "punch_forward");
    const score = scoreExpectedStanceGeometry("gong_bu", kps, {
      gongBuLead: "right",
    });
    expect(score).toBeLessThan(65);
  });
});
