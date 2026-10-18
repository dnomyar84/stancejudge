import { gongBuLeadForSanDuanMove } from "@/lib/wushu/gong-bu-lead";
import { v } from "./vec3";
import type { CoachSkeleton } from "./skeleton";
import { ANATOMY } from "./anatomy";
import {
  armsBlockElbow,
  armsChopPalm,
  armsFistWaist,
  armsLiftFist,
  armsPunchForward,
  armsPushPalm,
  armsSalute,
  armsSpread,
  armsWristWrap,
  baseStandingTorso,
  legsFeetTogether,
  legsGongBu,
  legsMaBu,
  legsTiXi,
  hipY,
  legsXieBu,
  legsXuBu,
  mergeSkeleton,
} from "./skeleton";

function gongBuArms(
  moveId: string,
  style:
    | "block"
    | "punch"
    | "push"
    | "pushL"
    | "double"
    | "lift"
    | "chop"
    | "wrap",
): Partial<CoachSkeleton> {
  switch (style) {
    case "block":
      return armsBlockElbow();
    case "punch":
      return armsPunchForward("right");
    case "push":
      return armsPushPalm("right");
    case "pushL":
      return armsPushPalm("left");
    case "double":
      return armsPunchForward("both");
    case "lift":
      return armsLiftFist();
    case "chop":
      return armsChopPalm();
    case "wrap":
      return armsWristWrap();
  }
}

function pose(
  legs: Partial<CoachSkeleton>,
  arms: Partial<CoachSkeleton>,
): CoachSkeleton {
  return mergeSkeleton([baseStandingTorso(), legs, arms]);
}

const BUILDERS: Record<string, () => CoachSkeleton> = {
  "sdcq-01": () => pose(legsFeetTogether(), armsSalute()),
  "sdcq-02": () =>
    pose(
      legsGongBu(gongBuLeadForSanDuanMove("sdcq-02")),
      gongBuArms("sdcq-02", "block"),
    ),
  "sdcq-03": () =>
    pose(legsXuBu(), {
      ...armsFistWaist(),
      rightKnee: v(0.12, 0.2, 0.42),
      rightAnkle: v(0.14, 0.28, 0.02),
    }),
  "sdcq-04": () =>
    pose(legsGongBu("right"), gongBuArms("sdcq-04", "wrap")),
  "sdcq-05": () => pose(legsMaBu(), armsPunchForward("right")),
  "sdcq-06": () =>
    pose(legsGongBu("right"), {
      ...armsPushPalm("right"),
      leftWrist: v(-0.38, 0.08, 0.62),
      leftElbow: v(-0.22, 0.1, 0.68),
    }),
  "sdcq-07": () => pose(legsGongBu("right"), gongBuArms("sdcq-07", "lift")),
  "sdcq-08": () =>
    pose(legsTiXi(), armsPushPalm("right")),
  "sdcq-09": () =>
    pose(
      {
        ...legsXuBu(),
        rightKnee: v(0.16, 0.18, 0.48),
        rightAnkle: v(0.18, 0.22, 0.62),
      },
      armsSpread(),
    ),
  "sdcq-10": () =>
    pose(legsXuBu(), {
      ...armsBlockElbow(),
      leftWrist: v(0.06, 0.24, 0.72),
      leftElbow: v(0.02, 0.18, 0.76),
    }),
  "sdcq-11": () => {
    const hy = hipY() - 0.22;
    return pose(
      {
        ...legsXieBu(),
        leftHip: v(-ANATOMY.hipHalfWidth, 0, hy),
        rightHip: v(ANATOMY.hipHalfWidth, 0, hy),
        leftShoulder: v(-ANATOMY.shoulderHalfWidth, 0.02, ANATOMY.shoulderUp - 0.1),
        rightShoulder: v(ANATOMY.shoulderHalfWidth, 0.02, ANATOMY.shoulderUp - 0.1),
        nose: v(0, 0.06, ANATOMY.chin - 0.12),
      },
      armsPunchForward("right"),
    );
  },
  "sdcq-12": () =>
    pose(
      legsGongBu(gongBuLeadForSanDuanMove("sdcq-12")),
      gongBuArms("sdcq-12", "block"),
    ),
  "sdcq-13": () => pose(legsMaBu(), armsChopPalm()),
  "sdcq-14": () =>
    pose(legsGongBu("right"), armsPunchForward("right")),
  "sdcq-15": () =>
    pose(
      legsGongBu("left"),
      armsPushPalm("left"),
    ),
  "sdcq-16": () =>
    pose(legsGongBu("right"), gongBuArms("sdcq-16", "double")),
  "sdcq-17": () =>
    pose(legsGongBu("left"), armsPushPalm("left")),
  "sdcq-18": () =>
    pose(legsGongBu("right"), gongBuArms("sdcq-18", "chop")),
  "sdcq-19": () =>
    pose(
      {
        leftAnkle: v(-0.1, 0, 0),
        rightAnkle: v(0.12, 0.22, 0.55),
        leftKnee: v(-0.1, 0, 0.26),
        rightKnee: v(0.1, 0.18, 0.45),
      },
      armsSpread(),
    ),
  "sdcq-20": () =>
    pose(legsGongBu("right"), armsPunchForward("right")),
  "sdcq-21": () => pose(legsMaBu(), armsFistWaist()),
  "sdcq-22": () => pose(legsFeetTogether(), armsSalute()),
};

export function buildSanDuanCoachSkeleton(moveId: string): CoachSkeleton | null {
  const fn = BUILDERS[moveId];
  return fn ? fn() : null;
}
