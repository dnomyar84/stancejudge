"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  analyzeStance,
  type StanceAnalysis,
  type StanceCriterion,
  type StanceMode,
} from "@/lib/pose/analyze";
import { LiveCameraDock } from "@/components/live-camera-dock";
import { LiveFullscreenShell } from "@/components/live-fullscreen-shell";
import { LiveRecordButton } from "@/components/live-record-button";
import { PracticeStage } from "@/components/practice-stage";
import { useThrottledValue } from "@/lib/hooks/use-throttled-value";
import { drawPose } from "@/lib/pose/draw";
import { landmarksToKeypoints } from "@/lib/pose/keypoints";
import { loadCameraPrefs, setLens, toggleFacing } from "@/lib/camera/prefs";
import { cameraStageFit } from "@/lib/camera/video-fit";
import {
  getCameraVideoStream,
  readActiveFacingMode,
  stopMediaStream,
} from "@/lib/camera/stream";
import type { CameraLensProfile, CameraPrefs } from "@/lib/camera/types";
import { useCameraPrefs } from "@/lib/hooks/use-camera-prefs";
import { getPoseLandmarker } from "@/lib/pose/landmarker-client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type LoadState = "idle" | "loading" | "ready" | "error";

function statusBadgeVariant(
  status: StanceCriterion["status"],
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "good") return "default";
  if (status === "warn") return "secondary";
  if (status === "bad") return "destructive";
  return "outline";
}

function statusLabel(status: StanceCriterion["status"]): string {
  if (status === "good") return "Good";
  if (status === "warn") return "Adjust";
  if (status === "bad") return "Fix";
  return "—";
}

export function StanceJudge({ onBack }: { onBack?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);

  const { prefs, setPrefs } = useCameraPrefs();
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<StanceMode>("athletic");
  const [analysisRaw, setAnalysisRaw] = useState<StanceAnalysis>({
    overall: 0,
    criteria: [],
    ready: false,
    headline: "Start the camera to begin judging your stance.",
  });
  const analysis = useThrottledValue(analysisRaw, 120);

  const attachStream = useCallback(async (cameraPrefs: CameraPrefs) => {
    const previous = streamRef.current;
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    const stream = await getCameraVideoStream(cameraPrefs, {
      releaseStream: previous,
    });
    streamRef.current = stream;
    const video = videoRef.current;
    if (!video) {
      stopMediaStream(stream);
      return;
    }
    video.srcObject = stream;
    await video.play();

    const active = readActiveFacingMode(stream);
    if (active && active !== cameraPrefs.facing) {
      throw new Error(
        `Browser opened ${active === "user" ? "front" : "rear"} camera instead of ${cameraPrefs.facing === "user" ? "front" : "rear"}. Try stopping the camera, flip again, and start.`,
      );
    }
  }, []);

  const applyCameraPrefs = useCallback(
    (next: CameraPrefs) => {
      setPrefs(next);
      if (cameraOn) {
        void attachStream(next).catch((e) => {
          setError(
            e instanceof Error ? e.message : "Could not switch camera.",
          );
        });
      }
    },
    [attachStream, cameraOn, setPrefs],
  );

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    lastVideoTimeRef.current = -1;
    setCameraOn(false);
  }, []);

  const ensureLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    setLoadState("loading");
    setError(null);
    try {
      const landmarker = await getPoseLandmarker();
      landmarkerRef.current = landmarker;
      setLoadState("ready");
      return landmarker;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load pose model.";
      setError(message);
      setLoadState("error");
      throw e;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await ensureLandmarker();
      await attachStream(loadCameraPrefs());
      setCameraOn(true);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Camera access denied or unavailable.";
      setError(message);
      stopCamera();
    } finally {
      setLoading(false);
    }
  }, [attachStream, ensureLandmarker, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [stopCamera]);

  useEffect(() => {
    if (!cameraOn) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !canvas || !landmarker) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const tick = () => {
      if (!running) return;
      if (video.readyState >= 2) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w && h) {
          if (canvas.width !== w) canvas.width = w;
          if (canvas.height !== h) canvas.height = h;

          if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime;
            const result = landmarker.detectForVideo(
              video,
              performance.now(),
            );
            const landmarks = result.landmarks[0];
            if (landmarks) {
              const keypoints = landmarksToKeypoints(landmarks, w, h);
              drawPose(ctx, keypoints, w, h, false);
              setAnalysisRaw(analyzeStance(keypoints, mode));
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [cameraOn, mode]);

  const scoreColor =
    analysis.overall >= 75
      ? "text-emerald-400"
      : analysis.overall >= 45
        ? "text-amber-400"
        : "text-rose-400";

  const showScore = cameraOn && analysis.ready;
  const displayScore = showScore ? analysis.overall : null;

  return (
    <LiveFullscreenShell
      onBack={onBack}
      title="Stance Judge"
      subtitle={
        cameraOn
          ? analysis.headline
          : "Full body in frame · tap Go live"
      }
      topOverlay={
        <div className="flex gap-2 overflow-x-auto px-3 pb-2 pt-1">
          {(["athletic", "boxing"] as StanceMode[]).map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              disabled={cameraOn}
              variant={mode === m ? "default" : "secondary"}
              className={cn(
                "shrink-0 rounded-full",
                mode !== m && "bg-black/40 text-white hover:bg-black/55",
              )}
              onClick={() => setMode(m)}
            >
              {m === "athletic" ? "Athletic" : "Boxing guard"}
            </Button>
          ))}
        </div>
      }
      rightDock={
        <LiveCameraDock
          prefs={prefs}
          disabled={loading || loadState === "loading"}
          onFlipFacing={() => applyCameraPrefs(toggleFacing(prefs))}
          onLensChange={(lens: CameraLensProfile) =>
            applyCameraPrefs(setLens(prefs, lens))
          }
        />
      }
      bottomPanel={
        cameraOn && analysis.criteria.length > 0
          ? (
              <div className="space-y-2 rounded-2xl bg-black/55 p-3 backdrop-blur-md">
                <Progress
                  value={showScore ? analysis.overall : 0}
                  className="h-1.5 bg-white/20"
                />
                <ul className="max-h-[28vh] space-y-2 overflow-y-auto">
                  {analysis.criteria.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-white">
                          {c.label}
                        </span>
                        <Badge variant={statusBadgeVariant(c.status)}>
                          {statusLabel(c.status)}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-white/70">{c.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )
          : undefined
      }
      bottomBar={
        <div className="flex flex-col items-center gap-2">
          {error && (
            <p className="max-w-sm rounded-lg bg-red-950/80 px-3 py-2 text-center text-xs text-red-200">
              {error}
            </p>
          )}
          <LiveRecordButton
            active={cameraOn}
            loading={loading || loadState === "loading"}
            label="Go live"
            onClick={() => {
              if (!cameraOn) void startCamera();
              else stopCamera();
            }}
          />
          <p className="text-[10px] text-white/50">
            Runs on your device · no upload
          </p>
        </div>
      }
      stage={
        <PracticeStage
          videoRef={videoRef}
          canvasRef={canvasRef}
          fullscreen
          fit={cameraStageFit(prefs)}
          mirrored={prefs.facing === "user"}
          overlay={
            <>
              {displayScore !== null && (
                <div
                  className="pointer-events-none absolute left-4 top-[max(5.5rem,env(safe-area-inset-top))] z-20 flex flex-col items-start"
                  aria-live="polite"
                >
                  <span
                    className={cn(
                      "text-5xl font-bold tabular-nums drop-shadow-lg",
                      scoreColor,
                    )}
                  >
                    {displayScore}
                  </span>
                  <span className="text-xs font-medium text-white/80">
                    / 100
                  </span>
                </div>
              )}
              {!cameraOn && !loading && loadState !== "loading" && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 p-6 text-center text-sm text-white/80">
                  Stand facing the camera · feet visible
                </div>
              )}
              {(loading || loadState === "loading") && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60">
                  <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
                  <p className="text-sm text-white/70">Loading pose model…</p>
                </div>
              )}
            </>
          }
        />
      }
    />
  );
}
