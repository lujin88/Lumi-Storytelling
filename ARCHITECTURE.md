# Architecture

## Structure
- `index.html`: everything. One `<style>`, one `<script>`, images inlined as data URIs.
- `design-system/`: the visual standard (tokens, components, rules). Not loaded by the page.
- `prompts/`: the prompts sent to Claude, OpenAI and Gemini, one `.md` each, with an example in `prompts/examples/`. `node scripts/embed-prompts.js` copies them into `index.html` as `<script type="text/plain" id="prompt-NAME">`; `tests/prompts.spec.js` fails if the copies drift.
- `server/`: local static server for `index.html` and `assets/`, listens on `127.0.0.1:4317`. No API routes, no keys.

## Data flow
User input (composer, uploads, clicks) → global `state` → `render()` rebuilds the page from template strings → `persist()` saves to `localStorage` (`lumi-workbench-v1`).
AI calls go straight from the browser to the provider with the user's key: step 3 send → Claude Messages (structured output decides text or image edit) → OpenAI image edits only for an image edit; mic → Gemini `generateContent`, or the browser's own speech recognition without Gemini. Errors show as one inline line on the page (`state.aiError`).

With Claude connected, step 2 and step 4 also call Claude (task 15); without it the rule code runs as before:
- Entering step 2 drafts the open answers from the notes (`draft-answers`). An answer is kept only if its `quote` is in the notes (whitespace and full-/half-width punctuation ignored); drafts are cached per notes text.
- Next on step 2 runs `review-answers` (follow-up questions only) and `score-story` together. The Claude score is cached per answer text and shown until the text changes; Lumi's jump always follows the rule score (`ruleAudit`). Code sets a dimension to 0 when its answer is empty or its quote isn't in it, and clamps scores to 0–2.
- Entering step 4 drafts the empty answers from step 2 (`draft-defend`). Numbers not found in the step 2 answers are replaced with `[待补]` / `[Needed]` in code.
- Every Claude call streams (`stream: true`); the reply is joined before it is parsed. One Claude task runs at a time; the busy line above the composer (`#aiStatus`, `aria-live="polite"`) names it and can cancel it, and a cancelled task writes nothing. Requests still stop after 10 minutes.

## Boundaries
- Event handling is delegated: `data-action="name:arg"` on elements, one handler on `document`.
- All UI text goes through `t(zh, en)`.
- Keys live in `localStorage` only; they are excluded from downloads and project ZIPs.
- Later CSS overrides earlier CSS; new rules are appended before `</style>`. Pending: consolidate into layers.
