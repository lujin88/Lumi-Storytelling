# Lumi Storytelling Workbench — PRD

Sep 25, 2026 · @Lu

## 1. Overview

**Lumi · A space for your story** ("Storytelling Workbench") is a single-page, single-HTML-file prototype that turns a project into a presentation-ready story. The user's notes go in. Story answers, slides in a chosen style, a script and follow-up answers come out, and step 5 downloads them.

**Audience:** an individual contributor (PM, designer, researcher) who needs to turn real project work into a leadership- or client-facing narrative without starting from a blank slide deck.

**Current implementation state — important context for scoping any next work:**

- It is **one 4.3 MB HTML file**, framework-free, with fonts, icons and images embedded. No build step.
- The flow is five steps: Gather, Story, Build, Defend, Download. Download is step 5. There is no top bar.
- The flow runs client-side. AI calls go through the companion backend at `http://127.0.0.1:4317` (or a relative `/api/...` path when deployed): Claude (drafting and review), OpenAI (images), Gemini (voice to text) and Jimeng (video only, via Seedance). That backend is not part of this file.
- **No sample content is shown as if it were the user's.** Every title and point comes from the user's own words. Anything not supplied stays visible as `[待补]` / `[Needed]`.

## 2. User flow

Five steps in the sidebar (v6, Oct 22). The old Story map and Talking points steps are merged into Find the story and Slides & script; Export moved out of the top bar into step 5. There is no top bar on desktop: the language switch sits next to the logo.

| Step | What happens | Exit |
| --- | --- | --- |
| **1 Gather** | Type, talk or upload notes. Pick purpose (interview, portfolio, report) and length. Interview and report also pick **who is listening** (multi-select roles plus custom ones). Load or clear a sample project. | Notes saved and a purpose picked |
| **2 Find the story** | Part 1: six questions with inline edit, autosave and undo. Part 2: three things to remember. Story score card top right; Next first runs Lumi's review, which adds follow-up questions. | All answered, or continue with gaps (gaps are marked, never invented) |
| **3 Slides & script** | Pick a style (built-in or saved "my style" with image and brief). One row per slide; Outline or Full script toggle. Edit popup per slide: layout, motion, swap image for video. | None |
| **4 Follow-ups** | One question per slide: what they test, where not to overclaim, the one fact to add, your answer. Ordered by the chosen audience. | Leads to Download |
| **5 Download** | Checklist of files (all by default). One file downloads as itself, several as a ZIP. Short GitHub Pages guide. | — |

No step is locked: every step can be opened at any time from the sidebar. The primary action is always bottom right ("Next", ⌘/Ctrl+Enter), and the step-5 action is "Download all".

## 3. What's real vs. simulated

Everything the user sees now comes from their own material; what is still rule-based rather than model-driven is the extraction and drafting:

| Feature | Status |
| --- | --- |
| Drafting answers from the notes (step 2) | **Not Claude-backed yet.** Drafts are marked 初稿 until the user edits or accepts them. Real Claude drafting is in the Backlog. |
| Review on Next (steps 2 and 4) | **Not Claude-backed yet.** Vague answers get follow-up questions; Claude review is in the Backlog. |
| Story score | **Completeness only**, not quality. Claude scoring weighted by audience is in the Backlog. |
| Follow-up questions and drafted answers (step 4) | Ordered by the chosen audience. Answers are drafted from the step-2 answers. A Claude endpoint is in the Backlog. |
| Slides | **Real layout** from the story in the chosen style. Images are the bundled photo unless the user uploads one or OpenAI edits it. |
| Video on slides | The user can swap an image for a video. Uploaded videos are not persisted yet; Jimeng/Seedance generation is in the Backlog. |
| Voice input, GitHub publish | Unchanged: real when the backend is running. |

**Implication:** the prototype no longer looks smarter than it is. When the user hasn't supplied something, the gap is visible instead of covered by sample copy. The remaining gap is that drafting, review and scoring are not yet done by Claude. The next step is to let Claude draft answers, review them and draft follow-up answers, under the skill's no-invention policy (§10). See Backlog for Buzz.

## 4. Functional requirements (as implemented)

Five steps plus Settings. Each block lists what the user sees and does.

**1 Gather (收集素材)**

- Purpose cards: Interview, Report, Portfolio. Single select, no subtitles.
- Interview and Report then show a "who is listening" tag row. It is multi-select: preset roles plus custom roles the user adds. See 8.7.
- Length chips: 5 / 10 / 15 / 30 min. Portfolio uses reading time instead: 1 / 3 / 5 / 8 min.
- Input: typed text, voice (browser speech or Gemini) and Markdown. A ZIP or `.lumi.md` restores a saved project instead.
- The upload area shows four hints:
  - What the project was and who used it.
  - What you owned and decided.
  - What was hard and who pushed back.
  - How it turned out, with numbers.
- A sample project can be loaded and cleared. Clearing it restores the user's own prior work.
- File limits: images 20 MB, project ZIP 30 MB, Markdown 2 MB.

**2 Find the story (找到故事)**

- Part 1, "Tell the story": six questions. Part 2: "Three things to remember".
- Lumi drafts answers from the notes first. Each draft is marked 初稿 (draft) until the user edits or accepts it.
- The user edits inline. Changes autosave and can be undone.
- Story score card, top right: a ring with a Lumi face that changes by score tier. Rows expand per dimension, each with a Fix link. The score measures completeness only, not quality. See 8.8.
- Next runs Lumi's review. If anything is vague, Lumi adds follow-up questions and the user stays. When everything holds, Next moves on. There is no separate review button. See 8.9.

**3 Slides & script (页面和讲稿)**

- A style dropdown sits next to the Slides heading. It holds built-in styles and "my styles" (reference image, brief or `.md`, background, font, accent).
- One row per slide: thumbnail, title, points.
- Outline / Full script toggle.
- Per-slide edit popup: layout, motion with replay, swap the image for a video.
- Timing is shown as a line, for example "6 slides · \~1:40/slide".
- See 8.10.

**4 Follow-ups (追问准备)**

- One question per slide, ordered by the chosen audience.
- Each question shows:

| Field | What it holds |
| --- | --- |
| What they're checking | The concern behind the question |
| Don't overclaim | The line the answer should not cross |
| Fact to add | A fact that makes the answer stronger |
| Your answer | Lumi's draft from the step-2 answers, marked 初稿 until the user edits it |

- Next runs the same gate as step 2: review, then feedback, then proceed.

**5 Download (下载文件)**

- A checklist of files, all selected by default.
- One file downloads as itself. Several download as one ZIP.
- One quiet link to the GitHub Pages docs.
- See 8.11.

**Settings**

- One table with a row each for Claude, OpenAI, Gemini and Jimeng:

| Column | What it does |
| --- | --- |
| Key | Where the user pastes the API key |
| Connect | Connects the provider with that key |
| Status | Shows whether the provider is connected |
| Model | Dropdown to pick the model |

- Keys stay in the browser.
- Bilingual interface with one shared content source. The 中/EN toggle sits next to the logo. The user's own text is never split into separate language copies.
- The theme follows local time: dark from 19:00 to 07:00.
- Every change autosaves to the browser.

## 5. Data, persistence & security

**Storage:** three `localStorage` keys, all scoped to the browser/device, none synced anywhere:

- `lumi-workbench-v1` — project state: notes, answers, purpose, length, the five checks (`found`), whether gaps were accepted, map state (`storyState`, `mapStale`), slides, talking points, approvals, language, template and `generatedImage`. If the browser quota is exceeded, it retries without the image.
- `lumi-api-keys-v1` — Claude/OpenAI/Gemini API keys, **stored in plaintext**.
- `lumi-github-token-v1` — GitHub PAT, **stored in plaintext**.

**Not persisted across reload:** uploaded reference/template files (`visualFiles`), in-progress composer drafts, and GitHub repository/branch/account fields. `generatedImage` is now included in `lumi-workbench-v1`, so an uploaded or edited slide image survives a reload.

**API keys:** the `type="password"` input is a UI mask only — values still live in plaintext in `localStorage` and in the DOM. This is disclosed to the user in-product ("keys stay on this device") but remains a real plaintext-secret-at-rest exposure if the device/browser is shared or compromised (XSS, malicious extension, devtools access).

**GitHub token:** same plaintext-at-rest caveat. Per the code, it is sent only to the local/first-party backend (`127.0.0.1:4317` or same-origin `/api/...`), never to a third party, and is explicitly excluded from all exports (ZIP, HTML, project JSON) — this matches the in-product copy.

**XSS:** nearly all user-controlled text is passed through an `esc()` HTML-escaper before being inserted into `innerHTML`; no unescaped injection of raw user input was found in this review. One low-severity gap: `github.url` / `github.commitUrl` are HTML-escaped for the `href` attribute but not scheme-validated, so a compromised backend response could in theory supply a `javascript:` URL — recommend an `http(s):`-only allowlist before use as a link href.

**Backend trust boundary:** because the app blindly trusts whatever the local/backend server returns (image URLs, script text, GitHub URLs), the security model implicitly assumes the companion backend is trusted and not itself compromised — worth stating explicitly if this ships beyond a local prototype.

## 6. Open questions & recommended next steps

**Open questions (need the product owner's decision):**

- Is the plan to keep this as a local, single-file, backend-optional prototype, or to ship a real hosted backend? That decides whether the plaintext key/token storage (§5) is an acceptable trade-off or a blocker.
- Finding answers in the notes is keyword-based, so any sentence that mentions "customer" can be marked as the answer to "why it matters". Should Claude do this extraction, and should a "found in your notes" item count only after the user confirms it?
- Should the gate demand a minimum before approving with gaps, for example that "why it matters" and "what made it hard" are answered?
- Some older Visuals-page and Clarify-page CSS and markup is no longer used by any view. Confirm it can be deleted rather than kept for a relaunch.

**Recommended next steps, roughly in priority order:**

1. Use Claude to draft the story answers and the script from the notes, sending the skill policy (see Backlog for Buzz).
2. Address the plaintext key/token storage before any shared-device or multi-user use.
3. Declare the artifact downloads capability so Download (step 5) works inside the hosted artifact; plain download links do nothing there.
4. Delete the unused CSS and markup from the old Visuals and Clarify pages as its own reviewed pass.

## 7. Data model

There is **one root mutable object, `state`**, plus one sibling object `github` (kept separate in the source, but conceptually part of the same model) and a handful of bare module-level `let`s for transient recording state (`recording`, `mediaStream`, etc. — deliberately *not* persisted, since they're DOM/hardware handles that can't survive a reload anyway).

&#91;embedded content: state shape · 4 entity groups, 3 localStorage keys\]

**Why it's shaped this way:** the split isn't a formal schema — it's four purposes mixed into one object: (1) the actual project content a user is authoring (survives everything, is what gets exported), (2) where-am-I-in-the-wizard UI state (survives reload for convenience, resets on export), (3) provider connection state (deliberately *not* persisted as "connected" — only the raw key is saved, and connection is re-verified every load via `autoValidateProviders()`), and (4) the GitHub publishing state (token persisted, everything else — repo/branch/account/URL — is not, so a returning user must re-type the repo and branch even though their token is remembered).

**Per-language duplication:** `script` and `direction` are objects keyed by `'zh'`/`'en'` rather than the app picking one language — so a script written/edited in Chinese and one in English coexist independently; switching the language toggle does not translate, it swaps which key is displayed.

**Scene entity** (inside `scenes[]`): `{ type, job, ev, zh, en, zhp, enp, zhv, env }`. `job` ties the slide to one of the five checks (`stake`, `challenge`, `decision`, `outcome`, `wisdom`; empty for slides the user adds) and drives its follow-up question and claim boundary. `ev` is the evidence status: `supported`, `stated`, `inferred` or `missing`. `zh`/`en` hold the title, `*p` the body and `*v` the visual note.

**Story answers** live in `state.found`. An answer with no stored text falls back to Lumi's draft from the notes; with neither, it is missing. There is no map approval gate any more: `storyState` and `mapStale` belonged to the old Story map step and no longer gate any step. Next on steps 2 and 4 runs Lumi's review instead (8.9).

**State fields added in v6**

| Field | Holds |
| --- | --- |
| `audience` | Listener roles picked on step 1 (Interview and Report) |
| `customRoles` | Roles the user typed in |
| `scriptMode` | Outline or Full script on step 3 |
| `followups` | Step-4 questions and the user's answers, with draft marks |
| `sample` / `preSample` | Whether the sample project is loaded, and the user's own work saved before it, restored on clear |
| `scoreOpen` | Whether the score card rows are expanded |
| `pkgSel` | Files ticked on step 5 |

## 8. Logic walkthrough

Tracing the control flow end to end, since this is the part that's hardest to see just by reading the minified source.

&#91;embedded content: five steps · review on Next in steps 2 and 4\]

### 8.1 The render cycle

There is no diffing/virtual DOM — every state change is followed by calling `render()`, which does a **full re-render**: rebuild the sidebar/topbar (`shell()`), rebuild `#content.innerHTML` from the current page's view function, rebuild the footer composer (`renderFooter()`), run a few page-specific DOM tweaks (placeholder text, mascot image, build-page scroll listener setup), then call `persist()` to write to `localStorage`. This means: **every keystroke does not re-render** (inputs are read live via `capture()`, not re-rendered on each character), but every navigation, button click, or async API response does a full-page rebuild. This is simple and correct but means all DOM state not backed by `state` (scroll position, focus, open `<select>`) is lost on every action unless explicitly restored (e.g. `initBuildNavigation()` re-attaches the scroll listener after every rebuild).

### 8.2 `capture()` — the missing piece between typing and state

Because inputs aren't controlled components, `capture()` is a manual sync: before anything that might read `state` (navigating, sending, downloading), it pulls current values out of specific DOM elements by id (`#brief`, `#scriptEdit`, `#direction`, `#guideText`, `#voiceModel`, every `[data-key]` input) into `state`. If a function forgets to call `capture()` first, it silently acts on stale `state` — this is why `go()`, `send()`, `next()`, `downloadPackage()`, `exportProject()`, `downloadDirection()`, and the `beforeunload` handler all explicitly call it. `#scriptEdit`, `#direction` and `#voiceModel` no longer exist in any rendered view, so those three lookups in `capture()` are permanently no-ops today.

### 8.3 Page gates — `next()`

`next()` checks one condition per step. Step 1 needs notes and a purpose. On steps 2 and 4, the first Next runs Lumi's review: weak answers get follow-up questions and the user stays. The next Next moves on; gaps stay marked, never invented. Editing or sending an answer resets that step's review (8.13). Step 3 has no condition. Step 4 leads to Download.

### 8.4 Sidebar navigation

No step is locked. `go()` opens any step from the sidebar and runs no review; the review runs only on Next. The story map approval, the `storyState` lock and the `mapStale` rebuild banner are gone (§7).

### 8.5 Click dispatch

One generic bubble-phase `[data-action]` handler covers most actions. Four capture-phase handlers intercept their own action names first, via `stopImmediatePropagation()`: slide editing (save, reorder, add), the style dropdown on step 3, and Settings. A reader still needs to know that capture runs before bubble to find where a given `data-action` is handled.

### 8.6 `send()` — one function, one meaning per step

`send()` branches on the step. Gather appends the text to the notes. Story fills the focused answer, follow-up or three-things slot. Build sends an edit request for the slides or script; an image edit goes to OpenAI. Defend fills the open question's answer and replaces the Draft. Full rules are in 8.13.

### 8.7 Audience: who is listening (new in v6)

When the purpose is Interview or Report, step 1 asks who is listening. The answer changes what Lumi stresses, not what the user wrote.

| Purpose | Preset roles | Custom roles |
| --- | --- | --- |
| Interview | Design lead, Product manager, Engineering lead, HR / recruiter, Business lead | Type a role, press Enter; removable |
| Report | Design lead, CEO, Head of product, Tech / IT lead, Business unit lead, Finance | Type a team, press Enter; removable |

- **Multi-select.** A panel interview or a mixed leadership review is common, so any number of roles can be picked. Roles are Tags; purpose and length are single-choice ChoiceCards (design system). Nothing is required; with no role picked, Lumi behaves as before.
- **Stored per purpose.** `state.audience = { interview: [...], report: [...] }` and `state.customRoles` the same shape, both in `lumi-workbench-v1`. Switching purpose keeps each list.
- **Role → focus map.** Each preset role maps to the story checks it probes first. Custom roles carry no map and only add their name to prompts.

| Role | Asks first about |
| --- | --- |
| Design lead | Real problem, the call you made, what made it hard |
| Product manager / Head of product | Why it mattered, real problem, outcome |
| Engineering lead / Tech / IT lead | The call you made, what made it hard, outcome |
| HR / recruiter | What you learned, what made it hard, why it mattered |
| CEO / Business lead | Why it mattered, outcome, the call you made |
| Finance | Outcome, why it mattered |

- **Where it is used.**
  1. Follow-ups (step 4) are sorted by the merged focus order of the picked roles, and the subtitle says "Ordered by what X will most likely ask".
  2. Every Claude request sends `purpose` and `audience` (role names joined) so script rewrites match the listener.
  3. Planned: the story score weights the checks the audience cares about, and follow-up questions are phrased in that role's words.

### 8.8 Story score

- Five dimensions (tension, trade-off, turning point, your role, outcome) scored 0–2 each from the answers; total out of 10.
- Shown as a card top right of step 2: ring + score + "N to improve". Click expands one row per dimension with a 3-segment bar, status and a "Fix" link that jumps to the question.
- **Known limit:** scoring is keyword-based, so a very short answer can still score 2. Real scoring needs Claude; the card says it is an estimate.

### 8.9 Review and follow-ups

- Next runs Lumi's review, which reads every answer. A weak answer becomes a follow-up question listed under part 1; if all are fine, Lumi adds up to two probing questions.
- Follow-up answers are appended to the parent answer for slides and script.
- Feedback language follows the language of the answer, not the interface.

### 8.10 Slides & script

- **Outline / Full script toggle** (`state.scriptMode`). Full script shows one editable paragraph per slide; untouched paragraphs are drafts built from the title and points (grey until edited). `talk.md` exports whichever mode is on.
- **Edit popup per slide** (click the thumbnail or its Edit button): layout, motion (none, fade, rise, one by one, zoom; with replay) and swap the image for a video. Motion plays in the exported HTML when the slide scrolls in, and is skipped under reduced motion.
- **Video** is kept in memory for the session and included in exports made in that session; it is not saved to the browser yet.
- **My styles**: name, reference image (drag and drop), style brief or uploaded .md, background, title font, accent. The brief is sent with image prompts.

### 8.11 Download, settings, theme

- Step 5: checklist of files; one file saves as itself, several as `lumi-story.zip`. Inside claude.ai it goes through the viewer's download prompt. Publishing to the web is a guide, not an automated upload.
- Settings is one table: Claude, OpenAI, Gemini, Jimeng (key, Connect, status, model dropdown). Providers are only auto-checked when a key is present. Jimeng connects through the local service (API key, or the signed-in Dreamina CLI); that endpoint is not built yet.
- Theme follows local time: dark from 19:00 to 07:00, rechecked every minute. Slide previews keep their own colours.

### 8.12 First-time use

On first open, before step 1 does anything AI, Lumi asks the user to connect Claude.

| Provider | Needed? | What it unlocks |
| --- | --- | --- |
| Claude | Required | Drafting, review, score feedback |
| OpenAI | Optional | Images |
| Gemini | Optional | Voice to text |
| Jimeng (即梦) | Optional | Video, via Seedance. It does not make images. |

1. A short first-run card: "Connect Claude to start".
2. Connect opens the Settings table.
3. Lumi checks the key.
4. On success, the user goes back to step 1.

- The user can skip the card and use the sample project. Any AI action then shows an inline "Connect Claude" prompt instead of failing silently.
- Keys stay in this browser only.
- Settings shows a connection status for each provider.

**Done when**

- A new browser shows the card on first open, before any AI call.
- A valid Claude key is checked and the user lands back on step 1.
- A wrong key shows a one-line error in its row and is not marked connected.
- After skipping, every AI action shows "Connect Claude" inline. Nothing fails silently.
- Each optional provider says what it unlocks, and each row shows its status.
- Keys are stored only in this browser and are never in a download.
- The card does not show again once Claude is connected.

### 8.13 Input box logic

One input box (composer) sits at the bottom of steps 1–4. What it shows and does depends on the step and on what is in focus.

**Global rules**

- Hidden on step 5 Download, Settings and Help.
- The placeholder always says what to type for the item in focus. Precedence: focused follow-up > focused "three things" slot > focused row or question > step default.
- Send is disabled while the box is empty. Enter sends; Shift+Enter adds a line; ⌘/Ctrl+Enter is Next.
- Mic is voice to text and needs Gemini. If Gemini is not connected, show inline "Connect Gemini in Settings".
- Unsent text is kept per step in this browser.
- Lumi replies in the language the user typed.
- Editing or sending any answer resets that step's review: the next Next runs the review again.

| Step | State | Placeholder | Accepts | What sending does |
| --- | --- | --- | --- | --- |
| 1 Gather | Empty | "Start with what the project was…" | Text, voice; + adds .md or a Lumi project .zip | Appends the text to the brief (preview clipped at 280 characters). A .zip restores the whole project. |
| 1 Gather | Sample loaded | Same | Same | Same. The right side shows "Viewing a sample · Clear sample"; clearing restores what the user had before. |
| 2 Story | Open row in focus | "At the time…" | Text, voice | Fills the focused answer. A Lumi "Draft" becomes the user's answer once edited. |
| 2 Story | Follow-up in focus | "Answer this follow-up…" | Text, voice | Fills that follow-up. |
| 2 Story | Three-things slot N in focus | "Thing N they should remember…" | Text, voice | Fills slot N. |
| 2 Story | All complete | "Click any row to edit it" | Text, voice | Edits the row the user clicks. |
| 3 Build | Default | "Make slide 1 open with the point" (fallback "Tell Lumi what you want to change…") | Text, voice; + adds PNG, JPEG or WebP screenshots or reference images | Sends an edit request; Lumi applies it to the slides or script. |
| 4 Defend | Open question card | "Answer question 0N…" (follows the open card) | Text, voice | Fills that answer and replaces the Draft. |

**Step 1 empty state**

- A shaded guidance box above the brief. Lead: "Cover these four and Lumi can draft the rest:"
  - What the project was and who used it.
  - What you owned and the calls you made.
  - What was hard and who pushed back.
  - How it turned out, with numbers.
- Empty brief line: "Type or talk in the box below, or use + to add notes or docs. Rough is fine."

**Edge cases**

- No Claude key: sending shows the inline connect prompt (8.12). The text is kept.
- Lumi is busy: Send is disabled until the reply arrives.
- File too large or wrong type: a toast says so, and the file is not added.

## Tone of voice

Lumi talks like a calm senior colleague sitting next to you: warm, direct, and on your side. It helps you say what you actually did, never makes things up, and never lectures.

| Principle | Do | Don't |
| --- | --- | --- |
| **Plain** | Short everyday words. “不用整理。” / “No need to tidy it up.” | Jargon or system words: “项目包已拆解”, “credential source”, “payload” |
| **Short** | One idea per line. Labels 2–6 characters (“别说过头”). Helper text one sentence. | Two-sentence subtitles under every heading; repeating what the UI already shows |
| **Honest** | Say what is missing and what is an estimate. “缺材料”, “估算”, “\[待补数字\]” | Filling a gap with a made-up number or promising accuracy we don't have |
| **Coaching, not judging** | Point to the next small step: “再补一个数字：多少客户、多少钱或多少时间。” | Grading the user: “你的回答太弱” |
| **Second person, Lumi as “我”** | “我把说得不够具体的地方变成新追问。” | Passive or system voice: “系统将生成……” |
| **Calm** | Statements end with “。”; questions only when Lumi really asks. | Exclamation marks, emoji, hype (“太棒了！”) |

**Mechanics**

- **Buttons** are verbs, 2–4 characters: 下一步, 连接, 保存, 全部下载. English: Next, Connect, Save, Download all.
- **Headings** state the point or the job: “故事的地基有了。”, “让对方记住三件事”. Page titles end with “。” when they are a sentence.
- **Errors** say what happened and what to do, in one line: “这张图片读不了，换一张试试。”
- **Placeholders** are examples the user could type, not instructions: “当时的情况是…”.
- **Chinese punctuation** in Chinese text (，。？「」), a space between Chinese and Latin words or numbers (“10 分钟”, “API 密钥”).
- **English** uses US spelling and sentence case; contractions are fine (“I’ll”, “don’t”).
- **Lumi feedback** answers in the language the user wrote in, not the interface language.

**Words we use**

| Use | Avoid |
| --- | --- |
| 故事, 页面, 讲稿, 追问 | Case study 模板话, “叙事框架” |
| 缺材料, 待确认 | 无证据, 推断状态 |
| 下载文件 | 导出发布, 项目包拆解 |
| 收集素材 / Gather | Dump |

## 9. Design system

**Source of truth:** the [Lumi Storytelling Workbench design system](https://claude.ai/artifact/JgUPgFxykKD89aDr3MaZag) holds the tokens, type scale and components. The notes below are the original audit. The current build applies it as one token layer:

- **Type:** 32 font sizes reduced to 7 (12 / 13 / 14 / 16 / 20 / 24 / 32); weights 400 / 500 / 600.
- **Spacing:** 84 distinct paddings reduced to an 8-step 4px scale (4 → 64).
- **Radius:** 18 radii reduced to five (4 chip, 6 control, 8 surface, 12 tag, 999 round markers only).
- **Layout:** no top bar on desktop (the 中/EN toggle sits next to the logo); content and composer share one gutter (40 / 64 at ≥1600 / 32 at ≤1100 / 16 at ≤720), all left-aligned; sidebar and footer share 24px bottom padding. The sidebar "正在创作" project block is removed.
- **Chips:** one outlined chip (4px radius) for every status (supported / stated / inferred / missing, answered / brief). Lumi's drafts are marked 初稿 (draft) until the user edits or accepts them.
- **Language toggle:** 中 / EN segments on a sunken track next to the logo; the pressed segment shows by the action fill alone (design system: LanguageToggle).
- **Theme:** follows local time; dark from 19:00 to 07:00.
- **Icons:** Material Symbols Outlined replaces Remix Icon (subset embedded). Material has no brand logos, so GitHub uses `code`.

Pulled directly from the app's own `:root` CSS variables and its `designSystemMarkdown()` export (the same tokens ship in every downloaded ZIP as `design-system.md`).

**Core palette** (from `:root`)

| Token | Hex | Role |
| --- | --- | --- |
| `--paper` | `#F7F5F0` | Page background — warm ivory |
| `--ink` | `#252A38` | Primary text — midnight |
| `--muted` | `#677181` | Secondary text — blue-grey |
| `--blue` | `#7E8FAE` | Accent — soft blue |
| `--soft` | `#E7ECF3` | Selected/hover fill |
| `--line` | `#E3E1DB` | Hairline borders |

**Typography:** the system sans stack (-apple-system, Segoe UI, PingFang SC, Microsoft YaHei) for the whole UI, list numbers and the story score included. Georgia / Songti SC appear only inside slide thumbnails and exported slides. Page titles are 24/600 and the step 1 headline 32/600 (§12.4).

**Motion:** restrained transitions plus small looping SVG-free CSS keyframe animations on the Lumi mascot per page (a gentle float/think/read/work/idea/build/celebrate pose tied to `data-pose`), respecting `prefers-reduced-motion`.

**The three visual templates** (built-in styles in the style dropdown on Slides & script; each themes the preview and the exported HTML. Users can also add their own styles (§4)):

| Template | Background | Accent | Text | Credit |
| --- | --- | --- | --- | --- |
| **Lumi Keynote** (default) | `#F7F5F0` warm ivory | `#7E8FAE` soft blue | `#252A38` midnight | Lumi's own, no external credit |
| **Guizang PPT Skill** | `#202632` near-black navy | `#F2C95D` gold | `#F7F1E7` warm cream | Community template, linked to `github.com/op7418/guizang-ppt-skill` |
| **Frontend Slides** ("zara") | `#F4BDA8` salmon ↔ `#8EA4C6` blue-grey diagonal split | — | `#243149` deep navy | Community template by Zara Zhang, linked to `github.com/zarazhangrui/frontend-slides` |

All three are CSS variants of the same slide markup, switched by one class on the preview container (`tpl-guizang`, `tpl-frontend`) and on the exported page's `<body>`. Cover slides keep white text over the photo in every template.

**Scene visual formats** (the 5 storyboard types, each with a distinct layout rule): `statement` (single large headline on open space), `comparison` (two-panel split), `diagram` (three connected nodes), `number` (one large stat), `image` (full-bleed photo, no body copy).

## 10. Story engine: the Case Study Storytelling skill

Lumi should run on the logic of [case-study-storytelling](https://github.com/mengxuebi-mush/case-study-storytelling) (MIT, by Mengxue Bi). The skill handles the story layer: argument, evidence, slide order, talking points and interview defense. It explicitly does not design the deck. Lumi adds the visual layer on top (styles, slides, download).

**What the skill enforces:** three stages in strict order (`/plan` → `/script` → `/follow-up`), an approval gate between them (`draft` → `clear` → `approved`), and a hard rule that no stake, conflict, failure, turning point or outcome may be invented. Anything missing becomes a visible `GAP-##` placed where it belongs in the story.

**Mapping to Lumi** ("Lumi today" is the earlier prototype; the Change column is the target; Flow below says what is built)

| Skill concept | Lumi today | Change |
| --- | --- | --- |
| Inspect sources: draft, webpage, deck, JD | Brief takes text, voice, Markdown | Also accept a case-study page, an existing deck and a JD. Set audience mode: interview, portfolio or self-guided. |
| Foundation check: stake, causal chain, real challenge, earned wisdom | Clarify asks 5 keyword-triggered logistics questions | Replace with foundation questions. Each unmet foundation becomes a `GAP-##` and the story is marked "not complete yet". |
| Story map comes first; script comes after slides are stable | Script is drafted first, then a fixed 5-scene storyboard | Story answers come first (step 2); the script is written per slide in step 3. |
| Each slide: one job, conclusion-led title, one artifact + its message, a "why next" handoff | Scene: headline, purpose, visual description, format | Add job, artifact, artifact message and handoff fields. |
| Evidence status: supported / stated-only / inferred / missing | None | A status chip on every scene. `missing` always creates a gap. |
| Approval gate | `approved` is a sidebar checkmark; the sidebar skips every gate | Replaced by the review on Next in steps 2 and 4. No step is locked. |
| `/script`: per-slide emotion, 2–3 talking points, real BUT/THEREFORE connectors, `PREP-GAP` | Script is one prose story.md | Script is per slide in step 3, as an outline or full script. |
| `/follow-up`: question cards, claim boundary, outcome ladder | None | Step 4 Defend, before Download. |
| Bilingual output with the same IDs | Content forks into separate zh/en copies | One source of truth, translated for meaning. |
| Title-only arc test, surprise-leakage check | None | Planned: a check on slide titles during review. |

**Flow (implemented):** 1 Gather → 2 Story (review on Next) → 3 Build → 4 Defend (review on Next) → 5 Download.

**Data added:** `found` (story answers), `purpose`, `duration`, `audience`, `scriptMode`, `followups`, and on each slide `job` and `ev`. `storyState` and `mapStale` no longer gate any step (§7).

**Prototype status:** the embedded `case-study-storytelling-skill` JSON now carries the skill's stages, gate, five checks, evidence statuses and guardrails, and is sent with every Claude rewrite. Not yet built from the skill: case-study page, deck and JD as inputs; the title-only arc test and surprise-leakage check; `PREP-GAP` items in the script; and the outcome ladder (learning → shipped → behavior change → revenue) inside follow-up cards.

## 11. Coaching layer (v4)

These additions make 找故事 and 搭结构 behave like an interview coach rather than a form. They come from the interview storytelling knowledge base.

### 11.1 Sixth foundation check: 真正的问题

The foundation grows from five checks to six: stake, **reframe**, challenge, decision, outcome, wisdom. Reframe asks whether the problem the team was handed is the problem the user actually solved ("said vs. actual problem"). It is a comparison check; challenge becomes a statement check. Every check now carries a one-line tip.

### 11.2 Story-strength audit

Replaced by the story score card on step 2 (8.8).

### 11.3 Three things to remember

The three things to remember are now part 2 of step 2 (找到故事). Lumi drafts them from the notes, marked 初稿 until the user edits them. The input box fills the focused slot (8.13).

### 11.4 Timing budget

From the chosen length, Lumi computes time per slide (mm:ss) and a word budget (250 Chinese characters or 140 English words per minute). Step 3 shows it as one line, for example "6 slides · \~1:40/slide".

### 11.5 Lumi coach bubble

Every step page except settings, support and publish shows a coach bubble under the heading with up to three tips for the current state. Examples: "我们" with no "我"; an answer too short to carry evidence; an open gap; scenes not tagged to any of the three things. It refreshes as the user types without re-rendering the page.

**Status: paused.** The bubble is turned off in the current build (`COACH_ON = false`). The tip logic stays in place so it can come back.

### 11.6 One way forward on 找到故事

Replaced in v6. The gaps modal (继续回答 / 带着 N 个缺口继续) is gone. Next runs Lumi's review instead (8.3, 8.9). Gaps stay marked, never invented.

### 11.7 Not yet built

- Download (step 5) inside the artifact preview needs the downloads capability; it works in the standalone file.
- English step names are not final.

## 12. Interface simplification (v5)

A design pass to cut chrome and repeated text. Behaviour is unchanged unless noted.

### 12.1 Removed

| Element | Why |
| --- | --- |
| Breadcrumb on desktop | Repeats the active sidebar step and the page title. Kept on mobile as the page title. |
| Sidebar phase labels (构思 / 制作 / 讲述) and the "故事工作台" subtitle | The numbered steps read on their own. |
| Lock icons on gated steps | No step is locked since v6, so there is nothing to mark. |
| "N 页" pill on the map heading, talk.md file bar, footnote credits and legends | Moved into section labels or ⓘ tooltips. |
| Dividers on the publish page | Spacing groups the sections. |

### 12.2 Changed

- **Story questions:** each row's title is the question itself, so it stays visible after answering; the answer sits under it.
- Map page: removed in v6. Slides sit on step 3, one row per slide (thumbnail, title, points). Layout, motion and video live in the per-slide edit popup.
- **ⓘ tooltips:** the method credit (Case Study Storytelling · Mengxue Bi) sits behind an ⓘ after the story intro; the evidence legend sits behind an ⓘ after the map intro.
- **Composer:** 48px tall. Order is +, text, send (Enter icon, white), mic. The step CTA is the only dark button.
- **Step 1:** upload summary sits below "讲给谁 / 讲多久".
- **Copy:** page intros cut to one short sentence each.

### 12.3 Unlock rule (removed in v6)

No step is locked. The map approval (确认结构) and the re-lock on map edits are gone. Next on steps 2 and 4 runs Lumi's review instead (8.3).

### 12.4 Visual system

Type follows a 1.25 ratio from the 14px body (12 / 13 / 14 / 16 / 20 / 24 / 32). Radii are 4 (chips), 6 (controls, including the rectangular language toggle) and 8 (surfaces). Status chips are 24px tall with 10px side padding. Full tokens and components: [Lumi design system](https://claude.ai/artifact/JgUPgFxykKD89aDr3MaZag).

## Backlog for Buzz (company use)

Follow-up work for Buzz, in rough order. The first three make Lumi's drafts and review real.

| Item | Why | Done when |
| --- | --- | --- |
| First-time use (8.12) | Without Claude, users don't know Lumi can draft for them. | See the done-when list in 8.12. |
| Claude drafting and review endpoints in the local service | Drafts and review are not Claude-backed yet. | The local service drafts answers and three things from the notes, reviews answers, and drafts follow-up answers with Claude. |
| Claude-based scoring by audience | The score measures completeness only. | Claude scores the story, weighted by the chosen audience. |
| Jimeng / Seedance endpoints | Video on slides needs a generator. | Video generation works with an API key or the Dreamina CLI. |
| Persist uploaded videos | Uploaded videos are lost on reload. | Videos are stored in IndexedDB and survive a reload. |
| Metrics | We need to know if Lumi saves time. | Primary: time-to-first-story (first paste of notes to first full slide preview). Also tracked: % of drafts accepted without edits, and step completion rate. |
