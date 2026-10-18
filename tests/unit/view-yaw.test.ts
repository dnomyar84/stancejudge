import { describe, expect, it } from "vitest";
import { buildStanceTemplateKeypoints } from "@/lib/pose/stance-template";
import { defaultThumbnailYaw, rotateKeypointsYaw } from "@/lib/pose/view-yaw";

describe("pose thumbnail yaw", () => {
  it("defaults 弓步 to a side-biased angle", () => {
    expect(defaultThumbnailYaw("gong_bu")).toBeGreaterThan(50);
  });

  it("yaw 0 leaves keypoints unchanged", () => {
    const kps = buildStanceTemplateKeypoints("gong_bu", "punch_forward", {
      gongBuLead: "right",
    });
    const same = rotateKeypointsYaw(kps, 0);
    expect(same[28]?.x).toBe(kps[28]?.x);
  });

  it("changes silhouette when yawed (not front-only)", () => {
    const front = buildStanceTemplateKeypoints("gong_bu", "punch_forward", {
      gongBuLead: "right",
    });
    const side = rotateKeypointsYaw(front, 60);
    const ankle = side[28]!;
    const frontAnkle = front[28]!;
    expect(Math.abs(ankle.x - frontAnkle.x)).toBeGreaterThan(4);
  });
});
