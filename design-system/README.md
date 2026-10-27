# Lumi Design System

The visual system for Lumi Storytelling Workbench.

Lumi is an interview-storytelling coach. It turns a design project into a story a hiring panel will remember, in five steps: 收集素材 → 找到故事 → 页面和讲稿 → 追问准备 → 下载文件. The interface should feel like a quiet notebook with a coach sitting beside you: warm paper, dark ink, one cool blue, and almost no chrome.

## Principles

1. **Paper first.** Every step sits on `paper`. Raised things (`surface`) are rare: scene cards, the coach bubble, the composer, a modal. Separation comes from `line` hairlines and whitespace, not shadows.
2. **One left edge.** Content and composer share `gutter`. There is no top bar on desktop; the logo and 中/EN sit in the sidebar. Nothing is centered except the empty-state mascot. Left-aligned content reads as a document.
3. **State is a chip, never a color block.** Evidence status (supported / stated / inferred / missing) is always the outlined pill: `ok`, `warn`, `info`, `danger` text with its `-line` border on transparent. Never fill a card with a status color.
4. **One way to answer (see Interaction rules).** Every list Lumi asks about (the six story questions, the three things to remember) is a row list on the shared row grid (Interaction rule 7): a muted sans number, the question as the row title, a status chip. The whole row is the target; there are no 回答 / 改写 buttons (Interaction rule 1). The current row uses the action treatment (below). Answered rows are edited inline; unanswered ones are answered in the bottom composer.
5. **Ink is the only button fill.** One primary per screen (`ink` fill, white text); everything else is outlined on `surface`.

## Voice

Chinese first, English parity. Short, direct, second person. Name the user's material, not the system: "补一句你做了什么决定" rather than "missing field: decision". Step names are verbs a person would say out loud. No exclamation marks, no emoji.

- Coach: "你写了「我们」，没有写「我」。面试官要听的是你的判断。"
- Gap modal: "还有 2 个问题没答。可以继续回答，也可以带着缺口往下走，缺口会标在结构里。"

## Visual foundations

**Color.** Neutral-first. `ink` on `paper` for everything readable; `muted` for secondary; `blue` (Lumi blue) only for focus rings, audit bars and accents, never for text. Status colors appear only inside chips.

**Action color (the one selected look).** Anything the user has picked, or the one thing they are working on, uses the same treatment so it reads as "this one" everywhere:

| State | Fill | Line | Text / mark | Used by |
| --- | --- | --- | --- | --- |
| Selected | `action-bg` (= `soft` #e7ecf3) | 1px `action-line` (= `blue` #7e8fae) | `ink`; Tag check in `action-line` | ChoiceCard, Tag, style chip, active nav row |
| Pressed segment | `action-bg` | none (the track holds the shape) | `action-ink`, 600 | Segmented controls on a `sunken` track: LanguageToggle, 要点/逐字稿, modal toggles |
| Current | `action-bg` | 3px `action-ink` (= `info` #526787) bar on the left | number in `action-ink`, 600 | Current question row, active slide row, open accordion item |
| Hover | `sunken` | unchanged | `ink` | Rows that are not current; ChoiceCard and Tag that are not selected |

Never use white-on-track, a grey fill or an ink border for selection; those read as "not picked". Dark mode maps the same tokens (`soft` #232a36, `blue` #9fb0cf, `info` #a9bbd6).

**Single vs multi select.** Single choice = rectangular ChoiceCard or segment (`r-control` 6px), no mark. Multi choice = Tag (`r-tag` 12px: softer than a card, squarer than a pill) with a trailing 16px ring; selected = `surface` circle with an `action-line` ring and an `action-line` check (same colour as the tag border), never a filled dark circle. Custom entries add a trailing ×. See ChoiceCard and Tag. Tag and ChoiceCard share the same borders: 1px `line` at rest, 1px `action-line` when selected.

**Type.** System sans for everything in the UI, list numbers and the story score included. Georgia appears only inside slide thumbnails and exported slides. A 1.25 ratio from the 14px body: 12, 13, 14, 16, 20, 24, 32. Page titles 24/600, the intro headline 32/600. Weights 400 / 500 / 600; 700 only for the wordmark. Headings use 600 with no extra tracking.

**Spacing.** 4px base: `s-1`…`s-8` = 4, 8, 12, 16, 24, 32, 48, 64. Controls are `control-h` (40px) tall; the composer and its CTA are `composer-h` (48px).

**Radius.** Small and quiet: `r-chip` 4px for status chips, `r-control` 6px for anything you press or type into (the language toggle included), `r-surface` 8px for things that hold content. `r-tag` 12px is for multi-select tags; `r-pill` only for round numbered markers.

**Focus.** 2px `blue` outline with 2px offset for buttons; inputs switch to a `blue` border plus a 3px blue ring at 15% alpha.

## Iconography

Material Symbols Outlined, weight 400, 16–20px, inheriting text color. Filled variant only for `check_circle` when a step is done. The set in use: add, arrow_back, arrow_forward, arrow_outward, arrow_upward, article, bar_chart, check, check_circle, close, cloud_upload, code, delete, description, download, edit, error, forum, grid_view, help, image, inventory_2, link, lock, logout, menu, mic, notes, account_tree, palette, person, progress_activity, refresh, settings, shield_lock, skip_next, slideshow, stop_circle, title, upload_file, visibility. Material has no brand logos, so GitHub uses `code`. Diagram arrows in slides are a typed → glyph, not an icon, so exported HTML shows no ligature text.

## Mascot

Lumi the mascot appears on the intro, in the story score face, on the step 5 file card and in empty states (the coach bubble avatar returns if CoachBubble does). Never on the map page, never next to a scene card.

## Interaction rules

1. **Click the thing to change it.** A whole row or card is the edit target. No separate 回答 / 改写 buttons.
   - Answered row: the answer turns into an inline text field in the row. Enter saves, Shift+Enter adds a line, Esc cancels.
   - Unanswered row: becomes the current row; answer in the bottom Composer (typing or voice).
   - Talk notes: click any line to edit in place.
2. **One current thing at a time.** The current row, active slide row, or the one open accordion item gets the `soft` fill with a 3px `info` bar on the left and an `info` number. Opening or editing another item clears the previous one. See `SelectionState` for the Step 3 editing contract.
3. **Flag only what needs action.** Evidence shows nothing when fine. Only 待确认 (inferred) and 缺材料 (missing) get an EvidenceMark.
4. **Icons trail the text** (ⓘ after the sentence, ↗ after a link, ✓ after a chip label). Only status icons inside a chip may lead.
5. **One primary button per screen**: the step CTA (下一步), or 下载 inside the file card on step 5 (no footer CTA there). Anything that acts on the current page is secondary (请 Lumi 看一遍, 连接); help and guides are text links. Buttons carry no icons; only external links get ↗. See Button.
6. **Never lock a step.** Every step opens any time from the sidebar.

7. **Row grid.** Every numbered list (story rows, three things, follow-up questions, slides, help) uses one grid: 16px inner padding, a 24px number column (centered), 12px gap, then text. Part heads use the same grid, so the part circle sits over the row numbers and the part title lines up with the row text.
8. **Checkboxes follow the selected pattern**: 18px, 4px radius, `line` border; checked = `action-bg` fill, `action-line` border and check. Never the browser's black checkbox. The row around a checked box stays unfilled; keyboard focus uses `:focus-visible`. See `SelectionState`.
9. **Two surfaces, never mixed.** *Panel* = `sunken` fill, no border (guidance box, file card on step 5). *Outlined card* = `paper` fill (same as the page) + 1px `line` border (StoryScore). Don't give a panel a border or an outlined card a fill.
10. **Guidance boxes**: a `sunken` panel with a 13px/550 lead line ("写清这四点，Lumi 就能帮你起草：") and the prompts as a list with `action-line` dots.

## Sections

A page with two jobs shows two sections, each with a 13px/600 label and an optional muted count ("故事分镜 6 页"), separated by `s-7` (48px). Secondary explanations live behind an ⓘ at the end of the page intro, not as footnotes.

## Layout

Sidebar `side` 232px: logo and the 中/EN toggle on one row, then 40px nav rows. No top bar on desktop; downloads live in step 5. Content padding `s-6` top, `gutter` sides. Composer fixed at the bottom on the same gutter. Under 720px the sidebar hides, the footer stacks and the CTA goes full width at 48px.
