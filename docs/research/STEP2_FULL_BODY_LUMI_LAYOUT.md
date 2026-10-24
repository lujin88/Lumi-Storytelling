# Step 2 full-body Lumi layout proposal

Status: revised proposal for Lu review after Visual QA. This changes no production code and generates no paid animation.

## Recommendation

Use StoryScore and a full-body Lumi as one coaching region beside, or above, the Step 2 story rows.

- At 1280px, keep a 280px coach rail beside the story. StoryScore stays first. Lumi stands below it in a 256px square stage.
- Below 1248px, move the coaching region above the rows. This is the first viewport where the 232px sidebar, 64px page gutters, 640px story, 32px column gap, and 280px rail no longer all fit.
- At 390px, use a closed coaching band below the 56px top bar. Its 104px content plus 12px bottom padding makes the sticky region 116px tall. When StoryScore is open, or the software keyboard is likely present, put the coaching region back in normal document flow.
- Keep the face inside StoryScore. The face communicates the score tier; the full-body render is Lumi's coaching presence and the animation anchor. They have different jobs.
- Use `assets/lumi/source/standing.webp` without changing the face, hair, scarf, colours, or clay texture.

The rows and Composer retain their approved component anatomy. Layout makes space for Lumi; components do not shrink or hide content to make room.

## Deliverables

| View | State | File |
| --- | --- | --- |
| 1280 × 900, light | StoryScore closed | `step2-lumi-layout/desktop-light.png` |
| 1280 × 900, dark | StoryScore closed | `step2-lumi-layout/desktop-dark.png` |
| 390 × 844, light | StoryScore closed | `step2-lumi-layout/mobile-light.png` |
| 390 × 844, dark | StoryScore closed | `step2-lumi-layout/mobile-dark.png` |
| 390 × 844, light | Gaps + StoryScore open | `step2-lumi-layout/mobile-expanded-light.png` |
| 390 × 844, dark | Gaps + StoryScore open | `step2-lumi-layout/mobile-expanded-dark.png` |

The dashed and dotted boxes and the `jump` / `thinking` labels are design annotations only. They do not appear in the product.

## Visual concept

Lumi is the quiet coach at the edge of the working document. The story rows keep their single reading axis. On wide screens, Lumi occupies the coaching margin; on narrower screens, the same relationship becomes a compact band before the rows.

Mood and personality: calm, observant, warm, precise, lightly playful.

The clay character is the only expressive visual. Paper, ink, hairlines, and whitespace remain quiet around it.

## Existing tokens and type

No new token is required.

| Role | Light | Dark | Existing token |
| --- | --- | --- | --- |
| Page | `#f7f5f0` | `#17191f` | `paper` |
| Raised surface | `#ffffff` | `#1f2229` | `surface` |
| Recessed hover | `#eeede8` | `#1b1d23` | `sunken` |
| Divider | `#e3e1db` | `#2c3039` | `line` |
| Primary text | `#252a38` | `#e9e6df` | `ink` |
| Secondary text | `#677181` | `#9aa1ad` | `muted` |
| Motion annotation / focus | `#7e8fae` | `#9fb0cf` | `blue` / `action-line` |

Typography stays on the design-system sans stack. Page title is 24/600; section title and question text remain 16/600 and 14px respectively; answer text remains 13px; StoryScore labels, notes, status, and action links remain 12px. Georgia is not introduced.

## Layout and spacing

### Wide layout: 1248px and above

- Sidebar: existing `side` = 232px.
- Page gutter: `s-6` = 32px.
- Page columns: `minmax(0, 1fr) 280px`, with `s-6` = 32px between them.
- At 1280px the story column is 672px. At the 1248px threshold it is 640px.
- Story rows keep the shared 24px number column, `s-3` = 12px gap, and `s-4` = 16px horizontal padding.
- Coach rail remains sticky at `top: s-6` = 32px. It never overlaps the fixed Composer.
- StoryScore remains 280px wide. Its labels and note remain 12px.

### Compact layout: 721–1247px

- Replace the side-by-side grid with a coaching band in normal document flow above the rows.
- Keep the page title above the coaching band and preserve the story's full available width.
- StoryScore takes the flexible column; Lumi uses a 128px stage. Do not keep a narrow 280px rail beside a story column below 640px.
- The band is not sticky in this range. This avoids a large persistent obstruction at 200% zoom and on short landscape displays.

### Mobile: 390px reference

- Top bar: existing 56px. Page gutter: `s-4` = 16px.
- Closed StoryScore: the coaching band is `minmax(0, 1fr) 104px` with an `s-3` = 12px gap. It may stick directly below the top bar only when the layout viewport height is at least 700px and the Composer is not focused.
- Open StoryScore: the card spans the full width, retains all five dimension rows, statuses, and `去补` links, and the full-body Lumi moves to a normal-flow row below it. The card stays open until the user closes it; the layout must not override disclosure intent.
- Short viewport or Composer focus: remove sticky positioning from the whole coaching band. Use `window.visualViewport` where available; treat `visualViewport.height < 700px`, or a material contraction after Composer focus, as keyboard/short-viewport mode. Restore stickiness only after blur and viewport recovery.
- Closed sticky band: row and review targets use `scroll-margin-top: 188px` = 56px top bar + 116px coaching band + 16px breathing room.
- Open or non-sticky band: `scroll-margin-top: 72px` = 56px top bar + 16px breathing room. A `去补` target therefore lands below the top bar without being covered.
- Mobile rows keep `24px minmax(0,1fr) auto`, `s-3` = 12px gap, and `s-4` = 16px horizontal padding. Status chips, including the three-item `初稿` source status, remain visible.
- Composer stays at `composer-h` = 48px with 6px padding and 36px icon controls. The step CTA remains 48px.

## Motion placement

The stage, animation canvas, and visible character pixels are different layers:

1. **Stage** is the page layout reservation.
2. **Canvas** is the transparent square media element placed at the exact centre of the stage.
3. **Visible pixels** are Lumi and the motion within the transparent canvas. The feet do not sit on the canvas edge.

Use one square master animation canvas, recommended at 960 × 960, and scale that same square to each layout size.

| View | Stage | Rendered square canvas | Required clear area inside canvas | Maximum visible bounds |
| --- | --- | --- | --- | --- |
| Wide | 256 × 256px | 240 × 240px, centred | left/right 16px, top 28px, bottom 12px | 208 × 200px |
| Compact | 128 × 128px | 120 × 120px, centred | scale the same inset ratios | about 104 × 100px |
| Mobile | 104 × 104px | 96 × 96px, centred | left/right 7px, top 12px, bottom 5px | 82 × 79px |

This leaves 8px between the wide canvas and stage on every side, and 4px on mobile. The visible-pixel limits then provide the additional head, tilt, and foot clearance inside the canvas.

| Motion | Trigger | Placement | Behaviour |
| --- | --- | --- | --- |
| `jump` | Rule score increases after an answer or edit | Use the top clearance inside the centred square canvas | Play once. Do not play on first render, a score decrease, or a Claude-only score change. |
| `thinking` | User types in the Step 2 Composer | Use side clearance inside the same centred square canvas | Begin after a short typing delay; loop gently per typing burst; stop after input pauses. |

Each file keeps a transparent background and must be at most 1MB. Do not crop the scarf, star, hair, or feet. Motion never changes the stage dimensions or moves StoryScore, a row, or the Composer.

## Components and interaction

- Reuse StoryScore as specified. Closed state uses the outlined `paper` card. Open state uses `surface`, then shows five rows with dimension name, bar, status, and `去补` when incomplete.
- Preserve the 48px face ring on wide screens and the current compact face ring on mobile. The entire card remains the disclosure target.
- Reuse the existing numbered row grid, source-status chip, Composer, and step CTA. Do not hide a status, reduce text below its token, or change control heights for Lumi.
- The full-body media is decorative: `alt=""`, `aria-hidden="true"`, and `pointer-events:none`. It never becomes a button.
- The coach rail/band and Lumi stage are page-local layout wrappers. They do not require a new shared component or token.

## Accessibility

- Respect `prefers-reduced-motion`: show `standing.webp` and suppress both clips.
- Do not announce animation state. StoryScore's number and label remain the accessible status.
- Keep the score card keyboard target and focus ring unchanged.
- Reserve the final stage before media loads, so starting a clip causes no content reflow.
- Preserve 12px metadata and all statuses at mobile widths. Do not make space by hiding information.
- Dark mode uses the existing token mapping. Do not add a glow or coloured field behind Lumi.

## Imagery direction

The approved clay render is the only imagery. Do not redraw or stylise Lumi, add a pedestal, add a coloured ellipse, or place the character inside a decorative card. Light and dark modes use the same transparent source pixels.

## Implementation notes for Development

1. Base the Step 2 markup on PR #29's StoryScore, row, and Composer implementation. Keep their internal anatomy and tokens unchanged.
2. Add a page-local coaching wrapper and a stage wrapper. No new shared component is required.
3. Use a `<picture>` / `<video>` swap only inside the stage and reserve its dimensions before loading media.
4. Use `@media (min-width: 1248px)` for the side rail. Below it, use the compact flow layout.
5. On mobile, add a layout-state class for score-open, Composer-focus, and short-viewport states. Do not infer or change the user's StoryScore disclosure state.
6. Apply the scroll margins above to foundation rows and review-generated targets before calling `scrollIntoView` for `去补` or review actions.
7. Use the existing `lumiAnim` state machine. Debounce `thinking`; trigger `jump` only on a positive rule-score delta.
8. Apply `prefers-reduced-motion` before loading or playing a motion file.
9. Test at 1280, 1248, 1247, 1024, and 390 widths. At 390, cover StoryScore closed/open, two incomplete dimensions, `去补`, Composer focus, a contracted `visualViewport`, dark mode, and reduced motion.
10. Visual QA should compare implementation screenshots with all six references, then exercise the real focus, scroll, and software-keyboard workflow.

## Sources reviewed

- [PR #29: Step 2 Claude drafting, review, and score](https://github.com/lujin88/Lumi-Storytelling/pull/29) — actual StoryScore, rows, source statuses, and Composer used for this proposal.
- [PR #34: Lu's full-body Lumi decision](https://github.com/lujin88/Lumi-Storytelling/pull/34) — scope and approval sequence.
- [`design-system/README.md`](../../design-system/README.md) — paper-first layout, one left edge, row anatomy, spacing, and motion restraint.
- [`design-system/tokens.json`](../../design-system/tokens.json) — colour, type, spacing, radius, and responsive values.
- [`design-system/components/StoryScore/README.md`](../../design-system/components/StoryScore/README.md) — closed/open StoryScore anatomy and 12px metadata.
- [`design-system/components/Composer/README.md`](../../design-system/components/Composer/README.md) — 48px Composer, 6px padding, 36px controls, and mobile stacking.
- [`assets/lumi/README.md`](../../assets/lumi/README.md) and [`standing.webp`](../../assets/lumi/source/standing.webp) — approved on-model source and animation constraints.
- [`decisions.md`](../../decisions.md) — transparent background, 1MB clip limit, no grey ellipse, and Step 2 decision history.

No Pinterest or outside visual reference was used. The assigned scope requires the approved Lumi render and existing design system; the recommendation is derived from those product constraints and the actual Step 2 implementation.
