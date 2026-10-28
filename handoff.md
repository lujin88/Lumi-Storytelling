# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

State as of 2026-10-28 11:30 UTC, main `ef9e56c`. All work goes through PRs; PRs need the `verify` check (#74). Lu tests only at `http://127.0.0.1:4317`.

## 现在在做什么
- QA: merge #73 (step 5 export copy, QA and visual passed on `7eb7fb6`) once `verify` runs; #72 follows it.
- Developer, in order: #29 (Claude drafting) merges main again (conflicts after the Lumi stack merged), then QA re-review and visual re-check of step 2 focus, then QA merges. Then #72: 390px wide modal padding to `s-4` (visual review 2026-10-28 08:24 on `2a5bdf2`), visual re-check, merge.
- Developer, after that, each a new PR from main: 390px toast covers the input (light and dark screenshots, visual re-check) → cheer "play once, pause, replay" for WebM only, pause from `motion-delay-cheer-replay`, `lumi-animation.spec.js:97-104` updated, WebP keeps looping until #58 → fix the `lumi-animation.spec.js:181` timing flake (10 reruns under load) plus a test for "one current row after review with a Claude key".
- Developer, later: "停用" copy in code (`gone.check` / `gone.model` / `gone.only-model`, per `docs/product-specs/copy/provider-errors.md`); #72 follow-ups after #72 merges (clear the step 5 export error when a video is removed or replaced; test for the RangeError → too-large branch).
- Motion designer: #58 needs the frame-0 still for cheer and the WebP duration in the manifest (WebP loop count 1 is done in `dbcd3fe`). Merge order: cheer PR → #58.
- Visual designer: dark mode A / B is up (#75). After Lu picks, step 2 "full-body Lumi vs current" draft on current main, then dark contrast fixes in the chosen direction.

## 等 Lu 决定的事
1. #75 dark mode: pick A ("夜间纸张", designer's pick) or B ("蓝图工作台"). Blocks the step 2 draft and the dark contrast fixes.
2. Team instructions in Buzz Desktop are out of date (Jimeng `server/`, clip status). PM proposed the new text on 2026-10-28; waits for Lu's OK.
3. Step 2 full-body Lumi: pass or change, once the draft is up. Head tilt, thinking and jump clips wait for it.
4. `bar.md` v2 (`research/bar-md-v2` `d2fce3a`, local only; #50 holds v1). The full-site acceptance needs it.
5. Native-speaker review: 18 lines plus #73's 5 lines in `docs/product-specs/copy/native-review-2026-10-27.md`.
6. Close #64 (superseded by the 2026-10-27 "no video provider" decision) and #35 (replaced by #57, #45 and the new step 2 draft); PM to confirm the rest of #35 is covered before asking.

## 最近完成的
- 2026-10-28 merged: Lumi stack #38 #39 #41 #44 #45 #61 (main `ef9e56c`; QA and visual passed on each head).
- 2026-10-28 merged: #60 (V01–V06 visual fixes), #70 (video prompt design), #74 (`verify` check on every PR).
- 2026-10-28 merged: #46 #56 #57 #49 #54 #37 #51 #52 #62 #63.
- 2026-10-27 merged: #67 (Jimeng removed; server serves static files only), #43, #69, #55, #68.
- 2026-10-27 decided: no video provider; cheer plays once, pauses, replays.

## 下一步
- After #29 and #72: the site-wide fixes list (dark contrast, 390 overflow, zoom dialog font size, about 6 items), then a full-site visual acceptance against `bar.md`.
- Release is asked only after that acceptance passes (decisions 2026-10-28).
- #66 (help FAQ copy): review after #29 merges.
- #28 stays open as an archive (decisions 2026-10-23).
- Export size limit (2^29-24) was measured in Chrome 156 only; Safari and Firefox to confirm.
