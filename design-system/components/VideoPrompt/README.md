# VideoPrompt

The Step 3 slide editor pattern for asking Claude to write a video-generation prompt, copying it, and explaining how to bring the resulting video back into Lumi. It extends the existing wide slide modal; it is not a new page or a video-provider connection.

## Concept and rationale

Keep the slide as the visual anchor, then place one compact work area directly below its preview and navigation. The left side handles the prompt; the right side explains the file handoff. This keeps the sequence visible in one place:

1. Ask Lumi for a prompt and copy it.
2. Generate the video in a tool the user already uses.
3. Return to the existing **换成视频 / Use a video** action.

Lumi never names, recommends or connects to a video provider here. The prompt is generated with the user's Claude key. The uploaded file remains a local browser asset according to the product decision and V3 implementation task.

## Mood and personality

Quiet, practical, private, reversible. The area should feel like a short note attached to the current slide, not a second workflow competing with the slide editor.

## Sources and observed constraints

These are the sources used to shape the pattern; the recommendations below are the designer's synthesis.

| Source | What it establishes |
| --- | --- |
| [`design-system/README.md`](../../README.md) | Paper-first surfaces, one primary action, guidance panels, shared type and spacing rules. |
| [`design-system/tokens.json`](../../tokens.json) | Canonical light palette, typography, spacing and radius values. |
| [`design-system/components/Banner`](../Banner/README.md) | One-line progress, success and warning feedback with an optional text link. |
| [`design-system/components/Button`](../Button/README.md) | Copy is a secondary action; buttons use text and no icon. |
| [`index.html`](../../../index.html) | The existing 960px slide modal, 16:9 preview, slide navigation and **换成视频 / Use a video** upload action. |
| [Decision PR #43](https://github.com/lujin88/Lumi-Storytelling/pull/43) | Lumi does not connect to a video provider; Claude writes one prompt per slide and the user returns with a generated file. |
| [Copy PR #68](https://github.com/lujin88/Lumi-Storytelling/pull/68) | Approved labels, four required states, conditional format rows and the rule that prompt language follows slide content. |

## Placement and hierarchy

Keep the existing modal order:

1. layout, motion and video controls;
2. 16:9 slide preview;
3. previous / slide count / next navigation;
4. a `line` divider and `s-5` top spacing;
5. the VideoPrompt work area.

At 1512px and 1905px, the modal remains 960px wide. Inside its existing `s-6` padding, use a two-column grid with `s-4` gap:

- prompt column: `minmax(0, 1fr)` and takes the remaining width;
- format column: 280px;
- align both columns at the top.

Do not widen the modal at 1905px. The slide, controls and prompt should remain one readable unit rather than spreading across the window.

At 390px, keep the modal within `s-2` of both viewport edges, reduce modal padding to `s-4`, and stack the prompt above the format panel with `s-4` gap. The 40px copy button becomes full width, with the feedback line directly below it. The modal may scroll vertically, but the page behind it must not scroll and no child may create horizontal overflow.

## Visual language

No new tokens are introduced.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `paper` | `#f7f5f0` | `#17191f` | Page behind the modal. |
| `surface` | `#ffffff` | `#1f2229` | Modal, copy button and prompt text ground. |
| `sunken` | `#eeede8` | `#1b1d23` | Video-format guidance panel. |
| `line` | `#e3e1db` | `#2c3039` | Section divider, button and prompt text border. |
| `ink` | `#252a38` | `#e9e6df` | Headings, prompt body and button label. |
| `muted` | `#677181` | `#9aa1ad` | Supporting format copy. |
| `info` | `#526787` | `#a9bbd6` | Internal text link and progress indicator. |
| `ok` | `#4f7a4d` | existing dark `ok` mapping | Copied status only. |
| `danger` | `#9d4b49` | existing dark `danger` mapping | Copy failure and missing-key status only. |
| `action-line` | `#7e8fae` | `#9fb0cf` | Keyboard focus outline. |

Typography stays on the system sans stack:

- format title: 13px/600;
- prompt body and format instruction: 13px/1.6/400;
- status line: 13px/1.4/400;
- button: the shared 14px/500, 40px-high secondary button.

The prompt text is prose, so do not render it in monospace. The selectable prompt is a `<pre>` or equivalent text region with `white-space: pre-wrap`, `surface`, a 1px `line` border, `r-control`, `s-3` padding and a minimum height of 112px. It may grow to 192px; after that it scrolls internally. Do not truncate it.

The format area is the existing guidance-box pattern: `sunken`, no border, `r-surface`, `s-4` padding. Its fixed process sentence comes first. Measured file facts follow as a plain list with `s-2` gaps and `action-line` dots. Never turn the format area into an outlined card.

## Required states

The copy button keeps the approved label **复制视频提示词 / Copy video prompt** in every state. A first activation generates and copies the prompt. If a current prompt already exists, activation copies that prompt again. Changing the slide content invalidates the stored prompt, so the next activation generates a fresh one.

| State | Prompt area | Button | Feedback |
| --- | --- | --- | --- |
| Generating | No empty bordered field on the first run. If regenerating, keep the previous prompt visible until the new one arrives. | Disabled, label unchanged. | Reuse Banner placement with `progress_activity` and `video-prompt.generating`. Set the section `aria-busy="true"`. |
| Copied | Show the complete selectable prompt. | Enabled, label unchanged so it can copy again. | `check_circle` + `ok` text using `video-prompt.copied`. |
| Copy failed | Show the complete selectable prompt; do not clear it. | Enabled for another copy attempt. | `error` + `danger` text using `video-prompt.copy-failed`. Keep focus on the button; do not select text or steal focus. |
| Claude key missing | Do not show an empty prompt field. Keep format guidance visible. | Disabled. | `warning` + `danger` text using `video-prompt.blocked`, followed by the existing internal text link **去设置连接 Claude / Connect Claude in Settings**. |

Claude/network failure before a prompt exists is an error branch of Generating rather than a fifth review state: remove `aria-busy`, keep the button enabled, and show `video-prompt.failed` in the same feedback line. There is no prompt region because there is no text to preserve.

Use one stable feedback line below the copy button row. Success, failure and blocked states replace one another; they do not stack. Do not use a toast for these states because the user needs the copy result beside the text it affects.

## Format guidance

Render format rows only when V3 has a measured value and a cited source. The order is:

1. supported formats;
2. aspect ratio;
3. maximum file size;
4. maximum duration, only if a defensible limit is found.

Do not render `{formats}`, `{ratio}`, `{size}` or `{length}` to users. If a value is still unknown, omit that complete row. The fixed process sentence and format title remain, so the panel never becomes an unexplained blank box.

Labels and status copy follow the interface language. The generated prompt itself follows the language of the current slide's content, even when the interface is in the other language.

## Interaction and accessibility

- Keep the modal a labelled dialog and preserve its existing close and focus-return behavior.
- Copy is a native `<button>` with the shared secondary style. `Enter` and `Space` activate it.
- The prompt region remains ordinary selectable text. When it scrolls internally, make it keyboard-focusable and give it the normal 2px `action-line` focus outline with 2px offset.
- Announce the feedback line with `aria-live="polite"`. Do not announce the whole prompt after every copy.
- On copy failure, keyboard users can move to the prompt, press `Ctrl/Cmd+A`, then `Ctrl/Cmd+C`. Keep the full text in DOM order immediately after the feedback line.
- The missing-key text link goes to Lumi Settings in the same app. It has no external-link arrow.
- Status is communicated by icon and text in addition to colour. Decorative icons are `aria-hidden="true"`.
- Do not animate the layout, prompt reveal or success message. The existing progress icon may rotate; stop it under `prefers-reduced-motion` while retaining the text and `aria-busy` state.
- Body, muted and status colours reuse the existing contrast-approved tokens. Do not place `blue` text on `paper`.

## Imagery and motion

No illustration, mascot, provider logo or video-tool logo appears in this area. The current slide remains the visual anchor. The only motion is the existing progress indicator while Claude is writing; there is no copied celebration or panel transition.

## Engineering notes

- Extend the existing `openZoom(i)` modal rather than opening a second dialog or drawer.
- Keep prompt state keyed to the same stable slide identifier used by the persisted video. Do not key by list position if slides can be reordered.
- The prompt source text may contain user material; keep it in browser storage with the slide and never include the Claude key in the stored value, export, log or download.
- Clipboard failure must not be treated as generation failure. Preserve the returned prompt and move only the feedback state to Copy failed.
- The upload control remains **换成视频 / Use a video**. This pattern does not rename it or add a provider chooser.
- Format support, size and duration values come from V3 measurement. The design intentionally contains no guessed acceptance number.
- Reuse the approved copy keys from `docs/product-specs/copy/video-prompt.json` and the existing Settings-link key; do not duplicate literals in `index.html`.
- Do not change slide-preview contrast or video overlays as part of this task.

## Acceptance checks

- At 1905px and 1512px, the modal is 960px wide, centred, and the prompt/format grid does not stretch with the viewport.
- At 390px in Chinese and English, the grid and header stack, the copy button is full width, the complete prompt can be selected, and there is no horizontal scroll.
- In light and dark themes, the prompt region uses `surface`, guidance uses `sunken`, and all four feedback states remain legible without adding a new colour.
- Generating disables duplicate requests; Copied can copy again; Copy failed preserves the text; missing key reaches the existing Settings route.
- Unresolved format facts do not appear in the rendered UI.
- Visual QA checks all four states at 1905, 1512 and 390px in both themes before implementation sign-off.

See [`preview.html`](preview.html) for a responsive, clickable state handoff. It is a design reference and contains no production logic.
