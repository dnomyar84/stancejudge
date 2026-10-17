import { existsSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import manifest from "../fixtures/reference-videos/manifest.json";

const FIXTURE_ROOT = join(process.cwd(), "tests/fixtures/reference-videos");

describe("reference video manifest", () => {
  it("has a fixtures array", () => {
    expect(manifest.version).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(manifest.fixtures)).toBe(true);
  });

  it("uses unique fixture ids", () => {
    const ids = manifest.fixtures.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("enabled fixtures must exist on disk", () => {
    const enabled = manifest.fixtures.filter((f) => f.enabled);
    for (const f of enabled) {
      const path = join(FIXTURE_ROOT, f.relativePath);
      expect(
        existsSync(path),
        `missing enabled fixture file: ${f.relativePath}`,
      ).toBe(true);
      expect(f.relativePath).not.toMatch(/\.gitkeep$/);
    }
  });
});
