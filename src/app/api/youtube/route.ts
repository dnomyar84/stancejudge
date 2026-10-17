import ytdl from "@distube/ytdl-core";
import { NextRequest } from "next/server";
import {
  isYouTubeUrl,
  normalizeYouTubeUrl,
  parseYouTubeVideoId,
} from "@/lib/youtube";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw?.trim()) {
    return Response.json({ error: "Missing url query parameter." }, { status: 400 });
  }

  const normalized = normalizeYouTubeUrl(raw);
  if (!isYouTubeUrl(normalized)) {
    return Response.json({ error: "Invalid YouTube URL." }, { status: 400 });
  }

  const videoId = parseYouTubeVideoId(normalized);
  if (!videoId) {
    return Response.json({ error: "Could not read video ID." }, { status: 400 });
  }

  const watch = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const info = await ytdl.getInfo(watch);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "lowestvideo",
      filter: (f) => f.hasVideo && f.hasAudio,
    });
    if (!format?.url) {
      return Response.json({ error: "No playable format found." }, { status: 502 });
    }

    const upstream = await fetch(format.url);
    if (!upstream.ok || !upstream.body) {
      return Response.json(
        { error: "Could not download from YouTube CDN." },
        { status: 502 },
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": format.mimeType ?? "video/mp4",
        "Access-Control-Allow-Origin": "*",
        ...(upstream.headers.get("content-length")
          ? { "Content-Length": upstream.headers.get("content-length")! }
          : {}),
      },
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "YouTube import failed.";
    return Response.json(
      {
        error:
          message.includes("bot") || message.includes("Sign in")
            ? "YouTube blocked automated download from this server. Download the video as MP4 and use Upload, or use a home-network YouTube proxy."
            : message,
      },
      { status: 502 },
    );
  }
}
