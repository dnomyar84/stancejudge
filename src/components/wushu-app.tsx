"use client";

import { useState } from "react";
import { LiveRoutinePractice } from "@/components/live-routine-practice";
import { PracticeHome, type PracticeMode } from "@/components/practice-home";
import { RoutineJudge } from "@/components/routine-judge";
import { StanceJudge } from "@/components/stance-judge";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-cyan-950/20">
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-2"
          onClick={() => setMode("home")}
        >
          ← Home
        </Button>
        {mode === "routine-video" && <RoutineJudge />}
      </div>
    </div>
  );
}
