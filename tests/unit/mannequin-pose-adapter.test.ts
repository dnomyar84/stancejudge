import { describe, expect, it } from "vitest";
import { sampleMoveChoreography } from "@/lib/pose/canonical3d/choreography";
import { wbq01OpeningChoreography } from "@/lib/pose/choreography/wbq-01-opening";
import { applyCoachPoseToMannequin } from "@/lib/pose/mannequin-adapter/coach-pose-to-mannequin";

function mockMannequin() {
  const joint = () => ({ raise: 0, straddle: 0, turn: 0, bend: 0, tilt: 0 });
  return {
    position: { x: 0, y: 0, z: 0 },
    rotation: {},
    body: { y: 0, turn: 0 },
    torso: { bend: 0 },
    head: { nod: 0, turn: 0 },
    l_leg: joint(),
    l_knee: joint(),
    l_ankle: joint(),
    r_leg: joint(),
    r_knee: joint(),
    r_ankle: joint(),
    l_arm: joint(),
    l_elbow: joint(),
    l_wrist: joint(),
    r_arm: joint(),
    r_elbow: joint(),
    r_wrist: joint(),
    l_fingers: { bend: 0 },
    r_fingers: { bend: 0 },
    stepOnGround() {},
    updateMatrixWorld() {},
  };
}

describe("applyCoachPoseToMannequin (五步拳起势)", () => {
  it("maps wide 并步 start to downward legs and arms at sides (not crossed)", () => {
    const pose = sampleMoveChoreography(wbq01OpeningChoreography, 0).pose;
    const man = mockMannequin();
    applyCoachPoseToMannequin(man, pose, 0);

    expect(man.l_leg.raise).toBeLessThan(25);
    expect(man.r_leg.raise).toBeLessThan(25);
    expect(Math.abs(man.l_leg.straddle)).toBeLessThan(40);
    expect(Math.abs(man.r_leg.straddle)).toBeLessThan(40);
    expect(Math.abs(man.l_leg.straddle)).toBeGreaterThan(4);
    expect(Math.abs(man.r_leg.straddle)).toBeGreaterThan(4);

    expect(man.l_arm.raise).toBeLessThan(30);
    expect(man.r_arm.raise).toBeLessThan(30);
    expect(Math.abs(man.l_arm.straddle)).toBeLessThan(45);
    expect(Math.abs(man.r_arm.straddle)).toBeLessThan(45);
  });
});
