// @ts-check
const { test, expect } = require('@playwright/test');
const { openApp, fillStepOne } = require('./helpers');

const NOTES = '我重新设计了团队的研究流程。产品经理反对，我放弃了自动生成，结果交付时间从两周降到三天。';

/** Animation state shown on the first Lumi image on screen. */
const lumiState = (page) => page.locator('img[data-lumi]').first().getAttribute('data-lumi-state');

test('Lumi waves on open, then breathes when idle', async ({ page }) => {
  const errors = await openApp(page);
  await expect(page.locator('img[data-lumi]').first()).toBeVisible();
  expect(await lumiState(page)).toBe('wave');
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('idle');
  expect(errors).toEqual([]);
});

test('Lumi thinks while the user types, then returns to idle', async ({ page }) => {
  await openApp(page);
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('idle');
  await page.locator('#guideText').pressSequentially('我重新设计了');
  expect(await lumiState(page)).toBe('think');
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('idle');
});

test('typing an API key does not trigger thinking', async ({ page }) => {
  await openApp(page);
  await page.click('#sidebar [data-page="settings"]');
  // Settings shows no Lumi image, so read the controller state directly.
  await expect.poll(() => page.evaluate(() => lumiAnim.state), { timeout: 5000 }).toBe('idle');
  await page.locator('#key-claude').pressSequentially('abc');
  expect(await page.evaluate(() => lumiAnim.state)).toBe('idle');
});

test('Lumi jumps when the story score rises', async ({ page }) => {
  await openApp(page);
  await fillStepOne(page, NOTES);
  await page.click('#footer [data-action="next"]');
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('idle');
  await page.click('[data-action="focus:reframe"]');
  await page.fill('#guideText', '大家以为是效率问题，其实是团队不信任自动生成的结论。');
  await page.press('#guideText', 'Enter');
  await expect.poll(() => lumiState(page)).toBe('jump');
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('idle');
});

test('Lumi cheers on the download page', async ({ page }) => {
  await openApp(page);
  await page.click('[data-action="loadSample"]');
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('idle');
  await page.click('#sidebar [data-page="publish"]');
  await expect.poll(() => page.evaluate(() => lumiAnim.state)).toBe('cheer');
  await expect.poll(() => page.evaluate(() => lumiAnim.state), { timeout: 5000 }).toBe('idle');
});

test('an approved clip replaces only the full-body renders', async ({ page }) => {
  await openApp(page);
  const clipSrc = 'assets/lumi/wave.webp';
  await page.evaluate((src) => {
    LUMI_CLIPS.wave = { webp: src };
    lumiAnim.set('wave');
  }, clipSrc);
  const clipImgs = page.locator('img[data-lumi="clip"]');
  await expect(clipImgs.first()).toHaveAttribute('src', clipSrc);
  await expect(clipImgs.first()).toHaveAttribute('data-lumi-clip', 'wave');
  for (const src of await page.locator('img[data-lumi]:not([data-lumi="clip"])').evaluateAll((els) => els.map((e) => e.getAttribute('src')))) {
    expect(src).not.toBe(clipSrc);
  }
  // Back to idle (no clip yet), the original still comes back.
  await expect.poll(() => clipImgs.first().getAttribute('src'), { timeout: 5000 }).not.toBe(clipSrc);
  await expect(clipImgs.first()).not.toHaveAttribute('data-lumi-clip', /./);
});

test('reduced motion turns the placeholder animations off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openApp(page);
  const name = await page.locator('img[data-lumi]').first().evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe('none');
});

test('reduced motion keeps the still even when a clip is approved', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openApp(page);
  const clipSrc = 'assets/lumi/wave.webp';
  await page.evaluate((src) => {
    LUMI_CLIPS.wave = { webp: src };
    lumiAnim.set('wave');
  }, clipSrc);
  await expect(page.locator('img[data-lumi="clip"]').first()).not.toHaveAttribute('src', clipSrc);
});
