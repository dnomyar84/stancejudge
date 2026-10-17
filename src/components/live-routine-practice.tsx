"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradeFloater } from "@/components/grade-floater";
import { ScreenJuice } from "@/components/screen-juice";
import { PoseRail } from "@/components/pose-rail";
import { PracticeStage } from "@/components/practice-stage";
import { ResultsScreen } from "@/components/results-screen";
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
import { buildLiveRail, liveRailScrollProgress } from "@/lib/wushu/live-rail";
import {
  initialLiveSession,
  sessionToPhaseLabel,
  tickLiveSession,
  type LiveSessionState,
  type PracticePhase,
} from "@/lib/wushu/session-phase";
import { ROUTINES, getRoutinePackage } from "@/lib/wushu/routines";
import { Camera, CameraOff, Loader2 } from "lucide-react";

const ROUTINE_STORAGE_KEY = "stancejudge.routineId";

export function LiveRoutinePractice({ onBack }: { onBack: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastVideoTimeRef = useRef(-1);
  const sessionRef = useRef<LiveSessionState>(initialLiveSession());

  const { prefs, setPrefs } = useCameraPrefs();
  const [routineId, setRoutineId] = useState(() => {
    if (typeof window === "undefined") return ROUTINES[0].id;
    return localStorage.getItem(ROUTINE_STORAGE_KEY) ?? ROUTINES[0].id;
  });
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<LiveSessionState>(initialLiveSession());
  const [floater, setFloater] = useState<{
    text: string | null;
    grade: "perfect" | "good" | "miss" | null;
  }>({ text: null, grade: null });
  const [juiceGrade, setJuiceGrade] = useState<
    "perfect" | "good" | "miss" | null
  >(null);
  const [shakeStage, setShakeStage] = useState(false);

  const { routine, canonical } = getRoutinePackage(routineId);
  const phase: PracticePhase =
    session.phase === "complete" ? "review" : session.phase;

  const railMoves = useMemo(
    () => buildLiveRail(canonical, session.moveIndex, session.moveGrades, session.phase),
    [canonical, session.moveIndex, session.moveGrades, session.phase],
  );

  const scrollProgress = liveRailScrollProgress(
    session.moveIndex,
    canonical.moves.length,
  );

  useEffect(() => {
    localStorage.setItem(ROUTINE_STORAGE_KEY, routineId);
  }, [routineId]);

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
    setCameraOn(false);
  }, []);

  const resetSession = useCallback(() => {
    const s = initialLiveSession();
    sessionRef.current = s;
    setSession(s);
    setFloater({ text: null, grade: null });
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setLoading(true);
    resetSession();
    try {
      if (!landmarkerRef.current) {
        landmarkerRef.current = await getPoseLandmarker();
      }
      await attachStream(prefs);
      setCameraOn(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera unavailable");
      stopCamera();
    } finally {
      setLoading(false);
    }
  }, [attachStream, prefs, resetSession, stopCamera]);

  useEffect(() => () => {
    stopCamera();
    landmarkerRef.current?.close();
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
        if (w && h && video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime;
          const result = landmarker.detectForVideo(video, performance.now());
          const landmarks = result.landmarks[0];
          const keypoints = landmarks
            ? landmarksToKeypoints(landmarks, w, h)
            : null;
          if (keypoints) {
            drawPose(ctx, keypoints, w, h, false);
            if (sessionRef.current.phase !== "review") {
              const out = tickLiveSession(
                sessionRef.current,
                canonical,
                keypoints,
                routine.weapon,
              );
              sessionRef.current = out;
              if (out.gradeFlash && out.floaterText) {
                setFloater({
                  text: out.floaterText,
                  grade: out.gradeFlash,
                });
                setJuiceGrade(out.gradeFlash);
                if (out.gradeFlash === "miss") {
                  setShakeStage(true);
                  window.setTimeout(() => setShakeStage(false), 380);
                }
                window.setTimeout(() => {
                  setFloater({ text: null, grade: null });
                  setJuiceGrade(null);
                }, 700);
              }
              setSession(
                out.phase === "complete" ? { ...out, phase: "review" } : out,
              );
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
  }, [cameraOn, canonical, routine.weapon]);

  if (phase === "review") {
    return (
      <div className="space-y-4">
        <ResultsScreen
          routine={canonical}
          session={session}
          onPracticeAgain={() => {
            resetSession();
            startCamera();
          }}
          onBack={onBack}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PoseRail moves={railMoves} scrollProgress={scrollProgress} scanning={session.phase === "performing"} />

      <div className="flex flex-wrap gap-2">
        {ROUTINES.map((r) => (
          <Button
            key={r.id}
            type="button"
            size="sm"
            variant={routineId === r.id ? "default" : "outline"}
            disabled={cameraOn}
            onClick={() => setRoutineId(r.id)}
          >
            {r.nameZh}
          </Button>
        ))}
      </div>

      <p className="text-center text-sm font-medium text-cyan-300/90">
        {sessionToPhaseLabel(session.phase)}
        {session.phase === "performing" && (
          <span className="text-muted-foreground">
            {" "}
            · move {session.moveIndex + 1}/{canonical.moves.length}
            {session.combo > 1 && (
              <span className="text-amber-300/90">
                {" "}
                · combo ×{session.combo}
                {session.combo >= 3 ? " 🔥" : ""}
              </span>
            )}
          </span>
        )}
      </p>

      <Card className="border-cyan-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Live routine (DDR)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PracticeStage
            videoRef={videoRef}
            canvasRef={canvasRef}
            fit="contain"
            mirrored={prefs.facing === "user"}
            className={shakeStage ? "animate-stage-shake" : undefined}
            overlay={
              <>
                <ScreenJuice grade={juiceGrade} />
                <GradeFloater text={floater.text} grade={floater.grade} />
                {session.phase === "performing" && session.combo >= 2 && (
                  <div
                    className="pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-black/50 px-3 py-1 text-sm font-bold tabular-nums text-amber-300 ring-1 ring-amber-400/40"
                    aria-live="polite"
                  >
                    ×{session.combo}
                  </div>
                )}
                {!cameraOn && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 p-4 text-center text-sm text-muted-foreground">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                    ) : (
                      `${prefs.facing === "user" ? "Front" : "Rear"} camera — whole body visible. Tap start.`
                    )}
                  </div>
                )}
              </>
            }
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <CameraSettingsBar
            prefs={prefs}
            disabled={loading}
            onFlipFacing={() => applyCameraPrefs(toggleFacing(prefs))}
            onLensChange={(lens: CameraLensProfile) =>
              applyCameraPrefs(setLens(prefs, lens))
            }
          />

          <div className="flex flex-wrap gap-3">
            {!cameraOn ? (
              <Button type="button" className="min-h-12 min-w-[8rem] gap-2" onClick={startCamera}>
                <Camera className="h-5 w-5" />
                Start
              </Button>
            ) : (
              <Button type="button" variant="outline" className="gap-2" onClick={() => {
                stopCamera();
                setSession((s) => ({ ...s, phase: "review" }));
              }}>
                <CameraOff className="h-4 w-4" />
                Finish & review
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={onBack}>Back</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
