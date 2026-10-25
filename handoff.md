# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

Deadline: Lu presents on 2026-10-26. Lu wants the open work finished tonight (2026-10-25).

## 现在在做什么
0. Developer | #45: step 5 Lumi to ~80% (Lu 17:06): `--lw:540px;--lh:545px` at ≥1700, 1500–1699 no larger; screenshots 1512 and 1905.
1. Developer | step 3 first thumbnail text cut off (demo, 4317): fix, PR, into local demo branch.
2. Developer | step 2 full-body Lumi + enlarge Lumi on steps 1, 2, 5 (#35 `5581a45` visual pass, #36). Static render first; jump plugs in later.
3. Developer | #38 conflicts with main: merge `origin/main` into #38, then cascade merges #39 → #41 → #44; fix #44 fallback box size, merge into #45; report all five HEADs once; then portfolio #26 footer dot at 390 + full screenshots, committed in the PR branch (SHA-pinned links, then removed), no `pr-assets/` branch.
4. Developer | Volcengine + Jimeng routes removed, `server/` kept static (PM 定 rows); not merged before the demo.
5. Visual QA → QA | #53 jump clip `e92f738`: on-model check, then QA merges. Also note which wave test timed out once (possible flake).
6. Visual QA | #38 #39 #41 #44 #45 after the developer reports new HEADs (#45 also at 1905).
7. QA | merge with `scripts/merge-pr.sh` after visual pass: #38→#39→#41→#44→#45 (stacked; retarget the next to main first, no `--delete-branch`), #42 alone. #28 has `hold`.
9. QA | flaky `flows.spec.js:141` on #46 → #29 `aafbd22` → portfolio #26 (do not merge: Vercel deploys main).

## 等 Lu 的事
1. #50 `bar.md` (design direction, Lu merges): keep or drop mechanisms 5 (settings ✓ + time) and 6 (download button counts files). PM recommends keep.
3. Delete portfolio branch `pr-assets/posthog-analytics` (Lu deletes, 2026-10-25): after the developer moves the 8 screenshots into #26 and confirms they show. Strike through once deleted.
2. Portfolio PostHog: ship now or wait for a Datenschutzerklärung page.

## 最近完成的
- #53 jump clip: 1 mini run, 24 credits (2076→2052), webm 874 KB, webp 887 KB, 107/107 on `e92f738`.
- #45 step 5 Lumi to 80% (`4448c11`); #52 step 3 thumbnails opened; #51 flaky :141 fix opened.
- #42 merged (`7538471`). #50 `bar.md` opened by UX researcher (`302c390`).
- Visual pass on current HEADs: #38 `66aee48`, #39 `dbdb989`, #41 `7a71673`, #42 `7538471`.
- harness-core#27 merged 17:04 UTC: QA merges design PRs after visual pass. #28 labelled `hold`.
- #48 in local `demo/2026-10-26` = `2b6c0da`, 132 passed; 4317 settings shows Image 2.5 Sunburst (PM checked HEAD and 4317 200 at 16:48 UTC).
- #41: Lumi stays on screen through re-renders (QA 93 tests on `7a71673`; visual QA 1900/1280 pass).
- #42 opened: follow-up rows use the story-question format (83 tests on `eddcaab`).

## 下一步
1. Developer | after #41 merges: QA follow-ups 1 and 2 on #41 (hand over only when the new clip shows its first frame; no repeated think.webm requests after a failed preload), with tests.
2. Developer | after #29 merges: remove the step 2 gaps modal; OpenAI image models to `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare` before 2026-12-01.
3. Developer | jump clip (paid, Lu's OK per run).
