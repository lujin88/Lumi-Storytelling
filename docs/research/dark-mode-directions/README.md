---
title: "Lumi dark mode directions A and B"
tags: [design, dark-mode, lumi, accessibility]
status: draft
created: 2026-10-28
---

# Dark mode directions

These are design renders from `main` at commit `e1609ad`, with proposal CSS injected at capture time. They are not product implementation. No production file changes in this proposal.

## Recommendation

Choose **A — Night Paper**. It keeps Lumi's warm, tactile character and the existing “quiet notebook with a coach” direction. The warmer graphite ground makes the cream clay, blue scarf and yellow star look intentional without altering the mascot asset. Direction B is a valid alternative if Lu wants the product to feel more technical and operational.

## Direction A — Night Paper / 夜间纸张

**Mood:** calm, warm, tactile, focused, editorial.

The page is warm graphite rather than black. Raised surfaces are a restrained brown-charcoal, while Lumi blue carries focus and selection. The sidebar stays on the same paper plane so the interface continues to read like a notebook rather than a dashboard.

| Role | HEX | Use |
| --- | --- | --- |
| `paper` | `#181715` | Page and sidebar ground |
| `surface` | `#22211E` | Composer, inputs, raised cards |
| `sunken` | `#1D1C19` | Guidance, hover, disabled controls |
| `line` | `#5A5750` | Hairlines and control borders |
| `ink` | `#F1EEE7` | Primary text and primary action |
| `muted` | `#B8B2A6` | Secondary text and placeholder |
| `blue` | `#A8B9D8` | Focus, selected border, Lumi accent |
| `soft` | `#2B313B` | Current / selected fill |

## Direction B — Blueprint / 蓝图工作台

**Mood:** precise, cool, structured, confident, operational.

The page uses deep blue-black and a slightly lighter navigation rail. Selection gets a clearer blue leading edge, so long workflows scan faster. It feels more like a serious story-building tool, with less of the notebook warmth.

| Role | HEX | Use |
| --- | --- | --- |
| `paper` | `#111820` | Main page ground |
| `surface` | `#18232E` | Composer, inputs, raised cards |
| `sunken` | `#141D26` | Sidebar, guidance, hover |
| `line` | `#46586A` | Hairlines and control borders |
| `ink` | `#EEF4F9` | Primary text and primary action |
| `muted` | `#ABB9C5` | Secondary text and placeholder |
| `blue` | `#91B7E5` | Focus, selected border, Lumi accent |
| `soft` | `#20334A` | Current / selected fill |

## Typography, spacing, shape and layout

Both directions keep the current system unchanged: system sans for the application, Georgia only inside slide content, 14px body, 24px page title, 4px spacing base, 6px controls, 8px surfaces and 12px multi-select tags. Desktop remains a 232px sidebar plus one left-aligned document rail. At 390px, content uses the existing 16px gutter and the sidebar stays off-canvas.

The two options differ only in dark color mapping and navigation-plane treatment. They do not change component geometry or interaction flow, so the chosen direction can be implemented as a semantic-token update instead of a page-by-page restyle.

## Components and interaction states

- Primary action: `ink` fill with `paper` text. Secondary actions: `surface` with `line` border and `ink` text.
- Disabled Connect actions keep full opacity and use `muted` on `sunken`, instead of applying global opacity to the whole control.
- Current and selected rows use `soft`; focus uses a 2px `blue` outline. Direction B additionally uses the existing current-row leading-bar pattern in the navigation.
- Slide title and point hover use `sunken` (A) or `soft` (B) with `ink` text. This removes the hard-coded light hover fill that caused the dark title contrast failure.
- Missing slide rows keep their EvidenceMark but do not lower the entire thumbnail opacity. User-created slides remain light in dark mode, preserving their authored appearance and preventing white-on-off-white text.
- Lumi imagery is unchanged: same face, hair, scarf, clay texture, pose and transparent render. Do not recolor, add a backdrop ellipse or regenerate the asset for dark mode.

## Accessibility measurements

Measured from the rendered proposal with Chrome. Text below 24px targets WCAG AA 4.5:1; focus and essential component boundaries target 3:1 where applicable.

| Pair / state | A | B |
| --- | ---: | ---: |
| Primary text `ink` / `paper` | 15.46:1 | 16.12:1 |
| Secondary text `muted` / `paper` | 8.49:1 | 8.91:1 |
| `ink` / raised `surface` | 13.90:1 | 14.37:1 |
| Secondary `muted` / `surface` | 7.63:1 | 7.95:1 |
| Current-state `info` / `soft` | 7.88:1 | 7.99:1 |
| First-run “Connect Claude” | 13.90:1 | 14.37:1 |
| Step 3 title hover | 14.71:1 | 11.59:1 |
| Step 3 thumbnail title | 13.14:1 | 13.14:1 |

Color is never the only state signal: selection retains border or leading bar, focus retains an outline, and missing content retains text. The proposal does not introduce motion. Lumi's full-color art is checked on both grounds without changing the asset.

## Images

### Before — current dark mode

| 1905px | 390px |
| --- | --- |
| ![Current dark mode at 1905px](https://github.com/lujin88/Lumi-Storytelling/blob/c16f74bcb41943d053bffd754fc8e14bbcf51548/docs/research/dark-mode-directions/direction-current-1905.png?raw=true) | ![Current dark mode at 390px](https://github.com/lujin88/Lumi-Storytelling/blob/c16f74bcb41943d053bffd754fc8e14bbcf51548/docs/research/dark-mode-directions/direction-current-390.png?raw=true) |

### 1905px

| A — Night Paper | B — Blueprint |
| --- | --- |
| ![Direction A at 1905px](https://github.com/lujin88/Lumi-Storytelling/blob/c16f74bcb41943d053bffd754fc8e14bbcf51548/docs/research/dark-mode-directions/direction-a-1905.png?raw=true) | ![Direction B at 1905px](https://github.com/lujin88/Lumi-Storytelling/blob/c16f74bcb41943d053bffd754fc8e14bbcf51548/docs/research/dark-mode-directions/direction-b-1905.png?raw=true) |

### 390px

| A — Night Paper | B — Blueprint |
| --- | --- |
| ![Direction A at 390px](https://github.com/lujin88/Lumi-Storytelling/blob/c16f74bcb41943d053bffd754fc8e14bbcf51548/docs/research/dark-mode-directions/direction-a-390.png?raw=true) | ![Direction B at 390px](https://github.com/lujin88/Lumi-Storytelling/blob/c16f74bcb41943d053bffd754fc8e14bbcf51548/docs/research/dark-mode-directions/direction-b-390.png?raw=true) |

## Research references

Observed references are separated from the Lumi recommendation above:

- [Apple HIG — Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode): dark mode is not a literal inversion; keep semantic colors, preserve full-color image appearance and meet at least 4.5:1 text contrast. Applied here by keeping Lumi and authored slides unchanged while remapping application tokens.
- [Material Design 3 — Color roles](https://m3.material.io/styles/color/the-color-system): multiple semantic surface roles create hierarchy in dark themes. Applied here with existing Lumi `paper`, `surface` and `sunken` roles rather than shadows.
- [Carbon — Color foundations](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview): dark layers get lighter as they rise. Applied to inputs, composer and modal surfaces.
- [Atlassian Design — Color](https://atlassian.design/foundations/color): hover and pressed states use subtle neutral backgrounds, and small text targets 4.5:1. Applied to the Step 3 hover repair and state-by-state contrast checks.

There is no project `bar.md`, so these references are inspiration and accessibility guidance, not a formal benchmark comparison. The required Operate-mode `interface-design` skill was unavailable in this environment; the proposal was produced manually against `design-system/` and harness-core `checks.md`.

## Implementation notes

After Lu chooses A or B, the development engineer should:

1. Update only the dark semantic token mapping first; do not fork page-specific palettes.
2. Replace fixed light hover fills on editable Step 3 titles and points with the chosen semantic state token.
3. Replace global disabled opacity on provider buttons with explicit dark disabled foreground/background/border values.
4. Keep slide previews on their authored light palette and remove whole-thumbnail opacity from the missing state; keep the EvidenceMark.
5. Verify Step 1, 2, 3, 5 and Settings at 1905 / 1512 / 1280 / 390, including hover, focus, selected, disabled and modal states.
6. Hand the implementation to Visual Correction for fidelity review before merge.
