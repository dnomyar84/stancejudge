# Deploy to GitHub Pages

## Why you see 404

`https://dnomyar84.github.io/stancejudge/` only works after:

1. **`main` contains this project** (repo must not be empty).
2. **Settings → Pages → Source = GitHub Actions**.
3. Workflow **Deploy GitHub Pages** completes successfully.

## Push code (one time)

From a machine logged into GitHub as **dnomyar84**:

```bash
git clone https://origin.cursor.com/git/esri-singapore/tmp-1412f656696e4dda.git stancejudge
cd stancejudge
git remote add github https://github.com/dnomyar84/stancejudge.git
git push -u github main
```

Or in **Cursor**: link the project to `dnomyar84/stancejudge` and push `main` (Publish / Create repo flow).

## After push

1. Open **Actions** → **Deploy GitHub Pages** → confirm green check.
2. Open **Settings → Pages** — URL should show `https://dnomyar84.github.io/stancejudge/`.

## Local verify (same as CI)

```bash
npm ci
npm run generate-canonical
GITHUB_PAGES=true npm run build
npx serve out -l 4322
```

Open http://localhost:4322/stancejudge/ — 四段剑 should show the `c1cgyuk-r7o` reference thumbnail and a **Coach link** button (not on older deploys).

## Cloud agent cannot push?

If `git push github main` fails with **401 / invalid token**, reconnect GitHub in **Cursor → Integrations** (repo + `workflow` scope for Actions), start a new agent or reply **retry push**. Code may still be on Cursor `origin` at the latest `main` commit.
