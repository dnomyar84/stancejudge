/** Static asset URL (GitHub Pages basePath /stancejudge). */
export function hanimModelUrl(file = "/models/xbot.glb"): string {
  const path = file.startsWith("/") ? file : `/${file}`;
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_BASE_PATH ?? ""
      : "";
  if (fromEnv) return `${fromEnv}${path}`;
  if (typeof window !== "undefined") {
    const base = document.documentElement.dataset.basePath;
    if (base) return `${base}${path}`;
    if (window.location.pathname.startsWith("/stancejudge")) {
      return `/stancejudge${path}`;
    }
  }
  return path;
}
