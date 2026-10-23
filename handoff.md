# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

## 现在在做什么
- Lu | task 9, Lumi wave: lujin88/Lumi-Storytelling#15 (eb89a0e) ready. QA: main + #11 + #12 + #15 = e66dc73, 41 tests pass. Visual: real Safari 26.6.2 light and dark, WebP, transparent, no green edge; on-model. Later: clip can stop mid-wave on slow networks; no real iPhone check.
- Lu | merge lujin88/Lumi-Storytelling#11, then lujin88/Lumi-Storytelling#12. Both passed QA and visual review.
- Developer | task 10, backend v1 on `feat/backend-v1`. CORS check done: Claude, OpenAI and Gemini all allow browser calls (Claude needs the `anthropic-dangerous-direct-browser-access` header); notes in `docs/research/BROWSER_KEY_CHECK_CORS.md`. Key storage: http(s) only, memory under `file://` (decided). Listing models cannot detect "no credit"; that error shows on the first real call.

## 等 Lu 决定的事
1. **Who spent 24 credits on this Dreamina account** before our run (task cd75c5b3)? You, or another channel's agent? If unknown, measured cost per clip can't be trusted.
2. **Approve credits for the other 5 clips** (mini, 5 × 24 = 120 credits, measured price) after the reworked wave.

## 最近完成的
- lujin88/Lumi-Storytelling#14: handoff in four sections; mini decision restored.
- lujin88/Lumi-Storytelling#13: Lumi clips via Dreamina CLI; wave reassigned to Developer.
- lujin88/Lumi-Storytelling#10: Lumi animation states switch on user actions.
- lujin88/Lumi-Storytelling#9: round-1 visual audit and mobile screenshots.
- lujin88/Lumi-Storytelling#7: design-system contradictions fixed; Tag added.

## 下一步
1. Developer | re-export wave from the 960 source, each file under 1MB, before/after screenshots; then Lu reviews.
2. If wave is OK and Lu approves the credits, the other 5 clips (mini) (idle, head tilt, thinking, jump, cheer) with the same keying script.
3. Developer | backend v1: browser key check (Claude, OpenAI, Gemini) + local `server/` for Jimeng. Started 2026-10-23; PR next, then QA.
4. Developer | task 12 after 10 and 11: step 5 save dialog on Chrome/Edge, Downloads fallback elsewhere.
