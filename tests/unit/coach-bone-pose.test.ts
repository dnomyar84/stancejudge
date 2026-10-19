import { describe, expect, it } from "vitest";
import { lerpCoachBonePose } from "@/lib/pose/bone-rig/lerp-bone-pose";
import type { CoachBonePoseV1 } from "@/lib/pose/bone-rig/schema";
import {
  COACH_BONE_DRIVER_MIXAMO_XBOT,
  COACH_BONE_POSE_SCHEMA,
} from "@/lib/pose/bone-rig/schema";

function samplePose(knee: number): CoachBonePoseV1 {
  return {
    schema: COACH_BONE_POSE_SCHEMA,
    driver: COACH_BONE_DRIVER_MIXAMO_XBOT,
    root: { x: 0, y: 0, z: 0 },
    rotations: {
      mixamorigLeftLeg: { x: 0, y: 0, z: knee, order: "XYZ" },
    },
  };
}

describe("CoachBonePoseV1", () => {
  it("lerpCoachBonePose hits endpoints", () => {
    const a = samplePose(10);
    const b = samplePose(50);
    expect(lerpCoachBonePose(a, b, 0).rotations.mixamorigLeftLeg.z).toBe(10);
    expect(lerpCoachBonePose(a, b, 1).rotations.mixamorigLeftLeg.z).toBe(50);
    expect(lerpCoachBonePose(a, b, 0.5).rotations.mixamorigLeftLeg.z).toBe(30);
  });
});
