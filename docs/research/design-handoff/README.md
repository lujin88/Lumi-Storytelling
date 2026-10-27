---
title: "Lumi interaction and layout handoff evidence"
tags: [design-handoff, lumi, layout, motion, settings]
status: active
created: 2026-10-27
---

# Handoff evidence

These images support the design-system specifications for Step 1 alignment, StoryScore motion and missing-provider navigation. They are review evidence, not application implementation screenshots.

## Step 1 Lumi alignment

The proposed layout uses the same 960px rail as the material area. On desktop, Lumi's top edge equals the first setup label and its right edge equals the material area's right edge. The screenshots include viewport x/y marks; they are generated from the current 4317 demo with proposal CSS injected and do not change production code.

| Viewport width | Evidence |
| --- | --- |
| 1905px | [Step 1 alignment at 1905px](https://github.com/lujin88/Lumi-Storytelling/blob/0ecbe54bdb6672fe5a1efaf1b7c2d31a90259352/docs/research/design-handoff/step1-lumi-align-1905.png?raw=true) |
| 1512px | [Step 1 alignment at 1512px](https://github.com/lujin88/Lumi-Storytelling/blob/0ecbe54bdb6672fe5a1efaf1b7c2d31a90259352/docs/research/design-handoff/step1-lumi-align-1512.png?raw=true) |
| 1280px | [Step 1 alignment at 1280px](https://github.com/lujin88/Lumi-Storytelling/blob/0ecbe54bdb6672fe5a1efaf1b7c2d31a90259352/docs/research/design-handoff/step1-lumi-align-1280.png?raw=true) |
| 390px | [Step 1 mobile rule at 390px](https://github.com/lujin88/Lumi-Storytelling/blob/0ecbe54bdb6672fe5a1efaf1b7c2d31a90259352/docs/research/design-handoff/step1-lumi-align-390.png?raw=true) |

At 390px Lumi remains hidden by the existing ≤720px rule. The single-column content and material area keep the `gutter` edges at x=16 and x=374.

## StoryScore

Current application baseline at commit `31e12e9`, 1280×850 after loading the sample and opening step 2:

[Current StoryScore](https://github.com/lujin88/Lumi-Storytelling/blob/85ce17c3fb26bf64f91b1d97cc3fc7e847e408bc/docs/research/design-handoff/story-score-current.png?raw=true)

Proposed component preview at 900×500. The 48px ring holds a 34px image inside its 36px clear diameter; the preview includes the low-frequency idle and one-shot score-rise reaction:

[StoryScore motion specification](https://github.com/lujin88/Lumi-Storytelling/blob/85ce17c3fb26bf64f91b1d97cc3fc7e847e408bc/docs/research/design-handoff/story-score-spec.png?raw=true)

## Missing connection

Proposed component preview at 900×500 after activating a missing-Gemini prompt and opening setup help. The target row keeps `action-bg`, a 3px `action-ink` leading bar and a visible keyboard focus outline; help remains inside that same region:

[Connection prompt specification](https://github.com/lujin88/Lumi-Storytelling/blob/85ce17c3fb26bf64f91b1d97cc3fc7e847e408bc/docs/research/design-handoff/connection-prompt-spec.png?raw=true)

The cheer change is a timing and playback-state specification in `design-system/motion.md`; its required three-cycle recording belongs to the implementation PR.
