"use client";

import { Button } from "@/components/ui/button";
import { MoveStanceChips } from "@/components/move-stance-chips";
import type { CanonicalRoutine } from "@/lib/wushu/types";
import type { LiveSessionState } from "@/lib/wushu/session-phase";
import { cn } from "@/lib/utils";

type ResultsScreenProps = {
  routine: CanonicalRoutine;
  session: LiveSessionState;
  onPracticeAgain: () => void;
  onBack: () => void;
};

export function ResultsScreen({
  routine,
  session,
  onPracticeAgain,
  onBack,
}: ResultsScreenProps) {
  const grades = routine.moves.map((m) => ({
    move: m,
    grade: session.moveGrades[m.id] ?? "pending",
  }));
  const perfect = grades.filter((g) => g.grade === "perfect").length;
  const good = grades.filter((g) => g.grade === "good").length;
  const miss = grades.filter((g) => g.grade === "miss").length;
  const attempted = perfect + good + miss;
  const rank =
    perfect >= routine.moves.length * 0.7
      ? "S"
      : perfect + good >= routine.moves.length * 0.6
        ? "A"
        : attempted > 0
          ? "B"
          : "—";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 py-4">
      <div>
        <h2 className="text-xl font-semibold">Run complete</h2>
        <p className="text-sm text-muted-foreground">
          {routine.moves[0]?.nameZh} …{" "}
          {routine.moves[routine.moves.length - 1]?.nameZh}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Rank</p>
          <p className="text-5xl font-black tabular-nums text-cyan-300">
            {rank}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-4xl font-bold tabular-nums text-emerald-400">
            {Math.round(session.totalPoints)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Max combo</p>
          <p className="text-3xl font-semibold tabular-nums">×{session.maxCombo}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Perfect {perfect} · Good {good} · Miss {miss}
        </p>
      </div>

      <ol className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
        {grades.map(({ move, grade }) => (
          <li
            key={move.id}
            className="rounded-xl border border-border/50 bg-card/50 px-3 py-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium leading-tight">
                <span className="text-muted-foreground tabular-nums">
                  {move.order}.
                </span>{" "}
                {move.nameZh}
              </p>
              <span
                className={cn(
                  "shrink-0 text-xs font-semibold uppercase",
                  grade === "perfect"
                    ? "text-emerald-400"
                    : grade === "good"
                      ? "text-cyan-400"
                      : grade === "miss"
                        ? "text-rose-400"
                        : "text-muted-foreground",
                )}
              >
                {grade === "pending" ? "—" : grade}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{move.name}</p>
            <MoveStanceChips
              className="mt-2"
              moveId={move.id}
              expectedLeg={move.expectedLeg}
              expectedHand={move.expectedHand}
              compact
            />
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={onPracticeAgain}>Practice again</Button>
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
      </div>
    </div>
  );
}
