# Contributing

Thanks for helping improve **Stance Judge**.

## Planning & features

All product and UX planning lives under **`docs/`**:

- [docs/README.md](docs/README.md) — documentation index
- [docs/product/features.md](docs/product/features.md) — feature IDs, acceptance criteria, status
- [docs/product/roadmap.md](docs/product/roadmap.md) — phases

**Before a sizable change:** read the relevant spec in `docs/product/` and update `features.md` (status + checkboxes) in the same PR.

**Coding agents:** follow [AGENTS.md](AGENTS.md).

## Development

```bash
npm install
npm run dev          # http://localhost:4317
npm run build:pages  # static export (same as GitHub Pages)
npm run preview:pages # http://127.0.0.1:4322/stancejudge/
```

## Deploy

See [.github/DEPLOY.md](.github/DEPLOY.md). Push to `main`; production static site is published from the `gh-pages` branch (or GitHub Actions when environment rules allow).

## Canonical routine data

Coach-calibrated timings belong in `src/data/canonical/*.json`. Reference YouTube URLs: `src/data/reference-videos.json`. Regenerate placeholders:

```bash
npm run generate-canonical
```
