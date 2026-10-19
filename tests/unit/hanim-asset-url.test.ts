import { afterEach, describe, expect, it, vi } from "vitest";
import { hanimModelUrl } from "@/lib/motion/retarget/hanim/asset-url";

describe("hanimModelUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses NEXT_PUBLIC_BASE_PATH when set", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/stancejudge");
    expect(hanimModelUrl()).toBe("/stancejudge/models/xbot.glb");
  });

  it("falls back to root path without base", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    expect(hanimModelUrl()).toBe("/models/xbot.glb");
  });
});
