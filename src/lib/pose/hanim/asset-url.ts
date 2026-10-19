/** Static asset URL (GitHub Pages basePath /stancejudge). */
export function hanimModelUrl(file = "/models/xbot.glb"): string {
  const path = file.startsWith("/") ? file : `/${file}`;
  if (typeof window === "undefined") return path;
  const onPages = window.location.pathname.startsWith("/stancejudge");
  return onPages ? `/stancejudge${path}` : path;
}
