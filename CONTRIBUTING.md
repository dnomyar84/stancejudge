# Development workflow

This repository is developed by a **single automated agent** with full merge/deploy rights on `main`. The project owner reviews **design intent** in `docs/product/` only — not code. Everything is tracked on **GitHub only** ([governance](docs/product/governance.md)).

**Repo:** https://github.com/dnomyar84/stancejudge

## Where things live

| What | Where |
| --- | --- |
| **Backlog (build/fix next)** | [GitHub Issues](https://github.com/dnomyar84/stancejudge/issues) |
| Product vision, UX, feature IDs, roadmap | `docs/product/` |
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
2. Open or update a **GitHub Issue** (feature or bug); see [`docs/product/issues-workflow.md`](docs/product/issues-workflow.md).
3. Update [`docs/product/features.md`](docs/product/features.md) when an F-### ships.
4. Implement on `main`, close issues when verified, deploy when needed (`.github/DEPLOY.md`).
