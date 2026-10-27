// @ts-check
const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

// Fixes from the 2026-10-27 visual audit (V02-V06). The page turns dark from
// 19:00 to 07:00 local time (applyTheme), so tests set the clock.
const NIGHT = new Date('2026-10-25T21:00:00');
const DAY = new Date('2026-10-25T10:00:00');

for (const [theme, time] of [['light', DAY], ['dark', NIGHT]]) {
  test(`${theme}: step 2 of an empty project has one current row`, async ({ page }) => {
    await page.clock.install({ time });
    const errors = await openApp(page);
    await page.click('#sidebar [data-page="story"]');
    const current = page.locator('#content .foundation-item.current');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute('data-action', /^focus:/);
    expect(errors).toEqual([]);
  });

  test(`${theme}: a picked "remember" row is the only current row on step 2`, async ({ page }) => {
    await page.clock.install({ time });
    const errors = await openApp(page);
    await page.click('#sidebar [data-page="story"]');
    await page.click('[data-action="three:1"]');
    await page.keyboard.press('Escape');
    const current = page.locator('#content .foundation-item.current');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute('data-action', 'three:1');
    expect(errors).toEqual([]);
  });

  test(`${theme}: selected step 1 choices use the shared action fill`, async ({ page }) => {
    await page.clock.install({ time });
    const errors = await openApp(page);
    await page.click('[data-action="purpose:interview"]');
    const [fill, actionBg] = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.background = 'var(--action-bg)';
      document.body.append(probe);
      const want = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return [getComputedStyle(document.querySelector('[data-action="purpose:interview"]')).backgroundColor, want];
    });
    expect(fill).toBe(actionBg);
    expect(errors).toEqual([]);
  });

  test(`${theme}: the score card focus ring is the same blue as other buttons`, async ({ page }) => {
    await page.clock.install({ time });
    const errors = await openApp(page);
    await page.click('[data-action="firstRunSample"]');
    await page.click('#sidebar [data-page="story"]');
    await page.locator('.sc-head').focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const [ring, offset, blue] = await page.evaluate(() => {
      const cs = getComputedStyle(document.activeElement);
      const probe = document.createElement('div');
      probe.style.color = 'var(--blue)';
      document.body.append(probe);
      const want = getComputedStyle(probe).color;
      probe.remove();
      return [`${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, cs.outlineOffset, want];
    });
    expect(await page.evaluate(() => document.activeElement?.classList.contains('sc-head'))).toBe(true);
    expect(ring).toBe(`solid 2px ${blue}`);
    expect(offset).toBe('2px');
    expect(errors).toEqual([]);
  });

  test(`${theme}: pressed segments show by fill alone`, async ({ page }) => {
    await page.clock.install({ time });
    const errors = await openApp(page);
    await page.click('[data-action="firstRunSample"]');
    await page.click('#sidebar [data-page="build"]');
    const shadows = await page.evaluate(() => [
      ...document.querySelectorAll('.language-picker button[aria-pressed="true"], .seg button.on, #content .script-seg button.on'),
    ].map((b) => getComputedStyle(b).boxShadow));
    expect(shadows.length).toBeGreaterThanOrEqual(2);
    expect(shadows.every((s) => s === 'none')).toBe(true);
    expect(errors).toEqual([]);
  });
}

// V02: the zoomed slide is light in both themes, so its text must keep light-mode colours.
for (const style of ['empty', 'guizang', 'zara']) {
  test(`dark mode: the zoomed ${style} slide keeps its light-mode text colours`, async ({ browser }) => {
    const colors = {};
    for (const [name, time] of [['light', DAY], ['dark', NIGHT]]) {
      const page = await browser.newPage();
      await page.clock.install({ time });
      const errors = await openApp(page);
      await page.click('[data-action="firstRunSample"]');
      await page.click('#sidebar [data-page="build"]');
      await page.selectOption('[data-style-pick]', style);
      await page.locator('#content .deck-thumb').nth(1).click();
      const zoom = page.locator('.modal .deck-zoom');
      await expect(zoom).toBeVisible();
      colors[name] = await zoom.evaluate((z) => [...z.querySelectorAll('*')]
        .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
        .map((el) => getComputedStyle(el).color));
      expect(errors).toEqual([]);
      await page.close();
    }
    expect(colors.light.length).toBeGreaterThan(0);
    expect(colors.dark).toEqual(colors.light);
  });
}
