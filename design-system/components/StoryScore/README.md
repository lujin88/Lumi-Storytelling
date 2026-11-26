# StoryScore

The 故事评分 card at the top right of step 2 (找到故事). It has two score sources: a rule-based estimate before review, and Claude's score after review.

## Anatomy (closed)
- Card: `paper` background (same as the page), 1px `line` border, radius `r-surface`. Hover: `sunken`.
- Left: a 48px ring (progress = score/10, `ok` stroke on `line` track) holding a Lumi face:
  - 0–4 `low`, 5–8 `good`, 9–10 `top`. Faces are images, never emoji.
  - The ring's clear inner diameter is 36px. Center the face in a **27px square** (`object-fit: contain`). The 27px size is based on the widest of the three current face silhouettes and leaves room for the 1px rise plus 1.05 scale at the reaction extreme; no visible pixel may touch the ring in `low`, `good`, `top`, idle or reaction poses.
  - Do not apply `border-radius`, `clip-path` or `overflow: hidden` to the image or its immediate wrapper: hair, scarf and star remain visible. Do not enlarge the image to fill the aperture.
- Middle: label 故事评分 (12px `muted`), score 16px/600 with "/10" in `muted`, then a 12px `muted` source note defined below.
- Right: a trailing chevron. The whole card is the button (Disclosure kind).

## Score source and copy

The card always exposes which source produced the number. These states implement the 2026-10-23 decision in [`decisions.md`](../../../decisions.md).

| State | Number source | Chinese source note | English source note |
| --- | --- | --- | --- |
| Before the first review | Current rule score | `预估 · 按完整度计算` | `Estimate · based on completeness` |
| Edited after a review | Recomputed rule score | `预估 · 内容已修改，需重新审稿` | `Estimate · edited since review` |
| Review completed, no later edit | Latest Claude score | `Claude 评分 · 完整度与具体度` | `Claude score · completeness and specificity` |

The edit state replaces the reviewed state immediately after a story answer changes; never keep displaying a stale Claude number. When Claude returns 0 for an answer that contains text, the affected dimension says `还不够具体` / `Not specific enough yet`, never `缺材料` / `Missing`. Lumi's full-body jump remains tied to a rise in the rule score, not to the Claude score.

## Open
- Same card, `surface` background. Below the head, one row per dimension: name, status, and a 去补 text link when it is not full. 去补 jumps to the first open question for that dimension.

## Face motion

The face is a quiet state indicator, not a second celebration. Duolingo uses large reactions at result moments and reserves idle behavior for small head, brow and blink changes; Lumi follows that hierarchy. Sources: [Duolingo's character animation system](https://blog.duolingo.com/world-character-visemes), [Duolingo's milestone reactions](https://blog.duolingo.com/building-character/) and the workspace synthesis at `/Users/lu/.buzz/RESEARCH/DUOLINGO_MASCOT_ANIMATION_MOBBIN.md`.

The mood is attentive, warm and restrained. Keep the existing `paper`, `line`, `ok`, `ink` and `muted` palette, system-sans score type and 48px layout; motion must not introduce a new colour, shape or illustration asset. The durations and amplitudes below are **Lumi proposals**, because the cited Duolingo sources do not publish timing values; review them from the implementation recording before treating them as final.

| State | Trigger and frequency | Motion | Token |
| --- | --- | --- | --- |
| Idle | While step 2 is visible. One restrained movement in each cycle; the face is still for most of the cycle. | **Proposal:** hold through 72%; rise 1px and rotate −1° at 78%; pass through +0.75° at 86%; settle by 94%. Transform origin 50% 60%. The 27px face remains clear of the ring at both extremes. | `face-idle`, 6000ms, `motion-ease-move` |
| Score rises | Once after the committed score increases. Initial render does not count. Coalesce score updates that arrive together and react only to the final value. | **Proposal:** current face rises 1px and scales uniformly to 1.05, then settles. The progress ring and card do not move. | `face-react`, 240ms, `motion-ease-out` |
| Score falls | After the committed score decreases. | Swap the face with no celebratory movement. | none |
| Score band changes | When 4→5 or 8→9 changes the image. | Swap to the new image first, then run `face-react` if the score rose. Do not crossfade two faces inside the 36px aperture. | `face-react` |

Only `transform` changes. Do not animate the ring, card, number, width, height, padding, shadow or crop. If another score rise arrives during `face-react`, retarget from the current transform or restart once after the burst; never stack animations.

With `prefers-reduced-motion: reduce`, disable `face-idle` and `face-react`. The score, ring and face image still update immediately. Motion is decorative here; no opacity fallback is required.

The component preview is the geometry reference. It includes the `low`, `good` and `top` faces at rest, plus the worst idle and score-rise extremes. Visual QA checks those five reference poses before approving implementation; the live animation must stay inside the same envelope.

## Don't
- Don't fill the card with `sunken` or `soft`: it must read as part of the page, set apart by the outline.
- Don't add a primary or secondary button inside it.
- Don't squash the face to imitate a blink; it changes Lumi's silhouette and clay texture.
- Don't add confetti, shake the card or loop a bounce. The full-body Lumi jump owns the score celebration.
