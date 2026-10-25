# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

GitHub bot account is 403 (suspended): no PRs, no pushes. All work is committed on local branches; Lu is handling the account. The app Lu sees is the local demo branch `demo/2026-10-26` on `http://127.0.0.1:4317`.

## 现在在做什么
- Developer | homework blockers from visual QA review `68aa709` (`review/de57eae-full-site`, `DESIGN_REVIEW.md`), on top of `de57eae`: D1 step 5 "第一页预览" must use the shared slide renderer (`slideHTML`) so it matches step 3; D3 "连接 Claude" button 44.39px -> 40px. Then full test suite, visual QA re-check, PM repackages Lu's homework.
- Visual designer | D2: step 1 headline is 24px in `index.html:890` ("design-system pass" override) but 32px/600 in the spec and in audit `4f834c6`. Confirm which one; developer then aligns code or designer updates spec.
- Visual QA | spec review of `design/system-production-audit` `4f834c6`; after the D1-D3 commit, sign the homework package.
- UX researcher | `bar.md` v2 bar 1: change "longest label + padding" to fixed 96px (304px / 408px rows), per designer audit `4f834c6`; new commit before Lu approves.
- Full-site list (not homework blockers, next batch): dark "连接 Claude" contrast ~1.25:1, dark step 3 thumbnails ~1.14:1, 390 empty step 4 overflow 9px, 390 step 3 toolbar wraps, empty download page says ready with 0/10; Material Symbols -> Remix Icon in `index.html`; drop trailing arrow on bottom CTA.

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
