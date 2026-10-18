import { KP } from "./keypoints";
import type { PoseKeypoint } from "./types";
import {
  applyKeypointOverrides,
  buildStanceTemplateKeypoints,
  fillKeypoint,
  type GongBuLead,
} from "./stance-template";
import type { HandProfileType } from "@/lib/wushu/types";

const CX = 64;

function gongBuLeadForMove(moveId: string): GongBuLead {
  if (moveId === "sdcq-15" || moveId === "sdcq-17") return "left";
  return "right";
}

function sdcqGongBu(
  moveId: string,
  hand: HandProfileType,
  overrides?: Partial<Record<number, { x: number; y: number }>>,
) {
  const base = buildStanceTemplateKeypoints("gong_bu", hand, {
    gongBuLead: gongBuLeadForMove(moveId),
  });
  return overrides ? applyKeypointOverrides(base, overrides) : base;
}

/** 歇步冲拳 — low seated cross stance (buttocks near floor), not 虚步. */
function buildXieBuThrustPose(): PoseKeypoint[] {
  const kps: PoseKeypoint[] = [];
  fillKeypoint(kps, KP.nose, { x: CX, y: 20 });
  fillKeypoint(kps, KP.left_shoulder, { x: CX - 15, y: 34 });
  fillKeypoint(kps, KP.right_shoulder, { x: CX + 15, y: 34 });
  fillKeypoint(kps, KP.left_hip, { x: CX - 10, y: 66 });
  fillKeypoint(kps, KP.right_hip, { x: CX + 8, y: 68 });
  fillKeypoint(kps, KP.left_knee, { x: CX - 22, y: 82 });
  fillKeypoint(kps, KP.right_knee, { x: CX + 4, y: 84 });
  fillKeypoint(kps, KP.left_ankle, { x: CX - 26, y: 104 });
  fillKeypoint(kps, KP.right_ankle, { x: CX + 2, y: 106 });
  fillKeypoint(kps, KP.left_elbow, { x: CX - 12, y: 48 });
  fillKeypoint(kps, KP.right_elbow, { x: CX + 24, y: 46 });
  fillKeypoint(kps, KP.left_wrist, { x: CX - 14, y: 60 });
  fillKeypoint(kps, KP.right_wrist, { x: CX + 44, y: 48 });
  return kps;
}

/** Per-move coach silhouettes for 三段长拳 (duanwei syllabus). */
const SAN_DUAN_POSE_BUILDERS: Record<string, () => PoseKeypoint[]> = {
  "sdcq-01": () =>
    buildStanceTemplateKeypoints("feet_together", "salute"),

  "sdcq-02": () =>
    applyKeypointOverrides(sdcqGongBu("sdcq-02", "block_elbow"), {
        [KP.left_wrist]: { x: CX - 4, y: 40 },
        [KP.left_elbow]: { x: CX - 18, y: 38 },
        [KP.right_wrist]: { x: CX + 20, y: 52 },
        [KP.right_elbow]: { x: CX + 10, y: 42 },
      },
    ),

  "sdcq-03": () =>
    applyKeypointOverrides(
      buildStanceTemplateKeypoints("xu_bu", "fist_waist"),
      {
        [KP.right_knee]: { x: CX + 20, y: 58 },
        [KP.right_ankle]: { x: CX + 28, y: 72 },
        [KP.left_ankle]: { x: CX - 20, y: 96 },
        [KP.left_knee]: { x: CX - 18, y: 80 },
      },
    ),

  "sdcq-04": () =>
    applyKeypointOverrides(sdcqGongBu("sdcq-04", "wrist_wrap"), {
        [KP.left_wrist]: { x: CX - 2, y: 46 },
        [KP.right_wrist]: { x: CX + 6, y: 44 },
        [KP.left_elbow]: { x: CX - 12, y: 40 },
        [KP.right_elbow]: { x: CX + 14, y: 38 },
      },
    ),

  "sdcq-05": () =>
    buildStanceTemplateKeypoints("ma_bu", "punch_forward"),

  "sdcq-06": () =>
    applyKeypointOverrides(sdcqGongBu("sdcq-06", "push_palm"), {
        [KP.left_wrist]: { x: 10, y: 52 },
        [KP.left_elbow]: { x: CX - 8, y: 44 },
        [KP.right_wrist]: { x: CX + 42, y: 48 },
      },
    ),

  "sdcq-07": () =>
    applyKeypointOverrides(sdcqGongBu("sdcq-07", "lift_fist"), {
        [KP.right_wrist]: { x: CX + 28, y: 24 },
        [KP.right_elbow]: { x: CX + 22, y: 36 },
      },
    ),

  "sdcq-08": () =>
    applyKeypointOverrides(
      buildStanceTemplateKeypoints("xu_bu", "punch_forward"),
      {
        [KP.left_knee]: { x: CX - 8, y: 56 },
        [KP.left_ankle]: { x: CX - 6, y: 70 },
        [KP.right_wrist]: { x: CX + 36, y: 46 },
      },
    ),

  "sdcq-09": () =>
    applyKeypointOverrides(
      buildStanceTemplateKeypoints("walking", "arms_spread"),
      {
        [KP.right_knee]: { x: CX + 24, y: 52 },
        [KP.right_ankle]: { x: CX + 32, y: 64 },
        [KP.left_ankle]: { x: CX - 16, y: 92 },
      },
    ),

  "sdcq-10": () =>
    applyKeypointOverrides(
      buildStanceTemplateKeypoints("xu_bu", "guard_chest"),
      {
        [KP.left_wrist]: { x: CX + 8, y: 44 },
        [KP.left_elbow]: { x: CX + 2, y: 38 },
      },
    ),

  "sdcq-11": () => buildXieBuThrustPose(),

  "sdcq-12": () => SAN_DUAN_POSE_BUILDERS["sdcq-02"](),

  "sdcq-13": () =>
    applyKeypointOverrides(
      buildStanceTemplateKeypoints("ma_bu", "chop_palm"),
      {
        [KP.right_wrist]: { x: CX + 24, y: 68 },
        [KP.right_elbow]: { x: CX + 20, y: 52 },
        [KP.left_wrist]: { x: CX - 16, y: 58 },
      },
    ),

  "sdcq-14": () => sdcqGongBu("sdcq-14", "punch_forward"),

  "sdcq-15": () =>
    applyKeypointOverrides(sdcqGongBu("sdcq-15", "push_palm"), {
        [KP.left_wrist]: { x: CX + 34, y: 46 },
        [KP.left_elbow]: { x: CX + 20, y: 40 },
      },
    ),

  "sdcq-16": () =>
    applyKeypointOverrides(sdcqGongBu("sdcq-16", "double_push_palm"), {
        [KP.left_wrist]: { x: CX + 34, y: 48 },
        [KP.right_wrist]: { x: CX + 38, y: 52 },
        [KP.left_elbow]: { x: CX + 18, y: 40 },
        [KP.right_elbow]: { x: CX + 22, y: 42 },
      },
    ),

  "sdcq-17": () =>
    applyKeypointOverrides(sdcqGongBu("sdcq-17", "push_palm"), {
        [KP.left_wrist]: { x: CX + 36, y: 50 },
      },
    ),

  "sdcq-18": () =>
    applyKeypointOverrides(sdcqGongBu("sdcq-18", "chop_palm"), {
        [KP.right_wrist]: { x: CX + 20, y: 32 },
        [KP.right_elbow]: { x: CX + 18, y: 44 },
      },
    ),

  "sdcq-19": () =>
    applyKeypointOverrides(
      buildStanceTemplateKeypoints("walking", "arms_spread"),
      {
        [KP.right_ankle]: { x: CX + 36, y: 58 },
        [KP.right_knee]: { x: CX + 28, y: 48 },
        [KP.left_ankle]: { x: CX - 14, y: 94 },
      },
    ),

  "sdcq-20": () => sdcqGongBu("sdcq-20", "punch_forward"),

  "sdcq-21": () =>
    buildStanceTemplateKeypoints("ma_bu", "fist_waist"),

  "sdcq-22": () =>
    buildStanceTemplateKeypoints("feet_together", "salute"),
};

export function buildSanDuanMoveKeypoints(moveId: string): PoseKeypoint[] | null {
  const fn = SAN_DUAN_POSE_BUILDERS[moveId];
  return fn ? fn() : null;
}
