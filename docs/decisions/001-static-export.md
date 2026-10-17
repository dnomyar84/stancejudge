# ADR-001: Static export + no backend on GitHub Pages

- **Status:** accepted
- **Date:** 2026-10-17

## Context

Hosting must be free, kid-club friendly, and work on GitHub Pages without a always-on server.

## Decision

Use Next.js `output: "export"` when `GITHUB_PAGES=true`. Pose runs in the browser (MediaPipe). Optional YouTube byte proxy is serverless (Vercel) or dev-only `/api/youtube`.

## Consequences

- No server-side sessions or databases.
- Coach data: committed JSON + browser IndexedDB exports.
- Build strips API routes during export (`scripts/static-export-build.mjs`).
