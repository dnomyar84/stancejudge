/** Prefix for static assets and routes (GitHub Pages: `/stancejudge`). */
export function appBasePath(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_PATH) {
    return process.env.NEXT_PUBLIC_BASE_PATH;
  }
  if (typeof document !== "undefined") {
    const fromDom = document.documentElement.dataset.basePath;
    if (fromDom) return fromDom;
  }
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/stancejudge")) {
    return "/stancejudge";
  }
  return "";
}

/** Absolute app path including basePath (for `href` when not using next/link). */
export function withBasePath(path: string): string {
  const base = appBasePath();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
