# ChoiceCard

A single-choice option for setup questions on step 1: 用在哪 (面试 / 汇报 / 作品集) and 准备讲多久 (5 / 10 / 15 / 30 分钟). Pick one; picking another replaces it. For "pick any number" use Tag.

- One line: label 14px/500, `ink`. No hint line, no icon, no check mark.
- Height `control-h` (40px), padding 0 `s-4`, radius `r-control`.
- Rest: `surface` fill, 1px `line` border.
- Hover: `sunken` fill, border unchanged.
- Selected: `action-bg` fill, 1px `action-line` border, `ink` text. Never an `ink` border or a grey fill.
- Label is the same 14px/500 in both rows and does not get bolder when selected; the fill and border show the selection.
- Layout: fixed 96px columns with gap `s-2` (3 for 用在哪, 4 for 讲多久), left-aligned, never stretched to the page width; under 720px 用在哪 drops to one full-width column, 讲多久 keeps four equal columns.
- A `<button>` with `aria-pressed`; the group has a visible label above it.
