"use client";

import { useEffect } from "react";

export default function HydrateProbePage() {
  useEffect(() => {
    document.body.dataset.stanceJudgeHydrated = "1";
  }, []);
  return <p data-testid="probe">probe</p>;
}
