import { pickVideoDeviceId } from "./devices";
import type { CameraPrefs } from "./types";

export async function getCameraVideoStream(
  prefs: CameraPrefs,
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera API not available in this browser.");
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const deviceId = pickVideoDeviceId(devices, prefs);

  const video: MediaTrackConstraints = {
    width: { ideal: prefs.lens === "wide" ? 1920 : 1280 },
    height: { ideal: prefs.lens === "wide" ? 1080 : 720 },
  };

  if (deviceId) {
    video.deviceId = { ideal: deviceId };
  } else {
    video.facingMode = { ideal: prefs.facing };
  }

  try {
    return await navigator.mediaDevices.getUserMedia({ video, audio: false });
  } catch (firstError) {
    if (!deviceId) throw firstError;
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: prefs.facing },
        width: video.width,
        height: video.height,
      },
      audio: false,
    });
  }
}

export function stopMediaStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((t) => t.stop());
}
