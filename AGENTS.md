# Agent guide — Stance Judge

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product source of truth

1. Start at [`docs/README.md`](docs/README.md).
2. Pick work from [`docs/product/features.md`](docs/product/features.md) — highest **P** priority with status `planned` (or continue `in_progress`).
3. Match UX to [`docs/product/ux-flows.md`](docs/product/ux-flows.md) and mode specs:
   - Live: [`docs/product/live-practice-spec.md`](docs/product/live-practice-spec.md)
   - Routine video: [`docs/product/routine-video-spec.md`](docs/product/routine-video-spec.md)
4. Visuals: [`docs/product/ui-design-system.md`](docs/product/ui-design-system.md).

## Implementation conventions

- **Stack:** Next.js static export, TypeScript, Tailwind, shadcn/ui, MediaPipe client-only.
- **Commands:** `npm run dev` (port 4317), `npm run build:pages`, `npm run preview:pages` (local Pages URL shape).
- **Deploy:** push `main`; production site uses `gh-pages` branch or Actions (see `.github/DEPLOY.md`).
- **Scope:** One feature ID per PR when possible; update feature checkboxes and status in `features.md`.
- **No secrets** in repo; never commit PATs.

## Repo map (quick)

| Area | Location |
| --- | --- |
| Routine video UI | `src/components/routine-judge.tsx` |
| Live camera UI | `src/components/stance-judge.tsx` |
| App shell / tabs | `src/components/wushu-app.tsx` |
| Coach admin | `src/components/admin-settings.tsx` |
| Syllabus + canonical | `src/lib/wushu/`, `src/data/canonical/` |

## Testing expectations

- Run `npm run build:pages` before claiming deploy readiness.
- Live camera: verify skeleton aligns with mirrored preview (CSS mirror only, not `drawPose` mirror).
- Routine: pose rail updates during playback after scan.
