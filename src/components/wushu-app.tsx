"use client";

import { useEffect, useState } from "react";
import { LiveRoutinePractice } from "@/components/live-routine-practice";
import { PracticeHome, type PracticeMode } from "@/components/practice-home";
import { RoutineJudge } from "@/components/routine-judge";
import { RoutineSyllabusView } from "@/components/routine-syllabus-view";
import { Pose3DLab } from "@/components/pose-3d-lab";
import { CoachErrorBoundary } from "@/components/coach-error-boundary";
import { WuBuQuanVisualCoach } from "@/components/wu-bu-quan-visual-coach";
import { StanceJudge } from "@/components/stance-judge";

function coachModeFromLocation(): PracticeMode | null {
  if (typeof window === "undefined") return null;
  const coach = new URLSearchParams(window.location.search).get("coach");
  if (coach === "wu-bu") return "wu-bu-coach";
  if (coach === "lab") return "pose-3d-lab";
  return null;
}

export function WushuApp() {
  const [mode, setMode] = useState<PracticeMode>("home");

  useEffect(() => {
    const fromUrl = coachModeFromLocation();
    if (fromUrl) setMode(fromUrl);
  }, []);

  const goHome = () => {
    setMode("home");
    window.history.replaceState(null, "", "/");
  };

  const openCoach = (next: Exclude<PracticeMode, "home">) => {
    setMode(next);
    if (next === "wu-bu-coach") {
      window.history.replaceState(null, "", "/?coach=wu-bu");
    } else if (next === "pose-3d-lab") {
      window.history.replaceState(null, "", "/?coach=lab");
    }
  };

  if (mode === "home") {
    return (
      <div className="min-h-full bg-gradient-to-b from-background via-background to-cyan-950/20">
        <PracticeHome onSelect={openCoach} />
      </div>
    );
  }

  if (mode === "live-routine") {
    return <LiveRoutinePractice onBack={goHome} />;
  }

  if (mode === "live-stance") {
    return <StanceJudge onBack={goHome} />;
  }

  if (mode === "routine-video") {
    return <RoutineJudge onBack={goHome} />;
  }

  if (mode === "syllabus") {
    return <RoutineSyllabusView onBack={goHome} />;
  }

  if (mode === "pose-3d-lab") {
    return (
      <CoachErrorBoundary
        title="Pose 3D Lab failed to load"
        onBack={goHome}
      >
        <Pose3DLab onBack={goHome} />
      </CoachErrorBoundary>
    );
  }

  if (mode === "wu-bu-coach") {
    return (
      <CoachErrorBoundary
        title="五步拳 3D coach failed to load"
        onBack={goHome}
      >
        <WuBuQuanVisualCoach onBack={goHome} />
      </CoachErrorBoundary>
    );
  }

  return null;
}
