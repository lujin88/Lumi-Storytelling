# Lumi character scale, Step 2 interaction, and download-result layout

Status: revised static proposal for Lu review. It updates PR #35 after the 2026-10-24 decisions in PR #36. It changes no production code and generates no paid animation.

## Recommendation and rationale

Treat Lumi as a visible coach at the three moments where the product changes mode:

- **Step 1 / wave:** a large welcome presence beside the project setup. It signals that the user can start with rough material.
- **Step 2 / thinking + jump:** a coaching rail paired with StoryScore. The body reacts to work; the face inside StoryScore continues to communicate the score tier.
- **Step 5 / cheer:** a celebration in the same full-width result surface as the downloadable files and a preview of what the user made.

At about 1900px, the content still stops at a 1280px maximum. Lumi grows inside that working area rather than drifting into unused viewport space. At 1280px, the character scales down while the story keeps at least 640px. At 390px, the same hierarchy becomes a compact coach band or a single-column result card.

Mood and personality: calm, observant, warm, precise, lightly playful. The clay character carries the expression; paper, ink, hairlines, and whitespace stay quiet.

## Reference files

All reference images live in `docs/research/step2-lumi-layout/`. The visible motion labels are design annotations and are not product UI.

| Page / state | 1900 × 1000 | 1280 × 900 | 390 × 844 |
| --- | --- | --- | --- |
| Step 1, light / dark | `gather-1900-light.png`, `gather-1900-dark.png` | `gather-1280-light.png`, `gather-1280-dark.png` | `gather-390-light.png`, `gather-390-dark.png` |
| Step 2, light / dark | `story-1900-light.png`, `story-1900-dark.png` | `desktop-light.png`, `desktop-dark.png` | `mobile-light.png`, `mobile-dark.png` |
| Step 2 busy, light / dark | `story-busy-1900-light.png`, `story-busy-1900-dark.png` | `story-busy-1280-light.png`, `story-busy-1280-dark.png` | `story-busy-390-light.png`, `story-busy-390-dark.png` |
| Step 2 score open, light / dark | — | — | `mobile-expanded-light.png`, `mobile-expanded-dark.png` |
| Step 5, light / dark | `download-1900-light.png`, `download-1900-dark.png` | `download-1280-light.png`, `download-1280-dark.png` | `download-390-light.png`, `download-390-dark.png` |

`mockup.html` renders these states with `?page=gather|story|download&theme=light|dark&state=busy|expanded|keyboard`.

Narrow-tablet references cover the two pages whose desktop columns become unsafe before the mobile breakpoint:

| Page | 768 × 1100, light / dark | 721 × 1100, light / dark |
| --- | --- | --- |
| Step 1 | `gather-768-light.png`, `gather-768-dark.png` | `gather-721-light.png`, `gather-721-dark.png` |
| Step 5 | `download-768-light.png`, `download-768-dark.png` | `download-721-light.png`, `download-721-dark.png` |

## Existing colour and type system

No new design token is required.

| Role | Light | Dark | Existing token |
| --- | --- | --- | --- |
| Page | `#f7f5f0` | `#17191f` | `paper` |
| Raised surface | `#ffffff` | `#1f2229` | `surface` |
| Recessed surface | `#eeede8` | `#1b1d23` | `sunken` |
| Divider | `#e3e1db` | `#2c3039` | `line` |
| Primary text | `#252a38` | `#e9e6df` | `ink` |
| Secondary text | `#677181` | `#9aa1ad` | `muted` |
| Focus / current row | `#7e8fae` | `#9fb0cf` | `blue` / `action-line` |

Typography stays on the design-system sans stack. Page titles are 24/600, except the Step 1 desktop welcome at 32/600. Section titles are 16/600, questions 14/500, answers 13px, and StoryScore labels, notes, statuses, and actions 12px. The generated slide thumbnail uses Georgia only inside the content preview, matching the presentation output rather than the app chrome.

## Shared layout and spacing

- Keep the existing 232px desktop sidebar.
- Centre a shared content wrapper at `max-width: 1280px` for the page and fixed Composer.
- At 1500px and wider, use 40px left and right content gutters. Between 721px and 1499px, use `s-6` = 32px. At mobile, use `s-4` = 16px.
- The Composer and its `下一步` button use the same wrapper and gutters as the page. The bar therefore fills the content width and has equal space on both sides.
- Use existing spacing tokens only: 4, 8, 12, 16, 24, 32, 48, and 64px.

## Step 1: wave

### Desktop

- At 1500px and wider, use `minmax(0, 1fr) 420px` with a 48px gap. Reserve a 400px square stage and render the transparent square asset at 380px.
- From 901px through 1499px, use a 340px character column, a 320px stage, and a 300px render.
- From 721px through 900px, reserve a compact 180px stage at the upper right and render Lumi at 168px. Keep 204px clear on the right of the title and lead, then let the setup controls use the full content width below that top block. This prevents the copy column from collapsing beside the desktop character column.
- The copy, setup controls, material guide, and Composer keep their existing components. Enlarging Lumi does not reduce a control, font, or hit target.

### Mobile

- Reserve a 136px stage at the upper right and render Lumi at 128px.
- Keep 148px clear on the right of the title and lead. Let the setup controls return to the full 358px content width below that top block.
- The Step 1 Composer continues to use its existing prompt; no new card or bubble is added.

## Step 2: one current row and coaching rail

### Active question

- Exactly one question row can use the current-row treatment: `action-bg`, a 3px left rule, current number colour, and 600-weight question.
- In the reference, `讲清这个故事 / 01` is current. `让对方记住三件事 / 01` keeps its normal row and its `初稿` source status.
- The Composer prompt repeats the active target: `回答 01：这个项目为什么重要？`. When focus changes, update the number and short question together.
- `去补`, a review suggestion, or direct row selection must first set the one active row, then scroll it into view, then update the Composer prompt.

### Wide layout: 1272px and above

- From 1272px through 1499px, use `minmax(0, 1fr) 304px`, with `s-6` = 32px between columns. Stage: 288px; rendered square: 272px.
- At 1500px and wider, enlarge the coach rail to 336px. Stage: 320px; rendered square: 304px.
- At a 1280px viewport, the 32px page gutters leave a 648px story column. At the 1272px threshold, the story column is 640px.
- At about 1900px, the max-width wrapper leaves an 832px story column; Lumi remains connected to StoryScore in the 336px rail instead of occupying the empty outer viewport.
- The coach rail is sticky at `top: s-6` = 32px. StoryScore remains first; the full-body stage sits below it.

### Compact layout: 721–1271px

- Move the coaching region above the story rows in normal document flow.
- StoryScore takes the flexible column; Lumi uses a 160px stage with a 152px render.
- Do not keep a side rail if it would push the story below 640px.

### Mobile: 390px reference

- Top bar: 56px. Page gutter: 16px.
- Closed coach band: `minmax(0, 1fr) 128px` with a 12px gap. Stage: 128px; rendered square: 120px.
- The closed band may stick below the top bar only when the layout viewport is at least 700px and the Composer is not focused.
- Its measured height is 140px, including 12px bottom padding. Sticky row targets therefore use `scroll-margin-top: 212px` = 56px top bar + 140px band + 16px breathing room.
- Open StoryScore, Composer focus, and a short or keyboard-contracted viewport put the band back into normal document flow. These states use `scroll-margin-top: 72px` = 56px top bar + 16px breathing room.
- Open StoryScore spans the full width and retains all five dimensions, statuses, and `去补` links. Lumi stays below it in the right column.
- Preserve the shared row grid: 24px number column, 12px gap, 16px horizontal padding, 14px question, 13px answer, and visible source status.

### StoryScore face motion

The face remains because it communicates score quality at a glance, while the full-body character communicates activity. The two roles should not be merged.

| Motion | Values | Trigger |
| --- | --- | --- |
| Resting float | `translateY(0 → -1px → 0)`, 2.8s, `ease-in-out`, infinite | While the score card is visible and motion is allowed |
| Score pop | `scale(1 → 1.16 → 1)`, 360ms, `cubic-bezier(.2,.8,.2,1)`, once | Positive rule-score change after an answer or edit |

Do not pop on first render, score decrease, or a Claude-only score change. The pop temporarily replaces the float, then the float resumes. Under `prefers-reduced-motion: reduce`, use the still face and suppress both effects.

## Thinking as typing and loading feedback

- Inside the full-body Step 2 stage, thinking begins after a short typing delay, loops during the typing burst, and returns to the idle frame after input pauses.
- During a Claude call, reuse the thinking clip beside the existing busy line. Render it at 40px on desktop and 32px on mobile, followed by the busy text and existing cancel action.
- The busy line sits inside the same full-width footer wrapper, immediately above the Composer. It introduces no filled panel or new border.
- Disable Composer input while the request is busy according to existing behaviour; keep the busy text live-region semantics.
- Under reduced motion, show a still thinking frame at the same reserved size.

## Step 5: cheer and result preview

Use one full-width `sunken` result surface with three related parts: file package, full-body cheer, and output preview. This fills the right side with useful evidence instead of decoration.

### Wide and standard desktop

- At 1500px and wider: `300px 320px minmax(340px, 1fr)`, with 32px gaps and 32px card padding.
- At 1280px: `260px 240px minmax(300px, 1fr)`, with 24px gaps. Stage: 240px; rendered asset: 228px.
- The preview contains the first generated slide thumbnail and the final story score. It is read-only and does not introduce editing at Step 5.
- Keep download as the primary action inside the package column. Step 5 has no Composer.

### Narrow tablet: 721–900px

- Switch the result surface to one column before the 721px mobile breakpoint. Stack file package, the 240px cheer stage, and the output preview.
- Keep 32px card padding and 24px gaps. The widest fixed element remains 240px, so the card fits the 425px content width at 721px without horizontal scrolling.
- Keep the desktop sidebar and 32px page gutters in this range; only the result surface changes its internal columns.

### Mobile

- Stack cheer, package, then preview inside the same card. Use a 184px stage and a 176px render. Keeping the file package before the read-only preview preserves the download action's priority.
- Keep the download button at least 40px high and the result preview inside the normal document flow; the page may scroll rather than compress text or controls.

## Animation placement and file constraints

Stage, animation canvas, and visible character pixels are three layers:

1. **Stage** reserves layout space and never changes size during playback.
2. **Canvas** is the transparent square media element centred inside the stage.
3. **Visible pixels** are Lumi and the motion inside that transparent square. Hair, scarf, star, and feet remain inside the safe area.

Use one 960 × 960 square master per motion and scale the same aspect ratio at each breakpoint. Each delivered clip has a transparent background and is at most 1MB.

| Motion | Placement | Playback | Reduced motion |
| --- | --- | --- | --- |
| `wave` | Step 1 stage | Loop while visible; pause about 1.5s between cycles; never stop on the last frame | Static first/neutral frame |
| `thinking` | Step 2 stage and busy line | Loop while typing or waiting for Claude; return to a neutral frame when inactive | Static thinking frame |
| `jump` | Step 2 stage | One 700ms reaction on positive rule-score delta; then return to thinking or idle | No animation |
| `cheer` | Step 5 stage | Loop while visible; pause about 2.5s between cycles; never stop on the last frame | Static first/neutral frame |

Pause looping media when the page is hidden or the stage is offscreen. Resume from the neutral start frame when it becomes visible again. Animation never moves StoryScore, a question row, the Composer, or download controls.

## Components and interaction

- Reuse StoryScore, QuestionList, Composer, busy line, step CTA, sidebar, and top bar. No new shared component is required.
- Add only page-local wrappers: character stage, coaching rail/band, and Step 5 result preview.
- The full-body media is decorative: `alt=""`, `aria-hidden="true"`, and `pointer-events:none`.
- The preview is labelled as download content and remains read-only.
- Do not hide status chips, shrink text, alter Composer height, or add a background shape behind Lumi to make space.

## Accessibility

- Honour `prefers-reduced-motion` before loading or playing animated media.
- Do not announce visual animation state. The score number, label, busy text, and file state carry the accessible meaning.
- Reserve all character and busy-line dimensions before media loads to avoid layout shift.
- Keep the StoryScore disclosure keyboard target and focus ring unchanged.
- Keep at least 4.5:1 contrast for normal text and use existing light/dark token mappings.
- Keep 44px minimum touch targets where the component system already requires them; Lumi itself is not interactive.
- Test mobile `去补` scrolling with closed/open score, Composer focus, and a contracted `visualViewport` so the target is not hidden by the top bar or coaching band.

## Imagery direction

Use only the approved clay renders in `assets/lumi/source/`. Keep Lumi's face, hair, scarf, star, body proportions, colours, and clay texture unchanged. Light and dark modes use the same transparent source pixels. Do not redraw Lumi, add a pedestal or coloured ellipse, or derive a new logo.

## Implementation notes for Development

1. Base the rows, StoryScore, Composer, busy line, and file card on the current implementation after PR #29. Preserve their internal anatomy and tokens.
2. Use the shared max-width wrapper for both page content and footer so the Composer aligns at 1900, 1280, and 390 widths.
3. Add one active-question state. Let row selection, `去补`, and review suggestions update that state; derive the Composer placeholder from it.
4. Use `@media (min-width: 1272px)` for the Step 2 side rail. Below it, use the flow layout.
5. On mobile, add a layout-state class for score-open, Composer-focus, and short-viewport states without changing the user's disclosure choice.
6. Apply the scroll margins above before calling `scrollIntoView`.
7. Keep the existing `lumiAnim` state machine. Give busy thinking priority over typing thinking; let jump interrupt idle/thinking once, then return to the current state.
8. Gate face motion and all media playback with the same reduced-motion preference.
9. For looping wave and cheer, insert the pause on the neutral start frame, not the last frame.
10. Test at 1900, 1500, 1499, 1280, 1272, 1271, 1024, 901, 900, 800, 768, 721, 720, and 390 widths. At 390, cover score closed/open, two incomplete dimensions, `去补`, Composer focus, a contracted viewport, busy state, dark mode, and reduced motion.
11. Visual QA must compare the implementation with every reference image, then exercise real focus, scroll, offscreen media pause/resume, and software-keyboard behaviour.

## Sources reviewed

- [PR #29: Step 2 Claude drafting, review, and score](https://github.com/lujin88/Lumi-Storytelling/pull/29) — implemented StoryScore, question rows, source statuses, busy line, and Composer.
- [PR #34: Lu's full-body Lumi decision](https://github.com/lujin88/Lumi-Storytelling/pull/34) — approval to add a full-body Step 2 coach before generating motion.
- [PR #36: Lu's scale, interaction, looping, and preview decisions](https://github.com/lujin88/Lumi-Storytelling/pull/36) — current scope and owner decisions for this revision.
- [`design-system/README.md`](../../design-system/README.md) — one reading axis, one current row, spacing, colour, and motion restraint.
- [`design-system/tokens.json`](../../design-system/tokens.json) — colour, type, spacing, radius, and responsive values.
- [`design-system/components/QuestionList/README.md`](../../design-system/components/QuestionList/README.md) — row grid, typography, status, and current-row treatment.
- [`design-system/components/StoryScore/README.md`](../../design-system/components/StoryScore/README.md) — closed/open anatomy and 12px metadata.
- [`design-system/components/Composer/README.md`](../../design-system/components/Composer/README.md) — 48px Composer, 6px padding, 36px controls, and mobile stacking.
- [`design-system/components/Banner/README.md`](../../design-system/components/Banner/README.md) — existing busy-line anatomy and semantics.
- [`assets/lumi/README.md`](../../assets/lumi/README.md) and source renders in [`assets/lumi/source/`](../../assets/lumi/source/) — approved character appearance and animation constraints.
- [`decisions.md`](../../decisions.md) — transparent background, 1MB clip limit, and Step 2 decision history.
- `/Users/lu/.buzz/RESEARCH/DUOLINGO_MASCOT_ANIMATION_MOBBIN.md` — observed patterns from Duolingo screens: context-linked placement, calm processing, one-shot success reactions, and restrained micro-motion. Lu's later decision overrides its one-shot recommendation for wave and cheer: both loop while visible.

No outside artwork, layout, logo, or branded asset is copied. The proposal combines recurring interaction principles with Lumi's existing design system and approved source render.
