import type { CoachSkeleton } from "./skeleton";
import { lerp3, type Vec3 } from "./vec3";

export type Vec3Display = { x: number; y: number; z: number };

export type BoneSegment = {
  from: Vec3Display;
  to: Vec3Display;
  radius: number;
};

export type CoachMeshSpec = {
  bones: BoneSegment[];
  headCenter: Vec3Display;
  headRadius: number;
  neckFrom: Vec3Display;
  neckTo: Vec3Display;
  neckRadius: number;
  torsoCorners: [Vec3Display, Vec3Display, Vec3Display, Vec3Display];
};

/** lat → X, up → Y, fwd → Z (Three.js Y-up). */
function toDisplay(p: Vec3): Vec3Display {
  return { x: p.lat, y: p.up, z: p.fwd };
}

function mid(a: Vec3, b: Vec3): Vec3 {
  return lerp3(a, b, 0.5);
}

/** Proportional tubes + torso box + head sphere for 3D lab rendering. */
export function coachMeshFromSkeleton(sk: CoachSkeleton): CoachMeshSpec {
  const shoulderMid = mid(sk.leftShoulder, sk.rightShoulder);
  const hipMid = mid(sk.leftHip, sk.rightHip);
  const neckBase = shoulderMid;
  const headCenter = {
    lat: sk.nose.lat,
    fwd: sk.nose.fwd + 0.02,
    up: sk.nose.up + 0.055,
  };

  const limbR = 0.038;
  const bones: BoneSegment[] = [
    { from: toDisplay(sk.leftShoulder), to: toDisplay(sk.leftElbow), radius: limbR },
    { from: toDisplay(sk.leftElbow), to: toDisplay(sk.leftWrist), radius: limbR * 0.9 },
    { from: toDisplay(sk.rightShoulder), to: toDisplay(sk.rightElbow), radius: limbR },
    { from: toDisplay(sk.rightElbow), to: toDisplay(sk.rightWrist), radius: limbR * 0.9 },
    { from: toDisplay(sk.leftHip), to: toDisplay(sk.leftKnee), radius: limbR * 1.05 },
    { from: toDisplay(sk.leftKnee), to: toDisplay(sk.leftAnkle), radius: limbR * 0.95 },
    { from: toDisplay(sk.rightHip), to: toDisplay(sk.rightKnee), radius: limbR * 1.05 },
    { from: toDisplay(sk.rightKnee), to: toDisplay(sk.rightAnkle), radius: limbR * 0.95 },
  ];

  const torsoW = 0.22;
  const torsoD = 0.12;
  const topZ = shoulderMid.up - 0.02;
  const botZ = hipMid.up + 0.02;
  const torsoCorners = [
    toDisplay({ lat: -torsoW / 2, fwd: -torsoD / 2, up: topZ }),
    toDisplay({ lat: torsoW / 2, fwd: -torsoD / 2, up: topZ }),
    toDisplay({ lat: torsoW / 2, fwd: torsoD / 2, up: botZ }),
    toDisplay({ lat: -torsoW / 2, fwd: torsoD / 2, up: botZ }),
  ] as CoachMeshSpec["torsoCorners"];

  return {
    bones,
    headCenter: toDisplay(headCenter),
    headRadius: 0.075,
    neckFrom: toDisplay(neckBase),
    neckTo: toDisplay(headCenter),
    neckRadius: limbR * 0.85,
    torsoCorners,
  };
}
