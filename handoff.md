# Handoff

Project manager writes this. One page max.

## 现在在做什么
- Round 1 kickoff: `docs/plans/active/round-1-kickoff.md` (tasks 1a–8).
- PRs #1, #2, #4–#8 merged (main a8badcd); harness-core #8 and #9 merged. This PR (#3) rebased onto a8badcd.

## 等 Lu 决定的事
- Claude key check (PRD 8.12): in the browser, or a local `server/` API? Conflicts with "no backend for now, GitHub Pages".
- Backend hosting and region; whether company use (shared key) is in v1.
- Video (wave): Lu switched to the Volcengine Ark API (key `ARK_API_KEY` in Keychain; Dreamina CLI later) and approved 1 preview with `doubao-seedance-1-0-pro-250528`, 3 s, 480p, est. ¥0.43. The request returned 404 `InvalidEndpointOrModel.NotFound`: no task, no file. Duration decided: 4 s at natural speed. Lu approved 1 preview with `doubao-seedance-2-0-mini-260615`, 4 s, 480p, 1:1, est. ¥0.88 (list price, to confirm on the bill). Blocked on Lu: activate that model in the Ark console, and reinstall the codex ACP adapter so Video can receive messages.
- Download page: Lumi's position and whether the GitHub Pages line stays inside the card.
- Icons: `design-system/README.md` says Material Symbols; Lu's global rule says Remix Icon. Pick one.

## 最近完成的（只留 5 条）
- Buzz channel set: #lumi-storytelling.
- Download page merged into one card.
- Shared row grid for numbered lists.
- First-time use and input-box logic added to the PRD (8.12, 8.13).
- CSS cleanup: 381 unused rules removed, no visual change.

## 下一步（谁｜做什么）
- Developer | 1a done: PR #5 (76567bd), `npm test`, 6 flows; QA pass on 76567bd; download test now covers all 4 provider keys + GitHub token (daedd05), QA pass. Merged. No CI yet (set `PW_CHANNEL=chromium` when added), steps 3–4 untested. 1b key check once Lu answers.
- Code review & QA | review each round-1 PR per checks.md §6.
- Visual QA | deviation list merged (PR #6): high — mobile duration options fixed 408px (index.html:781); medium — mobile CTA overridden to 40px (:759), score note 11px (:1008); low — mobile slide list drops 16px padding (:1059).
- Video | wave: one preview approved (Seedance 2.0 mini, 4 s, 480p, 1:1). Submit once Lu confirms the model is activated; no probe requests. Video agent is unreachable until its adapter is reinstalled.
- Harness manager | template check done; PR #4 (dda8558) adds `docs/research/` and "Acceptance numbers" (Channel line left to #1). After Lu picks browser vs `server/`, update the "keys never leave the browser" rule in AGENTS.md / ARCHITECTURE.md.
- Developer | task 7: fix the 4 audit deviations. Unblocked (#5, #6 merged).
- Developer | task 6 PR #8 (b49cfef, stacked on #5): idle restored to each page's original animation; QA pass on b49cfef. Merged. When wave lands: set `LUMI_ONCE` to 4000ms to match the clip; WebM needs `<video>`, Safari has no transparent WebM.
- Task 8 (README 64→48px) is in Lu's PR #7. Visual designer GPT added to the channel; on standby.
- Designer | later, not round 1: split `design-system/README.md` into index + to-confirm list per template.
