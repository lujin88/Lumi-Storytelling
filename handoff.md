# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

Deadline: Lu presents on 2026-10-26. Today's order is set by what the demo needs.

## 现在在做什么
1. Developer | #48 (`8087366`, QA pass) into local `demo/2026-10-26`, full suite, 4317 settings screenshot (Lu chose A).
2. Developer | Volcengine row + remove Jimeng and `server/` (#43), new branch from main. The demo branch is not touched, so this no longer waits for the demo.
3. Developer | jump clip, mini, 1 run (approved in #36), credits before/after.
4. Developer | step 2 full-body Lumi and enlarge Lumi on steps 1, 2, 5 (#35, #36), if not built yet.
5. Developer | portfolio PostHog in `memory` mode (bot has Write since 16:41 UTC); moved before item 2.
5b. Developer | rebase #29 on main: #48 is merged, keep #48's image model lines; `grep gpt-image-1` leaves only comments.
6. Visual QA | demo walkthrough on 4317 after item 1; #35 if not concluded.
7. QA | `flows.spec.js:141` flaky check; then review each new PR.

## 等 Lu 的事
1. Merge harness-core#27 (new merge rule: design PRs auto-merge after QA pass + visual QA comment `视觉通过 <sha>`). Until then the current rule applies.

## 最近完成的
- #41: Lumi stays on screen through re-renders (QA 93 tests on `7a71673`; visual QA 1900/1280 pass).
- #42 opened: follow-up rows use the story-question format (83 tests on `eddcaab`).

## 下一步
1. Developer | after #41 merges: QA follow-ups 1 and 2 on #41 (hand over only when the new clip shows its first frame; no repeated think.webm requests after a failed preload), with tests.
2. Developer | after #29 merges: remove the step 2 gaps modal; OpenAI image models to `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare` before 2026-12-01.
3. Developer | jump clip (paid, Lu's OK per run).
