# Composer

The fixed bottom bar where the user answers Lumi. Shares the page `gutter`. Order inside one `surface` container: upload (+), textarea, send (Enter icon `keyboard_return`), mic.

- Container radius `r-surface`, min height `composer-h` (48px), padding 6px.
- Icon buttons 36px squares (`r-control`); send (Enter icon) has no border or fill, a `selected` fill on hover; the step CTA stays the only `ink` button.
- Focus is on the container: `blue` border plus a 3px blue ring.
- Under 720px the composer and the step CTA stack; the CTA goes full width at 48px.
- Suggestions: on 讲稿要点, a row of 28px pill chips sits right above the composer; a click fills the composer.
- The textarea grows with its text up to 160px.
