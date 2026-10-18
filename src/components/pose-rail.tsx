"use client";

import { useEffect, useRef } from "react";
import { PoseThumbnail } from "@/components/pose-thumbnail";
import type { RailMove } from "@/lib/wushu/playback";
import { cn } from "@/lib/utils";

type PoseRailProps = {
  moves: RailMove[];
  scrollProgress: number;
  scanning: boolean;
  routineId?: string;
  variant?: "default" | "overlay";
};

const USER_SCROLL_PAUSE_MS = 4500;

export function PoseRail({
  moves,
  scrollProgress,
  scanning,
  routineId,
  variant = "default",
}: PoseRailProps) {
  const overlay = variant === "overlay";
  const scrollerRef = useRef<HTMLDivElement>(null);
  const userScrollingRef = useRef(false);
  const pauseAutoScrollUntilRef = useRef(0);

  const activeIndex = moves.findIndex(
    (m) =>
      m.isActive ||
      m.state === "scanning" ||
      m.state === "active",
  );

  const markUserScroll = () => {
    userScrollingRef.current = true;
    pauseAutoScrollUntilRef.current = Date.now() + USER_SCROLL_PAUSE_MS;
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (Date.now() < pauseAutoScrollUntilRef.current) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    if (activeIndex >= 0) {
      const chip = el.children[activeIndex] as HTMLElement | undefined;
      chip?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      return;
    }

    el.scrollTo({
      left: scrollProgress * maxScroll,
      behavior: "smooth",
    });
  }, [scrollProgress, activeIndex, moves.length]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() >= pauseAutoScrollUntilRef.current) {
        userScrollingRef.current = false;
      }
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        overlay
          ? "border-b border-white/10 bg-black/45 backdrop-blur-md"
          : "sticky top-0 z-40 border-b border-cyan-500/20 bg-background/95 backdrop-blur-md",
      )}
    >
      <div className={cn("px-2 py-2", !overlay && "mx-auto max-w-6xl md:px-4")}>
        {!overlay && (
          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Routine poses</span>
            <span>
              {scanning
                ? "Scanning… swipe rail to browse"
                : "Swipe rail · 3D coach view (feet on floor line)"}
            </span>
          </div>
        )}
        <div
          className={cn(
            "relative",
            overlay ? "bg-black/30" : "rounded-lg bg-muted/40",
          )}
        >
          <div
            ref={scrollerRef}
            className={cn(
              "flex gap-2 overflow-x-auto overscroll-x-contain px-3 py-2",
              "touch-pan-x scroll-smooth",
              "[scrollbar-width:thin] [-webkit-overflow-scrolling:touch]",
              "snap-x snap-mandatory",
            )}
            onTouchStart={markUserScroll}
            onPointerDown={markUserScroll}
            onWheel={(e) => {
              if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) markUserScroll();
            }}
            onScroll={markUserScroll}
            role="list"
            aria-label="Routine pose sequence"
          >
            {moves.map((item, index) => (
              <PoseChip
                key={item.move.id}
                routineId={routineId}
                item={item}
                showNextLabel={
                  item.state === "upcoming" &&
                  index > 0 &&
                  (moves[index - 1]?.isActive ||
                    moves[index - 1]?.state === "scanning" ||
                    moves[index - 1]?.state === "active")
                }
              />
            ))}
          </div>
          <div
            className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
            style={{ left: `${8 + scrollProgress * 84}%` }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

function PoseChip({
  item,
  routineId,
  showNextLabel,
}: {
  item: RailMove;
  routineId?: string;
  showNextLabel?: boolean;
}) {
  const { move, state } = item;
  const isNow =
    item.isActive || state === "scanning" || state === "active";
  return (
    <div
      role="listitem"
      className={cn(
        "flex min-w-[5.25rem] shrink-0 snap-center flex-col items-center rounded-md border px-1.5 py-1.5 text-center transition-colors md:min-w-[6.25rem]",
        state === "upcoming" &&
          "border-border/50 bg-background/60 text-muted-foreground",
        item.isActive &&
          "scale-105 border-cyan-400 bg-cyan-950/50 ring-2 ring-cyan-400/60",
        state === "scanning" &&
          "border-amber-500/50 bg-amber-950/30 text-amber-100",
        state === "met" && "border-emerald-500/70 bg-emerald-950/50 text-emerald-100",
        state === "missed" && "border-rose-500/70 bg-rose-950/50 text-rose-100",
      )}
      title={move.name}
    >
      <PoseThumbnail
        routineId={routineId}
        moveId={move.id}
        leg={move.expectedLeg}
        hand={move.expectedHand}
        size={item.isActive ? 56 : 48}
        highlight={item.isActive}
        className="mb-1"
      />
      <span className="text-[10px] font-medium leading-tight text-foreground/90">
        {move.nameZh}
      </span>
      {isNow && (
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-300">
          Now
        </span>
      )}
      {showNextLabel && (
        <span className="mt-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
          Next
        </span>
      )}
      {!isNow && !showNextLabel && (
        <span className="mt-0.5 text-[9px] leading-tight opacity-70">
          {move.order > 0 ? `#${move.order}` : "·"}
        </span>
      )}
    </div>
  );
}
