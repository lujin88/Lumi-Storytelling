# Tech debt tracker

| 发现日期 | 问题 | 在哪 | 影响 | 谁发现的 |
|---|---|---|---|---|
| 2026-10-22 | CSS is layered overrides with many `!important` | `index.html` `<style>` | Hard to change safely | Design review |
| 2026-10-22 | Design System previews for ChoiceCard and Tag lag the prototype | `design-system/components/` | Docs and UI disagree | Design review |
| 2026-10-22 | PRD §5 storage list, §6 open question and §12.4 type scale are outdated | `docs/product-specs/prd.md` | Agents may read old rules | PRD update pass |
| 2026-10-22 | Score face for 5–8 still uses the old image; new "thinking" image not received as a file | `index.html` | Minor | Lu |
| 2026-10-23 | GitHub connect/publish code (`githubConnectModal()`, `/api/github/test`, `/api/github/publish`) has no trigger on the page | `index.html` | Dead code; PRD 8.11 says publishing is a guide | Developer, task 14 call map |
| 2026-10-23 | PRD §1 says AI calls go through a companion backend; decided 2026-10-23 that Claude, OpenAI and Gemini are called from the browser. PRD §2 (browser speech or Gemini) and 8.13 (mic needs Gemini) disagree | `docs/product-specs/prd.md` | Agents may read old rules | PM |
