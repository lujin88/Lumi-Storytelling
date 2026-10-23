// @ts-check
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { openApp, fillStepOne } = require('./helpers');

const NOTES = '我重新设计了团队的研究流程。产品经理反对，我放弃了自动生成，结果交付时间从两周降到三天。';

/** Animation state shown on the first Lumi image on screen. */
const lumiState = (page) => page.locator('img[data-lumi]').first().getAttribute('data-lumi-state');

const animationName = (locator) => locator.evaluate((el) => getComputedStyle(el).animationName);

test('Lumi waves on open with the transparent WebM, then goes back to the still', async ({ page }) => {
  const errors = await openApp(page);
  const still = page.locator('img.intro-lumi[data-lumi]');
  const video = page.locator('video[data-lumi-video]');
  expect(await lumiState(page)).toBe('wave');
  // The clip replaces the CSS placeholder: the <video> takes the still's place, the <img> is hidden.
  await expect(video).toHaveAttribute('src', 'assets/lumi/wave.webm');
  await expect(video).toBeVisible();
  await expect(still).toBeHidden();
  await expect.poll(() => video.evaluate((v) => v.readyState)).toBeGreaterThan(0);
  expect(await video.evaluate((v) => v.duration)).toBeCloseTo(4, 0);
  await expect.poll(() => lumiState(page), { timeout: 6000 }).toBe('idle');
  // Idle keeps what the page had before the state machine: the intro Lumi was a still.
  await expect(video).toHaveCount(0);
  await expect(still).toBeVisible();
  expect(await animationName(still)).toBe('none');
  expect(errors).toEqual([]);
});

test('a WebM that fails to load falls back to the animated WebP', async ({ page }) => {
  await openApp(page);
  await expect.poll(() => lumiState(page), { timeout: 6000 }).toBe('idle');
  await page.evaluate(() => {
    LUMI_CLIPS.wave = { webm: 'assets/lumi/missing.webm', webp: 'assets/lumi/wave.webp' };
    lumiAnim.set('wave');
  });
  const still = page.locator('img.intro-lumi[data-lumi]');
  await expect(still).toHaveAttribute('src', 'assets/lumi/wave.webp');
  await expect(still).toBeVisible();
  await expect(page.locator('video[data-lumi-video]')).toHaveCount(0);
});

// Safari, every iOS browser and in-app WebKit browsers (no "Safari" in the UA) cannot show
// WebM alpha, so they get the animated WebP.
const WEBP_USER_AGENTS = {
  'Mac Safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  'iOS Chrome': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.90 Mobile/15E148 Safari/604.1',
  'iOS WeChat': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.50(0x1800322c) NetType/WIFI Language/zh_CN',
  'iPad Instagram': 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22A3354 Instagram 350.0.0.0.0',
  'Mac in-app WebKit': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)',
};

for (const [name, userAgent] of Object.entries(WEBP_USER_AGENTS)) {
  test.describe(name, () => {
    test.use({ userAgent });

    test('gets the animated WebP instead of the WebM', async ({ page }) => {
      await openApp(page);
      const still = page.locator('img.intro-lumi[data-lumi]');
      expect(await lumiState(page)).toBe('wave');
      await expect(still).toHaveAttribute('src', 'assets/lumi/wave.webp');
      await expect(still).toBeVisible();
      await expect(page.locator('video[data-lumi-video]')).toHaveCount(0);
    });
  });
}

test.describe('phone width', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a hidden Lumi loads no clip', async ({ page }) => {
    const clipRequests = [];
    page.on('request', (r) => { if (/assets\/lumi\/wave\.(webm|webp)/.test(r.url())) clipRequests.push(r.url()); });
    await openApp(page);
    const still = page.locator('img.intro-lumi[data-lumi]');
    expect(await lumiState(page)).toBe('wave');
    await expect(still).toBeHidden();
    // Give a clip that was wrongly started time to request its file.
    await page.waitForTimeout(500);
    await expect(page.locator('video[data-lumi-video]')).toHaveCount(0);
    expect(await still.getAttribute('src')).not.toMatch(/assets\/lumi\/wave\./);
    expect(clipRequests).toEqual([]);
  });
});

test('each approved clip file stays under 1 MB', () => {
  // 1 MB = 1024 × 1024 bytes, the same limit scripts/lumi-clip.sh checks.
  for (const file of ['wave.webm', 'wave.webp']) {
    const size = fs.statSync(path.resolve(__dirname, '..', 'assets', 'lumi', file)).size;
    expect(size, file).toBeLessThan(1024 * 1024);
  }
});

test('the download page keeps its celebrate loop after cheering', async ({ page }) => {
  await openApp(page);
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="publish"]');
  const lumi = page.locator('img.character[data-lumi]');
  await expect.poll(() => animationName(lumi)).toBe('lumiCheer');
  await expect.poll(() => animationName(lumi), { timeout: 5000 }).toBe('lumiCelebrate');
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

test('reduced motion keeps the still with the shipped clips', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const clipRequests = [];
  page.on('request', (r) => { if (/assets\/lumi\/wave\.(webm|webp)/.test(r.url())) clipRequests.push(r.url()); });
  await openApp(page);
  expect(await lumiState(page)).toBe('wave');
  await page.waitForTimeout(500);
  await expect(page.locator('video[data-lumi-video]')).toHaveCount(0);
  const still = page.locator('img.intro-lumi[data-lumi]');
  await expect(still).toBeVisible();
  expect(await still.getAttribute('src')).not.toMatch(/assets\/lumi\/wave\./);
  expect(clipRequests).toEqual([]);
});
