# LanguageToggle

A two-segment rectangular toggle for 中文 / EN, in the style of a dialog tab bar. No divider between segments; the pressed segment is shown by fill alone.

- Container: `line` border, `r-control` (6px), a rectangle, no padding, transparent.
- Segment: 32px tall, padding 0 `s-4`, 13px/500 `muted`.
- Pressed (`aria-pressed="true"`): `selected` fill, `ink` text, 600.
