import type { CameraPrefs } from "./types";

/** Wider native aspect + cover avoids pillarboxing ultra-wide streams in the stage. */
export function cameraStageFit(prefs: CameraPrefs): "cover" | "contain" {
  if (prefs.lens === "wide" || prefs.facing === "environment") {
    return "cover";
  }
  return "contain";
}
