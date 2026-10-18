# Deploy to GitHub Pages

**Canonical repo (only place for code, docs, and planning):**  
https://github.com/dnomyar84/stancejudge

Product docs: [`docs/README.md`](../docs/README.md).

## Live site

https://dnomyar84.github.io/stancejudge/

## Source branches

| Branch | Role |
| --- | --- |
| `main` | Application source, `docs/`, workflows |
| `gh-pages` | Static `out/` export served by GitHub Pages (legacy source) |

Settings → Pages should use the **`gh-pages`** branch (root `/`), as configured today.

## Agent workflow (sole developer)

**Hard rules (see also [`AGENTS.md`](../AGENTS.md)):**

1. **Always push to `main`** on `https://github.com/dnomyar84/stancejudge` (`git push github main` or `origin` if it points there). Do not leave work only on a Cursor/tmp remote.
2. **Always update GitHub Pages after every push to `main`** — the live site must not lag `main`.

**How to publish Pages:**

| Method | When |
| --- | --- |
| **CI (default)** | Push to `main` → `.github/workflows/deploy-pages.yml` builds and force-pushes `out/` to `gh-pages`. |
| **Manual / agent** | `npm run deploy:pages` (build + push `gh-pages`) if you need the site updated immediately or CI is down. |

Before deploy when reference videos changed: `npm run generate-canonical`.

Implement on `main`; update [`docs/product/features.md`](../docs/product/features.md) in the same commit when closing a feature.

## Clone (any machine)

```bash
git clone https://github.com/dnomyar84/stancejudge.git
cd stancejudge
npm install
npm run dev
```

## Local verify (matches Pages)

```bash
npm run build:pages
npm run preview:pages
```

Open **http://127.0.0.1:4322/stancejudge/** — not the server root. `basePath` is `/stancejudge`.

## GitHub Actions

Workflow `.github/workflows/deploy-pages.yml` runs on **every push to `main`**: `npm ci` → `generate-canonical` → static build → **force-push `out/` to branch `gh-pages`**. No separate Pages environment approval required.
