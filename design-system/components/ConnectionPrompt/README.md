# ConnectionPrompt

An inline route from a missing or degraded AI connection to the exact place that fixes it. It reuses Banner's one-line anatomy; it is not a modal, toast or new raised card.

## Visual direction

- **Concept:** a calm handoff from the interrupted task to the exact repair point. The prompt, target row and help read as one path instead of three separate messages.
- **Mood:** specific, calm, reassuring, local.
- **Palette:** blocked text uses `danger` #9d4b49; degraded text uses `muted` #677181; the target row uses `action-bg` #e7ecf3 with an `action-ink` #526787 leading bar; focus uses `blue` #7e8fae. No provider brand colours.
- **Type:** system sans; prompt and help at 13px/500, provider name at 14px/600, supporting copy at 12px/500.
- **Shape and imagery:** existing 6px controls and 8px content radius; no illustration, provider logo or new icon style.

## When to show it

- **Blocked:** an action needs a provider and that provider has no usable key or connection. Use `danger` text and the warning icon.
- **Degraded:** the feature still works locally but a provider improves it, such as browser speech recognition without Gemini. Use `muted` text and the info icon.
- Do not show it pre-emptively on every page. Show it after the user invokes the affected feature, or in an existing first-run connection card.

## Anatomy

- The whole prompt is one internal-navigation button/link, so clicking the message or trailing action has the same result.
- 16px leading icon, `s-2` gap, 13px text, then a trailing text-link label. No fill, border or shadow. Minimum hit height 44px on touch layouts.
- The Settings row keeps its existing `Connect` / `连接` action beside the key field. It is an outlined secondary button; help is the text link below it. Do not tell the user to choose Connect unless that control is visible in the same highlighted region.
- Keep the provider name visible in the sentence and the action. Final Chinese and English strings belong to UX Copy; the design keys are `connection.blocked`, `connection.degraded`, `connection.open-settings`, `connection.get-key`, `connection.paste-key` and `help.connect-provider`.
- Do not put a generic "Open Settings" prompt beside several providers. Each instance carries exactly one provider id.

## Navigation contract

1. The trigger carries a provider id (`claude`, `openai`, `gemini`, or a video provider) and the current feature as the return context.
2. Activation opens Settings, scrolls the matching provider row to the centre of the visible area, then moves focus to the row container (`tabindex="-1"`). Do not autofocus the secret input; that would open the phone keyboard before the user has read the help.
3. Add the `targeted` state to that row. It uses `action-bg`, a 3px `action-ink` bar on the leading edge and `r-surface`; it has no pulse or timed fade. Keep it until the user interacts with the row or leaves Settings.
4. With `prefers-reduced-motion: reduce`, use instant scrolling. Otherwise native smooth scrolling is allowed; do not add a page transition.
5. On 390px, the complete highlighted row and its help stack into one column. The provider name, key field, help and connect action must remain in the same highlighted region.
6. Dark mode uses the dark action tokens from the shared system: `action-bg` #232a36, `action-line` #9fb0cf, `action-ink` #a9bbd6, `paper` #171a21, `surface` #1d222c and `line` #343b49. The leading bar, focus outline and underlined links remain visible without provider brand colours.

## Setup help beside the key field

Every provider row has a text link beside or directly below its key field. It opens an inline disclosure inside the same highlighted row; it does not open another page or modal.

The disclosure has two provider-specific steps:

1. A direct external link to the provider's official key-creation page, with ↗.
2. A plain instruction to copy the key, paste it into this field and choose Connect.

End with the existing local-storage privacy fact for the current origin. Never show, repeat, copy, log or place the actual key in the help text. Provider names, official URLs and whether a provider accepts browser calls come from one provider metadata source; if an official key-creation URL is not confirmed, label it `待确认` rather than linking to a guessed page.

The `Connect` button stays available while the disclosure is open. At desktop widths the field and button share a row; at 390px they stack to full width before the help link. A pending connection disables only the button and changes its label; it never hides the provider help.

## Help page

Add one FAQ, "连接服务和 API 密钥" / English equivalent from UX Copy. It explains why keys are needed, where they stay and how to connect a provider. List only providers that Settings currently offers. Each provider name is an internal link that uses the same navigation contract and lands on the same highlighted Settings row.

Do not duplicate setup prose or URLs in the Help renderer. Help and Settings read the same provider metadata so they cannot drift.

## Accessibility

- The prompt's accessible name includes the missing provider and action.
- The focused provider row has a visible 2px `blue` focus outline in addition to the persistent highlight.
- Announce blocked prompts with `role="alert"`; degraded prompts use `role="status"`.
- The inline help disclosure is a real button with `aria-expanded` and `aria-controls`.
- Highlight and focus carry the orientation; never rely on colour alone.

## Implementation notes

- Reuse the existing `connectPromptHTML()`, `go('settings')`, provider rows and provider metadata; extend them rather than creating a second settings flow.
- Store `targetProvider` in navigation state before rendering Settings. After render, select the row by provider id, apply `targeted`, scroll and focus it.
- Use `motion-duration-state` only for the row background and focus colour if a transition is needed. Do not animate layout properties.
- UX Copy supplies the final bilingual strings for the six keys above and the Help FAQ before implementation is complete.
