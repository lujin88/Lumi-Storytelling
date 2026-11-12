# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

State as of 2026-10-28 13:00 UTC, main `55421ba`. All work goes through PRs; PRs need the `verify` check (#74). Lu tests only at `http://127.0.0.1:4317`.

## 现在在做什么
- QA and visual QA: review #77 (cheer plays once, holds 4s, replays; WebM only) on `6847ab1`. QA merges once both pass.
- Developer, next: fix the `lumi-animation.spec.js` timing flake (10 reruns under load) plus a test for "one current row after review with a Claude key".
- Developer, later: "停用" copy in code (`gone.check` / `gone.model` / `gone.only-model`, per `docs/product-specs/copy/provider-errors.md`); #72 follow-ups (clear the step 5 export error when a video is removed or replaced; test for the RangeError → too-large branch); `claudeVideoPrompt` onto `claudeJSON` when the video prompt needs cancel.
- Visual designer: dark mode D chosen (decisions 2026-10-28). In #75: D at 390px, step 3, Settings, full WCAG AA check, Lumi on a surface / glow at 100%. Then the step 2 "full-body Lumi vs current" draft on current main.
- Motion designer: #58 needs the frame-0 still for cheer and the WebP duration in the manifest. Merge order: #77 → #58.

## 等 Lu 决定的事
1. Team instructions in Buzz Desktop are out of date (Jimeng `server/`, clip status). PM proposed the new text on 2026-10-28; waits for Lu's OK.
2. Step 2 full-body Lumi: pass or change, once the draft is up. Head tilt, thinking and jump clips wait for it.
3. `bar.md` v2 (`research/bar-md-v2` `d2fce3a`, local only; #50 holds v1). The full-site acceptance needs it.
4. Native-speaker review: 18 lines plus #73's 5 lines in `docs/product-specs/copy/native-review-2026-10-27.md`.
5. Close #64 (superseded by the 2026-10-27 "no video provider" decision) and #35 (replaced by #57, #45 and the new step 2 draft); PM to confirm the rest of #35 is covered before asking.

## 最近完成的
- 2026-10-28 decided: dark mode direction D (event 639efcce).
- 2026-10-28 merged: #73 (step 5 export copy), #29 (Claude drafting), #72 (video prompt store, 390px modal padding), #76 (390px toast above the footer), #71 (handoff).
- 2026-10-28 merged: Lumi stack #38 #39 #41 #44 #45 #61; #60 #70 #74; #46 #56 #57 #49 #54 #37 #51 #52 #62 #63.
- 2026-10-27 merged: #67 (Jimeng removed; server serves static files only), #43, #69, #55, #68.

## 下一步
- After D is drawn out: Developer implements dark mode D, visual QA accepts at 1512 / 1905 / 390.
- Then the site-wide fixes list (390 overflow, zoom dialog font size, about 6 items), then a full-site visual acceptance against `bar.md`.
- Release is asked only after that acceptance passes (decisions 2026-10-28).
- #66 (help FAQ copy): review now that #29 is merged.
- #28 stays open as an archive (decisions 2026-10-23).
- Export size limit (2^29-24) was measured in Chrome 156 only; Safari and Firefox to confirm.
