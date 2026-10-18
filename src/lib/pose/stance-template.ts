import { KP } from "./keypoints";
import type { PoseKeypoint } from "./types";
import type { HandProfileType, LegStanceType } from "@/lib/wushu/types";

const S = 128;
const CX = S / 2;

type Pt = { x: number; y: number };

export function fillKeypoint(
  out: PoseKeypoint[],
  index: number,
  p: Pt,
): void {
  out[index] = { x: p.x, y: p.y, score: 1 };
}

const fill = fillKeypoint;

export function applyKeypointOverrides(
  kps: PoseKeypoint[],
  overrides: Partial<Record<number, Pt>>,
): PoseKeypoint[] {
  const out = [...kps];
  for (const [idx, p] of Object.entries(overrides)) {
    if (p) fillKeypoint(out, Number(idx), p);
  }
  return out;
}

/** Normalized stick figure for rail thumbnails (front-facing coach view). */
export function buildStanceTemplateKeypoints(
  leg: LegStanceType,
  hand: HandProfileType,
): PoseKeypoint[] {
  const kps: PoseKeypoint[] = [];

  const nose: Pt = { x: CX, y: 14 };
  const ls: Pt = { x: CX - 16, y: 30 };
  const rs: Pt = { x: CX + 16, y: 30 };
  let lh: Pt = { x: CX - 14, y: 54 };
  let rh: Pt = { x: CX + 14, y: 54 };
  let lk: Pt = { x: CX - 12, y: 72 };
  let rk: Pt = { x: CX + 12, y: 72 };
  let la: Pt = { x: CX - 14, y: 96 };
  let ra: Pt = { x: CX + 14, y: 96 };

  switch (leg) {
    case "feet_together":
      la = { x: CX - 6, y: 96 };
      ra = { x: CX + 6, y: 96 };
      break;
    case "gong_bu":
      la = { x: CX - 18, y: 96 };
      ra = { x: CX + 26, y: 96 };
      rk = { x: CX + 22, y: 74 };
      lk = { x: CX - 16, y: 76 };
      break;
    case "ma_bu":
      la = { x: CX - 28, y: 94 };
      ra = { x: CX + 28, y: 94 };
      lk = { x: CX - 26, y: 76 };
      rk = { x: CX + 26, y: 76 };
      lh = { x: CX - 18, y: 54 };
      rh = { x: CX + 18, y: 54 };
      break;
    case "xu_bu":
      la = { x: CX + 8, y: 94 };
      ra = { x: CX - 22, y: 96 };
      lk = { x: CX + 6, y: 78 };
      rk = { x: CX - 18, y: 80 };
      break;
    case "xie_bu":
      la = { x: CX - 26, y: 104 };
      ra = { x: CX + 2, y: 106 };
      lk = { x: CX - 22, y: 82 };
      rk = { x: CX + 4, y: 84 };
      lh = { x: CX - 10, y: 66 };
      rh = { x: CX + 8, y: 68 };
      break;
    case "ti_xi":
      la = { x: CX - 18, y: 96 };
      ra = { x: CX + 10, y: 94 };
      lk = { x: CX - 6, y: 56 };
      rk = { x: CX + 8, y: 80 };
      break;
    case "walking":
      la = { x: CX - 10, y: 88 };
      ra = { x: CX + 18, y: 96 };
      rk = { x: CX + 14, y: 70 };
      break;
    default:
      break;
  }

  let le: Pt = { x: ls.x - 8, y: 44 };
  let re: Pt = { x: rs.x + 8, y: 44 };
  let lw: Pt = { x: ls.x - 10, y: 58 };
  let rw: Pt = { x: rs.x + 10, y: 58 };

  switch (hand) {
    case "salute":
      lw = { x: CX - 8, y: 28 };
      rw = { x: CX + 8, y: 28 };
      le = { x: CX - 14, y: 34 };
      re = { x: CX + 14, y: 34 };
      break;
    case "guard_chest":
    case "jian_guard":
      lw = { x: CX - 22, y: 48 };
      rw = { x: CX + 22, y: 48 };
      le = { x: CX - 12, y: 38 };
      re = { x: CX + 12, y: 38 };
      break;
    case "punch_forward":
    case "push_palm":
    case "chop_palm":
    case "lift_fist":
    case "jian_point":
      rw = { x: CX + 38, y: 50 };
      re = { x: CX + 24, y: 40 };
      lw = { x: CX - 18, y: 54 };
      le = { x: CX - 10, y: 42 };
      break;
    case "double_push_palm":
      lw = { x: CX + 34, y: 48 };
      rw = { x: CX + 38, y: 52 };
      le = { x: CX + 18, y: 40 };
      re = { x: CX + 22, y: 42 };
      break;
    case "block_elbow":
    case "wrist_wrap":
      lw = { x: CX - 4, y: 40 };
      rw = { x: CX + 20, y: 52 };
      le = { x: CX - 18, y: 38 };
      re = { x: CX + 10, y: 42 };
      break;
    case "fist_waist":
      lw = { x: lh.x - 4, y: lh.y + 4 };
      rw = { x: rh.x + 4, y: rh.y + 4 };
      le = { x: ls.x - 4, y: 48 };
      re = { x: rs.x + 4, y: 48 };
      break;
    case "arms_spread":
      lw = { x: 8, y: 46 };
      rw = { x: S - 8, y: 46 };
      le = { x: ls.x - 14, y: 36 };
      re = { x: rs.x + 14, y: 36 };
      break;
    default:
      break;
  }

  fill(kps, KP.nose, nose);
  fill(kps, KP.left_shoulder, ls);
  fill(kps, KP.right_shoulder, rs);
  fill(kps, KP.left_elbow, le);
  fill(kps, KP.right_elbow, re);
  fill(kps, KP.left_wrist, lw);
  fill(kps, KP.right_wrist, rw);
  fill(kps, KP.left_hip, lh);
  fill(kps, KP.right_hip, rh);
  fill(kps, KP.left_knee, lk);
  fill(kps, KP.right_knee, rk);
  fill(kps, KP.left_ankle, la);
  fill(kps, KP.right_ankle, ra);

  return kps;
}
