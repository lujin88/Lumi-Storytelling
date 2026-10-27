# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

State as of 2026-10-27 19:10 UTC, main `46592f6`. GitHub bot works again; all work goes through PRs. Lu tests only at `http://127.0.0.1:4317`.

## 现在在做什么
- Developer | V3 (video prompt per slide): `prompts/video-prompt.md` + example test and IndexedDB video storage written; measuring formats Chrome can play and export size. UI follows design #70 (`e4128a3`). Then: "停用" copy in code (`gone.check` / `gone.model` / `gone.only-model`, per `docs/product-specs/copy/provider-errors.md`), new PR from main, one test per case.
- Developer | after V3: rebase the Lumi stack #38 → #39 → #41 → #44 → #45 (+ #61, retarget to main) onto main (#39/#41 carry the old #38 head `d40e7f0`, not the passed `03555d4`); #29 after #60 merges; #52.
- QA | review #37, #49, #54 (AGENTS.md), #51, #56, and #58 new head `dbcd3fe` (earlier approval was on `1ad7022`; #58 conflicts with #38/#45 in 6 `assets/lumi` files, merge order to be set).

## 等 Lu 的事
1. Merge, in order: #46, #60, #57, #62, #63 (all passed on their current head, clean against main). Don't delete #62's branch: #66 is stacked on it.
2. Design #70 (video prompt in the edit modal): pass or changes. V3 UI is not merged before #70.
3. Native-speaker review: 18 lines in `docs/product-specs/copy/native-review-2026-10-27.md` (#68, merged). Can wait until V3 fills in the format numbers.
4. Older, status to confirm: dark mode palette (`design/dark-mode-system`); `bar.md` v2 (`research/bar-md-v2` `d2fce3a`, local only, not pushed; #50 holds v1); step 2 full-body Lumi layout (decisions 2026-10-24) before head tilt, thinking and jump are generated.

## PM to-do
- #64 (video provider plan) is superseded by the 2026-10-27 "no video provider" decision; E1–E3 done in #69, E4 cancelled. Move the rest out, then ask Lu to close it.
- #35: check whether #57 replaces its step 1 part before asking Lu to merge.
- #66: retarget to main after #62 merges; then review. Its copy waits for #29.
- #44: close once developer confirms its fix is in #45.
- #28 stays open as an archive (decisions 2026-10-23).

## 最近完成的
- 2026-10-27 merged: #67 (Jimeng removed; server serves static files only), #43 (video upload-only; Claude writes a per-slide video prompt), #69 (key check: 15 s timeout, 404 retired, 403 region/account; QA 113 tests on `b647969`), #55 (byte ranges for static files; QA 107 tests on `b6b6b12`), #68 (video prompt and provider error copy).
