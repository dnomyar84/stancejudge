"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pose3DViewer } from "@/components/pose-3d-viewer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { extendedFromSkeleton } from "@/lib/pose/coach-figure/extended-pose";
import { buildCoachFigureSkeleton } from "@/lib/pose/coach-figure";
import {
  sampleMoveChoreography,
  sampleRoutineVisualCoach,
} from "@/lib/pose/canonical3d/choreography";
import {
  evaluateStanceConstraints,
  inferTiXiSupportLeg,
  tiXiDingConstraintSet,
} from "@/lib/pose/canonical3d/constraints";
import {
  defaultFootAimForLeg,
  handShapeFromProfile,
  legStanceFromProfile,
} from "@/lib/pose/canonical3d/move-expectations";
import {
  footAimLabelZh,
  handShapeLabelZh,
  legStanceLabelZh,
} from "@/lib/pose/canonical3d/vocabulary";
import {
  getMoveChoreography,
  getRoutineVisualCoach,
} from "@/lib/pose/choreography/registry";
import { ROUTINES } from "@/lib/wushu/routines";
import { ArrowLeft, Box, Pause, Play } from "lucide-react";

const LAB_ROUTINE_IDS = ["wu-bu-quan", "san-duan-chang-quan"] as const;

type Pose3DLabProps = {
  onBack: () => void;
};

export function Pose3DLab({ onBack }: Pose3DLabProps) {
  const routines = useMemo(
    () =>
      ROUTINES.filter((r) =>
        (LAB_ROUTINE_IDS as readonly string[]).includes(r.id),
      ),
    [],
  );

  const [routineId, setRoutineId] = useState<string>("wu-bu-quan");
  const routine = routines.find((r) => r.id === routineId) ?? routines[0];
  const [moveId, setMoveId] = useState(routine.moves[0]?.id ?? "");
  const [coachMode, setCoachMode] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [moveT, setMoveT] = useState(1);
  const [routineT, setRoutineT] = useState(0);

  const move = routine.moves.find((m) => m.id === moveId) ?? routine.moves[0];
  const choreography = move
    ? getMoveChoreography(routine.id, move.id)
    : null;
  const visualCoach = getRoutineVisualCoach(routine.id);

  const sampled = useMemo(() => {
    if (coachMode && visualCoach) {
      return sampleRoutineVisualCoach(visualCoach, routineT);
    }
    if (choreography) {
      return sampleMoveChoreography(choreography, moveT);
    }
    const sk = move ? buildCoachFigureSkeleton(routine.id, move.id) : null;
    return sk
      ? {
          pose: extendedFromSkeleton(sk),
          moveId: move?.id ?? "",
          moveNameZh: move?.nameZh ?? "",
          phaseId: null,
          phaseNameZh: null,
          keyframeLabelZh: null,
          activeCues: [],
          stanceConstraints: null,
          moveT: 1,
          routineT: 0,
        }
      : null;
  }, [
    coachMode,
    visualCoach,
    routineT,
    choreography,
    moveT,
    move,
    routine.id,
  ]);

  useEffect(() => {
    if (!playing) return;
    const tickMs = 40;
    const id = window.setInterval(() => {
      if (coachMode && visualCoach) {
        setRoutineT((t) => {
          const next = t + tickMs / visualCoach.moves.reduce((s, m) => s + m.durationMs, 0);
          if (next >= 1) {
            setPlaying(false);
            return 1;
          }
          return next;
        });
      } else {
        setMoveT((t) => {
          const next = t + tickMs / (choreography?.durationMs ?? 4000);
          if (next >= 1) {
            setPlaying(false);
            return 1;
          }
          return next;
        });
      }
    }, tickMs);
    return () => window.clearInterval(id);
  }, [playing, coachMode, visualCoach, choreography]);

  const resetMoveTime = useCallback(() => {
    setMoveT(0);
    setRoutineT(0);
  }, []);

  const legKind = move ? legStanceFromProfile(move.expectedLeg) : "unknown";
  const handKind = move ? handShapeFromProfile(move.expectedHand) : "unknown";
  const feet = defaultFootAimForLeg(legKind);

  const constraintEval = useMemo(() => {
    if (!sampled?.pose) return null;
    if (sampled.stanceConstraints) {
      return evaluateStanceConstraints(sampled.pose, sampled.stanceConstraints);
    }
    if (legKind === "ti_xi") {
      const support = inferTiXiSupportLeg(sampled.pose.skeleton);
      return evaluateStanceConstraints(
        sampled.pose,
        tiXiDingConstraintSet(support),
      );
    }
    return null;
  }, [sampled, legKind]);

  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-cyan-950/20">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 md:py-10">
        <header className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-cyan-400/90">
              Fundamentals
            </p>
            <h1 className="flex items-center gap-2 text-2xl font-semibold md:text-3xl">
              <Box className="h-7 w-7 text-cyan-400" />
              Pose 3D Lab
            </h1>
          </div>
        </header>

        <p className="text-sm text-muted-foreground">
          Moves are authored as <strong className="font-medium text-foreground">phases</strong> (并步, 抱拳, …) with keyframes and coaching cues.
          Hands and feet extend past wrist/ankle. Use <strong className="font-medium text-foreground">Visual coach</strong> to scrub the full 五步拳 timeline.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={coachMode ? "default" : "outline"}
            disabled={!visualCoach}
            onClick={() => {
              setCoachMode((c) => !c);
              setPlaying(false);
              resetMoveTime();
            }}
          >
            Visual coach (full form)
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              if (playing) setPlaying(false);
              else setPlaying(true);
            }}
          >
            {playing ? (
              <>
                <Pause className="mr-1 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-1 h-4 w-4" />
                Play
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <Card className="overflow-hidden border-cyan-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {coachMode && sampled
                  ? `${sampled.moveNameZh}${sampled.phaseNameZh ? ` · ${sampled.phaseNameZh}` : ""}`
                  : move
                    ? `${move.order}. ${move.nameZh}`
                    : "—"}
              </CardTitle>
              <CardDescription>
                {sampled?.keyframeLabelZh ?? move?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <Pose3DViewer
                pose={sampled?.pose ?? null}
                className="h-[min(52vh,420px)] w-full rounded-lg border border-border/60"
              />
              <label className="block text-xs text-muted-foreground">
                {coachMode ? "Routine time" : "Move choreography"}
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={Math.round((coachMode ? routineT : moveT) * 1000)}
                  className="mt-1 w-full accent-cyan-500"
                  onChange={(e) => {
                    const v = Number(e.target.value) / 1000;
                    setPlaying(false);
                    if (coachMode) setRoutineT(v);
                    else setMoveT(v);
                  }}
                />
              </label>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            {!coachMode && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Routine</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {routines.map((r) => (
                      <Button
                        key={r.id}
                        type="button"
                        variant={r.id === routineId ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => {
                          setRoutineId(r.id);
                          setMoveId(r.moves[0]?.id ?? "");
                          setCoachMode(false);
                          resetMoveTime();
                          setMoveT(1);
                        }}
                      >
                        {r.nameZh}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Move</CardTitle>
                  </CardHeader>
                  <CardContent className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                    {routine.moves.map((m) => (
                      <Button
                        key={m.id}
                        type="button"
                        variant={m.id === moveId ? "secondary" : "ghost"}
                        size="sm"
                        className="justify-start text-left"
                        onClick={() => {
                          setMoveId(m.id);
                          setMoveT(0);
                          setPlaying(false);
                        }}
                      >
                        <span className="tabular-nums text-muted-foreground">
                          {m.order}.
                        </span>
                        <span className="ml-1">{m.nameZh}</span>
                        {getMoveChoreography(routine.id, m.id) ? (
                          <span className="ml-auto text-[10px] text-cyan-400">
                            flow
                          </span>
                        ) : null}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {constraintEval ? (
              <Card className="border-border/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Stance constraints</CardTitle>
                  <CardDescription className="text-xs">
                    Required vs preferred (soft) — score {constraintEval.overallScore}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {constraintEval.results.map((r) => (
                    <p
                      key={r.constraintId}
                      className={
                        r.strength === "required" && r.score < 100
                          ? "text-red-400"
                          : r.score < 100
                            ? "text-amber-400/90"
                            : "text-muted-foreground"
                      }
                    >
                      {r.messageZh}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {sampled && sampled.activeCues.length > 0 ? (
              <Card className="border-cyan-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Active cues</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {sampled.activeCues.map((c) => (
                    <div key={c.id}>
                      <p className="font-medium">{c.labelZh}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.descriptionZh}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {choreography && !coachMode ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Phases & cues</CardTitle>
                  <CardDescription className="text-xs">
                    {choreography.nameZh} choreography spec
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-40 space-y-2 overflow-y-auto text-xs text-muted-foreground">
                  {choreography.phases.map((p) => (
                    <div key={p.id}>
                      <p className="font-medium text-foreground">{p.nameZh}</p>
                      <ul className="ml-3 list-disc">
                        {p.cues.map((c) => (
                          <li key={c.id}>{c.descriptionZh}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {!choreography && !coachMode ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Expected (legacy tags)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">腿式 · </span>
                    {legStanceLabelZh(legKind)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">手型 · </span>
                    {handShapeLabelZh(handKind)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">左脚 · </span>
                    {footAimLabelZh(feet.left)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">右脚 · </span>
                    {footAimLabelZh(feet.right)}
                  </p>
                </CardContent>
              </Card>
            ) : null}

          </div>
        </div>
      </div>
    </div>
  );
}
