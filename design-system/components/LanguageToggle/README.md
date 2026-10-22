# LanguageToggle

A two-segment control for 中 / EN, on the same row as the logo in the sidebar. It follows the Pressed segment row of the action table: the track holds the shape, the pressed segment shows by fill alone.

- Track: `sunken` fill, no border, radius `r-control` (6px), 32px tall, padding 2px, gap 2px.
- Segment: 28px tall, padding 0 `s-2`, radius `r-control`, 12px/500 `muted`, transparent.
- Pressed (`aria-pressed="true"`): `action-bg` fill, `action-ink` text, 600. No border, no shadow, never white on the track.

Known issue: the unpressed segment (`muted` on `sunken`) is 4.2:1, under the 4.5:1 that 12px text needs. Fix by raising the label to `ink` at 400 or the size to 13px; to be decided.
