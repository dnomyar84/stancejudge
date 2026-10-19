import TWEEN from "@tweenjs/tween.js";
import type { MixamoAvatar } from "@/lib/motion/retarget/hanim/apply-coach-to-mixamo";
import { applyCoachBonePose, captureCoachBonePose } from "./capture-apply";
import { lerpCoachBonePose } from "./lerp-bone-pose";
import type { CoachBonePoseV1 } from "./schema";

export type BonePoseTweenHandle = {
  stop: () => void;
};

/**
 * Animate native bones toward `target` over `durationMs` (Tween.js).
 * Call `updateBoneTweens()` from the Three.js render loop.
 */
export function tweenCoachBonePose(
  avatar: MixamoAvatar,
  target: CoachBonePoseV1,
  durationMs: number,
): BonePoseTweenHandle {
  const from = captureCoachBonePose(avatar);
  const state = { t: 0 };
  const tween = new TWEEN.Tween(state)
    .to({ t: 1 }, durationMs)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      applyCoachBonePose(avatar, lerpCoachBonePose(from, target, state.t));
    })
    .start();

  return {
    stop: () => {
      tween.stop();
    },
  };
}

export function updateBoneTweens(time?: number): void {
  TWEEN.update(time);
}
