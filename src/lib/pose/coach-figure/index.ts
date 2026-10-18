import { KP } from "../keypoints";
import type { PoseKeypoint } from "../types";
import {
  alignFigureToFloor,
  defaultCoachCamera,
  projectCoachPoint,
} from "./camera";
import { buildSanDuanCoachSkeleton } from "./poses-san-duan";
import type { CoachSkeleton } from "./skeleton";

const CANVAS = 128;

function skeletonToKeypoints(
  sk: CoachSkeleton,
  canvasSize = CANVAS,
): PoseKeypoint[] {
  const camera = defaultCoachCamera();
  const raw = [
    { idx: KP.nose, p: sk.nose },
    { idx: KP.left_shoulder, p: sk.leftShoulder },
    { idx: KP.right_shoulder, p: sk.rightShoulder },
    { idx: KP.left_elbow, p: sk.leftElbow },
    { idx: KP.right_elbow, p: sk.rightElbow },
    { idx: KP.left_wrist, p: sk.leftWrist },
    { idx: KP.right_wrist, p: sk.rightWrist },
    { idx: KP.left_hip, p: sk.leftHip },
    { idx: KP.right_hip, p: sk.rightHip },
    { idx: KP.left_knee, p: sk.leftKnee },
    { idx: KP.right_knee, p: sk.rightKnee },
    { idx: KP.left_ankle, p: sk.leftAnkle },
    { idx: KP.right_ankle, p: sk.rightAnkle },
  ].map(({ idx, p }) => ({
    idx,
    ...projectCoachPoint(p, camera, canvasSize),
  }));

  const aligned = alignFigureToFloor(
    raw.map((r) => ({ x: r.x, y: r.y })),
    canvasSize,
  );

  const kps: PoseKeypoint[] = [];
  for (let i = 0; i < raw.length; i++) {
    kps[raw[i].idx] = {
      x: aligned[i].x,
      y: aligned[i].y,
      score: 1,
    };
  }
  return kps;
}

/** 3D-proportioned coach figure for 三段长拳 rail / scoring templates. */
export function buildCoachFigureKeypoints(
  routineId: string,
  moveId: string,
): PoseKeypoint[] | null {
  if (routineId !== "san-duan-chang-quan") return null;
  const sk = buildSanDuanCoachSkeleton(moveId);
  if (!sk) return null;
  return skeletonToKeypoints(sk);
}

export function coachFigureFloorY(canvasSize = CANVAS): number {
  return canvasSize * 0.94;
}
