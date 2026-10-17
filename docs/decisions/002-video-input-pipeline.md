# ADR-002: No YouTube iframe for analysis

- **Status:** accepted
- **Date:** 2026-10-17

## Context

Cross-origin iframes cannot be sampled by canvas/MediaPipe reliably.

## Decision

Reference: thumbnail + external link or self-hosted MP4. Student/coach analysis: MP4 upload, webcam, or YouTube URL fetched as bytes → `blob:` URL on a same-origin `<video>` element → `detectForVideo`.

## Consequences

- YouTube requires a proxy on static hosting.
- Upload MP4 is the reliable fallback when proxy fails.
