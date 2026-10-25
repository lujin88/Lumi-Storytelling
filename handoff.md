# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

Deadline: Lu presents on 2026-10-26. Today's order is set by what the demo needs.

## 现在在做什么
1. Developer | P0: download page shows a broken Lumi image (alt text "Lumi" in the grey box). Reproduce on main and on #38→#39→#41, fix, add a test that every step's Lumi image loads.
2. Developer | P0: download page per #35 (`8b4015f`): download-preview card inside the grey box, Lumi moved to the right column at the same box as steps 1 and 2. Started before visual QA passes #35, to save time; follow up any deviations.
3. Developer | Settings: Claude / OpenAI / Gemini / Volcengine (optional); Volcengine key filled → video uses Volcengine, else OpenAI; remove Jimeng and `server/` (#43). Key row, browser key check and routing only; video generation stays in the Backlog.
4. Developer | PostHog in LuJin-Portfolio, after 1–3.
5. Visual QA | #35 (priority), then #42. QA | #42.

## 等 Lu 的事
1. Merge #38 → #39 → #41 (QA and visual QA passed; 390 to re-check after #35 shows Lumi at 390).
2. Portfolio PostHog: GitHub Write invite for `lujinixdbot88`; storage mode A or B.
3. Approve #35 after visual QA passes.

## 最近完成的
- #41: Lumi stays on screen through re-renders (QA 93 tests on `7a71673`; visual QA 1900/1280 pass).
- #42 opened: follow-up rows use the story-question format (83 tests on `eddcaab`).

## 下一步
1. Developer | after #41 merges: QA follow-ups 1 and 2 on #41 (hand over only when the new clip shows its first frame; no repeated think.webm requests after a failed preload), with tests.
2. Developer | after #29 merges: remove the step 2 gaps modal; OpenAI image models to `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare` before 2026-12-01.
3. Developer | jump clip (paid, Lu's OK per run).
