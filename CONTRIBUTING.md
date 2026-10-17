# Development workflow

This repository is developed by a **single automated agent**. There is no separate contributor process — everything is tracked on **GitHub only**.

**Repo:** https://github.com/dnomyar84/stancejudge

## Where things live

| What | Where |
| --- | --- |
| Product vision, UX, features, roadmap | `docs/product/` |
| Architecture & ADRs | `docs/architecture/`, `docs/decisions/` |
| Implementation guide | `AGENTS.md` |
| Deploy steps | `.github/DEPLOY.md` |
| App code | `src/` |
| Committed canonical routines | `src/data/canonical/` |

## Commands

```bash
npm install
npm run dev              # http://localhost:4317
npm run build:pages
npm run preview:pages    # http://127.0.0.1:4322/stancejudge/
```

## Changing the product

1. Edit or extend specs under `docs/product/` when the plan changes.
2. Update [`docs/product/features.md`](docs/product/features.md) (ID, status, acceptance criteria).
3. Implement on `main`, push to GitHub, deploy static site when needed (see `.github/DEPLOY.md`).
