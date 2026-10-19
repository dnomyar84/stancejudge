"use client";

import { useMemo, useState } from "react";
import { Pose3DViewer } from "@/components/pose-3d-viewer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildCoachFigureSkeleton } from "@/lib/pose/coach-figure";
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
import { ROUTINES } from "@/lib/wushu/routines";
import { ArrowLeft, Box } from "lucide-react";

const LAB_ROUTINE_IDS = ["wu-bu-quan", "san-duan-chang-quan"] as const;

type Pose3DLabProps = {
  onBack: () => void;
};

export function Pose3DLab({ onBack }: Pose3DLabProps) {
  const routines = useMemo(
    () => ROUTINES.filter((r) =>
      (LAB_ROUTINE_IDS as readonly string[]).includes(r.id),
    ),
    [],
  );

  const [routineId, setRoutineId] = useState<string>("wu-bu-quan");
  const routine = routines.find((r) => r.id === routineId) ?? routines[0];
  const [moveId, setMoveId] = useState(routine.moves[0]?.id ?? "");

  const move = routine.moves.find((m) => m.id === moveId) ?? routine.moves[0];
  const skeleton = move
    ? buildCoachFigureSkeleton(routine.id, move.id)
    : null;

  const legKind = move ? legStanceFromProfile(move.expectedLeg) : "unknown";
  const handKind = move ? handShapeFromProfile(move.expectedHand) : "unknown";
  const feet = defaultFootAimForLeg(legKind);

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
          Canonical poses are authored in 3D (tubes, solid torso, head). Drag to orbit.
          Compare against your routine memory — feedback drives the backlog in{" "}
          <code className="text-xs">docs/product/pose-3d-fundamentals.md</code>.
        </p>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <Card className="overflow-hidden border-cyan-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {move ? `${move.order}. ${move.nameZh}` : "—"}
              </CardTitle>
              <CardDescription>{move?.name}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Pose3DViewer
                skeleton={skeleton}
                className="h-[min(52vh,420px)] w-full"
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
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
              <CardContent className="max-h-56 overflow-y-auto flex flex-col gap-1">
                {routine.moves.map((m) => (
                  <Button
                    key={m.id}
                    type="button"
                    variant={m.id === moveId ? "secondary" : "ghost"}
                    size="sm"
                    className="justify-start text-left"
                    onClick={() => setMoveId(m.id)}
                  >
                    <span className="tabular-nums text-muted-foreground">
                      {m.order}.
                    </span>
                    <span className="ml-1">{m.nameZh}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Expected (vocabulary)</CardTitle>
                <CardDescription className="text-xs">
                  Migrating from 2D enums → full 3D records
                </CardDescription>
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
                {move?.coachTip ? (
                  <p className="border-t border-border pt-2 text-xs text-muted-foreground">
                    {move.coachTip}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
