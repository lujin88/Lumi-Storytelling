# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

GitHub bot account is 403 (suspended): no PRs, no pushes. All work is committed on local branches; Lu is handling the account. The app Lu sees is the local demo branch `demo/2026-10-26` on `http://127.0.0.1:4317`.

## 现在在做什么
- Developer | step 1: one text style for both option rows ("用在哪" and "准备讲多久"), option buttons sized to content instead of stretched, Lumi (256px) moved into the content column next to the rows. Local commit on `demo/2026-10-26`; then visual QA; then PM repackages Lu's homework.
- Visual designer | audit `design-system/` against what `index.html` uses (button text styles, option button width, content column vs Lumi placement, spacing); update the spec; visual QA re-checks. Dark palette stays separate, waiting for Lu.
- Visual QA | after the step 1 fix: full-site review (5 steps + Settings + Help, 1512/1905/390, light and dark), issue list by severity.
- Harness Manager | rule gaps reported: no full-site review is ever required; a missing `bar.md` blocks nothing.

## 等 Lu 决定的事
1. Dark mode palette (`design/dark-mode-system` d72e5c9 + 65fd2ea, passed visual QA spec review).
2. `bar.md` v2 (`research/bar-md-v2` `5626227`, UX researcher): approve, then merge first once GitHub works. Old #50 (`302c390`, Lu said "好的" 2026-10-25 but never merged) is superseded; closing it is Lu's call.
3. harness-core rule branch `rule/full-review-trigger-bar-gate` `387ff70` (full-page review before every delivery to Lu; unmerged `bar.md` counts as missing): merge once GitHub works.

## 最近完成的
- Homework package for Lu at `0c8083c` (step 1 link padding, step 1 Lumi 256px, download Lumi 404px; 143 tests; "视觉通过 0c8083c"), on Lu's Desktop `Lumi-作业-最终版`. Will be redone after the current step 1 fix.
- `demo/2026-10-26` `0e09810`: #38→#45 merged into the demo branch, Lumi at 80% (visual QA pass).
- lujin88/Lumi-Storytelling#53: jump clip. #48: GPT Image 2.5. #42: follow-up row format.
- Dark secondary button fix `e2596ae` (QA pass, 112 tests), local only, waiting for GitHub.

## 下一步
1. Developer | fix the full-site issue list in batches; QA + visual QA per batch; final full-site sign-off against `bar.md`.
2. PM | once GitHub works: open PRs for the local branches (demo fixes, `e2596ae`, dark palette after Lu approves), Lu merges.
3. Lu decides on publishing only after the full-site sign-off.
