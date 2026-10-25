// @ts-check
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { openApp, fillStepOne } = require('./helpers');

const NOTES = '我重新设计了团队的研究流程。产品经理反对，我放弃了自动生成，结果交付时间从两周降到三天。';

/** Animation state shown on the first Lumi image on screen. */
const lumiState = (page) => page.locator('img[data-lumi]').first().getAttribute('data-lumi-state');

/** The wave clip; step 1 also keeps the think clip loaded (hidden) so typing shows it at once. */
const WAVE = 'video[data-lumi-video][src="assets/lumi/wave.webm"]';

const animationName = (locator) => locator.evaluate((el) => getComputedStyle(el).animationName);

test('Lumi keeps waving on step 1 with a looping transparent WebM', async ({ page }) => {
  const errors = await openApp(page);
  const still = page.locator('img.intro-lumi[data-lumi]');
  const video = page.locator(WAVE);
  expect(await lumiState(page)).toBe('wave');
  // The clip replaces the CSS placeholder: the <video> takes the still's place, the <img> is hidden.
  await expect(video).toHaveAttribute('src', 'assets/lumi/wave.webm');
  await expect(video).toBeVisible();
  await expect(still).toBeHidden();
  await expect.poll(() => video.evaluate((v) => v.readyState)).toBeGreaterThan(0);
  expect(await video.evaluate((v) => v.duration)).toBeCloseTo(4, 0);
  expect(await video.evaluate((v) => v.loop)).toBe(true);
  // Past the 4 s clip it is still waving and still playing, not frozen on the last frame.
  await page.waitForTimeout(5000);
  expect(await lumiState(page)).toBe('wave');
  await expect(video).toBeVisible();
  expect(await video.evaluate((v) => v.ended)).toBe(false);
  expect(errors).toEqual([]);
});

test('leaving step 1 stops the wave; coming back starts it again', async ({ page }) => {
  await openApp(page);
  await expect(page.locator(WAVE)).toBeVisible();
  await page.click('#sidebar [data-page="settings"]');
  expect(await page.evaluate(() => lumiAnim.state)).toBe('idle');
  await expect(page.locator('video[data-lumi-video]')).toHaveCount(0);
  await page.click('#sidebar [data-page="dump"]');
  expect(await lumiState(page)).toBe('wave');
  await expect(page.locator(WAVE)).toBeVisible();
});

test('a wave clip made after the loop began joins it at the right place', async ({ page }) => {
  await openApp(page);
  // Pretend the wave started 9.5 s ago and its <video> is gone, so the next apply() makes a new one.
  await page.evaluate(() => { document.querySelectorAll('video[data-lumi-video]').forEach((v) => v.remove()); document.querySelector('img.intro-lumi').style.display = ''; lumiAnim.starts.wave = performance.now() - 9500; lumiAnim.apply(); });
  const video = page.locator(WAVE);
  await expect.poll(() => video.evaluate((v) => v.readyState)).toBeGreaterThan(0);
  const t = await video.evaluate((v) => v.currentTime);
  expect(t).toBeGreaterThan(1);
  expect(t).toBeLessThan(2.5);
});

test('a WebM that fails to load falls back to the animated WebP', async ({ page }) => {
  await openApp(page);
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

const LUMI_FILES = ['wave.webm', 'wave.webp', 'cheer.webm', 'cheer.webp'];

test('each approved clip file stays under 1 MB', () => {
  // 1 MB = 1024 × 1024 bytes, the same limit scripts/lumi-clip.sh checks.
  for (const file of LUMI_FILES) {
    const size = fs.statSync(path.resolve(__dirname, '..', 'assets', 'lumi', file)).size;
    expect(size, file).toBeLessThan(1024 * 1024);
  }
});

test('the looping WebP fallbacks repeat forever', () => {
  // WebP container: the ANIM chunk holds a 4-byte background colour, then a 2-byte loop count (0 = forever).
  for (const file of ['wave.webp', 'cheer.webp']) {
    const buf = fs.readFileSync(path.resolve(__dirname, '..', 'assets', 'lumi', file));
    const anim = buf.indexOf('ANIM');
    expect(anim, file).toBeGreaterThan(0);
    expect(buf.readUInt16LE(anim + 8 + 4), file).toBe(0);
  }
});

test('the download page loops the cheer clip and keeps it', async ({ page }) => {
  const errors = await openApp(page);
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="publish"]');
  const video = page.locator('video[data-lumi-video]');
  await expect(video).toHaveAttribute('src', 'assets/lumi/cheer.webm');
  await expect(video).toBeVisible();
  expect(await video.evaluate((v) => v.loop)).toBe(true);
  await page.waitForTimeout(5000);
  expect(await page.evaluate(() => lumiAnim.state)).toBe('cheer');
  await expect(video).toBeVisible();
  expect(await video.evaluate((v) => v.ended)).toBe(false);
  expect(errors).toEqual([]);
});

test('Lumi thinks while the user types, then goes back to waving on step 1', async ({ page }) => {
  await openApp(page);
  expect(await lumiState(page)).toBe('wave');
  await page.locator('#guideText').pressSequentially('我重新设计了');
  expect(await lumiState(page)).toBe('think');
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('wave');
});

/** Reads a <video> handle: still in the page, shown, and where it is in the clip. */
const videoInfo = (handle) => handle.evaluate((v) => ({
  connected: v.isConnected, shown: v.getClientRects().length > 0, paused: v.paused, t: v.currentTime, src: v.getAttribute('src'),
}));

/** Where a clip is and what the page clock says, read in the same moment. */
const clock = (handle) => handle.evaluate((v) => ({ t: v.currentTime, now: performance.now() / 1000, d: v.duration }));

/** How far the clip got between two clock readings, counting a pass through the loop's end. */
const played = (a, b) => (b.t - a.t + a.d) % a.d;

test('without a think clip, typing keeps the same wave playing', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { LUMI_CLIPS.think = null; });
  const video = page.locator(WAVE);
  await expect.poll(() => video.evaluate((v) => v.currentTime)).toBeGreaterThan(1);
  const wave = await video.elementHandle();
  const before = await clock(wave);
  await page.locator('#guideText').pressSequentially('我重新设计了');
  expect(await lumiState(page)).toBe('think');
  // While typing: the wave is the only Lumi on screen, still playing, the still stays hidden.
  expect(await videoInfo(wave)).toMatchObject({ connected: true, shown: true, paused: false, src: 'assets/lumi/wave.webm' });
  await expect(page.locator('img.intro-lumi[data-lumi]')).toBeHidden();
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('wave');
  // After typing: the same element, and it played on with the clock the whole time.
  const after = await clock(wave);
  expect(await videoInfo(wave)).toMatchObject({ connected: true, shown: true, paused: false });
  await expect(page.locator('video[data-lumi-video]')).toHaveCount(1);
  expect(after.now - before.now).toBeLessThan(before.d - 0.5);
  expect(Math.abs(played(before, after) - (after.now - before.now))).toBeLessThan(0.3);
});

test('typing shows the think clip; the wave comes back where it stopped', async ({ page }) => {
  await openApp(page);
  const videos = page.locator('video[data-lumi-video]');
  const wave = await page.locator(WAVE).elementHandle();
  await expect.poll(() => wave.evaluate((v) => v.currentTime)).toBeGreaterThan(1);
  const before = await clock(wave);
  await page.locator('#guideText').pressSequentially('我重新设计了');
  const think = page.locator('video[data-lumi-video][src="assets/lumi/think.webm"]');
  await expect(think).toBeVisible();
  // The wave is hidden (once the think clip has a frame on screen), not removed; the think clip plays from its start.
  await expect.poll(() => videoInfo(wave)).toMatchObject({ connected: true, shown: false });
  await expect.poll(() => think.evaluate((v) => v.currentTime)).toBeGreaterThan(0.2);
  expect(await think.evaluate((v) => v.loop)).toBe(true);
  const thinkEl = await think.elementHandle();
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('wave');
  const after = await clock(wave);
  expect(await videoInfo(wave)).toMatchObject({ connected: true, shown: true, paused: false });
  await expect(think).toBeHidden();
  await expect(videos).toHaveCount(2);
  // The wave went on from where it was: it moved forward, by no more than the time that
  // passed. Restarting from frame 0 would read as nearly a whole loop ahead.
  const wall = after.now - before.now;
  expect(wall).toBeLessThan(before.d - 1);
  expect(played(before, after)).toBeLessThan(wall + 0.25);
  // Typing again reuses the same think clip and starts it over from its first frame.
  await page.locator('#guideText').pressSequentially('团队');
  await expect(think).toBeVisible();
  expect(await thinkEl.evaluate((v) => v.isConnected)).toBe(true);
  expect(await thinkEl.evaluate((v) => v.currentTime)).toBeLessThan(0.5);
  await expect(videos).toHaveCount(2);
});

test('after a few rounds of typing, a re-render keeps the wave on the same frame', async ({ page }) => {
  await openApp(page);
  const videos = page.locator('video[data-lumi-video]');
  await expect.poll(() => videos.first().evaluate((v) => v.currentTime)).toBeGreaterThan(0.5);
  // Each round hides the wave behind the think clip; Chrome pauses it while it is hidden,
  // so the wall-clock start time would drift by the length of every round.
  for (const word of ['我重新', '设计了', '团队的']) {
    await page.locator('#guideText').pressSequentially(word);
    await expect.poll(() => lumiState(page)).toBe('think');
    await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('wave');
    await page.waitForTimeout(300);
  }
  // Rebuild the page as render() does after any edit (e.g. sending the brief). The same
  // <video> goes back into the new page, still playing: a new one would show nothing until
  // its first frame loads, which is the flash Lu saw.
  const result = await page.evaluate(async () => {
    const shown = () => [...document.querySelectorAll('video[data-lumi-video]')].find((v) => v.getClientRects().length && v.getAttribute('src') === 'assets/lumi/wave.webm');
    const old = shown(), t0 = old.currentTime, d = old.duration, n0 = performance.now();
    render();
    const v = shown();
    await new Promise((ok) => setTimeout(ok, 300));
    const want = (t0 + (performance.now() - n0) / 1000) % d, diff = Math.abs(v.currentTime - want);
    return { same: v === old, paused: v.paused, inPage: !!v.closest('#content .page'), gap: Math.min(diff, d - diff) };
  });
  expect(result).toMatchObject({ same: true, paused: false, inPage: true });
  expect(result.gap).toBeLessThan(0.3);
});

test('a re-render on the same page keeps Lumi and does not fade the page in again', async ({ page }) => {
  await openApp(page);
  await expect(page.locator(WAVE)).toBeVisible();
  const before = await page.evaluate(() => {
    const img = document.querySelector('img.intro-lumi'), vs = [...document.querySelectorAll('video[data-lumi-video]')];
    window.__lumiNodes = [img, ...vs];
    return vs.length;
  });
  // Sending the brief rebuilds the page with render().
  await page.fill('#guideText', '我重新设计了团队的研究流程。');
  await page.press('#guideText', 'Enter');
  const after = await page.evaluate(() => ({
    same: window.__lumiNodes.every((n) => n.isConnected && n.closest('#content .page')),
    img: document.querySelector('img.intro-lumi') === window.__lumiNodes[0],
    count: document.querySelectorAll('video[data-lumi-video]').length,
    pageAnimation: getComputedStyle(document.querySelector('#content .page')).animationName,
  }));
  expect(after).toEqual({ same: true, img: true, count: before, pageAnimation: 'none' });
  // Changing page still fades the new page in.
  await page.click('#sidebar [data-page="settings"]');
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('#content .page')).animationName)).toBe('arrive');
  await page.click('#sidebar [data-page="dump"]');
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('#content .page')).animationName)).toBe('arrive');
});

test('step 1 loads the think clip before the first keystroke', async ({ page }) => {
  await openApp(page);
  const think = page.locator('video[data-lumi-video][src="assets/lumi/think.webm"]');
  await expect(think).toHaveCount(1);
  await expect(think).toBeHidden();
  await expect.poll(() => think.evaluate((v) => v.readyState)).toBeGreaterThanOrEqual(2);
  expect(await think.evaluate((v) => v.paused)).toBe(true);
});

test('a clip switch keeps the old clip in place until the new one has a frame', async ({ page }) => {
  await openApp(page);
  await expect(page.locator(WAVE)).toBeVisible();
  // Hold back the "frame drawn" callbacks so the switch stays half-way until we release it.
  const r = await page.evaluate(async () => {
    const held = [];
    HTMLVideoElement.prototype.requestVideoFrameCallback = function (cb) { held.push(cb); return held.length; };
    const box = (v) => { const b = v.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(Math.round).join(','); };
    const wave = document.querySelector('video[src="assets/lumi/wave.webm"]'), think = document.querySelector('video[src="assets/lumi/think.webm"]');
    const before = box(wave), css = wave.style.cssText;
    lumiAnim.think();
    lumiAnim.think(); // the next keystroke must not force the switch through
    const during = { wave: wave.getClientRects().length > 0, waveBox: box(wave), thinkBox: box(think), thinkOpacity: think.style.opacity };
    // Release the held callbacks once the think clip has finished seeking to its first frame.
    await new Promise((ok) => (think.seeking ? think.addEventListener('seeked', ok, { once: true }) : ok()));
    held.splice(0).forEach((cb) => cb(performance.now(), {}));
    const after = { wave: wave.getClientRects().length > 0, think: think.getClientRects().length > 0, thinkOpacity: think.style.opacity, css: wave.style.cssText.replace(/display: none;?\s*/, '') };
    return { before, css: css.replace(/display: block;?\s*/, ''), during, after };
  });
  expect(r.during).toEqual({ wave: true, waveBox: r.before, thinkBox: r.before, thinkOpacity: '0.01' });
  expect(r.after).toMatchObject({ wave: false, think: true, thinkOpacity: '' });
  // The pin (position, size, offsets) is gone again once the wave is hidden.
  expect(r.after.css).toBe(r.css);
});

test('a think clip that fails to preload leaves the wave WebM alone', async ({ page }) => {
  await openApp(page);
  await expect(page.locator(WAVE)).toBeVisible();
  await page.evaluate(() => {
    document.querySelector('video[src="assets/lumi/think.webm"]').remove();
    LUMI_CLIPS.think = { webm: 'assets/lumi/missing.webm', webp: 'assets/lumi/think.webp' };
    lumiAnim.apply();
  });
  await expect(page.locator('video[src="assets/lumi/missing.webm"]')).toHaveCount(0);
  await expect(page.locator(WAVE)).toBeVisible();
  expect(await page.locator('img.intro-lumi').getAttribute('data-lumi-webm')).toBeNull();
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
  await page.click('#sidebar [data-page="publish"]');
  await expect.poll(() => page.evaluate(() => lumiAnim.state)).toBe('cheer');
  // It stays until the user leaves the page.
  await page.click('#sidebar [data-page="settings"]');
  expect(await page.evaluate(() => lumiAnim.state)).toBe('idle');
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
  // Back to idle (no clip), the original still comes back.
  await page.evaluate(() => lumiAnim.set('idle'));
  await expect(clipImgs.first()).not.toHaveAttribute('src', clipSrc);
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

test('reduced motion keeps the still on the download page and loads no cheer clip', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const clipRequests = [];
  page.on('request', (r) => { if (/assets\/lumi\/cheer\.(webm|webp)/.test(r.url())) clipRequests.push(r.url()); });
  await openApp(page);
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="publish"]');
  expect(await page.evaluate(() => lumiAnim.state)).toBe('cheer');
  await page.waitForTimeout(500);
  await expect(page.locator('video[data-lumi-video]')).toHaveCount(0);
  expect(clipRequests).toEqual([]);
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

/** Every Lumi <img> the user can see has loaded pixels (no alt text in its place). */
const visibleLumiWidths = (page) => page.$$eval('img[data-lumi]', (els) =>
  els.filter((el) => el.getClientRects().length).map((el) => el.naturalWidth));

test('every step shows a loaded Lumi image, not its alt text', async ({ page }) => {
  await openApp(page);
  await page.click('[data-action="loadSample"]');
  for (const step of ['dump', 'story', 'build', 'defend', 'publish']) {
    await page.click(`#sidebar [data-page="${step}"]`);
    await expect.poll(() => visibleLumiWidths(page), { message: step }).not.toContainEqual(0);
  }
});

test('a clip whose files do not load falls back to the still, on step 1 and the download page', async ({ page }) => {
  // Same as opening index.html without assets/lumi/ next to it.
  await page.context().route(/assets\/lumi\//, (route) => route.abort());
  const webpFailed = (name) => page.waitForEvent('requestfailed', (r) => r.url().endsWith(`assets/lumi/${name}.webp`));
  let failed = webpFailed('wave');
  await openApp(page);
  await failed;
  await page.click('[data-action="loadSample"]');
  for (const [step, clip] of [['dump', 'wave'], ['publish', 'cheer']]) {
    if (step === 'publish') failed = webpFailed(clip);
    await page.click(`#sidebar [data-page="${step}"]`);
    await failed;
    const lumi = page.locator('#content img[data-lumi="clip"]');
    await expect(lumi, step).toBeVisible();
    await expect.poll(() => lumi.evaluate((el) => el.naturalWidth), { message: step }).toBeGreaterThan(0);
    await expect(page.locator('video[data-lumi-video]')).toHaveCount(0);
  }
});

test('the download page shows the preview card and Lumi on a fixed stage, same box for the still and the clip', async ({ page }) => {
  let clipBox;
  for (const [w, h, stage] of [[1900, 1000, [520, 570]], [1280, 900, [360, 380]], [390, 844, [64, 56]]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const reduce of [false, true]) {
      await page.emulateMedia({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
      await openApp(page);
      // The sample stays loaded after a reload, so only load it once.
      await page.evaluate(() => { if (!state.sample) loadSample(); go('publish'); });
      if (!reduce) {
        await expect(page.locator('.dl-stage video[data-lumi-video]')).toBeVisible();
        await expect(page.locator('.dl-stage img[data-lumi]')).toBeHidden();
      }
      const title = await page.evaluate(() => getScenes()[0][state.lang]);
      await expect(page.locator('.dl-preview .dl-slide h3')).toHaveText(title);
      await expect(page.locator('.dl-preview .dl-score strong')).toContainText('/10');
      // Stage and media are measured in one go, relative to the stage: the page itself may still be sliding in.
      const [st, media] = await page.evaluate(() => {
        const st = document.querySelector('.dl-stage').getBoundingClientRect();
        const m = [...document.querySelectorAll('.dl-stage > *')].find((el) => getComputedStyle(el).display !== 'none').getBoundingClientRect();
        return [[st.width, st.height], [m.x - st.x, m.y - st.y, m.width, m.height]].map((a) => a.map(Math.round));
      });
      expect(st, `${w} stage`).toEqual(stage);
      if (reduce) expect(media, `${w} still vs clip`).toEqual(clipBox);
      else clipBox = media;
    }
  }
});
