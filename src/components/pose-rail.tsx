"use client";

import { PoseThumbnail } from "@/components/pose-thumbnail";
import type { RailMove } from "@/lib/wushu/playback";
import { cn } from "@/lib/utils";

type PoseRailProps = {
  moves: RailMove[];
  scrollProgress: number;
  scanning: boolean;
};

export function PoseRail({ moves, scrollProgress, scanning }: PoseRailProps) {
  const translatePercent = scrollProgress * Math.max(0, moves.length - 4) * 12;

  return (
    <div className="sticky top-0 z-40 border-b border-cyan-500/20 bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-2 py-2 md:px-4">
        <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Routine poses</span>
          <span>{scanning ? "Scanning… keep playing" : "Play — green = met, red = missed"}</span>
        </div>
        <div className="relative overflow-hidden rounded-lg bg-muted/40 py-3">
          <div
            className="flex gap-2 px-3 transition-transform duration-150 ease-linear will-change-transform"
            style={{ transform: `translateX(-${translatePercent}%)` }}
          >
            {moves.map((item, index) => (
              <PoseChip
                key={item.move.id}
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
  showNextLabel,
}: {
  item: RailMove;
  showNextLabel?: boolean;
}) {
  const { move, state } = item;
  const isNow =
    item.isActive ||
    state === "scanning" ||
    state === "active";
  return (
    <div
      className={cn(
        "flex min-w-[5.25rem] shrink-0 flex-col items-center rounded-md border px-1.5 py-1.5 text-center transition-colors md:min-w-[6.25rem]",
        state === "upcoming" && "border-border/50 bg-background/60 text-muted-foreground",
        item.isActive &&
          "scale-105 border-cyan-400 bg-cyan-950/50 ring-2 ring-cyan-400/60",
        state === "scanning" && "border-amber-500/50 bg-amber-950/30 text-amber-100",
        state === "met" && "border-emerald-500/70 bg-emerald-950/50 text-emerald-100",
        state === "missed" && "border-rose-500/70 bg-rose-950/50 text-rose-100",
      )}
      title={move.name}
    >
      <PoseThumbnail
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
