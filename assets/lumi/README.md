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

| Pose | Source clip | `webm` | `webp` |
|---|---|---|---|
| wave | Dreamina seedance2.0 mini, task `cd75c5b3` | 628,020 B | 817,548 B |
| think | Dreamina seedance2.0 mini, task `2c49178f` | 659,263 B | 801,430 B |
| cheer | Dreamina seedance2.0 mini, task `b3e4fd1f` | 897,469 B | 805,818 B |
| jump | Dreamina seedance2.0 mini, task `caa805fc`, from `standing.webp` | 873,773 B | 887,206 B |

Wave, think and cheer were re-exported from their existing transparent WebM clips
without a paid generation. `scripts/lumi-loop-fix.mjs` eases the final six 24 fps
frames toward the first frame, then writes transparent VP9 and animated WebP.
The WebP selects 40 frames across the same 4-second motion, including the exact
first and last source frames. Original renders in `source/` are unchanged.

Decoded first/last-frame premultiplied RGBA PSNR for WebM is 95.6 dB (wave),
92.0 dB (think) and 94.2 dB (cheer). The corresponding WebP frames decode
identically. Both exceed the 40 dB seam target; the figures describe the seam,
not the visual quality of every frame. Versioned working exports are kept
locally; the app uses the stable filenames above.

The jump clip is a one-shot reaction for a rising step-2 score. Its generated audio
was removed. It is included as an asset only; page playback waits for the
approved full-body Lumi layout. The source MP4 is not committed. The transparent
exports use `FIT="480 -8 3" CANVAS="480 460"` so the full jump stays in frame.

The idle clip is kept unmerged (#28).
