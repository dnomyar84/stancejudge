const YOUTUBE_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "m.youtube.com",
];

export function normalizeYouTubeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, "")}`;
}

export function parseYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(normalizeYouTubeUrl(url));
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      const shorts = parsed.pathname.match(/^\/shorts\/([^/]+)/);
      if (shorts) return shorts[1];
      const embed = parsed.pathname.match(/^\/embed\/([^/]+)/);
      if (embed) return embed[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeYouTubeUrl(url));
    const host = parsed.hostname.replace(/^www\./, "");
    return YOUTUBE_HOSTS.some((h) => h.replace(/^www\./, "") === host);
  } catch {
    return false;
  }
}
