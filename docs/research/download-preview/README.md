# Download page: preview card and Lumi stage (#35)

Real page, `index.html` with the sample project, local Chrome. `before-*` is `c50e9ab` (#44), `after-*` is this branch.

| Width | Preview card x | Lumi stage (x, w×h) | Lumi media box | #35 visual check coordinates |
|---|---|---|---|---|
| 1900 | 660 | 1316, 520×570 | 673×680, centred on the stage | preview 670, stage 1306 520×570 |
| 1280 | 528 | 880, 360×380 | 435×440 | preview 520, stage 888 360×380 |
| 390 | — | 310, 64×56 | 64×56 | 64×56 |

The 8–10px horizontal difference comes from the product's page padding, which every step shares (`.page` starts at x=296 at 1900, the mockup's at 306). The sizes match.

The still and the clip use the same `.dl-lumi` box, so the box does not change when the clip takes over (checked by a test at 1900/1280/390).

## Review fixes (QA and visual check on `7a767e2`)

`fix-before-*` is `7a767e2`, `fix-after-*` is this branch. `normal` loads `assets/lumi/` (cheer clip plays); `no-assets` blocks it, so the still runs the CSS `lumiCheer` bounce (captured 450 ms in).

| Width | `scrollWidth` before, normal / no assets | after, both |
|---|---|---|
| 1512 | 1549 / 1764 | 1512 |
| 1900 | 1913 / 2111 | 1900 |

- The media box is centred with `left`/`top` instead of `transform`, so `lumiCheer`'s transform no longer replaces the centring. The 673px box is wider than the 520px stage; the download page clips sideways overflow at the viewport edge (`#content:has(.page-publish){overflow-x:clip}`).
- Lumi's outline is not clipped: the cheer clip's rightmost opaque pixel over the loop is checked against the viewport at 1512 and 1900 (test). At 1500–1599px the gutter is 40px instead of 64px, so the box moves 32px into the stage there; at 1600px and up it stays centred as in #35.
- The preview title showed half of its second line at 1500–1650px (the slide is narrow while the big stage is shown). It no longer shrinks, and up to 1699px it uses two 20px lines.
