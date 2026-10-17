"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getPoseLandmarker } from "@/lib/pose/landmarker-client";
import { buildCanonicalFromFrames } from "@/lib/wushu/canonical";
import { getReferenceVideo } from "@/lib/wushu/reference-videos";
import { ROUTINES, getRoutinePackage } from "@/lib/wushu/routines";
import { evaluateFramesAsSanDuanChangQuan } from "@/lib/wushu/evaluate-san-duan";
import { sampleVideoPoses } from "@/lib/wushu/sequence";
import { parseYouTubeVideoId } from "@/lib/youtube";
import { Loader2, Upload } from "lucide-react";

export function CalibrateRoutine() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("routine") ?? ROUTINES[0].id;
  const testHarness = searchParams.get("test") === "1";

  useEffect(() => {
    document.body.dataset.stanceJudgeHydrated = "1";
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [routineId, setRoutineId] = useState(initialId);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonOut, setJsonOut] = useState<string | null>(null);
  const [evalOut, setEvalOut] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { routine } = getRoutinePackage(routineId);
  const refVideo = getReferenceVideo(routineId);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !pendingFile) return;
    setJsonOut(null);
    setEvalOut(null);
    setError(null);
    setVideoReady(false);
    video.src = URL.createObjectURL(pendingFile);
  }, [pendingFile]);

  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) return;
    const onNativeChange = () => {
      const file = input.files?.[0];
      if (file) setPendingFile(file);
    };
    input.addEventListener("change", onNativeChange);
    return () => input.removeEventListener("change", onNativeChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const markReady = () => setVideoReady(true);
    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);
    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
    };
  }, []);

  const onFile = useCallback((file: File | null) => {
    if (!file) return;
    setPendingFile(file);
  }, []);

  const syncInputFile = useCallback(() => {
    const input = document.querySelector<HTMLInputElement>(
      "[data-testid=calibrate-file]",
    );
    const file = input?.files?.[0] ?? fileInputRef.current?.files?.[0];
    if (file) setPendingFile(file);
  }, []);

  const run = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !videoReady) {
      setError("Upload the reference performance video first.");
      return;
    }
    setRunning(true);
    setProgress(0);
    setError(null);
    try {
      const landmarker = await getPoseLandmarker();
      const frames = await sampleVideoPoses(
        video,
        landmarker,
        routine.weapon,
        setProgress,
      );
      const youtubeUrl = refVideo?.youtubeUrl?.trim() || null;
      const canonical = buildCanonicalFromFrames(
        routine,
        frames,
        video.duration,
        {
          youtubeId: youtubeUrl ? parseYouTubeVideoId(youtubeUrl) : null,
          youtubeUrl,
          label: refVideo?.label,
        },
      );
      setJsonOut(JSON.stringify(canonical, null, 2));
      if (routine.id === "san-duan-chang-quan") {
        setEvalOut(
          JSON.stringify(
            evaluateFramesAsSanDuanChangQuan(frames, video.duration),
          ),
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calibration failed.");
    } finally {
      setRunning(false);
    }
  }, [routine, refVideo, videoReady]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {testHarness && (
        <button
          type="button"
          data-testid="calibrate-sync-input"
          className="hidden"
          onClick={syncInputFile}
        >
          Sync file input
        </button>
      )}
      <div>
        <h1 className="text-2xl font-semibold">Calibrate reference sequence</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload the same performance as your selected YouTube reference (download
          with a tool like yt-dlp). Save the JSON into{" "}
          <code className="text-xs">src/data/canonical/&lt;routine&gt;.json</code>{" "}
          and redeploy.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ROUTINES.map((r) => (
          <Button
            key={r.id}
            size="sm"
            variant={routineId === r.id ? "default" : "outline"}
            onClick={() => {
              setRoutineId(r.id);
              setJsonOut(null);
            }}
          >
            {r.nameZh}
          </Button>
        ))}
      </div>

      {refVideo?.youtubeUrl ? (
        <p className="text-sm text-muted-foreground">
          Configured reference:{" "}
          <a
            href={refVideo.youtubeUrl}
            className="text-cyan-400 underline"
            target="_blank"
            rel="noreferrer"
          >
            {refVideo.label ?? refVideo.youtubeUrl}
          </a>
        </p>
      ) : (
        <p className="text-sm text-amber-400/90">
          Set <code className="text-xs">youtubeUrl</code> in{" "}
          <code className="text-xs">src/data/reference-videos.json</code> first.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reference video file</CardTitle>
          <CardDescription>MP4/WebM of the full routine, front view.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            data-testid="calibrate-file"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={() => {
              const file = fileInputRef.current?.files?.[0] ?? null;
              onFile(file);
            }}
          />
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Choose reference video
          </Button>
          <video
            ref={videoRef}
            className="aspect-video w-full rounded-lg bg-black"
            controls
            playsInline
          />
          <Button
            data-testid="calibrate-run"
            disabled={running || !videoReady}
            onClick={run}
            className="gap-2"
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Build canonical sequence
          </Button>
          {running && <Progress value={progress * 100} />}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {evalOut && (
        <pre data-testid="calibrate-eval" className="hidden">
          {evalOut}
        </pre>
      )}

      {jsonOut && (
        <Card>
          <CardHeader>
            <CardTitle>Canonical JSON</CardTitle>
            <CardDescription data-testid="calibrate-done">
              Commit this file to the repo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre
              data-testid="calibrate-json"
              className="max-h-96 overflow-auto rounded-lg bg-muted p-3 text-xs"
            >
              {jsonOut}
            </pre>
            <Button
              className="mt-3"
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(jsonOut)}
            >
              Copy JSON
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
