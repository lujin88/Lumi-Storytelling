# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

## 现在在做什么
- Developer | Lumi cheer clip (mini, about 24 credits, Lu chose A): from `cheer.webp`, plays when the download page opens; before/after credit in the PR.
- Visual designer | enlarge Lumi on step 1, step 2 and the download page, layout in proportion (Lu approved the #35 layout but Lumi is too small); update lujin88/Lumi-Storytelling#35; then visual QA.
- Developer | jump and thinking clips (mini, 1 run each from `standing.webp`, about 24 credits each, Lu approved 2026-10-24); start and end on the same pose; credit before/after in the PR.
- Developer | small fixes from Lu's review (decisions.md 2026-10-24, 8 points): wave and cheer loop, settings key error pushes the divider down, composer bar full width with equal padding. QA reviews.
- Visual designer | in the same #35 update: score face micro-animation (CSS only), step 2 single active row + composer placeholder naming the question, thinking clip as loading state. Uses the Duolingo study. Then visual QA.
- PM | Mobbin study of Duolingo mascot animation: done, `RESEARCH/DUOLINGO_MASCOT_ANIMATION_MOBBIN.md` (PM workspace), sent to the designer.
- Harness Manager | review rules: first review lists everything; re-review checks fixes and regressions only; check at Lu's ~1900px window before Lu sees it (Lu asked, event de09e390).
- Lu | merge lujin88/Lumi-Storytelling#29 (task 15 + score card; QA pass 30bca60, 114 tests). Real-key trial: drafting and review run end to end; a one-character quote passes; single Chinese numerals (三位, 两小时) are not replaced with [待补].

## 等 Lu 决定的事
1. Clicking the Lumi logo: go to step 1, or a new welcome screen.
2. Step 5 deck: real, good-looking `.pptx` (how: in-browser library or Claude Skills); developer spike first.
4. Tracking: Lu chose PostHog. Lu creates the PostHog account (EU cloud) and says which channel the portfolio work happens in.
3. The enlarged Lumi sizes come back to Lu with the updated #35.

## 最近完成的
- lujin88/Lumi-Storytelling#26: task 14, Claude/OpenAI/Gemini from the browser (QA pass 6f7d231). #27: its follow-ups and docs.
- lujin88/Lumi-Storytelling#28: idle clip, kept open as an archive, not merged (Lu chose A).
- lujin88/Lumi-Storytelling#15: Lumi wave clip (≤1MB re-export).
- lujin88/Lumi-Storytelling#23: browser key check + local Jimeng `server/` (QA pass 523b84e).
- lujin88/Lumi-Storytelling#20: keys and GitHub token saved only over http(s).

## 下一步
1. Developer | cheer clip PR (clip already generated, task b3e4fd1f); Lu reviews.
2. Developer | after #29 merges: remove the step 2 gaps modal (decisions.md 2026-10-24); the review names every empty row with and without Claude, tests cover both; plus the two #29 follow-ups that send text to notes. QA reviews.
3. Developer | after #29 merges: OpenAI image models to `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare` in Settings, default from OpenAI docs (decisions.md 2026-10-24); must land before 2026-12-01. QA reviews.
4. Developer | task 12: step 5 save dialog; then QA's two small fixes; then task 13 (`file://` notice).
5. Developer | after the enlarged #35 passes visual QA: build the step 2 full-body Lumi and the bigger Lumi on steps 1 and 5, with jump and thinking. QA reviews.
