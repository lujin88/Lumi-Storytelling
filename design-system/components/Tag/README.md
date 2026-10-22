# Tag

A multi-select option: 讲给谁 on step 1 (设计负责人, 产品经理, 工程负责人, HR / 招聘, 业务负责人, plus roles the user adds). Any number can be on; none is fine. For "pick one" use ChoiceCard.

- Height 32px, padding 0 `s-2` 0 `s-3`, radius `r-tag` (12px), gap `s-2` between label and ring. Label 13px.
- Trailing 16px ring (1.2px stroke), after the label (icons trail text).
- Rest: `surface` fill, 1px `line` border, label 400 `ink`, ring stroke `line`, no fill.
- Hover: `sunken` fill, border unchanged.
- Selected: `action-bg` fill, 1px `action-line` border, label 500 `ink`; ring = `surface` circle with an `action-line` stroke and an `action-line` check. Never a filled dark circle.
- Custom role: same tag with a trailing × (aria-label "删除") instead of the ring.
- Add field: after the tags, a 32px input with the same radius and a dashed `line` border, placeholder in `muted` ("其他职位，回车添加"). Enter adds the role as a selected tag.
- Group label: 13px/600 question ("面试官是谁") followed by a 12px `muted` "可多选".
- Layout: a wrapping row, gap `s-2`.
- A `<button>` with `aria-pressed`; the ring is `aria-hidden`.
