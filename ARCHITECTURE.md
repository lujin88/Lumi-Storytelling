# Architecture

## Structure
- `index.html`: everything. One `<style>`, one `<script>`, images inlined as data URIs.
- `design-system/`: the visual standard (tokens, components, rules). Not loaded by the page.
- `prompts/`: the prompts sent to Claude, OpenAI and Gemini, one `.md` each, with an example in `prompts/examples/`. `node scripts/embed-prompts.js` copies them into `index.html` as `<script type="text/plain" id="prompt-NAME">`; `tests/prompts.spec.js` fails if the copies drift.
- `server/`: local static server for `index.html` and `assets/`, listens on `127.0.0.1:4317`. No API routes, no keys.

## Data flow
User input (composer, uploads, clicks) → global `state` → `render()` rebuilds the page from template strings → `persist()` saves to `localStorage` (`lumi-workbench-v1`).
AI calls go straight from the browser to the provider with the user's key: step 3 send → Claude Messages (structured output decides text or image edit) → OpenAI image edits only for an image edit; mic → Gemini `generateContent`, or the browser's own speech recognition without Gemini. Errors show as one inline line on the page (`state.aiError`).

## Boundaries
- Event handling is delegated: `data-action="name:arg"` on elements, one handler on `document`.
- All UI text goes through `t(zh, en)`.
- Keys live in `localStorage` only; they are excluded from downloads and project ZIPs.
- Later CSS overrides earlier CSS; new rules are appended before `</style>`. Pending: consolidate into layers.
