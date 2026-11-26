# Lumi Storytelling

A design-led prototype that turns a messy project into a story you can present: notes in, a story, slides, a script and follow-up answers out.

**Open `index.html` in a browser.** It is one self-contained file. Drafts stay in your browser; nothing is uploaded.

## The five steps
1. **Gather**: what it's for, who's listening, how long, and your notes.
2. **Story**: Lumi drafts the answers; you polish; Lumi reviews before you move on.
3. **Slides & script**: pick a style, edit slides, switch between outline and full script.
4. **Follow-ups**: the questions your audience will ask, ordered by what they care about.
5. **Download**: presentation, script, outline, design system and project data.

## What's in this repo
| Path | What |
|---|---|
| `index.html` | The prototype |
| `server/` | Local static server. Run `node server`, then open http://127.0.0.1:4317 so saved keys persist |
| `design-system/` | Tokens, components and rules the prototype follows |
| `docs/product-specs/prd.md` | The PRD |
| `AGENTS.md` | How agents work in this repo |

AI features use your own keys (Claude required; OpenAI and Gemini optional), set in Settings and kept in your browser. Keys are saved only when Lumi is opened over http(s); opened as a file, they last until the page closes.

## Hosted version (static, bring your own key)

`index.html` plus `assets/` is the whole app. Deploy the repo root as a static site (Vercel, no build command, no env vars). `vercel.json` sets a CSP whose `connect-src` limits `fetch`/XHR calls from the page to `'self'`, `data:`, `blob:`, `api.anthropic.com`, `api.openai.com` and `generativelanguage.googleapis.com`. This is defense in depth, not a guarantee that an injected script cannot exfiltrate a key: because `index.html` is a single file with inline scripts, `script-src` allows `'unsafe-inline'`, and `connect-src` does not restrict top-level page navigation (such as setting `location.href` or calling `window.open`). Keys stay in the visitor's browser (localStorage) and are not part of any download or ZIP. The three providers answer browser calls with CORS (checked 2026-11-26 with fake keys: Anthropic needs `anthropic-dangerous-direct-browser-access: true`), so no proxy is needed.

The hosted version has no `/api`. The GitHub publish code (`githubRequest`) still needs the local `server/`, and no button on step 5 reaches it, so nothing breaks; step 5 only offers downloads. `connect-src` also allows `data:` and `blob:` because OpenAI image edit and video export fetch those.
