"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoveStanceChips } from "@/components/move-stance-chips";
import { PoseThumbnail } from "@/components/pose-thumbnail";
import { ROUTINES, getRoutinePackage } from "@/lib/wushu/routines";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

type RoutineSyllabusViewProps = {
  onBack: () => void;
};

function sectionLabel(routineId: string, order: number): string | null {
  if (routineId === "san-duan-chang-quan") {
    if (order === 1) return "第一小节 · Section 1";
    if (order === 12) return "第二小节 · Section 2";
  }
  return null;
}

export function RoutineSyllabusView({ onBack }: RoutineSyllabusViewProps) {
  const [routineId, setRoutineId] = useState(ROUTINES[0].id);
  const { routine, canonical } = getRoutinePackage(routineId);

  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-cyan-950/25">
      <div className="mx-auto max-w-2xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2 py-3">
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            ← Home
          </Button>
        </div>

        <header className="mb-6">
          <p className="flex items-center gap-2 text-sm font-medium text-cyan-400/90">
            <BookOpen className="h-4 w-4" />
            Syllabus
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {routine.nameZh}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {routine.description} · {canonical.moves.length} moves (duanwei
            gold standard). Leg and hand tags match what the app scores.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-2">
          {ROUTINES.map((r) => (
            <Button
              key={r.id}
              type="button"
              size="sm"
              variant={routineId === r.id ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setRoutineId(r.id)}
            >
              {r.nameZh}
            </Button>
          ))}
        </div>

        <ol className="space-y-3">
          {canonical.moves.map((move) => {
            const section = sectionLabel(routineId, move.order);
            return (
              <li key={move.id}>
                {section && (
                  <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-widest text-cyan-400/80">
                    {section}
                  </p>
                )}
                <article
                  className={cn(
                    "flex gap-3 rounded-xl border border-border/60 bg-card/60 p-3",
                  )}
                >
                  <PoseThumbnail
                    routineId={routineId}
                    moveId={move.id}
                    leg={move.expectedLeg}
                    hand={move.expectedHand}
                    size={64}
                    className="shrink-0 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug">
                      <span className="text-muted-foreground tabular-nums">
                        {move.order}.
                      </span>{" "}
                      {move.nameZh}
                    </p>
                    <p className="text-xs text-muted-foreground">{move.name}</p>
                    <MoveStanceChips
                      className="mt-2"
                      expectedLeg={move.expectedLeg}
                      expectedHand={move.expectedHand}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {move.coachTip}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
