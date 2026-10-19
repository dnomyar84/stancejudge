"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LiveRoutinePractice } from "@/components/live-routine-practice";
import { PracticeHome, type PracticeMode } from "@/components/practice-home";
import { RoutineJudge } from "@/components/routine-judge";
import { RoutineSyllabusView } from "@/components/routine-syllabus-view";
import { Pose3DLab } from "@/components/pose-3d-lab";
import { CoachErrorBoundary } from "@/components/coach-error-boundary";
const WuBuQuanVisualCoach = dynamic(
  () =>
    import("@/components/wu-bu-quan-visual-coach").then(
      (m) => m.WuBuQuanVisualCoach,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-full items-center justify-center bg-gradient-to-b from-background via-background to-cyan-950/25 p-8 text-sm text-muted-foreground">
        Loading 3D coach…
      </div>
    ),
  },
);
import { StanceJudge } from "@/components/stance-judge";

export function WushuApp() {
  const [mode, setMode] = useState<PracticeMode>("home");

  if (mode === "home") {
    return (
      <div className="min-h-full bg-gradient-to-b from-background via-background to-cyan-950/20">
        <PracticeHome onSelect={(m) => setMode(m)} />
      </div>
    );
  }

  if (mode === "live-routine") {
    return <LiveRoutinePractice onBack={() => setMode("home")} />;
  }

  if (mode === "live-stance") {
    return <StanceJudge onBack={() => setMode("home")} />;
  }

  if (mode === "routine-video") {
    return <RoutineJudge onBack={() => setMode("home")} />;
  }

  if (mode === "syllabus") {
    return <RoutineSyllabusView onBack={() => setMode("home")} />;
  }

  if (mode === "pose-3d-lab") {
    return (
      <CoachErrorBoundary
        title="Pose 3D Lab failed to load"
        onBack={() => setMode("home")}
      >
        <Pose3DLab onBack={() => setMode("home")} />
      </CoachErrorBoundary>
    );
  }

  if (mode === "wu-bu-coach") {
    return (
      <CoachErrorBoundary
        title="五步拳 3D coach failed to load"
        onBack={() => setMode("home")}
      >
        <WuBuQuanVisualCoach onBack={() => setMode("home")} />
      </CoachErrorBoundary>
    );
  }

  return null;
}
