import Link from "next/link";
import { getReferenceVideo, getReferenceYouTubeId } from "@/lib/wushu/reference-videos";
import { ExternalLink } from "lucide-react";

type ReferenceVideoLinkProps = {
  routineId: string;
};

/** Reference clip without iframe — thumbnail + link, or local MP4 in public/. */
export function ReferenceVideoLink({ routineId }: ReferenceVideoLinkProps) {
  const ref = getReferenceVideo(routineId);
  if (!ref) {
    return (
      <p className="text-sm text-muted-foreground">
        No reference configured for this routine.
      </p>
    );
  }

  const videoId = getReferenceYouTubeId(routineId);
  const localSrc = ref.localMp4?.trim();
  const youtubeUrl = ref.youtubeUrl?.trim();

  if (!youtubeUrl && !localSrc) {
    return (
      <p className="text-sm text-muted-foreground">
        Add <code className="text-xs">youtubeUrl</code> or{" "}
        <code className="text-xs">localMp4</code> in{" "}
        <code className="text-xs">reference-videos.json</code>.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {localSrc ? (
        <video
          src={localSrc}
          className="aspect-video w-full rounded-lg bg-black ring-1 ring-white/10"
          controls
          playsInline
          preload="metadata"
        />
      ) : videoId ? (
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-video overflow-hidden rounded-lg ring-1 ring-white/10"
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={ref.label ?? "Reference routine on YouTube"}
            className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            Open on YouTube
          </span>
        </a>
      ) : null}

      {youtubeUrl && (
        <Link
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-cyan-400 underline-offset-4 hover:underline"
        >
          {ref.label ?? "Watch reference on YouTube"}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      )}
      {localSrc && (
        <p className="text-xs text-muted-foreground">
          Self-hosted reference (no iframe): {localSrc}
        </p>
      )}
    </div>
  );
}
