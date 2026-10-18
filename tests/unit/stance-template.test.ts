import { describe, expect, it } from "vitest";
import { KP } from "@/lib/pose/keypoints";
import { scoreGongBuGeometry } from "@/lib/pose/stance-geometry";
import {
  buildStanceTemplateKeypoints,
  gongBuKneeAngles,
} from "@/lib/pose/stance-template";

describe("buildStanceTemplateKeypoints", () => {
  it("returns a full lower-body skeleton for gong_bu punch", () => {
    const kps = buildStanceTemplateKeypoints("gong_bu", "punch_forward");
    expect(kps[KP.left_ankle]?.x).toBeDefined();
    expect(kps[KP.right_wrist]?.x).toBeGreaterThan(kps[KP.right_shoulder]!.x);
  });

  it("right gong bu shows ~90° front knee and straight rear leg (3D body)", () => {
    const kps = buildStanceTemplateKeypoints("gong_bu", "punch_forward", {
      gongBuLead: "right",
    });
    const { frontKnee, rearKnee } = gongBuKneeAngles("right");
    expect(rearKnee).toBeGreaterThan(165);
    expect(frontKnee).toBeGreaterThan(75);
    expect(scoreGongBuGeometry(kps, "right")).toBeGreaterThan(80);
  });

  it("spreads feet for ma_bu", () => {
    const kps = buildStanceTemplateKeypoints("ma_bu", "guard_chest");
    const spread =
      Math.abs(kps[KP.left_ankle]!.x - kps[KP.right_ankle]!.x);
    expect(spread).toBeGreaterThan(40);
  });
});
