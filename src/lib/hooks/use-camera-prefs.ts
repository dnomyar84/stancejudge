"use client";

import { useCallback, useState } from "react";
import { loadCameraPrefs, saveCameraPrefs } from "@/lib/camera/prefs";
import type { CameraPrefs } from "@/lib/camera/types";

export function useCameraPrefs() {
  const [prefs, setPrefsState] = useState<CameraPrefs>(() => loadCameraPrefs());

  const setPrefs = useCallback((next: CameraPrefs) => {
    saveCameraPrefs(next);
    setPrefsState(next);
  }, []);

  return { prefs, setPrefs };
}
