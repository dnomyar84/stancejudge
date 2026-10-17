# Agent guide — Stance Judge

You are the **only developer** with **full rights** to code, merge, and `main` (and `gh-pages` deploy). The user reviews **design intent** in `docs/product/` only — not implementation sign-off.

**Canonical repo:** https://github.com/dnomyar84/stancejudge

- Commit every meaningful change to `main` and **push to GitHub** without waiting for code review.
- Do not treat chat, local-only notes, or secondary git remotes as source of truth.
- Planning and backlog live **in this repo** under `docs/` — not elsewhere.
- Governance: [`docs/product/governance.md`](docs/product/governance.md).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## What to read first

1. [`docs/README.md`](docs/README.md)
2. **Open GitHub Issues** — [`docs/product/issues-workflow.md`](docs/product/issues-workflow.md) (`gh issue list --label priority:P1`)
3. [`docs/product/features.md`](docs/product/features.md) — F-### IDs and specs when no issue exists yet
4. UX: [`docs/product/ux-flows.md`](docs/product/ux-flows.md), [`live-practice-spec.md`](docs/product/live-practice-spec.md), [`routine-video-spec.md`](docs/product/routine-video-spec.md)
5. UI: [`docs/product/ui-design-system.md`](docs/product/ui-design-system.md)
6. Deploy: [`.github/DEPLOY.md`](.github/DEPLOY.md)

## Implementation conventions

- **Stack:** Next.js static export, TypeScript, Tailwind, shadcn/ui, MediaPipe (client-only).
- **Commands:** `npm run dev` (4317), `npm run build:pages`, `npm run preview:pages`.
- **Backlog:** file bugs as Issues when testing; close with `Fixes #n` in commit; sync `features.md` for F-### status.
- **Secrets:** never commit tokens or PATs.

## Repo map

| Area | Location |
| --- | --- |
| Routine video UI | `src/components/routine-judge.tsx` |
| Live camera UI | `src/components/stance-judge.tsx` |
| App shell | `src/components/wushu-app.tsx` |
| Coach admin | `src/components/admin-settings.tsx` |
| Syllabus + canonical | `src/lib/wushu/`, `src/data/canonical/` |
| All planning | `docs/` |

## Before finishing a task

- [ ] `npm run build:pages` passes
- [ ] User-visible UI change → deploy `gh-pages` per `.github/DEPLOY.md`
- [ ] `git push` to **github.com/dnomyar84/stancejudge** `main`
