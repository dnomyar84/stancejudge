import { parseYouTubeVideoId } from "@/lib/youtube";
import ytdl from "@distube/ytdl-core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter." }, { status: 400 });
  }

  const id = parseYouTubeVideoId(url);
  if (!id) {
    return NextResponse.json({ error: "Invalid YouTube link." }, { status: 400 });
  }

  const canonical = `https://www.youtube.com/watch?v=${id}`;
  if (!ytdl.validateURL(canonical)) {
    return NextResponse.json({ error: "Unsupported YouTube URL." }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(canonical);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "lowestvideo",
      filter: (f) => f.hasVideo && f.hasAudio,
    });
    if (!format?.url) {
      return NextResponse.json(
        {
          error:
            "Could not resolve a playable format. Try downloading the video and uploading the file instead.",
        },
        { status: 502 },
      );
    }

    const upstream = await fetch(format.url);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "Failed to fetch video stream from YouTube." },
        { status: 502 },
      );
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": format.mimeType ?? "video/mp4",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "YouTube import failed (often due to age/region restrictions). Upload an MP4/WebM file instead.",
      },
      { status: 502 },
    );
  }
}
