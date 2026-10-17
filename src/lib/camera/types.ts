export type CameraFacing = "user" | "environment";

/** `wide` prefers ultra-wide / wide-angle rear lenses when the OS exposes them. */
export type CameraLensProfile = "standard" | "wide";

export type CameraPrefs = {
  facing: CameraFacing;
  lens: CameraLensProfile;
};

export const DEFAULT_CAMERA_PREFS: CameraPrefs = {
  facing: "user",
  lens: "standard",
};
