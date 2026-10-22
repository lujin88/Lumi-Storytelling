// @ts-check
// No page may scroll sideways. A hidden tooltip still counts towards page width,
// so this caught the Story page's `.info-tip .tip` running past the right edge.
const { test, expect } = require('@playwright/test');
const { openApp, fillStepOne } = require('./helpers');

const NOTES = '我重新设计了团队的研究流程。产品经理反对，我放弃了自动生成，结果交付时间从两周降到三天。';

// Gather at 320/390px is covered by mobile-layout.spec.js (duration options, PR #11).
const CASES = [
  { page: 'dump', widths: [721, 1280] },
  { page: 'story', widths: [320, 390, 721, 1280] },
  { page: 'build', widths: [320, 390, 721, 1280] },
];

for (const lang of ['zh', 'en']) {
  for (const { page: step, widths } of CASES) {
    test(`${step} has no sideways scroll (${lang})`, async ({ page }) => {
      await openApp(page, { storage: { 'lumi-workbench-v1': JSON.stringify({ lang }) } });
      await fillStepOne(page, NOTES);
      // The sidebar is off-canvas on mobile; trigger the step link directly.
      await page.locator(`#sidebar [data-page="${step}"]`).evaluate((el) => el.click());
      await expect(page.locator(`#sidebar [data-page="${step}"]`)).toHaveClass(/active/);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 850 });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${step} at ${width}px`).toBe(0);
      }
    });
  }
}

test('Story tooltip fits the viewport when shown', async ({ page }) => {
  await openApp(page, { storage: { 'lumi-workbench-v1': JSON.stringify({ lang: 'en' }) } });
  await fillStepOne(page, NOTES);
  await page.locator('#sidebar [data-page="story"]').evaluate((el) => el.click());
  for (const width of [320, 390, 721, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    await page.locator('.info-tip .info-btn').focus();
    const tip = page.locator('.info-tip .tip');
    await expect(tip).toBeVisible();
    const box = await tip.evaluate((el) => el.getBoundingClientRect().toJSON());
    expect(box.left, `left at ${width}px`).toBeGreaterThanOrEqual(0);
    expect(box.right, `right at ${width}px`).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  }
});
