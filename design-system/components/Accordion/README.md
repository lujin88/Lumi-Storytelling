# Accordion

Expandable list for 追问准备 and 帮助. Same row grid as QuestionList.

- Row: the shared row grid (16px padding, 24px number column, 12px gap), title 14/500, optional EvidenceMark column, +/− on the right.
- **One open at a time.** Opening an item closes the previous one, so the blue state always means "the one you are reading".
- Open item: `soft` fill, 3px `info` bar, `info` number, title 600. Body indents to the title column; labels 12px `muted`, values 13px.
- Focus ring only for keyboard (`:focus-visible`), never on mouse click.
