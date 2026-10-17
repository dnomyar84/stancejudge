"use client";

import { cn } from "@/lib/utils";
import type { MoveGrade } from "@/lib/wushu/move-grade";

type ScreenJuiceProps = {
  grade: MoveGrade | null;
  className?: string;
};

export function ScreenJuice({ grade, className }: ScreenJuiceProps) {
  if (!grade) return null;
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-[15] animate-juice-flash",
        grade === "perfect" && "bg-emerald-400/25",
        grade === "good" && "bg-cyan-400/10",
        grade === "miss" && "bg-rose-500/30",
        className,
      )}
      aria-hidden
    />
  );
}
