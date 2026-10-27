# StoryScore

The 故事评分 card at the top right of step 2 (找到故事). It scores **completeness only**; the note says so.

## Anatomy (closed)
- Card: `paper` background (same as the page), 1px `line` border, radius `r-surface`. Hover: `sunken`.
- Left: a 48px ring (progress = score/10, `ok` stroke on `line` track) holding a Lumi face:
  - 0–4 `low`, 5–8 `good`, 9–10 `top`. Faces are images, never emoji.
  - The ring's clear inner diameter is 36px. Center the face in a 34px square (`object-fit: contain`) with 1px of clear space from the ring. Do not apply `border-radius`, `clip-path` or `overflow: hidden` to the image or its immediate wrapper: the hair, scarf and star must remain visible.
- Middle: label 故事评分 (12px `muted`), score 16px/600 with "/10" in `muted`, note 只看完整度，内容还要你来打磨 (12px `muted`).
- Right: a trailing chevron. The whole card is the button (Disclosure kind).

## Open
- Same card, `surface` background. Below the head, one row per dimension: name, status, and a 去补 text link when it is not full. 去补 jumps to the first open question for that dimension.

## Face motion

The face is a quiet state indicator, not a second celebration. Duolingo uses large reactions at result moments and reserves idle behavior for small head, brow and blink changes; Lumi follows that hierarchy. Sources: [Duolingo's character animation system](https://blog.duolingo.com/world-character-visemes), [Duolingo's milestone reactions](https://blog.duolingo.com/building-character/) and the workspace synthesis at `/Users/lu/.buzz/RESEARCH/DUOLINGO_MASCOT_ANIMATION_MOBBIN.md`.

The mood is attentive, warm and restrained. Keep the existing `paper`, `line`, `ok`, `ink` and `muted` palette, system-sans score type and 48px layout; motion must not introduce a new colour, shape or illustration asset. The durations and amplitudes below are **Lumi proposals**, because the cited Duolingo sources do not publish timing values; review them from the implementation recording before treating them as final.

| State | Trigger and frequency | Motion | Token |
| --- | --- | --- | --- |
| Idle | While step 2 is visible. One restrained movement in each cycle; the face is still for most of the cycle. | **Proposal:** hold through 72%; rise 1px and rotate −1° at 78%; pass through +0.75° at 86%; settle by 94%. Transform origin 50% 60%. | `face-idle`, 6000ms, `motion-ease-move` |
| Score rises | Once after the committed score increases. Initial render does not count. Coalesce score updates that arrive together and react only to the final value. | **Proposal:** current face rises 1px and scales uniformly to 1.05, then settles. The progress ring and card do not move. | `face-react`, 240ms, `motion-ease-out` |
| Score falls | After the committed score decreases. | Swap the face with no celebratory movement. | none |
| Score band changes | When 4→5 or 8→9 changes the image. | Swap to the new image first, then run `face-react` if the score rose. Do not crossfade two faces inside the 36px aperture. | `face-react` |

Only `transform` changes. Do not animate the ring, card, number, width, height, padding, shadow or crop. If another score rise arrives during `face-react`, retarget from the current transform or restart once after the burst; never stack animations.

With `prefers-reduced-motion: reduce`, disable `face-idle` and `face-react`. The score, ring and face image still update immediately. Motion is decorative here; no opacity fallback is required.

## Don't
- Don't fill the card with `sunken` or `soft`: it must read as part of the page, set apart by the outline.
- Don't add a primary or secondary button inside it.
- Don't squash the face to imitate a blink; it changes Lumi's silhouette and clay texture.
- Don't add confetti, shake the card or loop a bounce. The full-body Lumi jump owns the score celebration.
