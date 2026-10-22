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
- Lumi animation clips: each file under 500KB (Lu, #lumi-storytelling team instructions).
- To confirm: contrast, performance, API latency and cost limits.

## How to run and test
- Run: open `index.html` in a browser.
- Test: pending. Playwright flow scripts exist outside the repo and still need to be added under `tests/`.
- Docs check: `bash scripts/check-docs.sh`.
