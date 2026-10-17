import referenceVideos from "@/data/reference-videos.json";
import { parseYouTubeVideoId } from "@/lib/youtube";

export type ReferenceVideoConfig = {
  youtubeUrl: string;
  label: string;
};

export function getReferenceVideo(
  routineId: string,
): ReferenceVideoConfig | undefined {
  const entry = referenceVideos[routineId as keyof typeof referenceVideos];
  if (!entry) return undefined;
  return entry;
}

export function getReferenceYouTubeId(routineId: string): string | null {
  const ref = getReferenceVideo(routineId);
  if (!ref?.youtubeUrl) return null;
  return parseYouTubeVideoId(ref.youtubeUrl);
}

export function getReferenceEmbedUrl(routineId: string): string | null {
  const id = getReferenceYouTubeId(routineId);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}
