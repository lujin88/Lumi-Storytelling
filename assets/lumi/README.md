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

## Animated loops
`<pose>.webm` (transparent VP9) plus `<pose>.webp` (animated fallback), each under 1 MB. Built from a green-screen clip with `scripts/lumi-clip.sh`; the source mp4 is not committed.

| Pose | Source clip | `webm` | `webp` | On the page |
|---|---|---|---|---|
| wave | Dreamina seedance2.0 mini, task `cd75c5b3`, from `wave.webp` | 777,221 B | 890,402 B | Step 1, plays once on open |
| idle | Dreamina seedance2.0 mini, task `bbcd878e`, from `standing.webp` | 963,360 B | 872,158 B | Not yet: no page shows the standing pose |

`idle` loops (`LOOP=0`); built with `FIT="542 -31 -40" CANVAS="480 462"` to line up with `source/standing.webp`.

Still to decide (Lu): where idle goes, and whether to make tilt, thinking, jump, cheer.
