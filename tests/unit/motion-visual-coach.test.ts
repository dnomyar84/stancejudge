import { describe, expect, it } from "vitest";
import { sampleRoutineVisualCoach } from "@/lib/pose/canonical3d/choreography";
import { totalRoutineDurationMs } from "@/lib/pose/choreography/move-boundaries";
import { WU_BU_TRANSITION_MS } from "@/lib/disciplines/wushu/visual-coach/wu-bu-quan";
import { getRoutineVisualCoach } from "@/lib/motion/visual-coach/registry";

describe("motion visual coach registry", () => {
  it("registers full 五步拳 routine", () => {
    const spec = getRoutineVisualCoach("wu-bu-quan");
    expect(spec).not.toBeNull();
    expect(spec?.moves.length).toBe(9);
    expect(spec?.moves.map((m) => m.moveId)).toEqual([
      "wbq-01",
      "wbq-02",
      "wbq-03",
      "wbq-04",
      "wbq-05",
      "wbq-06",
      "wbq-07",
      "wbq-08",
      "wbq-09",
    ]);

    const start = sampleRoutineVisualCoach(spec!, 0);
    expect(start.moveId).toBe("wbq-01");
    expect(start.pose.skeleton.nose.up).toBeGreaterThan(0.5);
    expect(start.figurine.schema).toBe("coach-figurine-pose/v1");

    const end = sampleRoutineVisualCoach(spec!, 1);
    expect(end.moveId).toBe("wbq-09");
    expect(end.figurine).toBeDefined();

    const total = totalRoutineDurationMs(spec!.moves, WU_BU_TRANSITION_MS);
    expect(total).toBeGreaterThan(30_000);
  });
});
