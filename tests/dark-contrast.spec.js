// @ts-check
const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

// The page turns dark from 19:00 to 07:00 local time (applyTheme), so tests set the
// clock. Lu, 2026-10-25: "Connect Claude" on the first-run card was light text on a
// white button in dark mode.
const NIGHT = new Date('2026-10-25T21:00:00');
const DAY = new Date('2026-10-25T10:00:00');

/** Text in app buttons (not slide thumbnails) whose contrast is under 4.5:1. */
async function lowContrastButtons(page) {
  return page.evaluate(() => {
    const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
    const lum = ([r, g, b]) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    // First ancestor-or-self with a mostly opaque background.
    const bgOf = (el) => {
      for (let n = el; n; n = n.parentElement) {
        const c = rgb(getComputedStyle(n).backgroundColor);
        if (c.length === 3 || c[3] > 0.5) return c.slice(0, 3);
      }
      return [255, 255, 255];
    };
    const bad = [];
    for (const b of document.querySelectorAll('button')) {
      if (!b.offsetParent || b.disabled || b.closest('.deck-thumb')) continue;
      // Check the element that paints each text run, not only the button.
      for (const el of [b, ...b.querySelectorAll('*')]) {
        const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
        if (!text || !el.getClientRects().length) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.fontSize === '0px') continue;
        const a = lum(rgb(cs.color)), z = lum(bgOf(el));
        const ratio = (Math.max(a, z) + 0.05) / (Math.min(a, z) + 0.05);
        if (ratio < 4.5) bad.push(`${text.slice(0, 30)} [${b.className}] ${cs.color} on rgb(${bgOf(el)}) = ${ratio.toFixed(2)}`);
      }
    }
    return bad;
  });
}

/** Text colour of every text run in the step 3 slide thumbnails. */
async function thumbTextColors(page) {
  return page.locator('#content .deck-thumb').evaluateAll((thumbs) => thumbs.flatMap((t) =>
    [...t.querySelectorAll('*')]
      .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
      .map((el) => getComputedStyle(el).color)));
}

test('dark mode: first-run card buttons are readable', async ({ page }) => {
  await page.clock.install({ time: NIGHT });
  const errors = await openApp(page);
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('[data-action="firstRunConnect"]')).toBeVisible();
  expect(await lowContrastButtons(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('dark mode: buttons on every step and settings are readable', async ({ page }) => {
  await page.clock.install({ time: NIGHT });
  const errors = await openApp(page);
  await page.click('[data-action="firstRunSample"]');
  const bad = [];
  for (const p of ['dump', 'story', 'build', 'defend', 'publish', 'settings']) {
    await page.click(`#sidebar [data-page="${p}"]`);
    for (const line of await lowContrastButtons(page)) bad.push(`${p}: ${line}`);
  }
  expect(bad).toEqual([]);
  expect(errors).toEqual([]);
});

// Slides are light in both themes, so their thumbnails must look the same.
for (const style of ['empty', 'guizang', 'zara']) {
  test(`dark mode: ${style} slide thumbnails keep their light-mode text colours`, async ({ browser }) => {
    const colors = {};
    for (const [name, time] of [['light', DAY], ['dark', NIGHT]]) {
      const page = await browser.newPage();
      await page.clock.install({ time });
      const errors = await openApp(page);
      await page.click('[data-action="firstRunSample"]');
      await page.click('#sidebar [data-page="build"]');
      await page.selectOption('[data-style-pick]', style);
      await expect(page.locator('#content .deck-thumb').first()).toBeVisible();
      colors[name] = await thumbTextColors(page);
      expect(errors).toEqual([]);
      await page.close();
    }
    expect(colors.light.length).toBeGreaterThan(0);
    expect(colors.dark).toEqual(colors.light);
  });
}
