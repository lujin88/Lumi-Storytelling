# Step 2 full-body Lumi layout proposal

Status: proposal for Lu review after Visual QA. This changes no production code and generates no paid animation.

## Recommendation

Place StoryScore and a full-body Lumi in one coach rail beside the Step 2 story rows.

- At 1280px, the page becomes a two-column layout: story rows on the left, a 280px sticky coach rail on the right. StoryScore stays first in the rail. Lumi stands below it in a 232 × 272px motion-safe area.
- At 390px, the coach rail becomes a 104px-high sticky band below the 56px top bar. StoryScore stays on the left; Lumi uses a 104 × 104px motion-safe area on the right. Story rows keep the full content width below it.
- Keep the face inside StoryScore. The face is the component's score-tier indicator; the full-body render is the coach and motion anchor. Removing the face would weaken score scanning and change the approved StoryScore anatomy.
- Use `assets/lumi/source/standing.webp` for the static proposal. Do not retouch the face, hair, scarf, colours, or clay texture.

This layout keeps Lumi visible when a user types in the fixed Composer and when the score rises, without placing the mascot over a row or over the Composer.

## Deliverables

| View | File |
| --- | --- |
| 1280 × 900, light | `step2-lumi-layout/desktop-light.png` |
| 1280 × 900, dark | `step2-lumi-layout/desktop-dark.png` |
| 390 × 844, light | `step2-lumi-layout/mobile-light.png` |
| 390 × 844, dark | `step2-lumi-layout/mobile-dark.png` |

The dashed box and the `jump` / `thinking` labels are design annotations only. They do not appear in the product.

## Visual concept

Lumi becomes the quiet coach in the page margin. The story remains a left-aligned working document; the mascot occupies the unused coaching edge rather than interrupting the question sequence.

Mood and personality: calm, observant, warm, precise, lightly playful.

The design spends its visual emphasis on one place: the clay character. The rest remains paper, ink, hairlines, and whitespace.

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

Typography stays on the design-system sans stack. Page title is 24/600; section title is 16/600; question and answer text remain 14px; labels and metadata remain 12–13px. Georgia is not introduced.

## Layout and spacing

### Desktop 1280

- Sidebar: existing `side` = 232px.
- Page gutter: `s-6` = 32px at this viewport.
- Page columns: `minmax(0, 1fr) 280px`, with `s-6` = 32px between them.
- Story rows keep the shared 24px number column, `s-3` = 12px gap, and `s-4` = 16px horizontal padding.
- Coach rail: sticky at `s-6` below the viewport top. StoryScore stays 280px wide. The full-body stage is 272px tall and centres a 216px render.
- Composer and Next stay unchanged and fixed to the bottom. The rail ends above the Composer; it never overlaps the footer.

### Mobile 390

- Top bar: existing 56px.
- Page gutter: `s-4` = 16px.
- Coach band: sticky directly below the top bar; `minmax(0, 1fr) 104px` with `s-3` = 12px gap.
- StoryScore uses its current compact content; no label is removed. Lumi renders at 88 × 88px inside a 104 × 104px safe area.
- Story rows remain single-column and keep the current number grid. The band has a `paper` background and no border or shadow, so it reads as page structure rather than a new card.

## Motion placement

Both animation files keep a transparent background and must be at most 1MB each, per the 2026-10-23 project decision.

| Motion | Trigger | Desktop safe space | Mobile safe space | Behaviour |
| --- | --- | --- | --- | --- |
| `jump` | Rule score increases after an answer/edit | 232 × 272px; reserve 24px above and 8px below the 216px character | 104 × 104px; reserve 12px above and 4px below the 88px character | Play once. Do not play on first render or on score decrease. |
| `thinking` | User types in the Step 2 Composer | Same stage; reserve 12px on each side for head/torso tilt | Same stage; reserve 6px on each side | Start after a short typing delay; one gentle loop per typing burst. Stop after input pauses. |

The animation canvas should stay square so the same asset can scale into both stages. Keep meaningful pixels inside approximately 8% side insets, 14% top inset, and 6% bottom inset. Do not crop the scarf, star, hair, or feet.

## Components and interaction

- Reuse StoryScore exactly as specified: outlined `paper` card, 48px face ring on desktop, compact face ring on mobile, entire card as the disclosure target.
- Reuse the existing numbered row grid and Composer. No row, input, button, status chip, or score behaviour changes.
- The full-body image is decorative (`alt=""`, `aria-hidden="true"`, `pointer-events:none`). It never becomes a button.
- The coach rail is a page layout wrapper, not a new reusable design-system component. Development may name it `story-coach-rail` and its local child `story-lumi-stage`; no new token or shared component is needed.
- Keep the rail in the normal document structure. Sticky positioning is only a layout behaviour. It must stop before the footer and must not cover rows at zoomed text sizes.

## Accessibility

- Respect `prefers-reduced-motion`: show `standing.webp` and suppress both motion clips.
- Do not announce animation state. StoryScore's visible number and label remain the accessible status.
- Keep the score card keyboard target and focus ring unchanged.
- No content reflow when a clip starts: the stage owns its final width and height before media loads.
- At 200% zoom, drop the two-column desktop rail before it crowds story rows; use the mobile band layout.
- Dark mode uses the existing token mapping. Do not add a glow or coloured background behind Lumi; the transparent render must sit directly on `paper`.

## Imagery direction

The approved clay render is the only imagery. Do not redraw or stylise Lumi, add a pedestal, add a coloured ellipse, or place the character inside a decorative card. The transparent stage preserves the same character in light and dark themes.

## Implementation notes for Development

1. Base the Step 2 markup on PR #29's StoryScore and row implementation.
2. Wrap the heading, rows, and the coach rail in a page-local grid. Keep StoryScore's internal markup unchanged.
3. Use a `<picture>` / `<video>` swap only inside `story-lumi-stage`; reserve stage dimensions in CSS before media loads.
4. Desktop breakpoint: show the 280px rail while the content area can still give the story column at least 640px. Below that, use the mobile band pattern rather than shrinking the question column further.
5. Clamp animation transforms inside the safe areas above. Do not let jump move the rail, score card, page, or Composer.
6. Use the existing `lumiAnim` state machine. Scope `thinking` on Step 2 to the Composer input and debounce it; scope `jump` to a positive rule-score delta.
7. Add `prefers-reduced-motion` coverage and responsive tests at 1280 and 390. Visual QA should compare implementation screenshots with these four references.

## Sources reviewed

- [PR #29: Step 2 Claude drafting, review, and score](https://github.com/lujin88/Lumi-Storytelling/pull/29) — actual Step 2 structure used for this proposal.
- [PR #34: Lu's full-body Lumi decision](https://github.com/lujin88/Lumi-Storytelling/pull/34) — scope and approval sequence.
- [`design-system/README.md`](../../design-system/README.md) — paper-first layout, one left edge, StoryScore, rows, Composer, spacing, motion restraint.
- [`design-system/tokens.json`](../../design-system/tokens.json) — colour, typography, spacing, radius, and responsive values.
- [`design-system/components/StoryScore/README.md`](../../design-system/components/StoryScore/README.md) — face ring and disclosure anatomy.
- [`design-system/components/Composer/README.md`](../../design-system/components/Composer/README.md) — fixed bottom Composer behaviour.
- [`assets/lumi/README.md`](../../assets/lumi/README.md) and [`standing.webp`](../../assets/lumi/source/standing.webp) — approved on-model source render and animation constraints.
- [`decisions.md`](../../decisions.md) — 1MB clip limit, transparent background, no grey ellipse, and Step 2 decision history.

No Pinterest or external visual reference was used. The task explicitly requires the existing Lumi design system and on-model source render; adding outside styling would weaken fidelity rather than improve it.
