import { describe, expect, it } from "vitest";
import { getRoutineVisualCoach } from "@/lib/pose/choreography/registry";
import { buildWuBuCoachSkeleton } from "@/lib/pose/coach-figure/poses-wu-bu";
import { wuBuQuan } from "@/lib/wushu/routines/wu-bu-quan";
import {
  isLeftGongBuFront,
  isLeftPunchExtended,
  isRightPunchExtended,
  skeletonGongBuChongQuan,
  skeletonPuBuChuanZhangDing,
  skeletonTanTiChongQuanDing,
  skeletonTiXiChuanZhangDing,
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
    expect(buildWuBuCoachSkeleton("wbq-06")).toEqual(skeletonTiXiChuanZhangDing());
    expect(buildWuBuCoachSkeleton("wbq-07")).toEqual(skeletonPuBuChuanZhangDing());
  });

  it("wbq-02…09 choreography phases include leg/hand cues", () => {
    const coach = getRoutineVisualCoach("wu-bu-quan");
    const moves = coach!.moves.filter((m) => m.moveId !== "wbq-01");
    for (const m of moves) {
      const withCues = m.phases.filter((p) => p.cues.length > 0);
      expect(withCues.length).toBeGreaterThan(0);
      const legOrHand = m.phases.some((p) =>
        p.cues.some((c) => c.layer === "legs" || c.layer === "hands"),
      );
      expect(legOrHand).toBe(true);
    }
  });

  it("visual coach chains all nine syllabus moves", () => {
    const coach = getRoutineVisualCoach("wu-bu-quan");
    expect(coach?.moves).toHaveLength(wuBuQuan.moves.length);
    expect(coach?.moves.map((m) => m.moveId)).toEqual(
      wuBuQuan.moves.map((m) => m.id),
    );
  });
});
