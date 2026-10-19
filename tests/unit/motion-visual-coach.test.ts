import { describe, expect, it } from "vitest";
import { sampleRoutineVisualCoach } from "@/lib/pose/canonical3d/choreography";
import { getRoutineVisualCoach } from "@/lib/motion/visual-coach/registry";

describe("motion visual coach registry", () => {
  it("registers 五步拳 on module load", () => {
    const spec = getRoutineVisualCoach("wu-bu-quan");
    expect(spec).not.toBeNull();
    expect(spec?.moves.length).toBe(9);
    const frame = sampleRoutineVisualCoach(spec!, 0);
    expect(frame.pose.skeleton.nose.up).toBeGreaterThan(0.5);
  });
});
