import { describe, expect, it } from "vitest";
import { applyCoachFigurinePoseToMannequin } from "@/lib/pose/display-figurine/apply-coach-figurine-pose";
import { lerpCoachFigurinePose } from "@/lib/pose/display-figurine/lerp-coach-figurine-pose";
import { rigKeyframe } from "@/lib/pose/display-figurine/keyframe";
import { sampleMoveChoreography } from "@/lib/pose/canonical3d/choreography";
import { wbq01OpeningChoreography } from "@/lib/pose/choreography/wbq-01-opening";
import {
  applyCoachPoseToMannequin,
  extendedToCoachFigurinePose,
} from "@/lib/pose/mannequin-adapter/coach-pose-to-mannequin";

function mockMannequin() {
  const joint = () => ({ raise: 0, straddle: 0, turn: 0, bend: 0, tilt: 0 });
  return {
    position: { x: 0, y: 0, z: 0 },
    body: { y: 0, turn: 0, tilt: 0, bend: 0 },
    torso: { bend: 0, tilt: 0, turn: 0 },
    head: { nod: 0, turn: 0, tilt: 0 },
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

describe("CoachFigurinePoseV1", () => {
  it("compile + direct apply matches legacy applyCoachPoseToMannequin", () => {
    const pose = sampleMoveChoreography(wbq01OpeningChoreography, 0).pose;
    const compiled = extendedToCoachFigurinePose(pose);

    const a = mockMannequin();
    const b = mockMannequin();
    applyCoachFigurinePoseToMannequin(a, compiled, { smoothRootY: false });
    applyCoachPoseToMannequin(b, pose, 0);

    expect(a.l_leg.raise).toBe(b.l_leg.raise);
    expect(a.l_leg.straddle).toBe(b.l_leg.straddle);
    expect(a.l_knee.bend).toBe(b.l_knee.bend);
    expect(a.body.turn).toBe(-90);
    expect(b.body.turn).toBe(-90);
  });

  it("rigKeyframe freezes figurine on the keyframe", () => {
    const pose = sampleMoveChoreography(wbq01OpeningChoreography, 0).pose;
    const kf = rigKeyframe({
      id: "t",
      t: 0,
      labelZh: "test",
      pose,
    });
    expect(kf.figurine?.schema).toBe("coach-figurine-pose/v1");
    expect(kf.figurine?.leftLeg).toEqual(
      extendedToCoachFigurinePose(pose).leftLeg,
    );
  });

  it("lerpCoachFigurinePose is deterministic at endpoints", () => {
    const a = extendedToCoachFigurinePose(
      sampleMoveChoreography(wbq01OpeningChoreography, 0).pose,
    );
    const b = extendedToCoachFigurinePose(
      sampleMoveChoreography(wbq01OpeningChoreography, 1).pose,
    );
    expect(lerpCoachFigurinePose(a, b, 0).leftKnee.bend).toBe(a.leftKnee.bend);
    expect(lerpCoachFigurinePose(a, b, 1).leftKnee.bend).toBe(b.leftKnee.bend);
  });

  it("sampleMoveChoreography always returns figurine", () => {
    const frame = sampleMoveChoreography(wbq01OpeningChoreography, 0.5);
    expect(frame.figurine.schema).toBe("coach-figurine-pose/v1");
  });
});
