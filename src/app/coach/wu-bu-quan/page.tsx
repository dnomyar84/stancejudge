"use client";

import { CoachErrorBoundary } from "@/components/coach-error-boundary";
import { WuBuQuanVisualCoach } from "@/components/wu-bu-quan-visual-coach";

export default function WuBuQuanCoachPage() {
  return (
    <CoachErrorBoundary
      title="五步拳 3D coach failed to load"
      onBack={() => {
        window.location.href = "/";
      }}
    >
      <WuBuQuanVisualCoach
        onBack={() => {
          window.location.href = "/";
        }}
      />
    </CoachErrorBoundary>
  );
}
