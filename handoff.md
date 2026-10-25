# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

Deadline: Lu presents on 2026-10-26. Today's order is set by what the demo needs.

## 现在在做什么
1. Developer | step 3 first thumbnail text cut off (demo, 4317): fix, PR, into local demo branch.
2. Developer | step 2 full-body Lumi + enlarge Lumi on steps 1, 2, 5 (#35 `5581a45` visual pass, #36). Static render first; jump plugs in later.
3. Developer | #44 fallback box size; portfolio #26 footer dot at 390 + full screenshots.
4. Developer | Volcengine + Jimeng routes removed, `server/` kept static (PM 定 rows); not merged before the demo.
5. Video maker (视频制作 Codex) | jump clip, mini, 1 run (#36), files only, credits before/after.
6. Visual QA | #38 #39 playback; #41 390 vs main; #45 per PM 定.
7. QA | flaky `flows.spec.js:141` on #46 → #29 `aafbd22` → portfolio #26 (do not merge: Vercel deploys main).

## 等 Lu 的事
1. Merge harness-core#27 (new merge rule: design PRs auto-merge after QA pass + visual QA comment `视觉通过 <sha>`). Until then the current rule applies.

## 最近完成的
- #48 in local `demo/2026-10-26` = `2b6c0da`, 132 passed; 4317 settings shows Image 2.5 Sunburst (PM checked HEAD and 4317 200 at 16:48 UTC).
- #41: Lumi stays on screen through re-renders (QA 93 tests on `7a71673`; visual QA 1900/1280 pass).
- #42 opened: follow-up rows use the story-question format (83 tests on `eddcaab`).

## 下一步
1. Developer | after #41 merges: QA follow-ups 1 and 2 on #41 (hand over only when the new clip shows its first frame; no repeated think.webm requests after a failed preload), with tests.
2. Developer | after #29 merges: remove the step 2 gaps modal; OpenAI image models to `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare` before 2026-12-01.
3. Developer | jump clip (paid, Lu's OK per run).
