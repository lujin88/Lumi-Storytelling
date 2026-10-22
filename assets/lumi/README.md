# Lumi assets

## `source/`
The Lumi renders used in `index.html`, extracted so agents can use them as references. Do not edit these; they are the on-model reference.

| File | Pose | Used on |
|---|---|---|
| `standing.webp` | Standing, holding a star | Default |
| `wave.webp` | Waving | Step 1 |
| `cheer.webp` | Holding a star up | Step 5 (download) |
| `build.webp` | Working | Step 3 |
| `lie.webp` | Lying down, waving | Help |
| `point.webp` | Pointing | Hints |
| `face-low.webp`, `face-good.webp`, `face-top.webp` | Faces | Story score |
| `logo.webp` | Moon and star | Logo |

## Animated loops (to come)
`<pose>.webm` (transparent VP9) plus `<pose>.webp` (animated fallback), each under 500 KB: idle, wave, tilt, thinking, jump, cheer.
