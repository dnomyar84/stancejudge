# stancejudge

Frontend pose engine: procedural **wooden dummy** (Three.js `Bone` + `SkinnedMesh` cylinders) driven by a small **text pose grammar**.

## Stack

- [Vite](https://vite.dev/) dev server (no backend)
- [Three.js](https://threejs.org/) loaded from **jsDelivr CDN** via import map in `index.html` (not bundled)

## Run locally

```bash
npm install
npm run dev
```

Open http://127.0.0.1:4321/

## Pose grammar (v1)

Degrees, one statement per line. `#` starts a comment.

```
reset
joint l_upper_arm flex 165 abduct 18
joint l_forearm flex 25
```

| Axis keywords | Meaning on each joint |
|---------------|------------------------|
| `flex`, `bend`, `raise` | Primary swing |
| `abduct`, `straddle`, `spread` | Side plane |
| `twist`, `turn` | Roll |

`reset` clears all joint angles before subsequent `joint` lines.

Joint names: `root`, `hips`, `spine`, `chest`, `neck`, `head`, `l_upper_arm`, `l_forearm`, `l_hand`, `r_*`, `l_thigh`, `l_shin`, `l_foot`, `r_*`, shoulders and hips.

## Build static files

```bash
npm run build
npm run preview
```

Output is in `dist/` (still uses CDN for Three.js at runtime).

## GitHub Pages

**URL (project site):** https://dnomyar84.github.io/stancejudge/

Every push to `main` runs `.github/workflows/deploy-pages.yml`. Agents and maintainers should also run `npm run deploy:pages` after each push (`npm run ship` = build + push + deploy).

In the repo **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions** (not “Deploy from branch” only).

Manual fallback (pushes the `gh-pages` branch):

```bash
npm run deploy:pages
```

If you only see “Repository reset” or a blank page, hard-refresh or wait ~2 minutes for the CDN; ensure you are on `/stancejudge/` not the account root URL.
