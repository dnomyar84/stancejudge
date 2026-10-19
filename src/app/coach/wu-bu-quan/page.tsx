"use client";

import { useRouter } from "next/navigation";
import { CoachErrorBoundary } from "@/components/coach-error-boundary";
import { WuBuQuanVisualCoach } from "@/components/wu-bu-quan-visual-coach";

export default function WuBuQuanCoachPage() {
  const router = useRouter();
  const goHome = () => router.push("/");

  return (
    <CoachErrorBoundary
      title="五步拳 3D coach failed to load"
      onBack={goHome}
    >
      <WuBuQuanVisualCoach onBack={goHome} />
    </CoachErrorBoundary>
  );
}
