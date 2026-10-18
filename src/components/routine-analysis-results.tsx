"use client";

import { Badge } from "@/components/ui/badge";
import { MoveStanceChips } from "@/components/move-stance-chips";
import type { MoveAlignmentStatus, RoutineAnalysisReport } from "@/lib/wushu/types";
import { cn } from "@/lib/utils";

function moveStatusVariant(
  status: MoveAlignmentStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "correct") return "default";
  if (status === "wrong_stance") return "secondary";
  if (status === "wrong_sequence") return "outline";
  return "destructive";
}

function moveStatusLabel(status: MoveAlignmentStatus): string {
  if (status === "correct") return "Good";
  if (status === "wrong_stance") return "Adjust";
  if (status === "wrong_sequence") return "Order";
  return "Missed";
}

type RoutineAnalysisResultsProps = {
  report: RoutineAnalysisReport;
  routineNameZh: string;
  className?: string;
  variant?: "card" | "overlay";
};

export function RoutineAnalysisResults({
  report,
  routineNameZh,
  className,
  variant = "card",
}: RoutineAnalysisResultsProps) {
  const overlay = variant === "overlay";

  return (
    <div
      className={cn(
        overlay
          ? "rounded-2xl bg-black/60 p-4 backdrop-blur-md"
          : "space-y-6",
        className,
      )}
    >
      <div>
        <p
          className={cn(
            "text-sm font-medium",
            overlay ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {routineNameZh}
        </p>
        <p
          className={cn(
            "mt-1 text-sm",
            overlay ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {report.summary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ScoreTile label="Overall" value={report.overallScore} overlay={overlay} />
        <ScoreTile label="Sequence" value={report.sequenceScore} overlay={overlay} />
        <ScoreTile label="Legs" value={report.legScore} overlay={overlay} />
        <ScoreTile label="Hands" value={report.handScore} overlay={overlay} />
      </div>

      <ol className="max-h-[42vh] space-y-2 overflow-y-auto pr-1">
        {report.moves.map((m) => (
          <li
            key={m.move.id}
            className={cn(
              "rounded-xl border px-3 py-2.5",
              overlay
                ? "border-white/10 bg-black/35"
                : "border-border/40 bg-muted/20",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-medium leading-tight",
                    overlay ? "text-white" : "",
                  )}
                >
                  <span className="tabular-nums text-white/50">
                    {m.move.order}.
                  </span>{" "}
                  {m.move.nameZh}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    overlay ? "text-white/55" : "text-muted-foreground",
                  )}
                >
                  {m.move.name}
                </p>
              </div>
              <Badge variant={moveStatusVariant(m.status)} className="shrink-0">
                {moveStatusLabel(m.status)}
              </Badge>
            </div>
            <MoveStanceChips
              className="mt-2"
              moveId={m.move.id}
              expectedLeg={m.move.expectedLeg}
              expectedHand={m.move.expectedHand}
              detectedLeg={m.detectedLeg}
              detectedHand={m.detectedHand}
              compact
            />
            {(m.legScore < 100 || m.handScore < 100) && m.status !== "missing" && (
              <p
                className={cn(
                  "mt-1.5 text-[10px] tabular-nums",
                  overlay ? "text-white/45" : "text-muted-foreground",
                )}
              >
                Leg {m.legScore} · Hand {m.handScore}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ScoreTile({
  label,
  value,
  overlay,
}: {
  label: string;
  value: number;
  overlay?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2 py-2 text-center",
        overlay
          ? "border-white/15 bg-black/40"
          : "border-border/60 bg-muted/30",
      )}
    >
      <p
        className={cn(
          "text-[10px] uppercase tracking-wide",
          overlay ? "text-white/55" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-xl font-semibold tabular-nums sm:text-2xl",
          overlay ? "text-white" : "",
        )}
      >
        {value}
      </p>
    </div>
  );
}
