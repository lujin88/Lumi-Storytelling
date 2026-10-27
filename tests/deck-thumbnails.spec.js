// @ts-check
// Step 3 thumbnails show a 960px slide scaled down. The scale must match the
// thumbnail's real width, or the slide's right and bottom edges are cut off
// (seen on the sample deck at 1512px: 224px thumbnail, slide scaled to 288px).
const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

for (const lang of ['zh', 'en']) {
  test(`every Step 3 thumbnail shows the whole slide (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width: 1512, height: 900 });
    await openApp(page, { storage: { 'lumi-workbench-v1': JSON.stringify({ lang }) } });
    await page.locator('[data-action="firstRunSample"], [data-action="loadSample"]').first().evaluate((el) => el.click());
    await page.locator('#sidebar [data-page="build"]').evaluate((el) => el.click());
    await expect(page.locator('#content .deck-thumb').first()).toBeVisible();
    // Resize after the first render too, so the fluid mobile thumbnail is covered.
    for (const width of [1512, 1280, 1100, 721, 390]) {
      await page.setViewportSize({ width, height: 900 });
      // The resize event fires on the next frame, after setViewportSize returns.
      await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('#content .deck-thumb')].flatMap((th, i) => {
        const b = th.getBoundingClientRect(), s = th.querySelector('.slide')?.getBoundingClientRect();
        if (!s || !b.width) return [];
        return s.right > b.right + 0.5 || s.bottom > b.bottom + 0.5 ? [{ i, thumb: [b.right, b.bottom], slide: [s.right, s.bottom] }] : [];
      })), `${width}px`).toEqual([]);
    }
  });
}
