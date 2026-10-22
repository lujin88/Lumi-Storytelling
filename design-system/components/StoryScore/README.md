# StoryScore

The 故事评分 card at the top right of step 2 (找到故事). It scores **completeness only**; the note says so.

## Anatomy (closed)
- Card: `paper` background (same as the page), 1px `line` border, radius `r-surface`. Hover: `sunken`.
- Left: a 48px ring (progress = score/10, `ok` stroke on `line` track) holding a Lumi face:
  - 0–4 `low`, 5–8 `good`, 9–10 `top`. Faces are images, never emoji.
- Middle: label 故事评分 (12px `muted`), score 16px/600 with "/10" in `muted`, note 只看完整度，内容还要你来打磨 (12px `muted`).
- Right: a trailing chevron. The whole card is the button (Disclosure kind).

## Open
- Same card, `surface` background. Below the head, one row per dimension: name, status, and a 去补 text link when it is not full. 去补 jumps to the first open question for that dimension.

## Don't
- Don't fill the card with `sunken` or `soft`: it must read as part of the page, set apart by the outline.
- Don't add a primary or secondary button inside it.
