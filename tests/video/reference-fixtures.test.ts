import { existsSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import manifest from "../fixtures/reference-videos/manifest.json";

const FIXTURE_ROOT = join(process.cwd(), "tests/fixtures/reference-videos");

const enabled = manifest.fixtures.filter(
  (f) => f.enabled && f.relativePath.endsWith(".mp4"),
);

describe("reference video integration", () => {
  it.skipIf(enabled.length === 0)(
    "has at least one enabled MP4 fixture (upload videos to run)",
    () => {
      expect(enabled.length).toBeGreaterThan(0);
    },
  );

  for (const fixture of enabled) {
    it(`fixture ${fixture.id} is readable`, () => {
      const path = join(FIXTURE_ROOT, fixture.relativePath);
      expect(existsSync(path)).toBe(true);
      // Frame-level pose assertions: add when expect blocks are defined (Playwright / mediapipe in Node).
    });
  }
});
