# Reference videos for tests

Upload **MP4** clips here for automated checks against real Wushu performances (YouTube masters you choose). These are **not** shipped to the public GitHub Pages app — they are test fixtures only.

## Before you upload

1. **Prefer short clips** (one routine or a segment) to keep repo size reasonable.
2. **Use Git LFS** for any file over ~10 MB:
   ```bash
   git lfs install
   git lfs track "tests/fixtures/reference-videos/**/*.mp4"
   ```
   (`.gitattributes` in the repo root already tracks `*.mp4` under this tree.)
3. GitHub limits: **100 MB** per file (hard); LFS storage quotas apply on your account.

## Folder layout

Put files under the routine they belong to:

```
reference-videos/
  manifest.json          ← register every file here (required)
  san-duan-chang-quan/
    your-master-name.mp4
  si-duan-jian/
    your-master-name.mp4
```

## Register each video in `manifest.json`

For every MP4 you add, append an entry:

| Field | Description |
| --- | --- |
| `id` | Unique slug, e.g. `sdj-david-bao-2024` |
| `routineId` | `san-duan-chang-quan` or `si-duan-jian` |
| `relativePath` | Path from this folder, e.g. `si-duan-jian/master.mp4` |
| `label` | Human name (athlete, event, year) |
| `sourceYouTubeUrl` | Original YouTube link (for attribution; not used in CI embed) |
| `role` | `reference` (gold timing) or `student` (negative/positive test case) |
| `enabled` | `true` when the file is present and ready for tests |

## After upload

```bash
git add tests/fixtures/reference-videos/
git add .gitattributes
git commit -m "Add reference test video: <id>"
git push origin main
```

Run tests locally:

```bash
npm test
```

Video integration tests **skip** entries with `enabled: false` or missing files.

## What tests will do (as we build them)

- **Unit:** URL parsing, manifest validation (always run in CI).
- **Video (local / optional CI):** Sample frames → pose landmarks → stance/move classification vs expectations in `manifest.json` `expect` blocks.

You pick the masters; we encode expectations in the manifest as you confirm ground truth.
