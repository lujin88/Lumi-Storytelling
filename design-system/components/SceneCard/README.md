# SceneCard

One slide in the storyboard. A 16:9 thumbnail of the layout type on the left, on the right: number + type, an EvidenceMark only when needed, and the slide title.

- Padding `s-4`, radius `r-surface`, `surface` fill, `line` border. Grid: 120px thumbnail, then content, gap `s-4`.
- Thumbnails (128px, 16:9, 4px radius, `paper` fill) are drawn shapes, never words: 文字 (blue eyebrow, ink headline, two grey lines), 对比 (outlined card ↔ ink card, each with an avatar dot), 简图 (ink → blue → hollow dots with arrows), 数字 (serif 3× over a 3-dot track), 纯图片 (blue and ink mountains, `gold` sun).
- Title 14px/600. No description text on the card; it lives in the edit dialog.
- Click opens the edit dialog; drag reorders. Hover: tinted fill, darker border, edit icon bottom-right.
- Missing evidence: dashed border, faded thumbnail.
