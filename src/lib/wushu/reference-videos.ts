import { getReferenceConfigOverride } from "@/lib/admin/store";
import referenceVideos from "@/data/reference-videos.json";
import { parseYouTubeVideoId } from "@/lib/youtube";

export type ReferenceVideoConfig = {
  youtubeUrl?: string;
  label?: string;
  /** Path under public/, e.g. /refs/si-duan-jian.mp4 — native video element, no iframe */
  localMp4?: string;
};

export function getReferenceVideo(
  routineId: string,
): ReferenceVideoConfig | undefined {
  const overrides =
    typeof window !== "undefined" ? getReferenceConfigOverride() : null;
  const entry =
    overrides?.[routineId] ??
    referenceVideos[routineId as keyof typeof referenceVideos];
  if (!entry) return undefined;
  return entry;
}

export function getReferenceYouTubeId(routineId: string): string | null {
  const ref = getReferenceVideo(routineId);
  if (!ref?.youtubeUrl) return null;
  return parseYouTubeVideoId(ref.youtubeUrl);
}
