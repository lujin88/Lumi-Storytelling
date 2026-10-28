---
title: "Lumi dark mode directions C and D"
tags: [design, dark-mode, lumi, accessibility]
status: draft
created: 2026-10-28
---

# Dark mode directions C and D

This is a second direction round after Lu rejected A and B as lacking texture and reading as one block of black. The renders use current `main` at `ee452b7` plus the merge commit on this design branch. Proposal CSS is injected only for capture; no production file changes are included.

Both directions follow the same structural rule from Apple Dark Mode and the cited product screens: the environment is the darkest plane, navigation and content are separate middle planes, and cards / dialogs are the lightest plane. Neither uses near-black. The design stays flat; depth comes from adjacent luminance, 1px hairlines and a restrained top highlight.

## Recommendation

Choose **C — Warm Folio / 暖纸工作台**, using the **stage / glow** treatment for Lumi. It preserves the existing “quiet notebook with a coach” direction, gives the story one clear paper plane, and solves the bright mascot by giving it a place to stand. The dimmed alternative proves that the animation can be toned down without regeneration, but it loses some of Lumi's clay warmth.

Direction **D — Dusk Library / 暮色书库** gives stronger separation between navigation, workspace and foreground panel. It is more architectural and operational. It stays warm enough for Lumi, but feels less like a notebook than C.

## C — Warm Folio / 暖纸工作台

**Visual concept.** A dark writing desk with one warmer story sheet on it. The page is a bounded, brighter plane; cards lift one step above it. Very faint paper-grid texture breaks the large flat field without becoming decoration.

**Mood and personality.** Warm, tactile, editorial, calm, companionable.

| Layer | HEX | Use |
| --- | --- | --- |
| Environment base | `#1E1A17` | Outer workspace behind the story sheet |
| Navigation rail | `#25211D` | Sidebar and recessed wells |
| Story paper | `#2B2621` | Main content plane |
| Card | `#342E27` | First-run card, guidance and download card |
| Elevated / dialog | `#3B342D` | Inputs, score card, preview and modal |
| Hairline | `#5B5249` | Plane boundaries and control borders |
| Primary text | `#F4EEE6` | Headings, body and primary action |
| Secondary text | `#C1B7AB` | Captions, inactive navigation and placeholder |
| Lumi blue | `#A9BAD3` | Focus and selected boundaries only |

**Lumi treatments.** Stage / glow keeps the source at 100% and adds a warm radial plane plus a 1px lower edge. Dim applies `brightness(.83) saturate(.92) contrast(.98)` to the existing image / video only. Face, hair, scarf, pose, silhouette and clay texture remain the original asset in both.

## D — Dusk Library / 暮色书库

**Visual concept.** A quiet library workstation with three warm grey planes: rail, workspace and a foreground content panel. A soft top highlight makes the foreground plane readable before any card content is scanned.

**Mood and personality.** Composed, structured, substantial, focused, professional.

| Layer | HEX | Use |
| --- | --- | --- |
| Environment base | `#211E1D` | Outer workspace |
| Navigation rail | `#292523` | Sidebar and recessed wells |
| Content base | `#302B29` | Main workspace |
| Foreground panel | `#393330` | Page panel behind the step content |
| Card / dialog | `#433C38` | First-run card, inputs, download card and modal |
| Hairline | `#665D58` | Plane boundaries and component borders |
| Primary text | `#F5F0EB` | Headings, body and primary action |
| Secondary text | `#C7BDB6` | Captions, inactive navigation and placeholder |
| Lumi blue | `#ADBAD1` | Focus and selected boundaries only |

**Lumi treatments.** Stage / glow keeps the source at 100% and adds a low warm shelf with a highlighted top edge. Dim applies `brightness(.80) saturate(.90) contrast(.98)` to the existing image / video only. No asset regeneration or recoloring is required.

## Typography, layout and spacing

- Keep the existing project type system: system sans for the application, Georgia / Songti only inside authored slide content. No new font loading.
- Keep the current 4px spacing base, 232px desktop rail, 960px Step 1 content rail and 16px mobile gutter. C / D change planes and surfaces, not information architecture.
- At 1905px the bounded content area remains the existing `#content` width. C reads it as one story sheet; D adds one foreground panel inside it.
- The story sheet / foreground panel uses the existing surface radius language. Depth is limited to 1px hairlines, an inset top highlight and a low-opacity ambient shadow.

## Components and interaction

- Page, sidebar, content and cards must use distinct semantic layers. Do not reuse one background token for all four.
- Selected navigation keeps a filled state plus a non-color cue. C uses a 3px leading edge; D uses a brighter filled row with a top highlight.
- Inputs, composer, first-run card, score card, download card and dialog each move one layer forward. Disabled controls keep readable text instead of lowering whole-control opacity.
- Hover and focus use the chosen direction's elevated surface and existing Lumi-blue focus outline. Slide thumbnails retain their authored light palette.
- Modal uses the lightest plane in each direction, with the rest of the page remaining visibly behind it.

## Imagery and animation

- Do not regenerate a night version of Lumi for this round. The comparison isolates two reversible treatments against the same source asset.
- Preferred treatment in both directions is stage / glow. It corrects the “floating lamp” effect by creating a contact plane while keeping skin, hair, scarf and star color stable.
- The dim treatment is the fallback if the stage still feels too bright in motion. Apply the filter to both `<img data-lumi>` and `<video data-lumi-video>` so fallback and animation match.
- Reduced motion continues to show the still. The dark treatment must not trigger a separate asset download.

## Accessibility

Rendered 1905px checks found no horizontal overflow or page errors across Step 1, Step 2 and Step 5 for all four combinations.

| Pair | C | D |
| --- | ---: | ---: |
| Primary text / environment base | 14.99:1 | 14.37:1 |
| Secondary text / content plane | 7.58:1 | 7.57:1 |

These exceed WCAG AA for normal text. Before implementation approval, the development pass still needs rendered checks for all component states, 390px, Step 3, Settings and dialogs, as requested by the PM.

## Observed references

| Source | Observed principle used here |
| --- | --- |
| [Apple Human Interface Guidelines — Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) | Base and elevated backgrounds create depth; images may need separate contrast treatment in dark appearance. |
| [Sana AI on Mobbin](https://mobbin.com/screens/fd5a0a4e-ab62-44bf-96aa-155ae1f4d664) | The document sits on a visibly brighter paper plane inside a darker workspace. Used primarily by C. |
| [Remote on Mobbin](https://mobbin.com/screens/6d561544-2624-4398-bdf5-33608895aeeb) | A document card and right panel separate with a hairline rather than a heavy shadow. Used by C and D. |
| [Higgsfield on Mobbin](https://mobbin.com/screens/2f829612-e921-42c0-ba5c-2fd60fd97d77) | Rail, list and content use three neighbouring grey levels; selection moves one step brighter. Used primarily by D. |
| [Linear — A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh) | Navigation recedes while structure is carried by softened borders and restrained separation. Used by D. |

The three Mobbin screenshots were supplied in the Buzz thread by the project manager and are not committed to this repository. They are references for mechanisms, not assets to reproduce.

## Implementation notes for the development engineer

1. Wait for Lu to choose C or D. Do not implement both as user-selectable themes.
2. Map the chosen five layers to semantic dark tokens once; avoid page-specific hex values.
3. Implement the stage / glow treatment with CSS pseudo-elements behind `.intro-art`, `.sc-ring` and `.dl-stage`. Keep the media element unchanged.
4. If Lu prefers the dim treatment after reviewing the motion, apply the chosen filter to both still and video selectors. Do not edit or re-encode the assets.
5. Preserve the explicit light token scope inside slide thumbnails and zoom previews.
6. Capture Step 1, 2, 3, 5 and Settings at 1905px and 390px, including modal, hover, selected, disabled and focus states. Measure all small-text pairs and essential boundaries against WCAG AA before visual QA.
