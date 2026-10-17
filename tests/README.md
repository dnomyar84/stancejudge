# Tests

| Suite | Command | CI |
| --- | --- | --- |
| Unit | `npm test` | Yes (no videos required) |
| Video fixtures | same | Validates manifest; optional frame tests when fixtures enabled |

## Reference videos

Upload master clips to [`fixtures/reference-videos/`](./fixtures/reference-videos/README.md) and register in `manifest.json`.

## Layout

```
tests/
  unit/           # fast tests (youtube parse, manifest, classify helpers)
  video/          # fixture-backed tests (skip if no enabled MP4)
  fixtures/
    reference-videos/
```
