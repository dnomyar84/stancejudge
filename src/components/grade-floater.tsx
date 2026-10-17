"use client";

import { cn } from "@/lib/utils";
import type { MoveGrade } from "@/lib/wushu/move-grade";

type GradeFloaterProps = {
  text: string | null;
  grade: MoveGrade | null;
};

export function GradeFloater({ text, grade }: GradeFloaterProps) {
  if (!text || !grade) return null;
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-1/4 z-20 flex justify-center transition-opacity duration-200",
        grade === "perfect" && "text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]",
        grade === "good" && "text-cyan-300",
        grade === "miss" && "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]",
      )}
      aria-live="polite"
    >
      <span className="text-3xl font-black tracking-wide md:text-4xl">{text}</span>
    </div>
  );
}
