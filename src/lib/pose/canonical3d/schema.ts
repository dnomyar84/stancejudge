import type { Vec3 } from "../coach-figure/vec3";
import type { FootAimKind, HandShapeKind, LegStanceKind } from "./vocabulary";

/** Floor-aligned rig joint set (coach lineage). */
export type PoseCanonical3D = {
  routineId: string;
  moveId: string;
  /** Body yaw in radians (0 = facing +Z). */
  bodyYaw: number;
  joints: Record<
    | "nose"
    | "neck"
    | "leftShoulder"
    | "rightShoulder"
    | "leftElbow"
    | "rightElbow"
    | "leftWrist"
    | "rightWrist"
    | "leftHip"
    | "rightHip"
    | "leftKnee"
    | "rightKnee"
    | "leftAnkle"
    | "rightAnkle",
    Vec3
  >;
  leg: LegStanceKind;
  leftFoot: FootAimKind;
  rightFoot: FootAimKind;
  leftHand: HandShapeKind;
  rightHand: HandShapeKind;
  coachNotes?: string;
};

export type FlowKeyframe = {
  id: string;
  label: string;
  labelZh?: string;
  /** 0…1 position in normalized flow time. */
  t: number;
  pose: PoseCanonical3D;
};

export type MoveFlowSpec = {
  moveId: string;
  keyframes: FlowKeyframe[];
  /** Minimum hold on terminal keyframe for 定形 (ms). */
  pauseMinMs: number;
  /** Relative duration weights between consecutive keyframes (length = keyframes.length - 1). */
  segmentWeights: number[];
};
