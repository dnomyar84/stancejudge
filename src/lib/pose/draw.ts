import { getKeypoint, KP } from "./keypoints";
import type { PoseKeypoint } from "./types";

const BONES: [number, number][] = [
  [KP.left_shoulder, KP.right_shoulder],
  [KP.left_shoulder, KP.left_elbow],
  [KP.left_elbow, KP.left_wrist],
  [KP.right_shoulder, KP.right_elbow],
  [KP.right_elbow, KP.right_wrist],
  [KP.left_shoulder, KP.left_hip],
  [KP.right_shoulder, KP.right_hip],
  [KP.left_hip, KP.right_hip],
  [KP.left_hip, KP.left_knee],
  [KP.left_knee, KP.left_ankle],
  [KP.right_hip, KP.right_knee],
  [KP.right_knee, KP.right_ankle],
];

export function drawPose(
  ctx: CanvasRenderingContext2D,
  keypoints: PoseKeypoint[],
  width: number,
  height: number,
  mirror: boolean,
): void {
  ctx.clearRect(0, 0, width, height);

  const mapX = (x: number) => (mirror ? width - x : x);

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
  ctx.lineCap = "round";

  for (const [a, b] of BONES) {
    const p1 = getKeypoint(keypoints, a);
    const p2 = getKeypoint(keypoints, b);
    if (!p1 || !p2) continue;
    ctx.beginPath();
    ctx.moveTo(mapX(p1.x), p1.y);
    ctx.lineTo(mapX(p2.x), p2.y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(34, 211, 238, 1)";
  for (const idx of Object.values(KP)) {
    const p = getKeypoint(keypoints, idx);
    if (!p) continue;
    ctx.beginPath();
    ctx.arc(mapX(p.x), p.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
