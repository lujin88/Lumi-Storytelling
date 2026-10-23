// @ts-check
// Mobile fixes from the round-1 visual audit (docs/research/LUMI_VISUAL_AUDIT_2026_10_22.md).
const { test, expect } = require('@playwright/test');
const { openApp, fillStepOne } = require('./helpers');

const NOTES = '我重新设计了团队的研究流程。产品经理反对，我放弃了自动生成，结果交付时间从两周降到三天。';

/** Document width beyond the viewport, in px (0 = no sideways scroll). */
const sidewaysOverflow = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

for (const width of [320, 390]) {
  for (const lang of ['zh', 'en']) {
    test(`Gather has no sideways scroll at ${width}px (${lang})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 850 });
      await openApp(page, { storage: { 'lumi-workbench-v1': JSON.stringify({ lang }) } });
      await expect(page.locator('html')).toHaveAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');
      await expect(page.locator('.choice-row.compact .choice')).toHaveCount(4);
      expect(await sidewaysOverflow(page)).toBe(0);
      // Every duration option sits inside the viewport, and its label fits on one line.
      const options = await page.locator('.choice-row.compact .choice').evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right, height: r.height, textHeight: el.querySelector('strong').getBoundingClientRect().height };
        }));
      for (const o of options) {
        expect(o.left).toBeGreaterThanOrEqual(0);
        expect(o.right).toBeLessThanOrEqual(width);
        expect(o.textHeight).toBeLessThanOrEqual(o.height);
      }
    });
  }

  test(`step CTA is 48px tall at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await openApp(page);
    const height = await page.locator('#footer .outside-cta').first().evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBe(48);
  });
}

test('desktop step CTA keeps the 40px control height', async ({ page }) => {
  await openApp(page);
  const height = await page.locator('#footer .outside-cta').first().evaluate((el) => el.getBoundingClientRect().height);
  expect(height).toBe(40);
});

test('score note is a 12px caption', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await openApp(page);
  await fillStepOne(page, NOTES);
  await page.click('#footer [data-action="next"]');
  await expect(page.locator('.sc-note')).toHaveCSS('font-size', '12px');
});

test('mobile slide rows keep 16px side padding', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await openApp(page);
  await fillStepOne(page, NOTES);
  // The sidebar is off-canvas at this width; trigger its Slides link directly.
  await page.locator('#sidebar [data-page="build"]').evaluate((el) => el.click());
  const row = page.locator('#content .deck-row').first();
  await expect(row).toBeVisible();
  await expect(row).toHaveCSS('padding-left', '16px');
  await expect(row).toHaveCSS('padding-right', '16px');
});
