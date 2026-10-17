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

1. Implement on `main`; update [`docs/product/features.md`](../docs/product/features.md) in the same commit when closing a feature.
2. **Push `main`** to `github.com/dnomyar84/stancejudge` only.
3. **Publish user-facing changes:**
   ```bash
   npm run generate-canonical   # if reference-videos.json changed
   npm run build:pages
   # deploy static export to gh-pages (from repo root):
   rm -rf /tmp/stancejudge-pages && cp -a out /tmp/stancejudge-pages
   cd /tmp/stancejudge-pages && git init -q && git add -A \
     && git -c user.name="stancejudge" -c user.email="stancejudge@users.noreply.github.com" \
     commit -q -m "Deploy $(git -C /workspace rev-parse --short HEAD)" \
     && git branch -M gh-pages \
     && git push -f https://github.com/dnomyar84/stancejudge.git gh-pages
   ```
4. Optional: fix **Settings → Environments → github-pages** so the Actions workflow can deploy without step 3.

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

Workflow `.github/workflows/deploy-pages.yml` builds on push to `main`. If the **deploy** job fails on environment protection, use the `gh-pages` push above until `main` is allowed to deploy to the `github-pages` environment.
