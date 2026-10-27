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
| wave | Dreamina seedance2.0 mini, task `cd75c5b3` | 564,393 B | 822,678 B |
| think | Dreamina seedance2.0 mini, task `2c49178f` | 659,263 B | 801,430 B |
| cheer | Dreamina seedance2.0 mini, task `b3e4fd1f` | 830,715 B | 810,874 B |
| jump | Dreamina seedance2.0 mini, task `caa805fc`, from `standing.webp` | 873,773 B | 887,206 B |

Wave and cheer were re-exported without a paid generation from the transparent
clips in the pre-#58 `feat/lumi-loop-settings-error` branch. The old #58 method
of easing the final six frames to match the first frame is superseded: although
the endpoints matched, a pose snap remained just before and after the seam.
`scripts/lumi-loop-fix.mjs` now trims those frames instead. Wave keeps source
frames 4–89 (86 frames, 3.58 s); cheer keeps 3–92 (90 frames, 3.75 s). For
example, run `node scripts/lumi-loop-fix.mjs input.webm outdir wave-v2 4 89`.
The script writes transparent VP9 and a 40-frame animated WebP fallback into
versioned filenames, matching their playback lengths within one WebP frame,
then checks that both are under 1 MiB. The app uses the
stable filenames in this directory. Original renders in `source/` are unchanged.

Frame differences were measured from decoded RGBA composited on white, sampling
every fourth pixel and averaging absolute RGB differences on a 0–255 scale.
Wave's original frame 92→93 jump measured 2.25; the trimmed 89→4 seam measures
1.20 (median adjacent difference 0.49). Cheer's original 92→93 jump measured
3.48; the trimmed 92→3 seam measures 1.60 (median adjacent difference 3.28).
These seam figures are from the final encoded WebM outputs. The WebP
fallbacks currently loop continuously, including cheer. The planned
play-once/pause/replay behavior waits for the approved pause duration and a
page playback change; it is not implemented in this export.

Think still uses the earlier six-frame endpoint easing in #58. Its seam has
not been reworked in this pass.

The jump clip is a one-shot reaction for a rising step-2 score. Its generated audio
was removed. It is included as an asset only; page playback waits for the
approved full-body Lumi layout. The source MP4 is not committed. The transparent
exports use `FIT="480 -8 3" CANVAS="480 460"` so the full jump stays in frame.

The idle clip is kept unmerged (#28).
