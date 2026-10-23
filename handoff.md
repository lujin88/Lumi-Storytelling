# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

## 现在在做什么
- Lu | task 9, Lumi wave: lujin88/Lumi-Storytelling#15 (eb89a0e) ready. QA: main + #11 + #12 + #15 = e66dc73, 41 tests pass. Visual: real Safari 26.6.2 light and dark, WebP, transparent, no green edge; on-model. Later: clip can stop mid-wave on slow networks; no real iPhone check.
- Lu | merge lujin88/Lumi-Storytelling#11, then lujin88/Lumi-Storytelling#12. Both passed QA and visual review.
- Developer | task 10, backend v1: key storage merged (#20); key check + Jimeng `server/` in lujin88/Lumi-Storytelling#23, in QA (523b84e, 49 tests pass).
- Developer | task 14 (new): page AI calls still go to `/api/...` with nothing behind them; move Claude, OpenAI and Gemini calls to the browser, prompts into `prompts/`. Call map first.

## 等 Lu 决定的事
1. **Approve credits for the other 5 clips** (mini, about 5 × 24 = 120 credits; the 24 came from a clip another channel made, so the real per-clip cost is measured with `dreamina user_credit` before and after the first new run) after the reworked wave.

## 最近完成的
- lujin88/Lumi-Storytelling#14: handoff in four sections; mini decision restored.
- lujin88/Lumi-Storytelling#13: Lumi clips via Dreamina CLI; wave reassigned to Developer.
- lujin88/Lumi-Storytelling#10: Lumi animation states switch on user actions.
- lujin88/Lumi-Storytelling#9: round-1 visual audit and mobile screenshots.
- lujin88/Lumi-Storytelling#7: design-system contradictions fixed; Tag added.

## 下一步
1. QA | review lujin88/Lumi-Storytelling#23.
2. Developer | task 11: re-export wave under 1MB, before/after screenshots; then Lu reviews.
3. Developer | task 14: browser-direct AI calls + `prompts/`.
4. Developer | task 12: step 5 save dialog; then QA's two small fixes; then task 13 (`file://` notice).
5. If wave is OK and Lu approves the credits, the other 5 clips (mini).
