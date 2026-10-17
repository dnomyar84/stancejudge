"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  COACH_SESSION_KEY,
  clearCanonicalOverride,
  coachPinRequired,
  getCanonicalOverride,
  saveCanonicalOverride,
  saveReferenceConfig,
  saveReferenceVideoBlob,
  verifyCoachPin,
  type ReferenceConfigMap,
} from "@/lib/admin/store";
import { loadYouTubeAsBlobUrl } from "@/lib/load-youtube-video";
import { getPoseLandmarker } from "@/lib/pose/landmarker-client";
import { buildCanonicalFromFrames } from "@/lib/wushu/canonical";
import { getReferenceVideo } from "@/lib/wushu/reference-videos";
import { ROUTINES, getRoutinePackage } from "@/lib/wushu/routines";
import { sampleVideoPoses } from "@/lib/wushu/sequence";
import type { CanonicalRoutine } from "@/lib/wushu/types";
import { parseYouTubeVideoId } from "@/lib/youtube";
import { isYouTubeUrl, normalizeYouTubeUrl } from "@/lib/youtube";
import referenceVideosBundled from "@/data/reference-videos.json";
import { Link2, Loader2, Upload } from "lucide-react";

export function AdminSettings() {
  const [unlocked, setUnlocked] = useState(!coachPinRequired());
  const [pinInput, setPinInput] = useState("");
  const [routineId, setRoutineId] = useState(ROUTINES[0].id);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [label, setLabel] = useState("");
  const [localMp4Path, setLocalMp4Path] = useState("");
  const [canonical, setCanonical] = useState<CanonicalRoutine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoLabel, setVideoLabel] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const { routine } = getRoutinePackage(routineId);

  useEffect(() => {
    if (sessionStorage.getItem(COACH_SESSION_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    const ref = getReferenceVideo(routineId);
    setYoutubeUrl(ref?.youtubeUrl?.trim() ?? "");
    setLabel(ref?.label ?? "");
    setLocalMp4Path(ref?.localMp4?.trim() ?? "");
    setCanonical(getCanonicalOverride(routineId));
  }, [routineId]);

  const attachVideo = useCallback((src: string, label: string) => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const v = videoRef.current;
    if (!v) return;
    if (src.startsWith("blob:")) blobUrlRef.current = src;
    v.src = src;
    v.crossOrigin = "anonymous";
    setVideoLabel(label);
    setVideoReady(false);
  }, []);

  const onUnlock = () => {
    if (verifyCoachPin(pinInput)) {
      sessionStorage.setItem(COACH_SESSION_KEY, "1");
      setUnlocked(true);
    } else {
      setError("Wrong coach PIN.");
    }
  };

  const loadFile = async (file: File | null) => {
    if (!file) return;
    attachVideo(URL.createObjectURL(file), file.name);
    await saveReferenceVideoBlob(routineId, file);
  };

  const loadYouTube = async () => {
    if (!isYouTubeUrl(youtubeUrl)) {
      setError("Invalid YouTube URL.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { blobUrl } = await loadYouTubeAsBlobUrl(
        normalizeYouTubeUrl(youtubeUrl),
        (p) =>
        setProgress(p.phase === "resolving" ? 0.05 : p.ratio),
      );
      attachVideo(blobUrl, "YouTube (blob on video)");
      const res = await fetch(blobUrl);
      await saveReferenceVideoBlob(routineId, await res.blob());
    } catch (e) {
      setError(e instanceof Error ? e.message : "YouTube load failed.");
    } finally {
      setBusy(false);
    }
  };

  const runCalibrate = async () => {
    const video = videoRef.current;
    if (!video || !videoReady) {
      setError("Load reference video first (file or YouTube Stream).");
      return;
    }
    setBusy(true);
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
      const yt = youtubeUrl.trim() || null;
      const built = buildCanonicalFromFrames(
        routine,
        frames,
        video.duration,
        {
          youtubeId: yt ? parseYouTubeVideoId(yt) : null,
          youtubeUrl: yt,
          label: label || undefined,
        },
      );
      setCanonical(built);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calibration failed.");
    } finally {
      setBusy(false);
    }
  };

  const saveToBrowser = () => {
    if (!canonical) return;
    saveCanonicalOverride(routineId, canonical);
    const config: ReferenceConfigMap = {
      ...referenceVideosBundled,
      [routineId]: {
        youtubeUrl: youtubeUrl.trim(),
        label: label.trim(),
        localMp4: localMp4Path.trim(),
      },
    };
    saveReferenceConfig(config);
    setError(null);
    alert("Saved for this browser. Kids on other devices need exported JSON committed to the repo.");
  };

  const downloadCanonical = () => {
    if (!canonical) return;
    const blob = new Blob([JSON.stringify(canonical, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${routineId}.json`;
    a.click();
  };

  if (!unlocked) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-16">
        <h1 className="text-xl font-semibold">Coach settings</h1>
        {coachPinRequired() ? (
          <>
            <Input
              type="password"
              placeholder="Coach PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            <Button onClick={onUnlock}>Unlock</Button>
          </>
        ) : (
          <Button onClick={() => setUnlocked(true)}>Continue</Button>
        )}
        <Link href="/" className="text-center text-sm text-cyan-400 underline">
          Back to app
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Coach admin</h1>
        <Link href="/" className="text-sm text-cyan-400 underline">
          ← Main app
        </Link>
      </div>

      <Alert>
        <AlertTitle>YouTube → blob → same input as upload</AlertTitle>
        <AlertDescription>
          When you Stream a YouTube link, we put bytes on a{" "}
          <code className="text-xs">blob:</code> URL attached to{" "}
          <code className="text-xs">&lt;video&gt;</code>. That element is the
          same input source MediaPipe uses for calibration and student scoring
          (not an iframe).
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-2">
        {ROUTINES.map((r) => (
          <Button
            key={r.id}
            size="sm"
            variant={routineId === r.id ? "default" : "outline"}
            onClick={() => setRoutineId(r.id)}
          >
            {r.nameZh}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reference metadata</CardTitle>
          <CardDescription>
            Saved to this browser; export JSON to ship on GitHub Pages for
            everyone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="YouTube URL (metadata + optional Stream)"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          <Input
            placeholder="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Input
            placeholder="Deploy path e.g. /refs/si-duan-jian.mp4"
            value={localMp4Path}
            onChange={(e) => setLocalMp4Path(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reference video source</CardTitle>
          <CardDescription>Upload MP4 or Stream from YouTube into video tag.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="gap-2"
              disabled={busy}
              onClick={loadYouTube}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Stream YouTube
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => loadFile(e.target.files?.[0] ?? null)}
            />
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload MP4
            </Button>
          </div>
          {videoLabel && (
            <p className="text-xs text-muted-foreground">Loaded: {videoLabel}</p>
          )}
          {busy && <Progress value={progress * 100} />}
          <video
            ref={videoRef}
            className="aspect-video w-full rounded-lg bg-black"
            controls
            playsInline
            crossOrigin="anonymous"
            onLoadedData={() => setVideoReady(true)}
          />
          <Button disabled={busy || !videoReady} onClick={runCalibrate}>
            Build sequence from this video
          </Button>
        </CardContent>
      </Card>

      {canonical && (
        <Card>
          <CardHeader>
            <CardTitle>
              Sequence ({canonical.moves.length} poses) —{" "}
              {canonical.calibrated ? "calibrated" : "draft"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="max-h-72 space-y-1 overflow-y-auto text-sm">
              {canonical.moves.map((m) => (
                <li key={m.id} className="text-muted-foreground">
                  <span className="text-foreground">{m.nameZh}</span> — {m.name}{" "}
                  ({m.startSec.toFixed(1)}s–{m.endSec.toFixed(1)}s)
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-2">
              <Button onClick={saveToBrowser}>Save to this browser</Button>
              <Button variant="secondary" onClick={downloadCanonical}>
                Download canonical JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearCanonicalOverride(routineId);
                  setCanonical(null);
                }}
              >
                Clear browser sequence
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Commit downloaded file to{" "}
              <code>src/data/canonical/{routineId}.json</code> and redeploy for
              all users.
            </p>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
