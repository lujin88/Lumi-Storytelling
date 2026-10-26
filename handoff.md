# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

GitHub bot account is 403 (suspended): no PRs, no pushes. All work is committed on local branches; Lu is handling the account. The app Lu sees is the local demo branch `demo/2026-10-26` on `http://127.0.0.1:4317`.

## 现在在做什么
- Homework package delivered 2026-10-26: `~/Desktop/Lumi作业-d292c30` (copy in `~/.buzz/OUTBOX/homework-d292c30`): project zip `d292c30`, harness-core zip `1c75be0`, harness screenshot, step 1 and step 5 screenshots (1512 light, 4317 = `d292c30`). Visual QA signed step 1 / step 5 screenshots on `d292c30` (D1-D3 passed); not a full-site sign-off.
- Developer | D1-D3 done: `1b8a7d8` (D2 32px/600, D3 40px, D1 `slideHTML`), `d292c30` (step 3 slide text rules shared with `.dl-slide`). Tests 147/147 on `d292c30` (first run 146/147, known flaky test below). Log: `WORK_LOGS/LUMI_D1_SHARED_SLIDE_STYLES_D292C30_2026_10_26.md`.
- Spec | designer `2f5f14d` (`design/system-production-audit`): Lumi centred on task column, column/figure widths per breakpoint, mobile CTA 48px exception. Visual QA static recheck passed; no code change needed on `de57eae`.
- UX researcher | `bar.md` v2 final is `d2fce3a` (`research/bar-md-v2`), waiting for Lu.
- Full-site list (not homework blockers, next batch): dark "连接 Claude" contrast ~1.25:1, dark step 3 thumbnails ~1.14:1, 390 empty step 4 overflow 9px, 390 step 3 toolbar wraps, empty download page says ready with 0/10; Material Symbols -> Remix Icon in `index.html`; drop trailing arrow on bottom CTA; step 3 zoom modal slide title 51px / margin 8px vs thumbnail 38px / 15px (`.modal .deck-zoom-scale .slide` misses step 3 text rules, 1512, `d292c30`).
- Test stability (next batch): `tests/lumi-animation.spec.js:48` animated Lumi readyState stays 0 under high load (QA 2026-10-26, 1 of 2 full runs).
- Test stability (next batch): `tests/lumi-animation.spec.js:448` "下载页 Lumi 静图和动图同框" flakes at 1280, x off by 1px (-14 / -13). `d292c30`: 1 of 8 runs failed; `1b8a7d8`: at least 3 of 16 failed (pre-existing).

## 等 Lu 决定的事
1. Dark mode palette (`design/dark-mode-system` d72e5c9 + 65fd2ea, passed visual QA spec review).
2. `bar.md` v2 (`research/bar-md-v2`, final `d2fce3a`, bars 1-2 match designer spec `2f5f14d`; UX researcher): approve, then merge first once GitHub works. Old #50 (`302c390`, Lu said "好的" 2026-10-25 but never merged) is superseded; closing it is Lu's call.
3. harness-core rule branch `rule/full-review-trigger-bar-gate` `387ff70` (full-page review before every delivery to Lu; unmerged `bar.md` counts as missing): merge once GitHub works.

## 最近完成的
- Homework package for Lu at `0c8083c` (step 1 link padding, step 1 Lumi 256px, download Lumi 404px; 143 tests; "视觉通过 0c8083c"), on Lu's Desktop `Lumi-作业-最终版`. Will be redone after the current step 1 fix.
- `demo/2026-10-26` `0e09810`: #38→#45 merged into the demo branch, Lumi at 80% (visual QA pass).
- lujin88/Lumi-Storytelling#53: jump clip. #48: GPT Image 2.5. #42: follow-up row format.
- Dark secondary button fix `e2596ae` (QA pass, 112 tests), local only, waiting for GitHub.

## 下一步
1. Developer | batch 2 at `ad124c8` (154/154, dev report): CTA arrow markup removed (was already hidden), QA follow-ups done. Remaining: Remix Icon swap per final map `OUTBOX/LUMI_REMIX_ICON_MAP.md` (designer 2026-10-26, spec `02e5eb3`; GitHub `ri-github-fill`); vendor full remixicon 4.9.1 (+330KB, accepted); fix modal `wide` class left on after zoom preview (other modals become 960px); cherry-pick `d4f75a6` (flows.spec.js:141 race) into demo. Batch 1 complete (QA + visual QA passed). Batch 1 done at `4b63fac` (153/153, dev report; 390 step 3 toolbar now wraps as a group, not single-line as asked), visual QA passed the listed items except the 390 step 3 toolbar wrap (spec gap, sent to designer 2026-10-26); QA passed `4b63fac` (153/153 on 2nd run; 1st run 152/153, `lumi-animation.spec.js:48` readyState 0 under load ~9.8, 10/10 alone). Toolbar spec set by designer `f656b6f` (`design/system-production-audit`, right-aligned group, wrap by container width; `4b63fac` complies), visual QA sign-off on it pending. Next-batch follow-ups from QA: reuse `openFoundations().length===FOUNDATION.length` for the empty check; test for step 1 material that matches no question (and UX copy for that case: "write down what you know" is wrong for them); test for non-slide modal text; batch-1 animation wait should cover subtree. New full-site item: 390 step 5 full-page screenshot light band at 844px (pre-existing). Batch 1 assigned 2026-10-26 on `demo/2026-10-26` from `d292c30` (light only): zoom modal text styles, non-empty D1 test case, 390 step 4 overflow + step 3 toolbar wrap, empty download page "ready" copy (UX copywriter `copy/step5-not-ready` `42bce62` incl. score note, cross-review passed (visual QA, A only; empty = no content, not score 0); empty score card "6 项可加强" line added to the same batch; native-speaker review list in the `.md` needs Lu; scope A/B asked to Lu, default A), flaky test :448 root cause + 20 runs. Batch 2: Material Symbols -> Remix Icon, bottom CTA arrow. Dark items wait for Lu's dark palette decision. Then the rest of the full-site list in batches; QA + visual QA per batch; final full-site sign-off against `bar.md`.
2. PM | once GitHub works: open PRs for the local branches (demo fixes, `e2596ae`, dark palette after Lu approves), Lu merges.
3. Lu decides on publishing only after the full-site sign-off.
