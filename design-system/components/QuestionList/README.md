# QuestionList

The one list for anything Lumi asks: the six story questions and the three things to remember.

- Columns: 40px number (sans 14/500, `muted`), the question (14/500) with the answer under it (13px `muted`), a 120px chip column (你的回答 / 从材料中找到 / 缺失).
- Rows: padding 14px 16px, `line` hairlines, hover fill.
- **The whole row is the target.** No 回答 / 改写 buttons.
  - Answered row → inline text field in the row, focused with the cursor at the end. Enter saves, Shift+Enter new line, Esc cancels. Save / 取消 sit under the field.
  - Unanswered row → becomes current; the answer goes in through the Composer.
- Current row: `soft` fill, 3px `info` bar, `info` number, question at 600. Only one row is current.
