# Download page Lumi: broken image

Chrome, 1900×950, sample project, step 5, with `assets/lumi/` blocked (same as opening
`index.html` without the clip files next to it).

- `before.png`: `7a71673` (#41 head). The cheer WebM and WebP fail; the alt text "Lumi" shows.
- `after.png`: `96d1b25`. The failed WebP is remembered and the embedded still shows.

## Same box for the clip and the still

Chrome, 1280×800, step 5. The dashed outline is the Lumi media box.

- `same-box-clip.png`: cheer WebM playing (frame 0).
- `same-box-still.png`: `assets/lumi/` blocked, embedded still.

Before this fix the width rule only matched the `<img>`, so the WebM took `.character`'s
size (280×240) and the fallback still 240×243. Both now use the same rule: 240×243 at
desktop, 160×162 at 390 wide, in Chrome and WebKit.
