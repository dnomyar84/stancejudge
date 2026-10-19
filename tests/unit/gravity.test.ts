import { describe, expect, it } from "vitest";
import {
  COACH_FLOOR_CONTACT_UP,
  settlePoseOnFloor,
} from "@/lib/pose/coach-figure/gravity";
import { extendedFromSkeleton } from "@/lib/pose/coach-figure/extended-pose";
import { skeletonTiXiChuanZhangDing } from "@/lib/pose/choreography/wbq-standard";
import { sampleMoveChoreography } from "@/lib/pose/canonical3d/choreography";
import { wbq01OpeningChoreography } from "@/lib/pose/choreography/wbq-01-opening";

describe("settlePoseOnFloor", () => {
  it("plants lowest foot on floor for 起势 start", () => {
    const raw = sampleMoveChoreography(wbq01OpeningChoreography, 0).pose;
    const lifted = {
      ...raw,
      skeleton: {
        ...raw.skeleton,
        leftAnkle: { ...raw.skeleton.leftAnkle, up: raw.skeleton.leftAnkle.up + 0.08 },
        rightAnkle: { ...raw.skeleton.rightAnkle, up: raw.skeleton.rightAnkle.up + 0.08 },
      },
    };
    const settled = settlePoseOnFloor(lifted);
    const low = Math.min(
      settled.skeleton.leftAnkle.up,
      settled.skeleton.rightAnkle.up,
    );
    expect(low).toBeCloseTo(COACH_FLOOR_CONTACT_UP, 3);
  });

  it("keeps 提膝 foot raised while support foot stays on floor", () => {
    const sk = skeletonTiXiChuanZhangDing();
    const pose = extendedFromSkeleton(sk);
    const settled = settlePoseOnFloor(pose);
    const support = Math.min(
      settled.skeleton.leftAnkle.up,
      settled.skeleton.rightAnkle.up,
    );
    const raised = Math.max(
      settled.skeleton.leftAnkle.up,
      settled.skeleton.rightAnkle.up,
    );
    expect(support).toBeCloseTo(COACH_FLOOR_CONTACT_UP, 3);
    expect(raised - support).toBeGreaterThan(0.12);
  });
});
