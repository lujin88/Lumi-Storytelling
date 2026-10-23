# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

## 现在在做什么
- Lu | task 9, Lumi wave: lujin88/Lumi-Storytelling#15 (eb89a0e) ready. QA: main + #11 + #12 + #15 = e66dc73, 41 tests pass. Visual: real Safari 26.6.2 light and dark, WebP, transparent, no green edge; on-model. Later: clip can stop mid-wave on slow networks; no real iPhone check.
- Lu | merge lujin88/Lumi-Storytelling#11, then lujin88/Lumi-Storytelling#12. Both passed QA and visual review.

## 等 Lu 决定的事
1. **Merge order**: lujin88/Lumi-Storytelling#11 → #12 → #15, with #14 before or together with #15 (it restores the mini decision #15 relies on). Recommend: merge all four now. Before #15, look at wave: texture slightly softer than the render, thin light edge when zoomed, eyes close briefly mid-clip. QA: main + #11 + #12 + #15 = c15bcac, 34 tests pass, no conflicts. If not merged: mobile fixes and the Story sideways scroll stay on main.
2. **Model for the other 5 clips**: A Seedance 2.0 mini (24 credits/clip, measured) | B seedance2.0 (32 credits/clip, queue over a day). Recommend A, judged after you see wave. This reverses your earlier "not mini". Blocks: the other 5 clips.
3. **Who spent 24 credits on this Dreamina account** before our run (task cd75c5b3)? You, or another channel's agent? If unknown, measured cost per clip can't be trusted.
4. **Key check (PRD 8.12)**: A in the browser | B local `server/` API. Conflicts with "no backend for now, GitHub Pages". Blocks backend v1 and task 1b.
5. **Backend hosting and region; shared org key in v1** (yes/no). Blocks backend v1.
6. **Download page**: where Lumi sits, and whether the GitHub Pages line stays inside the card. Blocks: download page polish.

## 最近完成的
- lujin88/Lumi-Storytelling#13: Lumi clips via Dreamina CLI; wave reassigned to Developer.
- lujin88/Lumi-Storytelling#10: Lumi animation states switch on user actions.
- lujin88/Lumi-Storytelling#9: round-1 visual audit and mobile screenshots.
- lujin88/Lumi-Storytelling#7: design-system contradictions fixed; Tag added.
- lujin88/Lumi-Storytelling#5: Playwright flow tests under `tests/`.

## 下一步
1. QA and visual review finish lujin88/Lumi-Storytelling#15; then Lu reviews wave.
2. If wave is OK, the other 5 clips (idle, head tilt, thinking, jump, cheer) with the same keying script.
3. Backend v1 starts once items 4 and 5 are decided.
