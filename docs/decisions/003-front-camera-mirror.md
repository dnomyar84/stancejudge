# ADR-003: Front camera display mirror

- **Status:** accepted
- **Date:** 2026-10-17

## Context

Users expect a selfie-style mirrored preview. MediaPipe landmarks are in raw frame coordinates.

## Decision

Apply `scale-x: -1` via CSS to both `<video>` and overlay `<canvas>`. Call `drawPose(..., mirror: false)`. Stance analysis uses semantic left/right from the model, not screen position.

## Consequences

Do not pass `mirror: true` to `drawPose` while CSS mirror is enabled (double flip).
