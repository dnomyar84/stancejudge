"use client";

import { useEffect, useRef } from "react";
import {
  buildCoachFigureKeypoints,
  coachFigureFloorY,
} from "@/lib/pose/coach-figure";
import { drawPose } from "@/lib/pose/draw";
import { buildMoveTemplateKeypoints } from "@/lib/pose/move-pose-template";
import { buildStanceTemplateKeypoints } from "@/lib/pose/stance-template";
import type { HandProfileType, LegStanceType } from "@/lib/wushu/types";
import { cn } from "@/lib/utils";

type PoseThumbnailProps = {
  leg: LegStanceType;
  hand: HandProfileType;
  routineId?: string;
  moveId?: string;
  size?: number;
  className?: string;
  highlight?: boolean;
};

export function PoseThumbnail({
  leg,
  hand,
  routineId,
  moveId,
  size = 52,
  className,
  highlight,
}: PoseThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const px = Math.round(size * 2);
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let template =
      routineId && moveId
        ? buildMoveTemplateKeypoints(routineId, moveId, leg, hand)
        : buildStanceTemplateKeypoints(leg, hand);

    const coach3d =
      routineId && moveId
        ? buildCoachFigureKeypoints(routineId, moveId)
        : null;
    if (coach3d) template = coach3d;

    const scaled = template.map((kp) =>
      kp
        ? {
            ...kp,
            x: (kp.x / 128) * px,
            y: (kp.y / 128) * px,
          }
        : kp,
    );

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, px, px);

    const floorY = (coachFigureFloorY(128) / 128) * px;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px * 0.06, floorY);
    ctx.lineTo(px * 0.94, floorY);
    ctx.stroke();

    drawPose(ctx, scaled, px, px, false, { jointDots: "head-only" });
  }, [hand, leg, moveId, routineId, size]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "rounded-md ring-1 ring-white/10",
        highlight && "ring-cyan-400/70",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
