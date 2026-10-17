"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  analyzeStance,
  type StanceAnalysis,
  type StanceCriterion,
  type StanceMode,
} from "@/lib/pose/analyze";
import { PracticeStage } from "@/components/practice-stage";
import { useThrottledValue } from "@/lib/hooks/use-throttled-value";
import { drawPose } from "@/lib/pose/draw";
import { landmarksToKeypoints } from "@/lib/pose/keypoints";
import { CameraSettingsBar } from "@/components/camera-settings-bar";
import { setLens, toggleFacing } from "@/lib/camera/prefs";
import {
  getCameraVideoStream,
  stopMediaStream,
} from "@/lib/camera/stream";
import type { CameraLensProfile, CameraPrefs } from "@/lib/camera/types";
import { useCameraPrefs } from "@/lib/hooks/use-camera-prefs";
import { getPoseLandmarker } from "@/lib/pose/landmarker-client";
import { Camera, CameraOff, Loader2 } from "lucide-react";

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

export function StanceJudge() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);

  const { prefs, setPrefs } = useCameraPrefs();
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [cameraOn, setCameraOn] = useState(false);
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
    const stream = await getCameraVideoStream(cameraPrefs);
    stopMediaStream(streamRef.current);
    streamRef.current = stream;
    const video = videoRef.current;
    if (!video) {
      stopMediaStream(stream);
      return;
    }
    video.srcObject = stream;
    await video.play();
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
    try {
      await ensureLandmarker();
      await attachStream(prefs);
      setCameraOn(true);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Camera access denied or unavailable.";
      setError(message);
      stopCamera();
    }
  }, [attachStream, ensureLandmarker, prefs, stopCamera]);

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
              // Video + canvas use CSS mirror; MediaPipe coords stay in raw frame space.
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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-cyan-400/90">
            Stance Judge
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Real-time pose & stance feedback
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Uses your webcam and MediaPipe Pose to score athletic or boxing
            stance — width, knee bend, alignment, and guard — entirely in the
            browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["athletic", "boxing"] as StanceMode[]).map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              variant={mode === m ? "default" : "outline"}
              onClick={() => setMode(m)}
            >
              {m === "athletic" ? "Athletic" : "Boxing guard"}
            </Button>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden border-cyan-500/20 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Camera</CardTitle>
            <CardDescription>
              Stand facing the camera with your whole body visible, including
              feet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PracticeStage
              videoRef={videoRef}
              canvasRef={canvasRef}
              fit="contain"
              mirrored={prefs.facing === "user"}
              overlay={
                !cameraOn ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/70 p-6 text-center">
                    {loadState === "loading" ? (
                      <>
                        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
                        <p className="text-sm text-muted-foreground">
                          Loading pose model…
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Camera off. Start when you are ready to be scored.
                      </p>
                    )}
                  </div>
                ) : null
              }
            />

            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <CameraSettingsBar
              prefs={prefs}
              disabled={loadState === "loading"}
              onFlipFacing={() =>
                applyCameraPrefs(toggleFacing(prefs))
              }
              onLensChange={(lens: CameraLensProfile) =>
                applyCameraPrefs(setLens(prefs, lens))
              }
            />

            <div className="flex flex-wrap gap-3">
              {!cameraOn ? (
                <Button type="button" onClick={startCamera} className="gap-2">
                  <Camera className="h-4 w-4" />
                  Start camera
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={stopCamera}
                  className="gap-2"
                >
                  <CameraOff className="h-4 w-4" />
                  Stop camera
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">Score</CardTitle>
            <CardDescription>{analysis.headline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end gap-4">
              <span
                className={`text-6xl font-bold tabular-nums ${scoreColor}`}
              >
                {cameraOn && analysis.ready ? analysis.overall : "—"}
              </span>
              <span className="pb-2 text-muted-foreground">/ 100</span>
            </div>
            <Progress
              value={cameraOn && analysis.ready ? analysis.overall : 0}
              className="h-2"
            />

            <ul className="space-y-3">
              {analysis.criteria.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  Criteria appear once your full body is detected.
                </li>
              ) : (
                analysis.criteria.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{c.label}</span>
                      <Badge variant={statusBadgeVariant(c.status)}>
                        {statusLabel(c.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.detail}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Processing runs locally on your device. No video is uploaded.
      </p>
    </div>
  );
}
