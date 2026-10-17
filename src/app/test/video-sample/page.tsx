"use client";

import { useCallback, useRef, useState } from "react";
import { getPoseLandmarker } from "@/lib/pose/landmarker-client";
import { evaluateFramesAsSanDuanChangQuan } from "@/lib/wushu/evaluate-san-duan";
import { sampleVideoPoses } from "@/lib/wushu/sequence";

/** Playwright-only harness: sample poses and score vs 三段长拳. */
export default function VideoSampleTestPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<string>("");

  const onFile = useCallback((file: File | null) => {
    if (!file || !videoRef.current) return;
    videoRef.current.src = URL.createObjectURL(file);
    setResult("");
  }, []);

  const run = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setResult(JSON.stringify({ error: "video_not_ready" }));
      return;
    }
    try {
      const landmarker = await getPoseLandmarker();
      const frames = await sampleVideoPoses(
        video,
        landmarker,
        "unarmed",
        () => {},
      );
      const evaluation = evaluateFramesAsSanDuanChangQuan(
        frames,
        video.duration,
      );
      setResult(JSON.stringify(evaluation));
    } catch (e) {
      setResult(
        JSON.stringify({
          error: e instanceof Error ? e.message : "sample_failed",
        }),
      );
    }
  }, []);

  return (
    <div className="p-4">
      <input
        data-testid="video-file"
        type="file"
        accept="video/*"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <video
        ref={videoRef}
        data-testid="video-el"
        className="max-w-md"
        muted
        playsInline
        onLoadedData={() => {}}
      />
      <button type="button" data-testid="video-run" onClick={run}>
        Run
      </button>
      <pre data-testid="video-result">{result}</pre>
    </div>
  );
}
