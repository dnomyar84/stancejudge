"use client";

import { useState } from "react";
import { LiveRoutinePractice } from "@/components/live-routine-practice";
import { PracticeHome, type PracticeMode } from "@/components/practice-home";
import { RoutineJudge } from "@/components/routine-judge";
import { RoutineSyllabusView } from "@/components/routine-syllabus-view";
import { Pose3DLab } from "@/components/pose-3d-lab";
import { WuBuQuanVisualCoach } from "@/components/wu-bu-quan-visual-coach";
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
    return <Pose3DLab onBack={() => setMode("home")} />;
  }

  if (mode === "wu-bu-coach") {
    return <WuBuQuanVisualCoach onBack={() => setMode("home")} />;
  }

  return null;
}
