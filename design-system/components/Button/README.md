# Button

Buttons do one thing and say it with a verb. Which kind a button is depends on what it does, not where it sits:

| Kind | When | Look | Examples |
| --- | --- | --- | --- |
| **Primary** | Moves the user to the next step, or finishes the flow. One per screen. In a modal, the modal's own confirm is its primary. | `ink` fill, `surface` text | 下一步, 下载 (inside the step 5 file card), 保存 (modal) |
| **Secondary** | Does something on the current page without leaving it. | `surface` fill, 1px `line` border, `ink` text | 请 Lumi 看一遍, 连接, 重新检查 |
| **Text link** | Opens help, a guide, a doc, or a small inline action. | `info` text, 13px/500, underline offset 4px | 权限指引, 载入示例项目, 清除示例 |
| **Disclosure** | Opens or closes extra detail in place. Not a button style: the whole card or row is the target, with a trailing chevron. | Inherits the card | 故事评分 card, accordion rows |

- Height `control-h` (40px) for every button, including the footer CTA. Padding `0 s-4`. Radius `r-control` (6px). Label 14px/500. Disabled: 45% opacity.
- **No icons in buttons.** The label carries the meaning; Next has no arrow and Download has no download glyph. Icon-only buttons (mic, send, delete, eye) are the exception and always have an aria-label.
- **Arrows only on external links**: ↗ after a link that opens another site (API docs, GitHub Pages docs). Links that stay inside Lumi have no arrow.
- An "add" action is plain text too ("添加一页"), no leading "+".
- Focus: 2px `blue` outline, offset 2px.
