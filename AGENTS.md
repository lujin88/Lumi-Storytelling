# Lumi Storytelling

Read harness-core's `AGENTS.md` first (https://github.com/lujin88/harness-core), then this page. This page only lists what is specific to this project.

## Project
- One line: a single-file prototype that turns project notes into a presentable story (slides, script, follow-up answers).
- Channel: `#lumi-storytelling` (Buzz). Team: Lumi Storytelling.
- Default branch: `main`.

## Files
| File | Contents |
|---|---|
| `brief.md` | Goal, users, constraints, success criteria |
| `decisions.md` | What Lu decided |
| `handoff.md` | Current state (project manager only) |
| `design-system/` | Tokens, components, rules. The standard for design and code |
| `bar.md` | Quality bar: 5–7 checkable mechanisms from 1–3 references. UX researcher drafts it, Lu merges |
| `docs/product-specs/prd.md` | PRD (exported from Claude Docs; this copy is what agents read) |
| `docs/research/` | Research docs |
| `docs/plans/` | Plans: `active/`, `completed/`, `tech-debt-tracker.md` |
| `ARCHITECTURE.md` | Code structure and boundaries |
| `QUALITY_SCORE.md` | Quality grade per area |
| `examples/` | Good and bad examples |

## Project rules
- `design-system/` is the standard. The prototype is not, unless the design system says so.
- UI copy is bilingual (中/EN); every string goes through `t(zh, en)`.
- Buttons are text only; icons trail text; one action colour. See `design-system/README.md`.
- API keys never leave the browser, never appear in downloads, logs or commits.

## Acceptance numbers
- Sizes, spacing, type, radius: `design-system/tokens.json`.
- Lumi animation clips: each file under 1MB (Lu, 2026-10-23, see decisions.md; was 500KB).
- To confirm: contrast, performance, API latency and cost limits.
- Check widths (检查宽度): 1512, 1905 and 390, light and dark (decisions.md, 2026-10-25). Every first review and every rework screenshot covers all of them.

## How to run and test
- Run: `node server`, then open http://127.0.0.1:4317 . Opened as `file://`, keys are not saved (decisions.md, 2026-10-23).
- **Lu tests at one address only: http://127.0.0.1:4317 .** Keys are saved per address (`localStorage` is per origin), so any other port or `localhost` shows an empty Settings page. Other ports are for your own screenshots and tests; never send them to Lu.
- Test: `npm install` once, then `npm test` runs the full Playwright suite in `tests/` (opens `index.html` over `file://`, or over a mocked http origin where behavior differs, network blocked). Uses local Google Chrome; `PW_CHANNEL=chromium npm test` uses Playwright's Chromium after `npx playwright install chromium`.
- Docs check: `bash scripts/check-docs.sh`.
- After editing a prompt in `prompts/`: `node scripts/embed-prompts.js`, then `npm test`.
