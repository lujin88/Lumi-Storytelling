# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

State as of 2026-10-27 19:45 UTC, main `46592f6`. GitHub bot works again; all work goes through PRs. Lu tests only at `http://127.0.0.1:4317`.

## 现在在做什么
- Developer | rebase the Lumi stack #38 → #39 → #41 → #44 → #45 (+ #61, retarget to main) onto main (#39/#41 carry the old #38 head `d40e7f0`, not the passed `03555d4`); #29 after #60 merges; #52.
- Developer | then: "停用" copy in code (`gone.check` / `gone.model` / `gone.only-model`, per `docs/product-specs/copy/provider-errors.md`), new PR from main, one test per case. Then #72 follow-ups (new PR from main after #72 merges): clear the step 5 export error when a video is removed or replaced; test for the RangeError → too-large branch.
- #56 waits for a visual review (step 1 composer runs under Lumi at 1914px); visual QA and designer are down (Codex adapter outdated, Lu to reinstall).
- #58 waits for the Lumi stack, then the cheer "play, pause, replay" code (and `lumi-animation.spec.js:97-104`), then a rebase (QA 2026-10-27).

## 等 Lu 的事
1. Merge (all passed on their current head, clean against main): #46, #60, #51; #62 then #63 (don't delete #62's branch: #66 is stacked on it); #57, #37, #49, #54, #71.
2. Design #70 (video prompt in the edit modal): pass or changes. Then merge #70 → #73 (copy) → #72 (V3, QA 130 tests on `2a5bdf2`).
3. Lu said "已经解锁了" (19:13); asked whether that means the bot may merge. Unanswered.
4. Reinstall the codex ACP adapter (visual QA and designer down).
5. Native-speaker review: 18 lines plus #73's 5 lines in `docs/product-specs/copy/native-review-2026-10-27.md` (#68, merged). Can wait until V3 fills in the format numbers.
6. Older, status to confirm: dark mode palette (`design/dark-mode-system`); `bar.md` v2 (`research/bar-md-v2` `d2fce3a`, local only, not pushed; #50 holds v1); step 2 full-body Lumi layout (decisions 2026-10-24) before head tilt, thinking and jump are generated.

## PM to-do
- #64 (video provider plan) is superseded by the 2026-10-27 "no video provider" decision; E1–E3 done in #69, E4 cancelled. Move the rest out, then ask Lu to close it.
- #35: check whether #57 replaces its step 1 part before asking Lu to merge.
- #66: retarget to main after #62 merges; then review. Its copy waits for #29.
- #44: close once developer confirms its fix is in #45.
- GitHub publish path in `index.html` is unreachable (no button, no `/api/github`) and shows a raw English error on export failure. Publishing is Lu's call; if it comes back, use the reviewed export copy first (QA on #72).
- Export size limit (2^29-24) was measured in Chrome 156 only; Safari and Firefox limits to confirm.
- #28 stays open as an archive (decisions 2026-10-23).

## 最近完成的
- 2026-10-27 merged: #67 (Jimeng removed; server serves static files only), #43 (video upload-only; Claude writes a per-slide video prompt), #69 (key check: 15 s timeout, 404 retired, 403 region/account; QA 113 tests on `b647969`), #55 (byte ranges for static files; QA 107 tests on `b6b6b12`), #68 (video prompt and provider error copy).
