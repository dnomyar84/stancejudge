import { describe, expect, it } from "vitest";
import {
  isYouTubeUrl,
  normalizeYouTubeUrl,
  parseYouTubeVideoId,
} from "@/lib/youtube";

describe("youtube URL helpers", () => {
  it("normalizes URLs without https", () => {
    expect(normalizeYouTubeUrl("youtube.com/watch?v=abc123")).toBe(
      "https://youtube.com/watch?v=abc123",
    );
  });

  it("parses watch URLs with extra query params", () => {
    const url = "youtube.com/watch?v=c1cgyuk-r7o&pp=ygUMc2kgZHVhbiBqaWFu";
    expect(isYouTubeUrl(url)).toBe(true);
    expect(parseYouTubeVideoId(url)).toBe("c1cgyuk-r7o");
  });

  it("parses youtu.be links", () => {
    expect(parseYouTubeVideoId("https://youtu.be/xyz789")).toBe("xyz789");
  });
});
