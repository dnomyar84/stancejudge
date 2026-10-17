import { pickVideoDeviceId } from "./devices";
import type { CameraFacing, CameraPrefs } from "./types";
import { stopMediaStream } from "./stream-utils";

export { stopMediaStream } from "./stream-utils";

export function readActiveFacingMode(
  stream: MediaStream,
): CameraFacing | undefined {
  const track = stream.getVideoTracks()[0];
  const raw = track?.getSettings()?.facingMode;
  if (raw === "user" || raw === "environment") return raw;
  return undefined;
}

function videoSizeConstraints(prefs: CameraPrefs): MediaTrackConstraints {
  if (prefs.lens === "wide") {
    return {
      width: { ideal: 1920, min: 1280 },
      height: { ideal: 1440, min: 720 },
      aspectRatio: { ideal: 4 / 3 },
    };
  }
  return {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    aspectRatio: { ideal: 16 / 9 },
  };
}

/**
 * Open a camera stream. Pass `releaseStream` so the previous device is freed
 * before requesting another (required on iOS / iPad when flipping cameras).
 */
export async function getCameraVideoStream(
  prefs: CameraPrefs,
  options?: { releaseStream?: MediaStream | null },
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera API not available in this browser.");
  }

  stopMediaStream(options?.releaseStream);
  if (options?.releaseStream) {
    await new Promise((r) => setTimeout(r, 80));
  }

  const size = videoSizeConstraints(prefs);
  const attempts: MediaTrackConstraints[] = [];

  const devices = await navigator.mediaDevices.enumerateDevices();
  const deviceId = pickVideoDeviceId(devices, prefs);

  if (prefs.lens === "wide" && deviceId) {
    attempts.push({ ...size, deviceId: { exact: deviceId } });
    attempts.push({ ...size, deviceId: { ideal: deviceId } });
  }

  attempts.push({ ...size, facingMode: { exact: prefs.facing } });
  attempts.push({ ...size, facingMode: { ideal: prefs.facing } });

  if (prefs.lens !== "wide" && deviceId) {
    attempts.push({ ...size, deviceId: { exact: deviceId } });
    attempts.push({ ...size, deviceId: { ideal: deviceId } });
  }

  let lastError: unknown;
  for (const video of attempts) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio: false,
      });
      const active = readActiveFacingMode(stream);
      if (active && active !== prefs.facing) {
        stopMediaStream(stream);
        continue;
      }
      return stream;
    } catch (e) {
      lastError = e;
    }
  }

  if (lastError instanceof Error) throw lastError;
  if (lastError instanceof DOMException) throw lastError;
  throw new Error("Could not open the selected camera.");
}
