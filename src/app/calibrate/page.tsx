import { CalibrateRoutine } from "@/components/calibrate-routine";
import { Suspense } from "react";

export default function CalibratePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-muted-foreground">Loading calibrate tool…</div>
      }
    >
      <CalibrateRoutine />
    </Suspense>
  );
}
