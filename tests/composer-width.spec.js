// @ts-check
// Composer bar fills the content column with equal left and right gutters
// (decisions.md 2026-10-24, Lu's review point 6). Lu's window is about 1914px wide.
const { test, expect } = require('@playwright/test');
const { openApp, fillStepOne } = require('./helpers');

const NOTES = '我重新设计了团队的研究流程。产品经理反对，我放弃了自动生成，结果交付时间从两周降到三天。';

/** Left/right edges of the step content, the composer and the step CTA. */
const edges = (page) =>
  page.evaluate(() => {
    const box = (s) => {
      const r = document.querySelector(s).getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right) };
    };
    const content = document.querySelector('#content');
    const cs = getComputedStyle(content);
    const c = content.getBoundingClientRect();
    return {
      column: { left: Math.round(c.left + parseFloat(cs.paddingLeft)), right: Math.round(c.right - parseFloat(cs.paddingRight)) },
      composer: box('#footer .composer'),
      cta: box('#footer .outside-cta'),
      viewport: window.innerWidth,
      sidebar: Math.round(document.querySelector('#content').getBoundingClientRect().left),
    };
  });

for (const width of [1914, 1512, 1280]) {
  test(`composer and Next fill the content column at ${width}px, steps 1 and 2`, async ({ page }) => {
    await page.setViewportSize({ width, height: 964 });
    await openApp(page);
    for (const step of [1, 2]) {
      if (step === 2) {
        await fillStepOne(page, NOTES);
        await page.click('#footer [data-action="next"]');
        await expect(page.locator('#sidebar [data-page="story"]')).toHaveClass(/active/);
      }
      const e = await edges(page);
      expect(e.composer.left, `step ${step}`).toBe(e.column.left);
      expect(e.cta.right, `step ${step}`).toBe(e.column.right);
      expect(e.cta.left, `step ${step}`).toBeGreaterThan(e.composer.right);
      // Equal gutters on both sides of the bar.
      expect(e.composer.left - e.sidebar, `step ${step}`).toBe(e.viewport - e.cta.right);
    }
  });
}

test('stacked composer spans the full content width at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await openApp(page);
  const e = await edges(page);
  expect(e.composer).toEqual(e.column);
  expect(e.cta).toEqual(e.column);
  expect(e.column.left).toBe(e.viewport - e.column.right);
});
