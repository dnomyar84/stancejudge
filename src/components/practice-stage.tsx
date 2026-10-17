"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type PracticeStageProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  mirrored?: boolean;
  /** object-contain keeps skeleton aligned with letterboxed video (T-03). */
  fit?: "cover" | "contain";
  /** Edge-to-edge camera (live / mobile). */
  fullscreen?: boolean;
  className?: string;
  overlay?: React.ReactNode;
};

export function PracticeStage({
  videoRef,
  canvasRef,
  mirrored = true,
  fit = "contain",
  fullscreen = false,
  className,
  overlay,
}: PracticeStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!video || !canvas || !container) return;

    const syncCanvas = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh || !cw || !ch) return;

      const videoAspect = vw / vh;
      const boxAspect = cw / ch;
      let dw: number;
      let dh: number;
      if (fit === "contain") {
        if (boxAspect > videoAspect) {
          dh = ch;
          dw = ch * videoAspect;
        } else {
          dw = cw;
          dh = cw / videoAspect;
        }
      } else {
        if (boxAspect > videoAspect) {
          dw = cw;
          dh = cw / videoAspect;
        } else {
          dh = ch;
          dw = ch * videoAspect;
        }
      }

      canvas.width = vw;
      canvas.height = vh;
      canvas.style.width = `${dw}px`;
      canvas.style.height = `${dh}px`;
      canvas.style.left = `${(cw - dw) / 2}px`;
      canvas.style.top = `${(ch - dh) / 2}px`;
      video.style.width = `${dw}px`;
      video.style.height = `${dh}px`;
      video.style.left = `${(cw - dw) / 2}px`;
      video.style.top = `${(ch - dh) / 2}px`;
    };

    const ro = new ResizeObserver(syncCanvas);
    ro.observe(container);
    video.addEventListener("loadedmetadata", syncCanvas);
    syncCanvas();
    return () => {
      ro.disconnect();
      video.removeEventListener("loadedmetadata", syncCanvas);
    };
  }, [videoRef, canvasRef, fit]);

  const mirror = mirrored ? "scale-x-[-1]" : "";

  return (
    <div
      ref={containerRef}
      className={cn(
        fullscreen
          ? "relative h-full w-full overflow-hidden bg-black"
          : "relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10 sm:aspect-video",
        className,
      )}
    >
      <video
        ref={videoRef}
        className={cn("absolute object-none", mirror)}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className={cn("pointer-events-none absolute object-none", mirror)}
      />
      {overlay}
    </div>
  );
}
