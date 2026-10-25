# Download page: preview card and Lumi stage (#35)

Real page, `index.html` with the sample project, local Chrome. `before-*` is `c50e9ab` (#44), `after-*` is this branch.

| Width | Preview card x | Lumi stage (x, w×h) | Lumi media box | #35 visual check coordinates |
|---|---|---|---|---|
| 1900 | 660 | 1316, 520×570 | 673×680, centred on the stage | preview 670, stage 1306 520×570 |
| 1280 | 528 | 880, 360×380 | 435×440 | preview 520, stage 888 360×380 |
| 390 | — | 310, 64×56 | 64×56 | 64×56 |

The 8–10px horizontal difference comes from the product's page padding, which every step shares (`.page` starts at x=296 at 1900, the mockup's at 306). The sizes match.

The still and the clip use the same `.dl-lumi` box, so the box does not change when the clip takes over (checked by a test at 1900/1280/390).
