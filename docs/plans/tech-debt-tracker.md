# Tech debt tracker

| 发现日期 | 问题 | 在哪 | 影响 | 谁发现的 |
|---|---|---|---|---|
| 2026-10-22 | CSS is layered overrides with many `!important` | `index.html` `<style>` | Hard to change safely | Design review |
| 2026-10-22 | Design System previews for ChoiceCard and Tag lag the prototype | `design-system/components/` | Docs and UI disagree | Design review |
| 2026-10-22 | PRD §5 storage list, §6 open question and §12.4 type scale are outdated | `docs/product-specs/prd.md` | Agents may read old rules | PRD update pass |
| 2026-10-22 | Score face for 5–8 still uses the old image; new "thinking" image not received as a file | `index.html` | Minor | Lu |
| 2026-10-23 | GitHub connect/publish code (`githubConnectModal()`, `/api/github/test`, `/api/github/publish`) has no trigger on the page | `index.html` | Dead code; PRD 8.11 says publishing is a guide | Developer, task 14 call map |
| 2026-10-23 | PRD §1 says AI calls go through a companion backend; decided 2026-10-23 that Claude, OpenAI and Gemini are called from the browser. PRD §2 (browser speech or Gemini) and 8.13 (mic needs Gemini) disagree | `docs/product-specs/prd.md` | Agents may read old rules | PM |
| 2026-10-23 | 400/404 (model not found) shows "no result, try again"; retrying never helps. Will hit every image edit after `gpt-image-1` shuts down 2026-12-01 | `index.html` step 3 error mapping | Users retry forever | QA, PR #26 |
| 2026-10-23 | If the user edits the script while a step 3 request is in flight, the reply replaces the whole script | `index.html` `applyStep3` | Lost user edits (low likelihood) | QA, PR #26 |
| 2026-10-23 | Gemini audio is sent inline (20MB limit per Gemini docs); recordings have no length cap. Over the limit shows "no result" | `index.html` `transcribeRecording` | Long recordings fail with a vague message | QA, PR #26 |
| 2026-10-23 | Step 3 does not check that "[待补]"/"[Needed]" markers survive a Claude edit; only the prompt asks to keep them. Pasted material with hidden instructions can remove them or rewrite any slide | `index.html` `applyStep3`, `prompts/` | Invented content can slip in (PRD §10) | QA, PR #26 |
| 2026-10-23 | Step 3 text and image edits have no undo | `index.html` | A bad AI edit cannot be reverted | QA, PR #26 |
| 2026-10-23 | AI requests time out only after 10 minutes (Claude's non-streaming ceiling, https://platform.claude.com/docs/en/api/errors#long-requests); the only busy signal is a 4 s toast and there is no cancel. Fix: streaming, a persistent busy state and a cancel button. Planned with task 15, which adds more Claude calls | `index.html` `providerCall` | User waits with no feedback; an image edit (Claude then OpenAI) can wait up to 20 minutes | Developer, PR #26; QA |
