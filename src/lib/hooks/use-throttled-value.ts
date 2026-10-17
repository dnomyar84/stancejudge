import { useEffect, useRef, useState } from "react";

/** Limit React updates (e.g. pose HUD) to ~fps for battery on iPad. */
export function useThrottledValue<T>(value: T, intervalMs: number): T {
  const [throttled, setThrottled] = useState(value);
  const last = useRef(0);
  const pending = useRef(value);

  pending.current = value;

  useEffect(() => {
    const now = performance.now();
    if (now - last.current >= intervalMs) {
      last.current = now;
      setThrottled(pending.current);
      return;
    }
    const t = window.setTimeout(() => {
      last.current = performance.now();
      setThrottled(pending.current);
    }, intervalMs);
    return () => clearTimeout(t);
  }, [value, intervalMs]);

  return throttled;
}
