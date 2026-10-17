import {
  isYouTubeUrl,
  normalizeYouTubeUrl,
  parseYouTubeVideoId,
} from "@/lib/youtube";

function apiBase(): string {
  const proxy = process.env.NEXT_PUBLIC_YOUTUBE_PROXY?.replace(/\/$/, "");
  if (proxy) return proxy;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}/api/youtube`;
}

export type YouTubeLoadProgress = {
  phase: "resolving" | "downloading";
  ratio: number;
};

/**
 * Pull YouTube into a blob URL on a <video> you own — same pipeline as file upload
 * and (after decode) similar to getUserMedia → video for MediaPipe detectForVideo.
 */
export async function loadYouTubeAsBlobUrl(
  youtubeUrl: string,
  onProgress?: (p: YouTubeLoadProgress) => void,
): Promise<{ blobUrl: string; videoId: string }> {
  const normalized = normalizeYouTubeUrl(youtubeUrl);
  if (!isYouTubeUrl(normalized)) {
    throw new Error("Paste a valid YouTube watch or youtu.be link.");
  }
  const videoId = parseYouTubeVideoId(normalized);
  if (!videoId) {
    throw new Error("Could not read video ID from this link.");
  }

  onProgress?.({ phase: "resolving", ratio: 0 });

  const endpoint = `${apiBase()}?url=${encodeURIComponent(normalized)}`;
  const res = await fetch(endpoint);

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    const onPages =
      typeof window !== "undefined" &&
      window.location.hostname.includes("github.io");
    throw new Error(
      body?.error ??
        (onPages
          ? "YouTube Stream needs a proxy on GitHub Pages (deploy youtube-proxy/ to Vercel, set YOUTUBE_PROXY_URL in repo Actions vars, rebuild). For now: download this video as MP4 and use Upload."
          : "Could not stream this YouTube video. Try npm run dev (local /api/youtube), deploy youtube-proxy/, or upload an MP4."),
    );
  }

  const total = Number(res.headers.get("content-length"));
  const reader = res.body?.getReader();
  if (!reader) {
    const blob = await res.blob();
    onProgress?.({ phase: "downloading", ratio: 1 });
    return { blobUrl: URL.createObjectURL(blob), videoId };
  }

  const chunks: Uint8Array[] = [];
  let received = 0;
  onProgress?.({ phase: "downloading", ratio: 0 });

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      if (total > 0) {
        onProgress?.({ phase: "downloading", ratio: received / total });
      }
    }
  }

  const blob = new Blob(chunks as BlobPart[], {
    type: res.headers.get("content-type") ?? "video/mp4",
  });
  onProgress?.({ phase: "downloading", ratio: 1 });
  return { blobUrl: URL.createObjectURL(blob), videoId };
}
