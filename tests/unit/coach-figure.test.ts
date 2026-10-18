import { describe, expect, it } from "vitest";
import { buildCoachFigureKeypoints } from "@/lib/pose/coach-figure";
import { buildSanDuanCoachSkeleton } from "@/lib/pose/coach-figure/poses-san-duan";
import { KP } from "@/lib/pose/keypoints";

describe("3D coach figure (三段长拳)", () => {
  it("起势 holds hands in front of body (positive fwd in 3D)", () => {
    const sk = buildSanDuanCoachSkeleton("sdcq-01")!;
    expect(sk.leftWrist.fwd).toBeGreaterThan(0.2);
    expect(sk.rightWrist.fwd).toBeGreaterThan(0.2);
    expect(sk.leftWrist.lat).toBeLessThan(0);
    expect(sk.rightWrist.lat).toBeGreaterThan(0);
  });

  it("projects feet onto floor line in thumbnail space", () => {
    const kps = buildCoachFigureKeypoints("san-duan-chang-quan", "sdcq-01")!;
    const la = kps[KP.left_ankle]!;
    const ra = kps[KP.right_ankle]!;
    expect(la.y).toBeGreaterThan(115);
    expect(ra.y).toBeGreaterThan(115);
    expect(Math.abs(la.y - ra.y)).toBeLessThan(6);
  });

  it("右弓步 rear ankle sits behind front in depth (fwd)", () => {
    const sk = buildSanDuanCoachSkeleton("sdcq-14")!;
    expect(sk.leftAnkle.fwd).toBeLessThan(sk.rightAnkle.fwd - 0.2);
  });
});
