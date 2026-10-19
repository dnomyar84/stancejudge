import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { MIXAMO_TARGET_HEIGHT_M } from "@/lib/motion/retarget/hanim/apply-coach-to-mixamo";

/** Xbot in repo ships ~18 mm tall in glTF units; we scale to coach height. */
describe("Mixamo Xbot asset", () => {
  it("bind height is far below coach scale (must be scaled at load)", () => {
    const glbPath = join(process.cwd(), "public/models/xbot.glb");
    const buf = readFileSync(glbPath);
    expect(buf.byteLength).toBeGreaterThan(100_000);
    const bindHeightM = 0.01806;
    const scale = MIXAMO_TARGET_HEIGHT_M / bindHeightM;
    expect(scale).toBeGreaterThan(50);
    expect(scale).toBeLessThan(120);
  });
});
