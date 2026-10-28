// @ts-check
// The toast must never cover the composer or the step button (visual review 2026-10-28:
// at 390px the review toast sat on top of the composer while the user was typing).
const { test, expect } = require('@playwright/test');
const { openApp, fillStepOne } = require('./helpers');

const NOTES = '我重新设计了团队的研究流程。产品经理反对，我放弃了自动生成，结果交付时间从两周降到三天。';

/** Gap in px between the toast's bottom edge and the highest footer control (negative = overlap). */
const toastGap = (page) =>
  page.evaluate(() => {
    const toast = document.getElementById('toast').getBoundingClientRect();
    const tops = [...document.querySelectorAll('#footer .composer, #footer .outside-cta')]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.height > 0)
      .map((r) => r.top);
    return Math.min(...tops) - toast.bottom;
  });

for (const width of [320, 390, 1512, 1905]) {
  for (const theme of ['light', 'dark']) {
    test(`toast clears the footer at ${width}px (${theme})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 850 });
      await openApp(page);
      // The app picks dark by time of day; pin it so both themes are covered.
      await page.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), theme === 'dark');
      await fillStepOne(page, NOTES);
      await page.click('#footer [data-action="next"]');
      await page.evaluate(() => notify('Lumi 看了一遍，补了 1 个追问。答完再点「下一步」。'));
      await expect(page.locator('#toast')).toBeVisible();
      expect(await toastGap(page)).toBeGreaterThanOrEqual(12);

      // A multi-line draft grows the composer; the toast moves up with it.
      await page.fill('#guideText', '第一行\n第二行\n第三行\n第四行');
      await page.evaluate(() => notify('Lumi 看了一遍，补了 1 个追问。答完再点「下一步」。'));
      await expect.poll(() => toastGap(page)).toBeGreaterThanOrEqual(12);
    });
  }
}
