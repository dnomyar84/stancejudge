"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PoseRail } from "@/components/pose-rail";
import { getPoseLandmarker } from "@/lib/pose/landmarker-client";
import { ROUTINES, getRoutinePackage } from "@/lib/wushu/routines";
import { ReferenceVideoLink } from "@/components/reference-video-link";
import {
  buildRailFromReport,
  railScrollProgress,
} from "@/lib/wushu/playback";
import { analyzeRoutineVideo } from "@/lib/wushu/sequence";
import type { MoveAlignmentStatus, RoutineAnalysisReport } from "@/lib/wushu/types";
import { SYLLABUS_NOTES } from "@/lib/wushu/competition/sources";
import { loadYouTubeAsBlobUrl } from "@/lib/load-youtube-video";
import { isYouTubeUrl } from "@/lib/youtube";
import { FileVideo, Link2, Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const scanTokenRef = useRef(0);

  const [routineId, setRoutineId] = useState(ROUTINES[0].id);
  const [videoReady, setVideoReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<RoutineAnalysisReport | null>(null);
  const [videoLabel, setVideoLabel] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeProgress, setYoutubeProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { routine, canonical } = getRoutinePackage(routineId);
  const scanComplete = report !== null && !scanning;

  const railMoves = useMemo(
    () =>
      buildRailFromReport(
        canonical,
        report,
        currentTime,
        duration || canonical.referenceDurationSec,
        scanComplete,
      ),
    [canonical, report, currentTime, duration, scanComplete],
  );

  const scrollProgress = railScrollProgress(
    currentTime,
    duration || canonical.referenceDurationSec,
  );

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const startScan = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !videoReady) return;

    const token = ++scanTokenRef.current;
    setScanning(true);
    setScanProgress(0);
    setReport(null);
    setError(null);

    try {
      const landmarker = await getPoseLandmarker();
      const result = await analyzeRoutineVideo(
        video,
        canonical,
        routine.weapon,
        landmarker,
        setScanProgress,
      );
      if (token === scanTokenRef.current) {
        setReport(result);
      }
    } catch (e) {
      if (token === scanTokenRef.current) {
        setError(e instanceof Error ? e.message : "Scan failed.");
      }
    } finally {
      if (token === scanTokenRef.current) {
        setScanning(false);
      }
    }
  }, [canonical, routine.weapon, videoReady]);

  useEffect(() => {
    if (videoReady) {
      startScan();
    }
  }, [videoReady, routineId, startScan]);

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
      setCurrentTime(0);
      setDuration(0);
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
      attachVideoSrc(URL.createObjectURL(file), file.name);
    },
    [attachVideoSrc],
  );

  const loadYouTube = useCallback(async () => {
    if (!isYouTubeUrl(youtubeUrl)) {
      setError("Paste a valid YouTube link for the student or reference clip.");
      return;
    }
    setYoutubeLoading(true);
    setYoutubeProgress(0);
    setError(null);
    try {
      const { blobUrl, videoId } = await loadYouTubeAsBlobUrl(
        youtubeUrl,
        (p) => {
          setYoutubeProgress(p.phase === "resolving" ? 0.05 : p.ratio);
        },
      );
      attachVideoSrc(blobUrl, `YouTube ${videoId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "YouTube load failed.");
    } finally {
      setYoutubeLoading(false);
    }
  }, [youtubeUrl, attachVideoSrc]);

  return (
    <>
      {videoReady && (
        <PoseRail
          moves={railMoves}
          scrollProgress={scrollProgress}
          scanning={scanning}
        />
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6">
        <Alert className="border-cyan-500/30 bg-cyan-950/20">
          <AlertTitle>Same pose engine as the live camera</AlertTitle>
          <AlertDescription>
            We do not use YouTube iframes. Reference is a thumbnail link or a
            file in <code className="text-xs">public/</code>. Student clips use
            upload or YouTube Stream (blob on <code className="text-xs">video</code>
            ) — same MediaPipe path as the webcam.
          </AlertDescription>
        </Alert>

        {!canonical.calibrated && (
          <Alert>
            <AlertTitle>Timing not locked to reference yet</AlertTitle>
            <AlertDescription>
              Move names follow the duanwei syllabus. Add champion YouTube URLs
              in <code className="text-xs">reference-videos.json</code> and{" "}
              <Link href="/admin/" className="text-cyan-400 underline">
                Admin
              </Link>{" "}
              to sync windows.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Card className="border-cyan-500/20">
            <CardHeader>
              <CardTitle>Routine & student video</CardTitle>
              <CardDescription>
                {routine.nameZh} · {canonical.moves.length} poses on the rail
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

              <div className="space-y-2">
                <p className="text-sm font-medium">Reference (no iframe)</p>
                <ReferenceVideoLink routineId={routineId} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Student video — YouTube or file</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://www.youtube.com/watch?v=…"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 gap-2"
                    disabled={youtubeLoading}
                    onClick={loadYouTube}
                  >
                    {youtubeLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    Stream
                  </Button>
                </div>
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
                  Or upload MP4
                </Button>
                {youtubeLoading && (
                  <Progress value={youtubeProgress * 100} className="h-1" />
                )}
              </div>

              {videoLabel && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileVideo className="h-3.5 w-3.5" />
                  {videoLabel}
                  {scanning && (
                    <span className="text-amber-400">
                      · scanning {Math.round(scanProgress * 100)}%
                    </span>
                  )}
                </p>
              )}

              {scanning && (
                <Progress value={scanProgress * 100} className="h-1" />
              )}

              {error && (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              {videoReady && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={scanning}
                  onClick={startScan}
                >
                  Rescan poses
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20">
            <CardHeader>
              <CardTitle>Play</CardTitle>
              <CardDescription>
                Watch the pose rail while the video runs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
                <video
                  ref={videoRef}
                  className="h-full w-full object-contain"
                  controls
                  playsInline
                  crossOrigin="anonymous"
                  onLoadedData={() => setVideoReady(true)}
                  onLoadedMetadata={(e) => {
                    setDuration(e.currentTarget.duration);
                  }}
                  onTimeUpdate={(e) => {
                    setCurrentTime(e.currentTarget.currentTime);
                  }}
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
              <CardTitle>Summary — {routine.nameZh}</CardTitle>
              <CardDescription>{report.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-4">
                <ScoreTile label="Overall" value={report.overallScore} />
                <ScoreTile label="Sequence" value={report.sequenceScore} />
                <ScoreTile label="Leg stance" value={report.legScore} />
                <ScoreTile label="Hands / sword" value={report.handScore} />
              </div>

              <ol className="max-h-64 space-y-2 overflow-y-auto">
                {report.moves.map((m) => (
                  <li
                    key={m.move.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border/40 px-3 py-2 text-sm"
                  >
                    <span>
                      {m.move.nameZh}{" "}
                      <span className="text-muted-foreground">
                        ({m.move.name})
                      </span>
                    </span>
                    <Badge variant={moveStatusVariant(m.status)}>
                      {moveStatusLabel(m.status)}
                    </Badge>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </>
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
