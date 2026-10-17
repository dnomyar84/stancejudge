import {
  DEFAULT_CAMERA_PREFS,
  type CameraFacing,
  type CameraLensProfile,
  type CameraPrefs,
} from "./types";

const STORAGE_KEY = "stancejudge.cameraPrefs";

export function loadCameraPrefs(): CameraPrefs {
  if (typeof window === "undefined") return DEFAULT_CAMERA_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CAMERA_PREFS;
    const p = JSON.parse(raw) as Partial<CameraPrefs>;
    return {
      facing: p.facing === "environment" ? "environment" : "user",
      lens: p.lens === "wide" ? "wide" : "standard",
    };
  } catch {
    return DEFAULT_CAMERA_PREFS;
  }
}

export function saveCameraPrefs(prefs: CameraPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function toggleFacing(prefs: CameraPrefs): CameraPrefs {
  return {
    ...prefs,
    facing: prefs.facing === "user" ? "environment" : "user",
  };
}

export function setLens(
  prefs: CameraPrefs,
  lens: CameraLensProfile,
): CameraPrefs {
  return { ...prefs, lens };
}

export function facingLabel(facing: CameraFacing): string {
  return facing === "user" ? "Front" : "Rear";
}
