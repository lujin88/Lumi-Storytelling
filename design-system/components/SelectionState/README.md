# SelectionState

The shared state grammar for the Step 3 slide rows and the Step 5 download checklist. It applies the existing action tokens instead of introducing a new visual language.

## Why this exists

Step 2 already communicates “this is the one I am working on” with `action-bg`, a 3px `action-ink` leading bar and an `action-ink` number. Step 3 must use the same current-row treatment while a slide is being edited. A white editor by itself is not enough because it makes the field look active but leaves the slide row ambiguous.

Step 1 already uses the action palette for selected multi-choice controls. Step 5 must use the same palette inside its checkbox. A checked download row does not become a second kind of blue card, and a pointer click does not leave a keyboard focus ring behind.

This is a consistency correction, not a new component family. There is no new imagery, illustration or motion.

## Source and decision record

- `design-system/README.md`, Visual foundations: one selected/current treatment (`action-bg`, `action-line`, `action-ink`).
- `design-system/README.md`, Interaction rules 2, 7 and 8: one current item, shared row grid, custom checkbox treatment.
- `design-system/tokens.json`: canonical light values and spacing.
- `index.html`, `html.dark`: the current dark token mapping; this component does not define a second dark palette.
- Buzz event `0735faddcc5b06bfae0a887ca8eabb88894a1bcec6aeadd4ce588c8a48685afe` (2026-10-27): PM decision that Step 3 matches Step 2, Step 5 matches Step 1, and focus rings appear only for keyboard interaction.

## Mood and personality

Quiet, specific, steady, familiar. State should be obvious without making the page look more colourful or more interactive than the task requires.

## Tokens

| Role | Light | Dark | Usage |
| --- | --- | --- | --- |
| `paper` | `#f7f5f0` | `#17191f` | Page and idle row ground |
| `surface` | `#ffffff` | `#1f2229` | The one field actively being edited; checkbox ground |
| `sunken` | `#eeede8` | `#1b1d23` | Hover on an idle row |
| `line` | `#e3e1db` | `#2c3039` | Dividers and unchecked checkbox border |
| `ink` | `#252a38` | `#e9e6df` | Primary text |
| `muted` | `#677181` | `#9aa1ad` | Idle row number and secondary text |
| `action-bg` | `#e7ecf3` | `#232a36` | Current row; checked checkbox fill |
| `action-line` | `#7e8fae` | `#9fb0cf` | Selected border, check and focus outline |
| `action-ink` | `#526787` | `#a9bbd6` | Current-row leading bar and number |

Type stays on the system sans stack. Row numbers and labels use the existing Step 3 sizes; this change does not resize text. Spacing uses the shared row grid: `s-4` (16px) inline padding, a 24px centred number column and `s-3` (12px) gap.

## Step 3 — active slide row

“Current” means the slide whose title, point or script is actively being edited. It is a work state, not the first row by default and not a permanent selection.

| State | Row | Number | Editable text |
| --- | --- | --- | --- |
| Rest | `paper`, bottom `line` divider | `muted`, 500 | Plain text; no white field, border or ring |
| Hover | `sunken`; divider unchanged | unchanged | Text stays plain; pointer cursor reflects the actual target |
| Current / editing | `action-bg` plus inset 3px `action-ink` leading bar | `action-ink`, 600 | Only the active text target becomes `surface` with the existing blue edit ring |
| Keyboard focus on thumbnail or delete control | Row state is unchanged unless an editor is open | unchanged | The focused control gets the normal 2px `blue` / `action-line` outline with 2px offset |
| Dragging | Existing drag opacity and drop indicator win | unchanged | End editing before drag starts |

Interaction contract:

1. Clicking a title, point or script starts editing that target and makes its slide row current.
2. At most one slide row is current. Moving editing to another slide clears the first row before applying current to the next.
3. Moving focus between editable targets inside the same slide keeps the row current.
4. `Enter` follows the existing field behavior; `Escape` or leaving the editor saves/cancels according to the existing flow, returns the field to plain text and clears current when no editor remains.
5. Opening the large slide preview does not create a current row. When the modal closes, restore focus to the thumbnail; show only its keyboard focus outline.
6. Do not animate the fill, leading bar or row height. The state change is immediate and must not move content.

Responsive behavior:

- Keep the existing Step 3 grid at every breakpoint. The 3px bar sits inside the row so it never changes width or creates horizontal scroll.
- At `<=720px`, the thumbnail and body still stack in the text column. The leading bar spans the complete row, including the stacked thumbnail and editor.
- Chinese and English wrap naturally. Do not truncate titles, points or script text.

Suggested implementation state is a single `.current` or `.editing` class on `.deck-row`, driven by editing state rather than a global `:focus-within` rule. `:focus-within` alone would incorrectly mark a row current when the user only tabs to Preview or Delete.

## Step 5 — download checkbox

The checkbox itself carries selected state. Its label row remains a neutral list row so Step 5 does not invent a filled-card selection pattern.

| State | Checkbox | Row |
| --- | --- | --- |
| Unchecked | 18×18px, 4px radius, `surface`, 1px `line` border | Transparent |
| Unchecked hover | Border remains `line` | `sunken` hover only |
| Checked | `action-bg`, 1px `action-line` border, `action-line` check | Transparent; no persistent blue fill |
| Pointer focus | Same as checked/unchecked state | No visible focus ring |
| Keyboard focus | 2px `action-line` outline, 2px offset around the checkbox | No row outline |
| Disabled | Not used on this screen | If introduced later, define it separately rather than lowering opacity ad hoc |

Interaction contract:

1. Keep a native `<input type="checkbox">` inside the `<label>`; the complete label row toggles it.
2. Use `appearance: none` only to draw the approved 18px control and check. Preserve native checked state, keyboard toggling and form semantics.
3. Apply the ring with `:focus-visible`, never `:focus` and never as a permanent checked decoration.
4. When all files are unchecked, the existing Download button is disabled; selection styling otherwise does not change layout or copy.
5. Use at least a 44px row hit height. Long labels and file extensions wrap; no ellipsis and no horizontal scrolling at 390px.
6. There is no loading or error state for an individual checkbox.

## Accessibility

- Step 3 stays an ordered list. Put `aria-current="true"` on the one editing row, and give each editable target an accessible name that includes the slide number and field type.
- Do not make the whole Step 3 row a button when it already contains a thumbnail button, editable text and a delete button.
- Step 5 stays a native checkbox group in DOM order. The visible label is its accessible name; decorative file icons are `aria-hidden="true"`.
- Contrast comes from the existing tokens. Current and checked states use fill plus a bar/check, so colour is never the only cue.
- `prefers-reduced-motion` requires no special fallback because these state changes do not animate.

## Engineering acceptance checks

- Step 3: editing slide 01 produces exactly one current row; editing slide 02 clears 01; leaving editing clears the row; rest fields do not look like white inputs.
- Step 3: the current row’s computed styles use `action-bg`, an inset 3px `action-ink` bar and an `action-ink` number in both themes.
- Step 5: pointer click checks the box without a visible focus ring; Tab then Space checks it with the `:focus-visible` ring.
- Step 5: checking a file never applies a persistent fill or outline to the full row.
- Both: verify Chinese and English at 1905, 1512, 1280 and 390px in light and dark themes; 390px has no horizontal scrolling.
- Visual QA compares Step 3 beside the Step 2 current row, and Step 5 beside the Step 1 selected controls, before signing off implementation.

See `preview.html` for the target states. It is a visual handoff only and does not replace the application’s interaction logic.
