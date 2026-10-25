# Follow-up row format: before and after

Real page (`index.html`), Chrome, 1900×1000, step 2 with two seeded follow-ups (one open, one answered). Script: run on the PR branch, seeds `state.followups` after step 1.

- `before-*`: `main` at `05d80a2`. `after-*`: PR branch.
- `*-selected`: the first follow-up is selected, as after Lumi's review.
- `*-unselected`: nothing selected, so the selection falls back to the first missing story row (05).
