import { isYouTubeUrl, parseYouTubeVideoId } from "@/lib/youtube";

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
  if (!isYouTubeUrl(youtubeUrl)) {
    throw new Error("Paste a valid YouTube watch or youtu.be link.");
  }
  const videoId = parseYouTubeVideoId(youtubeUrl);
  if (!videoId) {
    throw new Error("Could not read video ID from this link.");
  }

  onProgress?.({ phase: "resolving", ratio: 0 });

  const endpoint = `${apiBase()}?url=${encodeURIComponent(youtubeUrl.trim())}`;
  const res = await fetch(endpoint);

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(
      body?.error ??
        "Could not stream this YouTube video in the browser. On GitHub Pages, set NEXT_PUBLIC_YOUTUBE_PROXY to a small proxy (see youtube-proxy/) or upload an MP4.",
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
