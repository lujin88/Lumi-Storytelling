# Round 1: kickoff

- Owner: project manager
- Status: in progress
- Start: 2026-10-22
- Source: Lu's kickoff message in #lumi-storytelling (event 361d69e5) and the focus message before it (event c22cbc2a)

## Goal
Every executing agent has one first task with an owner, priority and a check from harness-core `checks.md`. Round 1 is done when each task below is either merged by Lu or reported blocked with a reason.

## Tasks

| # | Priority | Owner | Task | Depends on | Done when (check) |
|---|---|---|---|---|---|
| 1a | P0 | Developer | Move the Playwright flow tests into `tests/`, add one command to run them all, document it in `AGENTS.md` "How to run and test". PR. | — | checks.md §5: own worktree + branch; PR says what changed, how it was tested, which commit the tests ran on. |
| 1b | P0 | Developer | Claude key check for PRD 8.12 (connected / not connected, one-line error in the row on a wrong key). **Where it runs is waiting on Lu** (browser vs local `server/`). No deploy, no GitHub secrets, no key in repo, logs or fixtures. PR. | 1a, Lu's answer | checks.md §5 + every "Done when" line of PRD 8.12 that the change touches is covered by a test in `tests/`. |
| 2 | P0 | Code review & QA | Review every PR from this round. | each PR | checks.md §6: names the HEAD reviewed (`git rev-parse HEAD`), full test suite run, verdict **pass** or **changes needed**, blocking and non-blocking listed apart; workflow changes checked for `secrets.*` and raised `permissions:`. |
| 3 | P1 | Visual QA | Compare `index.html` against `design-system/`; deviation list sorted by severity, each with a screenshot or file location. Standard is `design-system/`, not the prototype. Deliver as a PR adding the list under `docs/` (or a channel post if Lu prefers). | — | checks.md §4. |
| 4 | P1 | Video | Lumi "wave" loop. First: a plan (source render, generation command (Ark API since 2026-10-22; was Jimeng CLI), prompt, output settings, how transparency is achieved, credit estimate with source). Wait for Lu's approval. Then **one** preview clip only. | Lu approves plan | Plan posted with credit estimate sourced (Jimeng pricing page or our own run, say which). Preview: transparent loop, WebM + WebP fallback, each < 500 KB, on-model (face, hair, scarf, clay texture match the renders); off-model clips are discarded. Final files go to `assets/lumi/` via PR. |
| 5 | P1 | Harness manager | Check the repo against harness-core's project-layer template; run `bash scripts/check-docs.sh`; open a PR for anything missing. | — | Script output pasted in the PR; PR lists each gap found and what it adds. |
| 6 | P2 | Developer | Lumi animation states: the page switches Lumi's loop based on what the user does (team focus 2). Placeholder images until real loops exist; only "wave" is real this round. Stacked on 1a. PR. | 1a | checks.md §5 + a test in `tests/` for each state switch the PR adds. |
| 7 | P1 | Developer | Fix the 4 deviations in the visual audit (PR #6): mobile duration options overflow (`index.html:781`, page scrolls sideways at 320/390px); mobile step CTA 40px → 48px per `design-system/components/Composer/README.md:8` and `tokens.json` `composer-h` (`:759`); score note 11px → 12px (`:1008`); mobile slide list 16px side padding (`:1059`). PR. | #5, #6 | checks.md §5 + a test in `tests/` that the page has no horizontal scroll at 320 and 390px, and the mobile CTA is 48px. Visual QA re-checks in Chrome. |
| 8 | P2 | Designer (covered by Lu's PR #7) | `design-system/README.md:40` says `composer-h` is 64px; `tokens.json`, `design-system/components/Composer/README.md` and the code (`index.html:231`) all use 48px. Fix the README line. | — | PR changes only that line; check-docs passes. |

## Notes for owners
- Renders: source renders are in `assets/lumi/source/` (10 WebP with alpha, from PR #2). Use those; do not extract data URIs from `index.html`.
- `AGENTS.md` channel line is fixed by PR #1; task 5 (PR #4) leaves it alone.
- Keys: never in code, logs, fixtures, screenshots or GitHub Actions secrets. Local `.env` only for local runs; visitors' keys stay in their browser.

## Waiting on Lu (do not start)
- Task 1b location: browser key check vs local `server/` API (asked in channel, event 61523f37).
- Backend hosting and region.
- Whether company use (shared org key) is in v1.

## Progress
| Date | What happened |
|---|---|
| 2026-10-22 | Plan written; tasks assigned in channel. |
| 2026-10-22 | QA passed PR #1 (channel name, HEAD b2e637d) and PR #2 (Lumi source renders, HEAD bff1279); both opened by lujin88. Source renders live in `assets/lumi/source/` once #2 merges. |
| 2026-10-22 | Repo write access granted to bot. PR #3 (plan) and PR #4 (template gaps) opened. Visual QA static list delivered as a workspace file, no PR. Video plan posted; credit estimate still to confirm. |
| 2026-10-22 | PR #5 (daedd05), #6 (c9bb05c), #8 (b49cfef) passed QA. Video moved to the Ark API on Lu's say; the one approved wave preview (Seedance 1.0 pro, est. ¥0.43) returned 404 model not found, nothing generated. Waiting on Lu: activated model + duration. No PR merged yet; main 8257d2b. |

## Decisions
| Date | Decision | Reason |
|---|---|---|
| 2026-10-22 | PR #1 non-blocking: the stale handoff line is fixed in the PM handoff update, not in #1 | handoff.md is PM-owned; avoids two edits racing |
| 2026-10-22 | PR #2 non-blocking: README fixes (`point.webp` is used on the review card; "wave only until Lu approves") go into the video wave PR | Video touches `assets/lumi/README.md` anyway; keeps #2 mergeable now |
| 2026-10-22 | Task 6 added: developer had started animation state switching; it gets a row so its PR has a check | QA review of #3 |
| 2026-10-22 | CTA height is 48px; README.md:40 (64px) is the stale line, not a product question | tokens.json, Composer/README.md and index.html:231 all say 48px |
| 2026-10-22 | Task 6 (PR #8): idle restores each page's original Lumi animation by default; unified breathing only if Lu asks | No motion standard in design-system/ to justify changing existing behaviour |
| 2026-10-22 | Missing "tested on commit / not done" in PR descriptions is not blocking for docs/asset-only PRs | Only check is check-docs; QA recorded the HEAD |
