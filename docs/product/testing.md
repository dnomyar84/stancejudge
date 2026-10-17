# Testing strategy

## Layers

1. **Unit tests** (`npm test`) — pure logic (YouTube URLs, manifest, classifiers). Run in CI without videos.
2. **Reference video fixtures** — MP4s you upload under `tests/fixtures/reference-videos/`; registered in `manifest.json`.
3. **Future:** frame samples → MediaPipe → compare leg/hand/move vs `expect` in manifest (local or CI with LFS checkout).

## Your workflow (master videos from YouTube)

1. Download or export MP4 from the performances you trust (attribute `sourceYouTubeUrl` in manifest).
2. Place under `tests/fixtures/reference-videos/<routine-id>/`.
3. Edit `manifest.json`: set `relativePath`, `label`, `enabled: true`.
4. Push with **Git LFS** if files are large.
5. Agent adds/updates `expect` blocks and video tests as ground truth is agreed.

## Bugs vs tests

- **Regression in production** → GitHub Issue (`type:bug`).
- **New golden behavior** → extend manifest + test, or new fixture entry.

See [`tests/fixtures/reference-videos/README.md`](../../tests/fixtures/reference-videos/README.md).
