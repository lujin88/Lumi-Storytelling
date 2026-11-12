---
title: "Lumi dark mode direction D — Dusk Library"
tags: [design, dark-mode, lumi, accessibility]
status: active
created: 2026-10-28
---

# D — Dusk Library / 暮色书库

Lu selected D in the Buzz thread on 2026-10-28. This revision completes the selected direction at 390, 1512 and 1905px for Step 1, Step 2, Step 3, Step 5 and Settings. Light mode is captured as an unchanged baseline. The proposal remains capture-only CSS: production `index.html` is not changed in this design PR.

Directions C and the earlier A / B round remain in git history as decision evidence; they are not implementation alternatives.

## Visual concept and rationale

A quiet library workstation uses five neighbouring warm-grey planes: environment, rail, content, foreground panel and card / modal. The planes become lighter as the user moves toward the current task. A restrained top highlight and 1px boundary make the foreground legible without turning the interface into stacked floating cards.

Lumi keeps the source asset at 100% brightness and saturation. A low warm stage and shallow glow give the mascot a contact plane, so it reads as part of the workstation rather than a bright object floating over it. No night-version animation or recoloured asset is needed.

**Mood and personality:** composed, structured, warm, focused, substantial.

## Colour tokens

The five layer values below are unchanged from the D direction Lu selected. No surface layer needed to be brightened after WCAG measurement, so the spacing between layer luminances stays intact.

| Token | HEX | Use |
| --- | --- | --- |
| `base` | `#211E1D` | Outer workspace |
| `rail` | `#292523` | Sidebar and recessed wells |
| `paper` | `#302B29` | Main content base |
| `surface` | `#393330` | Foreground panel, inputs and secondary controls |
| `elevated` | `#433C38` | Cards, score panel, preview and modal |
| `line` | `#998D85` | Essential control and component boundaries |
| `ink` | `#F5F0EB` | Primary text and primary action surface |
| `muted` | `#C7BDB6` | Secondary text, captions and inactive navigation |
| `blue` | `#ADBAD1` | Focus and selected boundaries |
| `soft` | `#3D424D` | Selected and current fill |
| `info` | `#C2CDE0` | Information text and icon |
| `ok` | `#B7D2AC` | Supported state |
| `warn` | `#E8C987` | Stated-only state |
| `danger` | `#EFAAA4` | Missing state |

The first C / D draft used `line: #665D58`; it measured only 1.68–2.58:1 against D surfaces and could not carry an essential control boundary. D now uses `#998D85`, which measures 3.35–5.13:1 across the five layers. Decorative separators may remain low emphasis only when the adjacent fill, spacing or grouping already carries the structure; interactive controls use the measured `line` token.

## Lumi stage / glow tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `lumi-stage-width` | `112%` | Stage width relative to Lumi's art container |
| `lumi-stage-height` | `34%` | Low contact plane, not a halo around the full body |
| `lumi-stage-bottom` | `3%` | Anchors the plane under the feet / figure |
| `lumi-stage-radius` | `50%` | Elliptical stage |
| `lumi-stage-ambient` | `#D5BFAE24` | Warm top wash in the stage |
| `lumi-stage-fill` | `#51484270` | Stage body and score-avatar well |
| `lumi-stage-highlight` | `#D8C7BA52` | 1px top contact edge |
| `lumi-stage-shadow` | `0 18px 32px #00000030` | Shallow stage shadow |
| `lumi-media-shadow` | `drop-shadow(0 18px 24px #00000042)` | Separates the unchanged asset from the stage |

Apply the stage only to the Step 1 art container, the Step 5 Lumi container and the score-avatar ring. Keep both `<img data-lumi>` and `<video data-lumi-video>` at `opacity: 1` with no brightness or saturation filter. At 720px and below, Step 1 continues to hide full-body Lumi according to the existing responsive rule; do not force the stage into the mobile layout.

## Typography, layout and spacing

- Keep the current project type system: system sans for the application; Georgia / Songti only inside authored slide content. Do not load a new font.
- Keep the current 4px spacing base, 232px desktop rail, 960px Step 1 content rail and 16px mobile gutter.
- At desktop widths, `base` holds the environment, `rail` holds navigation, `paper` holds the content column, and `surface` is the bounded page panel. Cards and dialogs use `elevated`.
- At 390px, remove the desktop-only inline border on `#content`; retaining it caused 1px horizontal overflow. The page panel stays inside the 16px mobile gutter.
- Keep authored slide thumbnails and zoom previews on their explicit light palette in both themes.

## Components and interaction

- Active navigation uses `soft` plus a non-colour cue; focus uses a 2px `blue` outline.
- Inputs, choice cards, composer and secondary buttons use `surface` with the measured `line` boundary. Hover moves to `elevated`.
- Selected choices use `soft` with a `blue` boundary; disabled controls retain readable `muted` text instead of lowering whole-control opacity.
- First-run card, guidance and download card use `elevated`. Score panel, preview and modal also use the same fifth layer; do not add a sixth grey layer.
- Primary buttons invert to `ink` with `base` text. Slide content remains light in both themes.
- No interaction or information architecture changes are part of D.

## Imagery and illustration direction

- Preserve Lumi's face, hair, scarf, star, pose, silhouette and clay texture from the existing source assets.
- Do not regenerate, recolour or bake a dark background into any still or animation.
- The stage is a CSS plane behind the media, so still, WebM and WebP fallback remain visually aligned.
- Reduced motion continues to show the existing still. The dark treatment must not trigger another asset download.

## WCAG AA measurements

`capture.cjs` reads the computed tokens from the rendered D page and applies the WCAG relative-luminance formula. Normal text uses a 4.5:1 threshold. Large text, icons, focus indicators and essential component boundaries use 3:1. `CHECKS.json` is the machine-readable result.

| Foreground / background | Ratio | Threshold | Result |
| --- | ---: | ---: | --- |
| Primary `ink` / `base` | 14.62:1 | 4.5:1 | Pass |
| Secondary `muted` / `base` | 8.98:1 | 4.5:1 | Pass |
| Essential `line` / `base` | 5.13:1 | 3:1 | Pass |
| Primary `ink` / `rail` | 13.41:1 | 4.5:1 | Pass |
| Secondary `muted` / `rail` | 8.23:1 | 4.5:1 | Pass |
| Essential `line` / `rail` | 4.70:1 | 3:1 | Pass |
| Primary `ink` / `paper` | 12.34:1 | 4.5:1 | Pass |
| Secondary `muted` / `paper` | 7.57:1 | 4.5:1 | Pass |
| Essential `line` / `paper` | 4.33:1 | 3:1 | Pass |
| Primary `ink` / `surface` | 10.97:1 | 4.5:1 | Pass |
| Secondary `muted` / `surface` | 6.73:1 | 4.5:1 | Pass |
| Essential `line` / `surface` | 3.85:1 | 3:1 | Pass |
| Primary `ink` / `elevated` | 9.55:1 | 4.5:1 | Pass |
| Secondary `muted` / `elevated` | 5.86:1 | 4.5:1 | Pass |
| Essential `line` / `elevated` | 3.35:1 | 3:1 | Pass |
| Primary button `base` / `ink` | 14.62:1 | 4.5:1 | Pass |
| Selected / focus `blue` / `soft` | 5.14:1 | 3:1 | Pass |
| Information `info` / `soft` | 6.28:1 | 4.5:1 | Pass |
| Supported `ok` / `elevated` | 6.61:1 | 4.5:1 | Pass |
| Stated `warn` / `elevated` | 6.76:1 | 4.5:1 | Pass |
| Missing `danger` / `elevated` | 5.64:1 | 4.5:1 | Pass |

The 30 rendered states cover light and dark at 390, 1512 and 1905px for Step 1, Step 2, Step 3, Step 5 and Settings. All returned zero horizontal overflow and zero page errors. Light-mode screenshots are evidence that the capture-only D rules do not change the existing light appearance.

## Observed references

| Source | Observed principle used here |
| --- | --- |
| [Apple Human Interface Guidelines — Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) | Base and elevated backgrounds create depth; images may need separate contrast treatment in dark appearance. |
| [Sana AI on Mobbin](https://mobbin.com/screens/fd5a0a4e-ab62-44bf-96aa-155ae1f4d664) | A document sits on a visibly brighter plane inside a darker workspace. |
| [Remote on Mobbin](https://mobbin.com/screens/6d561544-2624-4398-bdf5-33608895aeeb) | A document card and adjacent panel separate with a hairline instead of a heavy shadow. |
| [Higgsfield on Mobbin](https://mobbin.com/screens/2f829612-e921-42c0-ba5c-2fd60fd97d77) | Rail, list and content use neighbouring grey levels; selection moves one step brighter. This is D's primary structural reference. |
| [Linear — A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh) | Navigation recedes while softened boundaries carry structure. |

The Mobbin screens were supplied in the Buzz thread and are pattern references only. No screenshot, layout, illustration, logo or branded asset is copied into Lumi.

## Implementation notes for the development engineer

1. Map the five D layers to semantic dark tokens once. Do not add page-specific hex values or a sixth surface layer.
2. Strengthen essential control boundaries with `line: #998D85`. Status borders use the matching status foreground; `action-line` remains `blue`.
3. Implement the Lumi treatment through the stage tokens above on `.intro-art`, the Step 5 art container and `.sc-ring`. Keep source media at 100% and apply the same media shadow to still and video.
4. Preserve the explicit light token scope inside slide thumbnails and zoom previews.
5. At the mobile breakpoint, remove the desktop-only `#content` inline border so D adds no horizontal overflow.
6. Capture Step 1, 2, 3, 5 and Settings at 390, 1512 and 1905px, light and dark, including modal, hover, selected, disabled and focus states. Run rendered text, icon and essential-boundary contrast checks against the thresholds above.
7. This PR is a design handoff only. The development engineer owns production `index.html` and tests in a separate implementation PR.

No `interface-design` skill was available in this environment, so this revision was completed manually against `design-system/`, harness-core `checks.md` and the selected D direction. The current branch has no merged `bar.md`; visual correction should record that benchmark comparison was not run and perform the specification comparison against this handoff.
