"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CanonicalRoutine } from "@/lib/wushu/types";
import type { LiveSessionState } from "@/lib/wushu/session-phase";

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
    <Card className="border-cyan-500/25">
      <CardHeader>
        <CardTitle>Run complete</CardTitle>
        <CardDescription>
          {routine.moves[0]?.nameZh} … {routine.moves[routine.moves.length - 1]?.nameZh}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <div className="text-sm text-muted-foreground">
            Perfect {perfect} · Good {good} · Miss {miss}
          </div>
        </div>

        <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
          {grades.map(({ move, grade }) => (
            <li
              key={move.id}
              className="flex justify-between gap-2 rounded-md border border-border/50 px-2 py-1"
            >
              <span>{move.nameZh}</span>
              <span
                className={
                  grade === "perfect"
                    ? "text-emerald-400"
                    : grade === "good"
                      ? "text-cyan-400"
                      : grade === "miss"
                        ? "text-rose-400"
                        : "text-muted-foreground"
                }
              >
                {grade === "pending" ? "—" : grade}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={onPracticeAgain}>Practice again</Button>
          <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        </div>
      </CardContent>
    </Card>
  );
}
