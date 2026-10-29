# Lumi character scale, Step 2 interaction, and download-result layout

Status: revised static proposal for Lu review. It updates PR #35 after Lu's 2026-10-25 marked screenshot and the 2026-10-24 decisions in PR #36. It changes no production code and generates no paid animation.

## Recommendation and rationale

Treat Lumi as a visible coach at the three moments where the product changes mode:

- **Step 1 / wave:** a large welcome presence beside the project setup. It signals that the user can start with rough material.
- **Step 2 / thinking + jump:** a coaching rail paired with StoryScore. The body reacts to work; the face inside StoryScore continues to communicate the score tier.
- **Step 5 / cheer:** a celebration in the same right-hand character rail as Steps 1 and 2. The recessed result surface contains only the downloadable files and a preview of what the user made.

At about 1900px, the page and Composer expand to a 1600px maximum so the working area uses the same right-hand territory as the enlarged character. The Step 1 character occupies the approximately 526 × 574 CSS-pixel zone Lu marked in her 3820 × 1942 screenshot. At 1280px, all three pages use the same smaller right-hand rail. At 390px, Lumi moves beside the first section heading instead of taking a separate block.

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
- Centre a shared content wrapper at `max-width: 1600px` for the page and fixed Composer at 1500px and wider. Keep the existing 1280px maximum below that breakpoint.
- At 1500px and wider, use 40px left and right content gutters. Between 721px and 1499px, use `s-6` = 32px. At mobile, use `s-4` = 16px.
- The Composer and its `下一步` button use the same wrapper and gutters as the page. At 1900px the bar extends through the enlarged Lumi column to its right edge; at 1280px and below it keeps the existing responsive wrapper.
- Use existing spacing tokens only: 4, 8, 12, 16, 24, 32, 48, and 64px.

### Fixed Lumi frame measurements

The stage is the implementation contract. Wave, standing, thinking, jump and cheer all render with `object-fit: contain` inside the stage for that viewport; changing media state must not change its rectangle.

| Viewport | Step 1 stage | Step 2 stage | Step 5 stage | Shared size |
| --- | --- | --- | --- | --- |
| 1900 × 1000 | `x=1306, y=32` | `x=1306, y=126` | `x=1306, y=126.8` | `w=520, h=570` |
| 1280 × 900 | `x=888, y=32` | `x=888, y=174.4` | `x=888, y=126.8` | `w=360, h=380` |
| 390 × 844 | `x=310, y=182.8` | `x=310, y=250.4` | `x=310, y=158.8` | `w=64, h=56` |

The wide and standard layouts therefore keep the same right-column x coordinate and frame dimensions across Steps 1, 2 and 5. Their y coordinate follows each page's content: Step 1 starts with the welcome, Step 2 follows StoryScore, and Step 5 follows the page intro. On mobile, each y coordinate is exactly the y coordinate of that step's first section heading.

## Step 1: wave

### Desktop

- At 1500px and wider, use `minmax(0, 1fr) 560px` with a 48px gap. Reserve a 520 × 570px stage and render the transparent source at 640px high. The source's alpha bounds produce an approximately 444 × 572px visible character, filling Lu's marked zone without cropping hair, scarf, star, or feet.
- From 901px through 1499px, use a 380px character column, a 360 × 380px stage, and a 430px-high render. At the 1280px reference this produces an approximately 298 × 384px visible character.
- From 721px through 900px, reserve a compact 200 × 220px stage at the upper right and render Lumi at 250px high. Keep 232px clear on the right of the title and lead, then let the setup controls use the full content width below that top block. This prevents the copy column from collapsing beside the desktop character column.
- The copy, setup controls, material guide, and Composer keep their existing components. Enlarging Lumi does not reduce a control, font, or hit target.

### Mobile

- Use a 64 × 56px stage at the right of `用在哪`, the first section heading. Render the full square asset with `object-fit: contain`; hair, star, scarf and feet stay visible.
- Keep the page title and lead at the full 358px content width. Only the first choice row reserves 72px on its right for the small stage.
- The Step 1 Composer continues to use its existing prompt; no new card or bubble is added.
- Measured against the previous 390px proposal, `上传资料` moves from `y=493.6` to `y=461.2`, saving 32.4px before the next section.

## Step 2: one current row and coaching rail

### Active question

- Exactly one question row can use the current-row treatment: `action-bg`, a 3px left rule, current number colour, and 600-weight question.
- In the reference, `讲清这个故事 / 01` is current. `让对方记住三件事 / 01` keeps its normal row and its `初稿` source status.
- The Composer prompt repeats the active target: `回答 01：这个项目为什么重要？`. When focus changes, update the number and short question together.
- `去补`, a review suggestion, or direct row selection must first set the one active row, then scroll it into view, then update the Composer prompt.

### Wide layout: 1272px and above

- From 1272px through 1499px, use `minmax(0, 1fr) 360px`, with `s-6` = 32px between columns. Stage: 360 × 380px; render: 430px high. This is the same frame and x coordinate as Steps 1 and 5 at 1280px.
- At 1500px and wider, enlarge the coach rail to 520px. Stage: 520 × 570px; render: 650px high. The visible standing character is approximately 464 × 570px.
- At a 1280px viewport, the 32px page gutters leave a 592px story column. The full question, answer and status remain visible in the reference without reducing type or hit targets.
- At about 1900px, the 1600px wrapper leaves an approximately 968px story column. Lumi remains connected to StoryScore in the 520px coaching rail while using the previously empty right side of the viewport.
- At 1500px and wider, StoryScore moves up by the page-title line height plus its 16px following space. Its measured top is `y=32`, matching the `故事的地基有了。` title at `y=32`.
- The coach rail is sticky at `top: s-6` = 32px. StoryScore remains first; the full-body stage sits below it.

### Compact layout: 721–1271px

- Move the coaching region above the story rows in normal document flow.
- StoryScore takes the flexible column; Lumi uses a 200 × 220px stage with a 250px-high render.
- Do not keep a side rail if it would push the story below the 592px width accepted by the 1280px reference.

### Mobile: 390px reference

- Top bar: 56px. Page gutter: 16px.
- StoryScore uses the full 358px content width below the page title. Open StoryScore retains all five dimensions, statuses and `去补` links.
- Lumi uses the shared 64 × 56px mobile stage at the right of `1 讲清这个故事`; the entire body is visible and does not occupy a separate coach band.
- The section heading reserves 72px on its right for Lumi. Row targets use `scroll-margin-top: 72px` = 56px top bar + 16px breathing room.
- Measured against the previous 390px proposal, the first question row moves from `y=339.4` to `y=315.4`, saving 24px before the work starts. The open-score state uses the same heading placement.
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

Move cheer outside the `sunken` result surface and into the right-hand Lumi rail. The surface contains two related parts: the file package and output preview. This keeps the page structure consistent with Steps 1 and 2 and lets the preview move left into the space that cheer previously occupied.

### Wide and standard desktop

- At 1500px and wider, the outer layout is `minmax(0, 1fr) 520px` with a 32px gap. The left `sunken` card is 968px wide and uses `300px minmax(0, 1fr)` for package and preview. Stage: 520 × 570px; render: 680px high.
- At 1280px, the outer layout is `minmax(0, 1fr) 360px`. The left card is 592px wide and uses `200px minmax(0, 1fr)` for package and preview. Stage: 360 × 380px; render: 440px high.
- At 1900px the preview moves from `x=1222` to `x=670`; at 1280px it moves from `x=924` to `x=520`.
- The preview contains the first generated slide thumbnail and the final story score. It is read-only and does not introduce editing at Step 5.
- Keep download as the primary action inside the package column. Step 5 has no Composer.

### Narrow tablet: 721–900px

- Put the 200 × 220px Lumi stage above the recessed result surface and keep it outside the surface. Stack package and preview inside the surface.
- Keep 32px card padding and 24px gaps. The card fits the 425px content width at 721px without horizontal scrolling.
- Keep the desktop sidebar and 32px page gutters in this range; only the result surface changes its internal columns.

### Mobile

- Put `你要下载的内容` on its own section-heading row and place the shared 64 × 56px Lumi stage at its right. The stage remains outside the recessed result card.
- Stack package and preview inside the card. Keeping the file package before the read-only preview preserves the download action's priority.
- Keep the download button at least 40px high and the result preview inside the normal document flow; the page may scroll rather than compress text or controls.
- Measured against the previous 390px proposal, document height drops from 1230px to 1030px, saving 200px.

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
- Add only page-local wrappers: character stage, coaching rail, Step 5 two-column result card and result preview.
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
4. Use `@media (min-width: 1272px)` for the Step 2 side rail. Below it, use the flow layout. At 390px, place the same stage beside the first section heading.
5. Keep StoryScore full-width on mobile in closed, open, Composer-focus and short-viewport states without changing the user's disclosure choice.
6. Apply the 72px mobile scroll margin above before calling `scrollIntoView`.
7. Keep the existing `lumiAnim` state machine. Give busy thinking priority over typing thinking; let jump interrupt idle/thinking once, then return to the current state.
8. Gate face motion and all media playback with the same reduced-motion preference.
9. For looping wave and cheer, insert the pause on the neutral start frame, not the last frame.
10. Give wave, static, thinking, jump and cheer one stage component whose rectangle is fixed per breakpoint, and size the centred media layer separately from that frame. At 1500px and wider, the shared stage is 520 × 570px; render Step 1 media at 640px high, Step 2 at 650px, and Step 5 at 680px. From 1272px through 1499px, the shared stage is 360 × 380px; render Step 1 and Step 2 media at 430px high and Step 5 at 440px. In compact flow, use a 200 × 220px stage with 250px-high media. At mobile, use a 64 × 56px stage and a 64 × 56px media box with `object-fit: contain`. Apply the same dimensions and centring to static images and video elements; swapping source or animation state must not change the stage or media-layer x, y, width, or height.
11. Test at 1900, 1500, 1499, 1280, 1272, 1271, 1024, 901, 900, 800, 768, 721, 720, and 390 widths. At 390, cover score closed/open, two incomplete dimensions, `去补`, Composer focus, a contracted viewport, busy state, dark mode, and reduced motion.
12. Visual QA must compare the implementation with every reference image, then exercise real focus, scroll, offscreen media pause/resume, and software-keyboard behaviour.

## Sources reviewed

- [PR #29: Step 2 Claude drafting, review, and score](https://github.com/lujin88/Lumi-Storytelling/pull/29) — implemented StoryScore, question rows, source statuses, busy line, and Composer.
- [PR #34: Lu's full-body Lumi decision](https://github.com/lujin88/Lumi-Storytelling/pull/34) — approval to add a full-body Step 2 coach before generating motion.
- [PR #36: Lu's scale, interaction, looping, and preview decisions](https://github.com/lujin88/Lumi-Storytelling/pull/36) — current scope and owner decisions for this revision.
- [Lu's 3820 × 1942 marked screenshot](https://buzz-wwbf.srv2056990.hstgr.cloud/media/81d9d7f064186974433d24f4ef913f14678827a51ded4d1c829522fabb6ba436.png) and `#lumi-storytelling` event `ba9b4c3512b01b0f7bd8819d91b03d668821785a9bc86507fe51e39844a2bf96` — the outer red box measures approximately 526 × 574 CSS px at 2× capture scale; it is the 1900px Step 1 character target.
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
