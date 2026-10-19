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

## Pose grammar

One line per action. `#` starts a comment.

```
stand
arms forward
both palms
raise left knee
hands by the ears
left fist
sword fingers
```

| Phrase | Pose |
|--------|------|
| `stand` | Neutral 开步 |
| `raise left knee` / `raise right knee` | Thigh lifts, knee folds back |
| `hands by the ears` | Both arms overhead |
| `arms forward` | Both arms in front |
| `both palms`, `left palm`, `right fist` | 掌 / 拳 |
| `sword fingers` | 剑指 on both hands |
| `bend left elbow 40` | Elbow flexion in degrees |
| `right gong bu left punch` | 右弓步左冲拳 — right bow stance, left fist |
| `left gong bu right punch` | 左弓步右冲拳 |
| `raise right arm 70` | Shoulder flexion in degrees |

The precise form still works: `joint l_upper_arm flex 58 abduct 16` and `hand left sword`.

| Token | Shape |
|-------|--------|
| `palm`, `zhang` | 掌 open palm |
| `fist`, `quan` | 拳 closed fist |
| `sword`, `jianzhi` | 剑指 index + middle straight, ring + pinky curled |

Angles are in anatomical coordinates, then clamped to human range of motion before they are written onto a `THREE.Bone`. Three.js itself does not enforce joint limits. See `src/engine/joint-limits.ts`.

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
