"use client";

import type { ExtendedCoachPose } from "@/lib/pose/coach-figure/extended-pose";
import type { CoachBonePoseV1 } from "@/lib/pose/bone-rig/schema";
import type { CoachFigurinePoseV1 } from "@/lib/pose/display-figurine/coach-figurine-pose";
import { Pose3DBoneViewer } from "@/components/pose-3d-viewer-bone";
import { Pose3DMannequinViewer } from "@/components/pose-3d-viewer-mannequin";

export type Pose3DViewerProps = {
  pose: ExtendedCoachPose | null;
  /** Native Three.js bone snapshot (default renderer). */
  bone?: CoachBonePoseV1 | null;
  /** Legacy mannequin-js display (when `NEXT_PUBLIC_COACH_RENDERER=mannequin`). */
  figurine?: CoachFigurinePoseV1 | null;
  className?: string;
  horizontalOrbit?: boolean;
  /** When false, bone viewer applies poses instantly (use during timeline play). */
  smoothMotion?: boolean;
};

const useMannequinRenderer =
  process.env.NEXT_PUBLIC_COACH_RENDERER === "mannequin";

/**
 * Default: Mixamo skinned mesh + native bones + Tween.js (`pose-3d-viewer-bone`).
 * Set `NEXT_PUBLIC_COACH_RENDERER=mannequin` to use mannequin-js.
 */
export function Pose3DViewer(props: Pose3DViewerProps) {
  if (useMannequinRenderer) {
    return <Pose3DMannequinViewer {...props} />;
  }
  return (
    <Pose3DBoneViewer
      pose={props.pose}
      bone={props.bone}
      className={props.className}
      horizontalOrbit={props.horizontalOrbit}
      tweenMs={props.smoothMotion === false ? 0 : 90}
    />
  );
}
