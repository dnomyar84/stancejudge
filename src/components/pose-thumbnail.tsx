"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { drawPose } from "@/lib/pose/draw";
import { buildMoveTemplateKeypoints } from "@/lib/pose/move-pose-template";
import { buildStanceTemplateKeypoints } from "@/lib/pose/stance-template";
import {
  defaultThumbnailYaw,
  rotateKeypointsYaw,
  THUMBNAIL_YAW_MAX,
  THUMBNAIL_YAW_MIN,
} from "@/lib/pose/view-yaw";
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
  /** Allow horizontal drag on the chip to yaw the coach view. */
  rotatable?: boolean;
};

export function PoseThumbnail({
  leg,
  hand,
  routineId,
  moveId,
  size = 52,
  className,
  highlight,
  rotatable = true,
}: PoseThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; yaw: number } | null>(null);
  const [viewYaw, setViewYaw] = useState(() =>
    defaultThumbnailYaw(leg, routineId, moveId),
  );

  useEffect(() => {
    setViewYaw(defaultThumbnailYaw(leg, routineId, moveId));
  }, [leg, hand, moveId, routineId]);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const px = Math.round(size * 2);
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const template =
      routineId && moveId
        ? buildMoveTemplateKeypoints(routineId, moveId, leg, hand)
        : buildStanceTemplateKeypoints(leg, hand);
    const yawed = rotateKeypointsYaw(template, viewYaw);
    const scaled = yawed.map((kp) =>
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
    drawPose(ctx, scaled, px, px, false, { jointDots: "head-only" });
  }, [hand, leg, moveId, routineId, size, viewYaw]);

  useEffect(() => {
    paint();
  }, [paint]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!rotatable) return;
    dragRef.current = { x: e.clientX, yaw: viewYaw };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = e.clientX - drag.x;
    const next = Math.min(
      THUMBNAIL_YAW_MAX,
      Math.max(THUMBNAIL_YAW_MIN, drag.yaw + delta * 0.55),
    );
    setViewYaw(next);
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      title={rotatable ? "Drag left/right to rotate coach view" : undefined}
      className={cn(
        "rounded-md ring-1 ring-white/10",
        rotatable && "touch-none cursor-ew-resize",
        highlight && "ring-cyan-400/70",
        className,
      )}
      style={{ width: size, height: size }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}
