// Row 11: the score-card face moves at most 1px in every motion state, so it stays inside the ring.
const { test, expect } = require('@playwright/test');
const { openWithKeys } = require('./helpers');

test('score face stays within 1px of rest in jump/cheer/think', async ({ page }) => {
  await openWithKeys(page, []);
  await page.click('[data-action="firstRunSample"]');
  await page.evaluate(() => go('story'));
  const face = page.locator('.sc-face');
  for (const state of ['jump', 'cheer', 'think']) {
    const maxUp = await face.evaluate(async (el, st) => {
      el.setAttribute('data-lumi-state', st);
      const a = el.getAnimations()[0];
      if (!a) return -1;
      a.pause();
      const ct = a.effect.getComputedTiming();
      const total = Math.min(ct.activeDuration, ct.duration * 2);
      let max = 0;
      for (let i = 0; i <= 40; i++) {
        a.currentTime = Math.min(total, (total * i) / 40);
        const m = new DOMMatrix(getComputedStyle(el).transform);
        max = Math.max(max, -m.f);
      }
      return max;
    }, state);
    expect(maxUp, state).toBeGreaterThanOrEqual(0);
    expect(maxUp, state).toBeLessThanOrEqual(1.01);
  }
});
