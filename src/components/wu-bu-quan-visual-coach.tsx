"use client";

import "@/lib/motion/disciplines-init";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActiveCuesCard } from "@/components/active-cues-card";
import { Pose3DMannequinViewer } from "@/components/pose-3d-viewer-mannequin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sampleRoutineVisualCoach } from "@/lib/pose/canonical3d/choreography";
import { totalRoutineDurationMs } from "@/lib/pose/choreography/move-boundaries";
import {
  getRoutineVisualCoach,
  routineVisualCoachDurationMs,
} from "@/lib/pose/choreography/registry";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";

type WuBuQuanVisualCoachProps = {
  onBack: () => void;
};

export function WuBuQuanVisualCoach({ onBack }: WuBuQuanVisualCoachProps) {
  const spec = getRoutineVisualCoach("wu-bu-quan");
  const totalMs = spec ? routineVisualCoachDurationMs(spec) : 1;

  const [routineT, setRoutineT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef(0);
  const lastTickRef = useRef(0);

  const sampled = useMemo(() => {
    if (!spec) return null;
    return sampleRoutineVisualCoach(spec, routineT);
  }, [spec, routineT]);

  const stopPlayback = useCallback(() => {
    setPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (!playing || !spec) return;

    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      setRoutineT((prev) => {
        const next = prev + dt / totalMs;
        if (next >= 1) {
          stopPlayback();
          return 1;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, spec, totalMs, stopPlayback]);

  const moveMarkers = useMemo(() => {
    if (!spec) return [];
    let acc = 0;
    const total = totalRoutineDurationMs(spec.moves, spec.transitionMs);
    return spec.moves.map((m, i) => {
      const start = acc / total;
      acc += m.durationMs;
      if (i < spec.moves.length - 1) acc += spec.transitionMs;
      return { id: m.moveId, nameZh: m.nameZh, start };
    });
  }, [spec]);

  if (!spec) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        五步拳 visual coach not available.
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-cyan-950/25">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 md:py-8">
        <header className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-cyan-400/90">
              Visual coach
            </p>
            <h1 className="text-2xl font-semibold md:text-3xl">五步拳 · 3D</h1>
          </div>
        </header>

        <p className="text-sm text-muted-foreground">
          Play the full form with animated transitions.{" "}
          <span className="text-foreground/90">
            Drag horizontally on the figure to rotate (side / back view).
          </span>
        </p>

        <Card className="overflow-hidden border-cyan-500/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {sampled?.moveNameZh ?? "—"}
              {sampled?.phaseNameZh ? ` · ${sampled.phaseNameZh}` : ""}
            </CardTitle>
            <CardDescription>{sampled?.keyframeLabelZh}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <Pose3DMannequinViewer
              pose={sampled?.pose ?? null}
              figurine={sampled?.figurine ?? null}
              horizontalOrbit
              className="h-[min(58vh,480px)] w-full touch-pan-y rounded-lg border border-border/60"
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="lg"
                className="min-h-11 flex-1 sm:flex-none"
                onClick={() => {
                  if (playing) stopPlayback();
                  else setPlaying(true);
                }}
              >
                {playing ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Play
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => {
                  stopPlayback();
                  setRoutineT(0);
                }}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Restart
              </Button>
            </div>

            <label className="block text-xs text-muted-foreground">
              Routine timeline (~{Math.round(totalMs / 1000)}s)
              <input
                type="range"
                min={0}
                max={1000}
                value={Math.round(routineT * 1000)}
                className="mt-1 w-full accent-cyan-500"
                onChange={(e) => {
                  stopPlayback();
                  setRoutineT(Number(e.target.value) / 1000);
                }}
              />
              <div className="relative mt-1 h-4 w-full">
                {moveMarkers.map((m) => (
                  <span
                    key={m.id}
                    className="absolute top-0 -translate-x-1/2 text-[10px] text-cyan-500/80"
                    style={{ left: `${m.start * 100}%` }}
                    title={m.nameZh}
                  >
                    {m.nameZh.slice(0, 2)}
                  </span>
                ))}
              </div>
            </label>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {moveMarkers.map((m) => (
                <Button
                  key={m.id}
                  type="button"
                  size="sm"
                  variant={
                    sampled?.moveId === m.id ? "default" : "outline"
                  }
                  className="h-8 text-xs"
                  onClick={() => {
                    stopPlayback();
                    setRoutineT(m.start);
                  }}
                >
                  {m.nameZh}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {sampled ? <ActiveCuesCard cues={sampled.activeCues} /> : null}
      </div>
    </div>
  );
}
