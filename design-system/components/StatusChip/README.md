# StatusChip

Answer status only (你的回答 / 从材料中找到 / 缺失) in QuestionList. Evidence on slides uses EvidenceMark.


An outlined chip that shows the evidence status of a claim or the answer state of a foundation question.

| status | text | border | meaning |
|---|---|---|---|
| supported / answer | `ok` | `ok-line` | backed by material |
| stated | `warn` | `warn-line` | said, not yet proven |
| inferred / brief | `info` | `info-line` | Lumi guessed from context |
| missing | `danger` | `danger-line` | a GAP to fill |
| neutral | `muted` | `line` | counts, timing |

24px tall, 10px side padding, `r-chip` (4px), 12px/500, transparent fill. Never fill a chip or a card with a status color.
