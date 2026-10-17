/**
 * Optional Vercel serverless proxy for GitHub Pages (no Node API on static host).
 * Deploy: cd youtube-proxy && vercel deploy
 * Then set NEXT_PUBLIC_YOUTUBE_PROXY=https://YOUR.vercel.app/api/youtube
 */
import ytdl from "@distube/ytdl-core";

function normalizeUrl(url) {
  const t = String(url).trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t.replace(/^\/\//, "")}`;
}

function parseId(url) {
  try {
    const u = new URL(normalizeUrl(url));
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0];
    if (u.searchParams.get("v")) return u.searchParams.get("v");
  } catch {
    return null;
  }
  return null;
}

export default async function handler(req, res) {
  const url = normalizeUrl(req.query.url ?? "");
  if (!url) {
    res.status(400).json({ error: "Missing url" });
    return;
  }
  const id = parseId(url);
  if (!id) {
    res.status(400).json({ error: "Invalid YouTube URL" });
    return;
  }
  const watch = `https://www.youtube.com/watch?v=${id}`;
  try {
    const info = await ytdl.getInfo(watch);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "lowestvideo",
      filter: (f) => f.hasVideo && f.hasAudio,
    });
    if (!format?.url) {
      res.status(502).json({ error: "No format" });
      return;
    }
    const upstream = await fetch(format.url);
    res.setHeader("Content-Type", format.mimeType ?? "video/mp4");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(200).send(buf);
  } catch {
    res.status(502).json({ error: "YouTube import failed" });
  }
}
