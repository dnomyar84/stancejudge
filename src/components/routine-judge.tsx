"use client";

import { useCallback, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPoseLandmarker } from "@/lib/pose/landmarker-client";
import { ROUTINES, getRoutineById } from "@/lib/wushu/routines";
import { analyzeRoutineVideo } from "@/lib/wushu/sequence";
import type { MoveAlignmentStatus, RoutineAnalysisReport } from "@/lib/wushu/types";
import { isYouTubeUrl } from "@/lib/youtube";
import { FileVideo, Link2, Loader2, Play, Upload } from "lucide-react";

function moveStatusVariant(
  status: MoveAlignmentStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "correct") return "default";
  if (status === "wrong_stance") return "secondary";
  if (status === "wrong_sequence") return "outline";
  return "destructive";
}

function moveStatusLabel(status: MoveAlignmentStatus): string {
  if (status === "correct") return "Good";
  if (status === "wrong_stance") return "Adjust form";
  if (status === "wrong_sequence") return "Order";
  return "Missed";
}

export function RoutineJudge() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [routineId, setRoutineId] = useState(ROUTINES[0].id);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoReady, setVideoReady] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<RoutineAnalysisReport | null>(null);
  const [videoLabel, setVideoLabel] = useState<string | null>(null);

  const routine = getRoutineById(routineId) ?? ROUTINES[0];

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const attachVideoSrc = useCallback(
    (src: string, label: string) => {
      revokeObjectUrl();
      const video = videoRef.current;
      if (!video) return;
      video.src = src;
      if (src.startsWith("blob:")) objectUrlRef.current = src;
      setVideoLabel(label);
      setVideoReady(false);
      setReport(null);
      setError(null);
    },
    [revokeObjectUrl],
  );

  const onFileChange = useCallback(
    (file: File | null) => {
      if (!file) return;
      if (!file.type.startsWith("video/")) {
        setError("Please choose a video file (MP4, WebM, etc.).");
        return;
      }
      const url = URL.createObjectURL(file);
      attachVideoSrc(url, file.name);
    },
    [attachVideoSrc],
  );

  const loadYouTube = useCallback(async () => {
    if (!isYouTubeUrl(youtubeUrl)) {
      setError("Paste a valid YouTube link (watch or youtu.be).");
      return;
    }
    setLoadingVideo(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/youtube?url=${encodeURIComponent(youtubeUrl.trim())}`,
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          body?.error ??
            "Could not import YouTube video. Upload the file instead.",
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      attachVideoSrc(url, "YouTube import");
    } catch (e) {
      setError(e instanceof Error ? e.message : "YouTube import failed.");
    } finally {
      setLoadingVideo(false);
    }
  }, [youtubeUrl, attachVideoSrc]);

  const runAnalysis = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !videoReady) {
      setError("Load a video first and wait until it is ready to play.");
      return;
    }
    setAnalyzing(true);
    setProgress(0);
    setError(null);
    setReport(null);
    try {
      const landmarker = await getPoseLandmarker();
      const result = await analyzeRoutineVideo(
        video,
        routine,
        landmarker,
        setProgress,
      );
      setReport(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }, [routine, videoReady]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6">
      <Alert className="border-cyan-500/30 bg-cyan-950/20">
        <AlertTitle>Kids practice coach (beta)</AlertTitle>
        <AlertDescription>
          This checks three things:{" "}
          <strong>step order</strong>, <strong>leg stance</strong>, and{" "}
          <strong>hand / sword shape</strong>. Film from the front with the
          full body in frame. Routine lists are simplified teaching guides —
          not official competition judging.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card className="border-cyan-500/20">
          <CardHeader>
            <CardTitle>Routine & video</CardTitle>
            <CardDescription>
              San Duan Chang Quan (三段长拳) or Si Duan Jian (四段剑).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {ROUTINES.map((r) => (
                <Button
                  key={r.id}
                  type="button"
                  size="sm"
                  variant={routineId === r.id ? "default" : "outline"}
                  onClick={() => {
                    setRoutineId(r.id);
                    setReport(null);
                  }}
                >
                  {r.nameZh}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{routine.description}</p>

            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube link</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 gap-2"
                  disabled={loadingVideo}
                  onClick={loadYouTube}
                >
                  {loadingVideo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  Import
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Or upload video</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Choose file
              </Button>
            </div>

            {videoLabel && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileVideo className="h-3.5 w-3.5" />
                Loaded: {videoLabel}
              </p>
            )}

            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="button"
              className="w-full gap-2"
              disabled={!videoReady || analyzing}
              onClick={runAnalysis}
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Analyze routine
            </Button>

            {analyzing && (
              <div className="space-y-1">
                <Progress value={progress * 100} />
                <p className="text-xs text-muted-foreground">
                  Scanning poses… {Math.round(progress * 100)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Use a clear side-on or front view; avoid cropping feet or hands.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
              <video
                ref={videoRef}
                className="h-full w-full object-contain"
                controls
                playsInline
                onLoadedData={() => setVideoReady(true)}
                onError={() => {
                  setVideoReady(false);
                  setError("This video could not be played in the browser.");
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {report && (
        <Card className="border-cyan-500/20">
          <CardHeader>
            <CardTitle>Results — {routine.nameZh}</CardTitle>
            <CardDescription>{report.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <ScoreTile label="Overall" value={report.overallScore} />
              <ScoreTile label="Sequence" value={report.sequenceScore} />
              <ScoreTile label="Leg stance" value={report.legScore} />
              <ScoreTile label="Hands / sword" value={report.handScore} />
            </div>

            <ol className="space-y-3">
              {report.moves.map((m) => (
                <li
                  key={m.move.id}
                  className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-muted-foreground">
                        {m.move.order}.{" "}
                      </span>
                      <span className="font-medium">
                        {m.move.name}{" "}
                        <span className="text-muted-foreground">
                          ({m.move.nameZh})
                        </span>
                      </span>
                    </div>
                    <Badge variant={moveStatusVariant(m.status)}>
                      {moveStatusLabel(m.status)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{m.notes}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Leg {m.legScore}/100 · Hands {m.handScore}/100
                    {m.matchedTimeSec != null &&
                      ` · ~${m.matchedTimeSec.toFixed(1)}s`}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Expected sequence (reference)</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            {routine.moves.map((m) => (
              <li key={m.id}>
                {m.nameZh} — {m.name}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
