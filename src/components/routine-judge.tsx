"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { LiveFullscreenShell } from "@/components/live-fullscreen-shell";
import { PoseRail } from "@/components/pose-rail";
import { RoutineAnalysisResults } from "@/components/routine-analysis-results";
import { ReferenceVideoLink } from "@/components/reference-video-link";
import { getPoseLandmarker } from "@/lib/pose/landmarker-client";
import { ROUTINES, getRoutinePackage } from "@/lib/wushu/routines";
import { getReferenceVideo } from "@/lib/wushu/reference-videos";
import {
  buildRailFromReport,
  railScrollProgress,
} from "@/lib/wushu/playback";
import { analyzeRoutineVideo } from "@/lib/wushu/sequence";
import type { RoutineAnalysisReport } from "@/lib/wushu/types";
import { loadYouTubeAsBlobUrl } from "@/lib/load-youtube-video";
import { isYouTubeUrl, normalizeYouTubeUrl } from "@/lib/youtube";
import {
  FileVideo,
  Link2,
  Loader2,
  PanelBottomOpen,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function RoutineJudge({ onBack }: { onBack?: () => void }) {
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
  const [sourceOpen, setSourceOpen] = useState(true);

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
        setSourceOpen(false);
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
      setSourceOpen(true);
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
        normalizeYouTubeUrl(youtubeUrl),
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

  const subtitle = scanning
    ? `Scanning ${Math.round(scanProgress * 100)}%`
    : report
      ? `Overall ${report.overallScore} · tap scores below`
      : videoLabel ?? "Upload or stream your performance";

  const showSourcePanel = sourceOpen && !scanning;

  return (
    <LiveFullscreenShell
      onBack={onBack}
      title="Routine video"
      subtitle={subtitle}
      topOverlay={
        <>
          {videoReady && (
            <PoseRail
              variant="overlay"
              moves={railMoves}
              scrollProgress={scrollProgress}
              scanning={scanning}
            />
          )}
          <div className="flex gap-2 overflow-x-auto px-3 pb-2 pt-1">
            {ROUTINES.map((r) => (
              <Button
                key={r.id}
                type="button"
                size="sm"
                disabled={scanning}
                variant={routineId === r.id ? "default" : "secondary"}
                className={cn(
                  "shrink-0 rounded-full",
                  routineId !== r.id && "bg-black/40 text-white hover:bg-black/55",
                )}
                onClick={() => {
                  setRoutineId(r.id);
                  setReport(null);
                }}
              >
                {r.nameZh}
              </Button>
            ))}
          </div>
        </>
      }
      bottomPanel={
        report
          ? (
              <RoutineAnalysisResults
                variant="overlay"
                routineNameZh={routine.nameZh}
                report={report}
              />
            )
          : showSourcePanel
            ? (
                <div className="space-y-3 rounded-2xl bg-black/60 p-4 backdrop-blur-md">
                  <p className="text-xs text-white/70">
                    Same pose engine as live camera — upload MP4 or stream YouTube
                    (no iframe).
                  </p>
                  <ReferenceVideoLink routineId={routineId} />
                  <div className="flex flex-wrap gap-2">
                    <Input
                      className="min-w-[10rem] flex-1 border-white/20 bg-black/40 text-white"
                      placeholder="youtube.com/watch?v=…"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!getReferenceVideo(routineId)?.youtubeUrl?.trim()}
                      onClick={() => {
                        const ref = getReferenceVideo(routineId)?.youtubeUrl?.trim();
                        if (ref) setYoutubeUrl(ref);
                      }}
                    >
                      Coach link
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1"
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
                    className="w-full gap-2 border-white/25 bg-black/30 text-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload MP4
                  </Button>
                  {youtubeLoading && (
                    <Progress value={youtubeProgress * 100} className="h-1" />
                  )}
                  {error && (
                    <p className="text-xs text-red-300">{error}</p>
                  )}
                </div>
              )
            : undefined
      }
      bottomBar={
        <div className="flex flex-col items-center gap-2">
          {videoLabel && (
            <p className="flex max-w-sm items-center gap-2 truncate text-xs text-white/70">
              <FileVideo className="h-3.5 w-3.5 shrink-0" />
              {videoLabel}
            </p>
          )}
          {scanning && (
            <Progress value={scanProgress * 100} className="h-1 w-full max-w-xs" />
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {videoReady && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-full bg-black/50 text-white"
                disabled={scanning}
                onClick={() => setSourceOpen((o) => !o)}
              >
                <PanelBottomOpen className="mr-1 h-4 w-4" />
                Source
              </Button>
            )}
            {videoReady && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-full bg-black/50 text-white"
                disabled={scanning}
                onClick={startScan}
              >
                Rescan
              </Button>
            )}
            {report && (
              <Badge className="bg-emerald-600/90 text-white">
                {report.overallScore} overall
              </Badge>
            )}
          </div>
        </div>
      }
      stage={
        <div className="relative h-full w-full bg-black">
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
          {!videoReady && !youtubeLoading && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/70">
              Add a student video to score the pose rail
            </div>
          )}
          {scanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
            </div>
          )}
        </div>
      }
    />
  );
}
