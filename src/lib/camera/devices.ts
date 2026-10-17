import type { CameraFacing, CameraLensProfile, CameraPrefs } from "./types";

export type ClassifiedDevice = {
  deviceId: string;
  label: string;
  facing: CameraFacing | "unknown";
  lens: CameraLensProfile | "ultra";
};

/** Best-effort labels from iOS / Android / desktop browsers (after camera permission). */
export function classifyVideoDeviceLabel(label: string): {
  facing: CameraFacing | "unknown";
  lens: CameraLensProfile | "ultra";
} {
  const l = label.toLowerCase();
  let lens: CameraLensProfile | "ultra" = "standard";
  if (
    l.includes("ultra") &&
    (l.includes("wide") || l.includes("angle"))
  ) {
    lens = "ultra";
  } else if (
    l.includes("wide") ||
    l.includes("0.5x") ||
    l.includes("dual wide")
  ) {
    lens = "wide";
  }

  let facing: CameraFacing | "unknown" = "unknown";
  if (
    l.includes("front") ||
    l.includes("facetime") ||
    l.includes("true depth") ||
    l.includes("selfie")
  ) {
    facing = "user";
  } else if (
    l.includes("back") ||
    l.includes("rear") ||
    l.includes("world") ||
    l.includes("environment")
  ) {
    facing = "environment";
  }

  return { facing, lens };
}

export function listClassifiedVideoDevices(
  devices: MediaDeviceInfo[],
): ClassifiedDevice[] {
  return devices
    .filter((d) => d.kind === "videoinput" && d.deviceId)
    .map((d) => {
      const c = classifyVideoDeviceLabel(d.label || "");
      return {
        deviceId: d.deviceId,
        label: d.label || "Camera",
        facing: c.facing,
        lens: c.lens,
      };
    });
}

export function pickVideoDeviceId(
  devices: MediaDeviceInfo[],
  prefs: CameraPrefs,
): string | null {
  const classified = listClassifiedVideoDevices(devices);
  if (classified.length === 0) return null;

  const wantWide = prefs.lens === "wide";

  let best: { id: string; score: number } | null = null;
  for (const d of classified) {
    let score = 0;
    if (d.facing === prefs.facing) score += 20;
    else if (d.facing === "unknown") score += 2;

    if (wantWide) {
      if (d.lens === "ultra") score += 15;
      else if (d.lens === "wide") score += 12;
      else score -= 3;
    } else if (d.lens === "standard") {
      score += 8;
    } else if (d.lens === "wide" || d.lens === "ultra") {
      score -= 2;
    }

    if (!best || score > best.score) {
      best = { id: d.deviceId, score };
    }
  }

  if (!best || best.score < 5) return null;
  return best.id;
}
