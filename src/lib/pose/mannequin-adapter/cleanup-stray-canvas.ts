/** Remove mannequin-js demo canvases wrongly attached to document.body. */
export function removeStrayFullscreenCanvases(): number {
  let removed = 0;
  for (const el of document.body.children) {
    if (el.tagName !== "CANVAS") continue;
    const style = (el as HTMLCanvasElement).style;
    const fixed =
      style.position === "fixed" ||
      style.cssText.includes("position:fixed") ||
      style.cssText.includes("position: fixed");
    const full =
      style.width === "100%" ||
      style.cssText.includes("width:100%") ||
      style.cssText.includes("width: 100%");
    if (fixed || full) {
      el.remove();
      removed += 1;
    }
  }
  return removed;
}
