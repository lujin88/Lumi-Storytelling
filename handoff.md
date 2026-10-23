# Handoff

Project manager writes this. Current state only, one page max. Lu's decisions go in `decisions.md`.

## 现在在做什么
- Lu | task 9, Lumi wave: lujin88/Lumi-Storytelling#15 (eb89a0e) ready. QA: main + #11 + #12 + #15 = e66dc73, 41 tests pass. Visual: real Safari 26.6.2 light and dark, WebP, transparent, no green edge; on-model. Later: clip can stop mid-wave on slow networks; no real iPhone check.
- Lu | merge lujin88/Lumi-Storytelling#11, then lujin88/Lumi-Storytelling#12. Both passed QA and visual review.
- Developer | task 10, backend v1 on `feat/backend-v1`. CORS check done: Claude, OpenAI and Gemini all allow browser calls (Claude needs the `anthropic-dangerous-direct-browser-access` header); notes in `docs/research/BROWSER_KEY_CHECK_CORS.md`. Key storage paused until Lu decides item 0. Listing models cannot detect "no credit"; that error shows on the first real call.

## 等 Lu 决定的事
0. **Key storage (security)**: Developer measured that in Chrome every `file://` page shares one `localStorage` (origin `file://`), so any local HTML can read the keys and GitHub token Lumi stores today. Options: A save keys only when opened over http(s) (GitHub Pages or `http://127.0.0.1:4317`), memory-only under `file://` | B never save keys | C accept and warn. Recommend A, same rule for the GitHub token. Blocks: key storage in task 10.
1. **Wave quality**: edges look clean at page size but blur and small blocks show when zoomed (WebP worse than WebM), from squeezing each file under 500KB. Options: A raise the cap (e.g. 1MB) and re-export from the 960 source | B keep 500KB, tune keying and encoder settings | merge #15 as is. Recommend B first. Rive not recommended (vector redraw loses the clay texture). Blocks: #15 and the other 5 clips. Merge order still #11 → #12 → #15.
2. **Model for the other 5 clips**: A Seedance 2.0 mini (24 credits/clip, measured) | B seedance2.0 (32 credits/clip, queue over a day). Recommend A, judged after you see wave. This reverses your earlier "not mini". Blocks: the other 5 clips.
3. **Who spent 24 credits on this Dreamina account** before our run (task cd75c5b3)? You, or another channel's agent? If unknown, measured cost per clip can't be trusted.
4. **Download page**: where Lumi sits, and whether the GitHub Pages line stays inside the card. Blocks: download page polish.

## 最近完成的
- lujin88/Lumi-Storytelling#14: handoff in four sections; mini decision restored.
- lujin88/Lumi-Storytelling#13: Lumi clips via Dreamina CLI; wave reassigned to Developer.
- lujin88/Lumi-Storytelling#10: Lumi animation states switch on user actions.
- lujin88/Lumi-Storytelling#9: round-1 visual audit and mobile screenshots.
- lujin88/Lumi-Storytelling#7: design-system contradictions fixed; Tag added.

## 下一步
1. Lu picks A/B for wave quality; Developer reworks wave if needed.
2. If wave is OK, the other 5 clips (idle, head tilt, thinking, jump, cheer) with the same keying script.
3. Developer | backend v1: browser key check (Claude, OpenAI, Gemini) + local `server/` for Jimeng. Started 2026-10-23; PR next, then QA.
