import { describe, expect, it } from "vitest";
import { buildWuBuCoachSkeleton } from "@/lib/pose/coach-figure/poses-wu-bu";
import {
  isLeftGongBuFront,
  isLeftPunchExtended,
  isRightPunchExtended,
  skeletonGongBuChongQuan,
  skeletonTanTiChongQuanDing,
  skeletonXieBuChongQuanDing,
} from "@/lib/pose/choreography/wbq-standard";

describe("五步拳国标左式定势", () => {
  it("wbq-02: 左弓步、右冲拳、左抱腰", () => {
    const sk = buildWuBuCoachSkeleton("wbq-02")!;
    expect(isLeftGongBuFront(sk)).toBe(true);
    expect(isRightPunchExtended(sk)).toBe(true);
    expect(sk.leftWrist.fwd).toBeLessThan(sk.rightWrist.fwd - 0.1);
  });

  it("wbq-03: 右腿前弹、左冲拳", () => {
    const sk = buildWuBuCoachSkeleton("wbq-03")!;
    expect(isLeftPunchExtended(sk)).toBe(true);
    expect(sk.rightAnkle.fwd).toBeGreaterThan(sk.leftAnkle.fwd + 0.05);
    expect(sk.rightAnkle.up).toBeGreaterThan(sk.leftAnkle.up + 0.05);
  });

  it("wbq-05: 歇步左冲拳", () => {
    const sk = buildWuBuCoachSkeleton("wbq-05")!;
    expect(isLeftPunchExtended(sk)).toBe(true);
  });

  it("skeleton recipes match move ids", () => {
    expect(buildWuBuCoachSkeleton("wbq-02")).toEqual(skeletonGongBuChongQuan());
    expect(buildWuBuCoachSkeleton("wbq-03")).toEqual(skeletonTanTiChongQuanDing());
    expect(buildWuBuCoachSkeleton("wbq-05")).toEqual(skeletonXieBuChongQuanDing());
  });
});
