# Motion

Lumi's interface is a quiet notebook with a coach beside it. Motion explains a state change or adds a small sign of life; it does not keep the page in motion.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `motion-ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | A short response that moves out and settles, such as StoryScore's score-rise reaction. Source: Emil Kowalski `animate` skill, strong UI ease-out. |
| `motion-ease-move` | `cubic-bezier(0.77, 0, 0.175, 1)` | An element already on screen moving between nearby poses. Source: Emil Kowalski `animate` skill, strong ease-in-out. |
| `motion-duration-state` | `160ms` | Focus, colour and state emphasis. Source: the skill's 100–160ms button-feedback range. |
| `motion-duration-feedback` | `240ms` | Small, occasional state feedback. Source: the skill's sub-300ms UI rule. |
| `motion-duration-face-idle` | `6000ms` | **Proposal:** StoryScore's mostly-still idle cycle. The research proposes 5–7s and notes that no Duolingo source gives a timing; 6s is the midpoint to test. Source: `/Users/lu/.buzz/RESEARCH/DUOLINGO_MASCOT_ANIMATION_MOBBIN.md`, recommendation E. |
| `motion-delay-cheer-replay` | `4000ms` | **Proposal:** quiet hold between download-page cheer plays. The research proposes 4–6s and gives no sourced duration; 4s makes the current ≈4s clip and its still interval equal in the first review build. Tune after Lu sees a three-cycle recording. Source: the same synthesis, recommendation D. |

These are the only motion values approved for the StoryScore and ConnectionPrompt guidance below. Add a new token before adding another duration or curve.

## Rules

- Animate `transform` and `opacity` only. Name transitioned properties; never use `transition: all`.
- A state caused by a click or score update responds within 300ms. Ambient mascot motion may be longer because most of its timeline is a static hold.
- `prefers-reduced-motion: reduce` removes mascot translation, rotation and scale. State colour and focus still change immediately.
- Hover motion is allowed only inside `@media (hover: hover) and (pointer: fine)`.
- Do not animate navigation to Settings as a page transition. The provider-row highlight is the orientation cue.
- Pause ambient mascot animation when its page is not active, the document is hidden or the character is outside the viewport. Resume from a quiet hold instead of catching up missed cycles.

## Download-page cheer rhythm

Lu chose an intermittent celebration for the download page: play once, pause, then play again. The research supports an event-triggered celebration and avoiding a visibly repetitive nonstop loop; it does not establish an exact delay. Sources: [`decisions.md` on PR #36](https://github.com/lujin88/Lumi-Storytelling/pull/36), [Duolingo's character animation system](https://blog.duolingo.com/world-character-visemes), [Duolingo's character celebrations](https://blog.duolingo.com/building-character/) and `/Users/lu/.buzz/RESEARCH/DUOLINGO_MASCOT_ANIMATION_MOBBIN.md` S3, S5, S6 and P1.

| State | Entry | Visual | Exit |
| --- | --- | --- | --- |
| `cheer-playing` | The download page becomes active while visible. | Show the exact first frame extracted from the final export, then play that same export once at its authored speed. Do not use the media `loop` attribute and do not add CSS breathing or a second animation. | WebM: on `ended`, pause, set `currentTime = 0`, wait for `seeked` and enter `cheer-hold`. WebP: when the export's measured single-play duration ends, replace the animated image with its extracted frame-0 still and enter `cheer-hold`. |
| `cheer-hold` | One complete play ends and frame 0 is decoded. | Keep the exact extracted frame 0 of the **final WebM/WebP export** visible for `motion-delay-cheer-replay` (4000ms, **proposal**). The character's canvas, size, crop and position stay identical to playback. Start the hold timer only after this frame is visible. | After the delay, replay once and return to `cheer-playing`. |
| `cheer-reduced` | `prefers-reduced-motion: reduce` is active. | Do not load or autoplay an animated clip. Show `assets/lumi/source/cheer.webp` as the static image for the entire visit. | No timer or replay. React live if the media query changes. |

The first visit starts with `cheer-playing`; the quiet hold only follows a completed play. Repeat the play/hold rhythm while the download page remains visible. Leaving the page, hiding the tab or moving the character outside the viewport pauses playback and clears the replay timer. When it becomes visible again, show frame 0 for one complete delay before replaying so the character does not move the instant the user returns.

The final export supplies a frame-0 still asset with the same pixel dimensions, transparent canvas, character position and crop as both animated files. WebM and WebP normal playback, initial paint and quiet hold all use that asset; the older source still is reserved for reduced motion. Do not use a separately composed or re-cropped hold image.

Export the animated WebP with a loop count of one. Browsers do not expose an `ended` event for animated images, so record the final WebP's exact duration in the asset manifest and use that duration for the one play timer. At its end, swap the `<img>` to the final-export frame-0 still. After the quiet delay, replace the image node with a fresh node pointing to the animated WebP so playback restarts at frame 0; do not rely on reassigning the same `src` to an existing node. Predecode both assets and preserve the same width, height and `object-fit` box so the swap has no blank frame or layout shift.

Use one coordinator, one play timer and one hold timer for this Lumi instance. A page render, visibility change and media `ended` event must not schedule overlapping replays. Clearing or changing state cancels both timers before another play is scheduled.

Acceptance recording: at normal motion, capture three complete play/hold cycles for WebM and one complete play/hold/replay cycle for the WebP fallback. Verify that each hold lasts 4s ±100ms, both formats hold on the same final-export frame 0, the transition into and out of the hold does not jump or flash, and only one clip plays at a time. Capture the reduced-motion visit separately and verify that `assets/lumi/source/cheer.webp` remains static.

## Verification

For a new motion implementation, record the affected component at normal speed, at 0.25 playback rate and with reduced motion enabled. Check that no hair, scarf or star intersects the StoryScore ring, that the target Settings row stays legible while highlighted, and that cheer holds on frame 0 without a position or scale jump.

## Rejected motion

| Considered | Decision gate |
| --- | --- |
| Loop a bounce in the score avatar | Fails function: it competes with the score and becomes tiring on the page where users type. |
| Squash the avatar to fake a blink | Fails purpose and fidelity: it distorts the fixed Lumi render instead of communicating a state. |
| Animate the full StoryScore card on every score update | Fails frequency and function: repeated card motion moves text the user is reading. |
| Flash or pulse the Settings provider row | Fails function and accessibility: persistent selected styling gives orientation without a repeated attention effect. |
| Smooth-scroll under reduced motion | Fails accessibility: navigation must become instant when the user asks for less motion. |
| Loop the cheer clip without a hold | Fails frequency: the same high-energy reaction repeats continuously on a page where the user may spend time choosing files. |
