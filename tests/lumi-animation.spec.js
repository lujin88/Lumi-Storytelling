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

test('the download page plays the cheer clip once, holds frame 0 for 4 s, then plays it again', async ({ page }) => {
  // design-system/motion.md, "Download-page cheer rhythm": WebM plays once, holds on frame 0 for
  // motion-delay-cheer-replay (4000ms), then replays. Two full cycles at 4x speed.
  test.setTimeout(60_000);
  const errors = await openApp(page);
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="publish"]');
  const video = page.locator('video[data-lumi-video]');
  await expect(video).toHaveAttribute('src', 'assets/lumi/cheer.webm');
  await expect(video).toBeVisible();
  expect(await video.evaluate((v) => v.loop)).toBe(false);
  const holds = await video.evaluate(async (v) => {
    if (v.readyState < 1) await new Promise((res) => v.addEventListener('loadedmetadata', res, { once: true }));
    v.playbackRate = 4;
    const out = [];
    for (let i = 0; i < 2; i++) {
      await new Promise((res) => v.addEventListener('ended', res, { once: true }));
      await new Promise((res) => v.addEventListener('seeked', res, { once: true }));
      const from = performance.now(), at = { t: v.currentTime, paused: v.paused, shown: v.getClientRects().length > 0 };
      await new Promise((res) => v.addEventListener('play', res, { once: true }));
      out.push({ ...at, ms: performance.now() - from });
    }
    return out;
  });
  for (const h of holds) {
    expect(h).toMatchObject({ t: 0, paused: true, shown: true });
    expect(h.ms).toBeGreaterThanOrEqual(3990);
    expect(h.ms).toBeLessThan(4400);
  }
  expect(await page.evaluate(() => lumiAnim.state)).toBe('cheer');
  expect(errors).toEqual([]);
});

test('a hidden tab stops the cheer replay and waits a full hold after it comes back', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { if (!state.sample) loadSample(); go('publish'); });
  const video = page.locator('video[data-lumi-video][src="assets/lumi/cheer.webm"]');
  await expect(video).toBeVisible();
  await expect.poll(() => video.evaluate((v) => v.currentTime)).toBeGreaterThan(0);
  const setHidden = (hidden) => page.evaluate((h) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
  await setHidden(true);
  await expect.poll(() => video.evaluate((v) => [v.paused, v.currentTime])).toEqual([true, 0]);
  // Hidden for longer than the hold: still no replay.
  await page.waitForTimeout(4500);
  expect(await video.evaluate((v) => v.paused)).toBe(true);
  const back = await page.evaluate(() => performance.now());
  await setHidden(false);
  const played = await video.evaluate((v) => new Promise((res) => v.addEventListener('play', () => res(performance.now()), { once: true })));
  expect(played - back).toBeGreaterThanOrEqual(3990);
});

test('the cheer hold reads its token; coming back to the page waits a full hold first', async ({ page }) => {
  await openApp(page);
  // A shorter token proves the hold is read from --motion-delay-cheer-replay, not a fixed 4 s.
  await page.evaluate(() => document.documentElement.style.setProperty('--motion-delay-cheer-replay', '1000ms'));
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="publish"]');
  const video = page.locator('video[data-lumi-video][src="assets/lumi/cheer.webm"]');
  await expect(video).toBeVisible();
  const ms = await video.evaluate(async (v) => {
    if (v.readyState < 1) await new Promise((res) => v.addEventListener('loadedmetadata', res, { once: true }));
    v.playbackRate = 4;
    await new Promise((res) => v.addEventListener('ended', res, { once: true }));
    const from = performance.now();
    await new Promise((res) => v.addEventListener('play', res, { once: true }));
    return performance.now() - from;
  });
  expect(ms).toBeGreaterThanOrEqual(990);
  expect(ms).toBeLessThan(2500);
  // Leave mid-play: the clip goes with the page and its old hold timer starts nothing.
  await page.click('#sidebar [data-page="settings"]');
  await expect(video).toHaveCount(0);
  await page.waitForTimeout(1500);
  // Coming back after the first visit: frame 0 for one full hold, then it plays (motion.md).
  // Catch the new clip's first play from the moment it is added.
  const back = await page.evaluate(() => {
    window.__cheerPlay = null;
    new MutationObserver((_, mo) => {
      const v = document.querySelector('video[data-lumi-video][src="assets/lumi/cheer.webm"]');
      if (!v) return;
      mo.disconnect();
      v.addEventListener('play', () => { window.__cheerPlay = [performance.now(), v.currentTime]; }, { once: true });
    }).observe(document.body, { subtree: true, childList: true });
    return performance.now();
  });
  await page.click('#sidebar [data-page="publish"]');
  await expect(video).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__cheerPlay), { timeout: 5000 }).not.toBeNull();
  const [at, t] = await page.evaluate(() => window.__cheerPlay);
  expect(at - back).toBeGreaterThanOrEqual(990);
  expect(at - back).toBeLessThan(2500);
  // 'play' is dispatched after playback starts, so allow a few frames past 0.
  expect(t).toBeLessThan(0.05);
  await expect(video).toHaveCount(1);
});

test('the cheer clip pauses on frame 0 out of view and waits a full hold when it scrolls back', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApp(page);
  await page.evaluate(() => document.documentElement.style.setProperty('--motion-delay-cheer-replay', '1000ms'));
  await page.evaluate(() => { if (!state.sample) loadSample(); go('publish'); });
  const video = page.locator('video[data-lumi-video][src="assets/lumi/cheer.webm"]');
  await expect(video).toBeVisible();
  await expect.poll(() => video.evaluate((v) => !v.paused && v.currentTime > 0)).toBe(true);
  // Move the clip out of view (a transform, so the test does not depend on how long the page is).
  await video.evaluate((v) => { v.style.transform = 'translateY(-200vh)'; });
  await expect.poll(() => video.evaluate((v) => [v.paused, v.currentTime])).toEqual([true, 0]);
  await page.waitForTimeout(1500);
  expect(await video.evaluate((v) => v.paused)).toBe(true);
  const back = await page.evaluate(() => performance.now());
  await video.evaluate((v) => { v.style.transform = ''; });
  const played = await video.evaluate((v) => new Promise((res) => v.addEventListener('play', () => res(performance.now()), { once: true })));
  expect(played - back).toBeGreaterThanOrEqual(990);
});

test('reduced motion switched on during the cheer hold shows the still and never replays', async ({ page }) => {
  // motion.md, cheer-reduced: no timer or replay, and react live when the media query changes.
  test.setTimeout(60_000);
  await openApp(page);
  await page.evaluate(() => { if (!state.sample) loadSample(); go('publish'); });
  const video = page.locator('video[data-lumi-video][src="assets/lumi/cheer.webm"]');
  const still = page.locator('img[data-lumi="clip"]').first();
  await expect(video).toBeVisible();
  // Wait for the first play to end and the hold on frame 0 to begin.
  await video.evaluate(async (v) => {
    if (v.readyState < 1) await new Promise((res) => v.addEventListener('loadedmetadata', res, { once: true }));
    v.playbackRate = 4;
    await new Promise((res) => v.addEventListener('ended', res, { once: true }));
    await new Promise((res) => v.addEventListener('seeked', res, { once: true }));
  });
  await video.evaluate((v) => { window.__cheerPlays = 0; v.addEventListener('play', () => window.__cheerPlays++); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(video).toBeHidden();
  await expect(still).toBeVisible();
  await expect(still).not.toHaveAttribute('src', /assets\/lumi\/cheer\./);
  // Longer than the 4 s hold: the timer that was running when reduce came on starts nothing.
  await page.waitForTimeout(4500);
  expect(await video.evaluate((v) => v.paused)).toBe(true);
  expect(await page.evaluate(() => window.__cheerPlays)).toBe(0);
  await expect(video).toBeHidden();
  await expect(still).toBeVisible();
  // Reduce off again: the clip comes back on frame 0 and waits one full hold before it plays.
  await page.evaluate(() => document.documentElement.style.setProperty('--motion-delay-cheer-replay', '1000ms'));
  const back = await page.evaluate(() => performance.now());
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(video).toBeVisible();
  const played = await video.evaluate((v) => new Promise((res) => v.addEventListener('play', () => res(performance.now()), { once: true })));
  expect(played - back).toBeGreaterThanOrEqual(990);
  expect(await page.evaluate(() => window.__cheerPlays)).toBe(1);
});

test('reduced motion switched on while the cheer plays stops it at once', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { if (!state.sample) loadSample(); go('publish'); });
  const video = page.locator('video[data-lumi-video][src="assets/lumi/cheer.webm"]');
  await expect.poll(() => video.evaluate((v) => !v.paused && v.currentTime > 0)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(video).toBeHidden();
  expect(await video.evaluate((v) => v.paused)).toBe(true);
  await expect(page.locator('img[data-lumi="clip"]').first()).toBeVisible();
});

test('the cheer hold token is read in ms or s', async ({ page }) => {
  await openApp(page);
  const ms = (value) => page.evaluate((v) => {
    document.documentElement.style.setProperty('--motion-delay-cheer-replay', v);
    return lumiAnim.holdMs('assets/lumi/cheer.webm');
  }, value);
  expect(await ms('4000ms')).toBe(4000);
  expect(await ms('4s')).toBe(4000);
  expect(await ms('1.5s')).toBe(1500);
  expect(await page.evaluate(() => lumiAnim.holdMs('assets/lumi/wave.webm'))).toBe(0);
});

test('leaving the download page clears the cheer hold timer', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { if (!state.sample) loadSample(); go('publish'); });
  const video = page.locator('video[data-lumi-video][src="assets/lumi/cheer.webm"]');
  await expect(video).toBeVisible();
  await video.evaluate(async (v) => {
    if (v.readyState < 1) await new Promise((res) => v.addEventListener('loadedmetadata', res, { once: true }));
    v.playbackRate = 4;
    await new Promise((res) => v.addEventListener('ended', res, { once: true }));
    await new Promise((res) => v.addEventListener('seeked', res, { once: true }));
  });
  // In the hold: a timer is pending. Record which timers get cleared while leaving.
  const timer = await page.evaluate(() => {
    window.__cleared = [];
    const clear = window.clearTimeout;
    window.clearTimeout = (id) => { window.__cleared.push(id); return clear(id); };
    return lumiAnim.holdTimer;
  });
  expect(timer).toBeTruthy();
  await page.click('#sidebar [data-page="settings"]');
  await expect(video).toHaveCount(0);
  expect(await page.evaluate(() => window.__cleared)).toContain(timer);
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

/**
 * Hold back every "frame drawn" callback, as on a slow network where the new clip has no frame yet.
 * `window.__held.splice(0).forEach(...)` releases them; `window.__rvfc` is the browser's own method.
 */
const holdFrames = (page) => page.evaluate(() => {
  window.__held = [];
  window.__rvfc = HTMLVideoElement.prototype.requestVideoFrameCallback;
  HTMLVideoElement.prototype.requestVideoFrameCallback = function (cb) { window.__held.push(cb); return window.__held.length; };
});
/** Visibility, pin and size of the step 1 wave and think clips. */
const clipInfo = (page) => page.evaluate(() => {
  const one = (src) => {
    const v = document.querySelector(`video[data-lumi-video][src="assets/lumi/${src}.webm"]`), b = v.getBoundingClientRect();
    return { shown: v.getClientRects().length > 0, opacity: v.style.opacity, paused: v.paused, pinned: v.style.position === 'absolute', w: Math.round(b.width), h: Math.round(b.height), sw: v.style.width, sh: v.style.height };
  };
  return { wave: one('wave'), think: one('think'), art: Math.round(document.querySelector('.intro-art').getBoundingClientRect().height) };
});

test('a new clip with no frame after 1.5 s leaves the old clip on screen; it switches once the frame comes', async ({ page }) => {
  await openApp(page);
  await expect(page.locator(WAVE)).toBeVisible();
  const before = await clipInfo(page);
  await holdFrames(page);
  // Typing for 1.5 s: each keystroke asks for the think clip again, which must not force the switch through.
  await page.evaluate(() => { lumiAnim.think(); });
  for (let i = 0; i < 5; i++) { await page.waitForTimeout(300); await page.evaluate(() => lumiAnim.think()); }
  const during = await clipInfo(page);
  expect(during.wave).toMatchObject({ shown: true, paused: false, pinned: true });
  expect(during.think).toMatchObject({ shown: true, opacity: '0.01' });
  // The frame arrives: the think clip shows and takes back its own size; the wave is hidden and unpinned.
  await page.evaluate(() => window.__held.splice(0).forEach((cb) => cb(performance.now(), {})));
  const after = await clipInfo(page);
  expect(after.wave).toMatchObject({ shown: false, pinned: false });
  expect(after.think).toMatchObject({ shown: true, opacity: '', sw: before.think.sw, sh: before.think.sh });
});

test('going back to the old clip while the new one has no frame cancels the switch', async ({ page }) => {
  await openApp(page);
  const wave = page.locator(WAVE);
  await expect(wave).toBeVisible();
  const before = await page.evaluate(() => {
    const v = document.querySelector('video[src="assets/lumi/wave.webm"]');
    window.__wave = v;
    return { css: v.style.cssText, think: document.querySelector('video[src="assets/lumi/think.webm"]').style.cssText };
  });
  await holdFrames(page);
  await page.evaluate(() => lumiAnim.think());
  // The think time runs out (1.2 s) before the think clip has a frame: Lumi goes back to waving.
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('wave');
  const r = await clipInfo(page);
  expect(r.wave).toMatchObject({ shown: true, paused: false, pinned: false });
  expect(r.think).toMatchObject({ shown: false, opacity: '', paused: true });
  // The same wave element, back to its own styles; the think clip has its size back too.
  expect(await page.evaluate(() => document.querySelector('video[src="assets/lumi/wave.webm"]') === window.__wave)).toBe(true);
  expect(await wave.evaluate((v) => v.style.cssText)).toBe(before.css);
  expect(await page.evaluate(() => document.querySelector('video[src="assets/lumi/think.webm"]').style.cssText)).toBe(before.think);
  // A frame that arrives late for the cancelled switch changes nothing.
  await page.evaluate(() => window.__held.splice(0).forEach((cb) => cb(performance.now(), {})));
  expect(await clipInfo(page)).toMatchObject({ wave: { shown: true }, think: { shown: false } });
});

test('after a cancelled switch, typing again shows the think clip once it has a frame', async ({ page }) => {
  await openApp(page);
  await expect(page.locator(WAVE)).toBeVisible();
  await holdFrames(page);
  await page.evaluate(() => lumiAnim.think());
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('wave');
  expect(await clipInfo(page)).toMatchObject({ wave: { shown: true }, think: { shown: false } });
  // The think clip has loaded by now; the next keystroke switches as usual.
  await page.evaluate(() => { HTMLVideoElement.prototype.requestVideoFrameCallback = window.__rvfc; });
  await page.locator('#guideText').pressSequentially('我');
  await expect.poll(async () => (await clipInfo(page)).think).toMatchObject({ shown: true, opacity: '' });
  expect((await clipInfo(page)).wave.shown).toBe(false);
});

test('while the preloaded think clip has no metadata yet, Lumi keeps her box size', async ({ page }) => {
  // The think file never arrives, so the clip step 1 preloads stays at readyState 0, with no size of its own.
  await page.route(/assets\/lumi\/think\.webm/, () => {});
  await openApp(page);
  await expect(page.locator(WAVE)).toBeVisible();
  await expect.poll(() => page.locator(WAVE).evaluate((v) => v.readyState)).toBeGreaterThanOrEqual(1);
  const box = () => page.evaluate(() => {
    const w = document.querySelector('video[src="assets/lumi/wave.webm"]'), t = document.querySelector('video[src="assets/lumi/think.webm"]'), h = (x) => Math.round(x.getBoundingClientRect().height);
    return { wave: h(w), think: t.getClientRects().length ? h(t) : null, thinkState: t.readyState, thinkCss: t.style.cssText, art: h(document.querySelector('.intro-art')) };
  });
  const before = await box();
  expect(before).toMatchObject({ think: null, thinkState: 0 });
  await page.evaluate(() => lumiAnim.think());
  const during = await box();
  expect(during).toMatchObject({ wave: before.wave, think: before.wave, thinkState: 0, art: before.art });
  // The think time runs out with still no frame: the switch is cancelled and the think clip loses the borrowed size.
  await expect.poll(() => lumiState(page), { timeout: 5000 }).toBe('wave');
  expect(await box()).toEqual(before);
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
  for (const [w, h, stage] of [[1900, 1000, [416, 456]], [1280, 900, [360, 380]], [390, 844, [64, 56]]]) {
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

/** Sideways overflow of the whole page, in px. */
const sidewaysScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

test('without assets/lumi/ the download page still bounces in place and never scrolls sideways', async ({ page }) => {
  // Same as opening index.html without assets/lumi/ next to it; motion is on, so the CSS placeholder runs.
  await page.context().route(/assets\/lumi\//, (route) => route.abort());
  for (const w of [1900, 1512, 1280]) {
    await page.setViewportSize({ width: w, height: 1000 });
    await openApp(page);
    const failed = page.waitForEvent('requestfailed', (r) => r.url().endsWith('assets/lumi/cheer.webp'));
    await page.evaluate(() => { if (!state.sample) loadSample(); go('publish'); });
    await failed;
    const still = page.locator('.dl-stage img[data-lumi]');
    await expect(still).toBeVisible();
    await expect.poll(() => animationName(still), { message: `${w}` }).toBe('lumiCheer');
    // lumiCheer lifts by 10px and scales from the bottom centre: while it runs (4 x 0.6 s) the centre stays put
    // and the bottom moves at most 10px up. Centring with transform let the animation throw Lumi off the stage.
    const anchor = () => still.evaluate((el) => {
      const st = el.parentElement.getBoundingClientRect(), b = el.getBoundingClientRect();
      return [b.x + b.width / 2 - st.x, b.bottom - st.y];
    });
    const samples = [];
    for (let i = 0; i < 8; i++) {
      samples.push({ at: await anchor(), overflow: await sidewaysScroll(page) });
      await page.waitForTimeout(170);
    }
    await expect.poll(() => animationName(still), { timeout: 4000 }).toBe('lumiCheer');
    await page.waitForTimeout(2600);
    const rest = await anchor();
    for (const { at, overflow } of samples) {
      expect(at[0], `${w} centre`).toBeCloseTo(rest[0], 0);
      expect(at[1], `${w} bottom`).toBeGreaterThanOrEqual(rest[1] - 10.5);
      expect(at[1], `${w} bottom`).toBeLessThanOrEqual(rest[1] + 0.5);
      expect(overflow, `${w} sideways scroll`).toBe(0);
    }
  }
});

test('the cheer clip on the download page stays inside the viewport and the page does not scroll sideways', async ({ page }) => {
  // Five widths, each reading one whole play at half speed (8 s) from frame 0.
  test.setTimeout(120_000);
  // Served over http so the clip frames can be read back from a canvas.
  // 1500-1599 has the big stage with a 40px gutter, 1600 and up a 64px one.
  for (const w of [1500, 1512, 1599, 1600, 1900]) {
    await page.setViewportSize({ width: w, height: 1000 });
    await openApp(page, { http: true });
    await page.evaluate(() => { if (!state.sample) loadSample(); go('publish'); });
    const video = page.locator('.dl-stage video[data-lumi-video]');
    await expect(video).toBeVisible();
    expect(await sidewaysScroll(page), `${w} sideways scroll`).toBe(0);
    // Rightmost opaque pixel over one whole loop, read frame by frame with requestVideoFrameCallback.
    // The star is raised furthest in a single frame (3.08 s of 4.04 s), so sampling on a timer misses it.
    // Half speed so no frame is dropped while each one is read back.
    const { right, frames } = await video.evaluate(async (v) => {
      if (v.readyState < 2) await new Promise((res) => v.addEventListener('loadeddata', res, { once: true }));
      const c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true });
      c.width = v.videoWidth; c.height = v.videoHeight;
      // Restart from frame 0 and read until the play ends (the clip plays once, then holds).
      v.pause();
      if (v.currentTime !== 0) { v.currentTime = 0; await new Promise((res) => v.addEventListener('seeked', res, { once: true })); }
      v.playbackRate = 0.5;
      let max = -1, frames = 0, ended = false;
      const read = () => {
        x.clearRect(0, 0, c.width, c.height); x.drawImage(v, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height).data;
        for (let i = 3; i < d.length; i += 4) if (d[i] > 128) max = Math.max(max, ((i - 3) / 4) % c.width);
        frames++;
        if (!ended) v.requestVideoFrameCallback(read);
      };
      v.requestVideoFrameCallback(read);
      await Promise.all([v.play(), new Promise((res) => v.addEventListener('ended', res, { once: true }))]);
      ended = true;
      // object-fit: contain, and the box has the clip's aspect ratio.
      const b = v.getBoundingClientRect();
      return { right: b.x + (max + 1) * (b.width / c.width), frames };
    });
    // cheer.webm has 97 frames at 24 fps.
    expect(frames, `${w} frames read in one play`).toBeGreaterThanOrEqual(95);
    expect(right, `${w} Lumi's right edge`).toBeLessThanOrEqual(w - 4);
  }
});

test('the download preview title shows whole lines and stays inside the slide at every width', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { if (!state.sample) loadSample(); go('publish'); });
  for (const w of [390, 1000, 1280, 1499, 1500, 1512, 1600, 1699, 1700, 1900]) {
    await page.setViewportSize({ width: w, height: 900 });
    const [lines, bottomGap] = await page.locator('.dl-slide h3').evaluate((h) => {
      const s = h.parentElement.getBoundingClientRect(), b = h.getBoundingClientRect();
      return [b.height / parseFloat(getComputedStyle(h).lineHeight), s.bottom - parseFloat(getComputedStyle(h.parentElement).paddingBottom) - b.bottom];
    });
    // A squeezed title showed half of its second line at 1512.
    expect(Math.abs(lines - Math.round(lines)), `${w} whole lines (${lines})`).toBeLessThan(0.05);
    expect(bottomGap, `${w} inside the slide`).toBeGreaterThanOrEqual(0);
  }
});

test('the download page Lumi takes the same box whether the clip plays or the still falls back', async ({ browser }) => {
  const box = async (w, h, blocked) => {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    if (blocked) await page.context().route(/assets\/lumi\//, (route) => route.abort());
    await openApp(page);
    await page.evaluate(() => go('publish'));
    const media = page.locator(blocked ? '.dl-stage img[data-lumi="clip"]' : '.dl-stage video[data-lumi-video][src="assets/lumi/cheer.webm"]');
    await expect(media).toBeVisible();
    if (blocked) await expect.poll(() => media.evaluate((el) => el.getAttribute('src').startsWith('data:'))).toBe(true);
    // Layout box, not the bounding rect: the fallback still runs the lumiCheer transform.
    const size = await media.evaluate((el) => [el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight, el.parentElement.offsetWidth, el.parentElement.offsetHeight]);
    await page.close();
    return size;
  };
  for (const [w, h] of [[1900, 1000], [1280, 900], [390, 844]]) {
    expect(await box(w, h, true), `${w}`).toEqual(await box(w, h, false));
  }
});
