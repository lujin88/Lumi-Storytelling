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

| Pose | Source clip | `webm` | `webp` | Plays |
|---|---|---|---|---|
| wave | Dreamina seedance2.0 mini, task `cd75c5b3` | 777,221 B | 890,402 B | Loops on step 1 |
| cheer | Dreamina seedance2.0 mini, task `b3e4fd1f` | 944,616 B | 884,042 B | Loops on the download page |
| think | Dreamina seedance2.0 mini, task `2c49178f`, from `standing.webp` | 814,661 B | 878,712 B | Loops while the user types, then back to the page's loop |
| jump | Dreamina seedance2.0 mini, task `caa805fc`, from `standing.webp` | 873,773 B | 887,206 B | Not on the page yet |

Wave and cheer end on nearly the frame they start with (mean RGBA difference 2.5 of 255 between the last and first frame; between two neighbouring frames it is 0.4 to 21), so they loop without a cut. The cheer WebM was re-encoded at CRF 20 from the first export (1,131,297 B, over the limit) because its source mp4 was gone; SSIM 0.988 against the first export.

The think clip was fitted to `standing.webp` (`FIT="544 -32 -41" CANVAS="480 460"`, silhouette overlap 0.993) on the wave clip's canvas, so it takes the wave's place on step 1 without moving her. Its last frame is close to its first (mean RGBA difference 1.74; neighbouring frames 0.23 to 4.17, median 1.60), so it loops without a cross-fade. An 8-frame cross-fade was tried and dropped: it left a see-through second arm on the last frames.

The jump clip is a one-shot reaction for a rising step-2 score. Its generated audio
was removed. It is included as an asset only; page playback waits for the
approved full-body Lumi layout. The source MP4 is not committed. The transparent
exports use `FIT="480 -8 3" CANVAS="480 460"` so the full jump stays in frame.

The idle clip is kept unmerged (#28).
