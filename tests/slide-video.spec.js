// @ts-check
// V3 (decisions.md 2026-10-27): a video the user uploads on a slide is kept in the
// browser (IndexedDB), so a reload doesn't lose it. The clip is Lumi's own wave loop, a
// small WebM the browser can play; an upload it can't play is refused.
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

const ROOT = path.resolve(__dirname, '..');
const CLIP = { name: 'clip.webm', mimeType: 'video/webm', buffer: fs.readFileSync(path.join(ROOT, 'assets/lumi/wave.webm')) };
const BLOB_URL = /^blob:/;

async function openBuild(page) {
  const errors = await openApp(page);
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="build"]');
  await expect(page.locator('.page-build')).toBeVisible();
  return errors;
}

/** Keys in the video store, read straight from IndexedDB. */
const storedIds = (page) => page.evaluate(() => new Promise((ok, no) => {
  const r = indexedDB.open('lumi-videos-v1', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('videos');
  r.onerror = () => no(r.error);
  r.onsuccess = () => { const q = r.result.transaction('videos').objectStore('videos').getAllKeys(); q.onsuccess = () => { r.result.close(); ok(q.result); }; };
}));

async function reloadToBuild(page) {
  await page.reload();
  await page.click('#sidebar [data-page="build"]');
  await expect(page.locator('.page-build')).toBeVisible();
}

const rowVideo = (page, i) => page.locator(`#content .deck-row[data-deck="${i}"] .slide-video`);

async function uploadOn(page, i) {
  await page.click(`[data-action="deckZoom:${i}"]`);
  await page.setInputFiles(`#modal [data-deck-video="${i}"]`, CLIP);
  await expect(page.locator('#modal .slide-video')).toHaveAttribute('src', BLOB_URL);
  await expect.poll(() => storedIds(page)).toHaveLength(1);
  await page.keyboard.press('Escape');
}

test('an uploaded slide video survives a reload', async ({ page }) => {
  const errors = await openBuild(page);
  await uploadOn(page, 1);
  await expect(rowVideo(page, 1)).toHaveAttribute('src', BLOB_URL);
  const id = await page.evaluate(() => state.scenes[1].video);
  expect(await storedIds(page)).toEqual([id]);
  await reloadToBuild(page);
  await expect(rowVideo(page, 1)).toHaveAttribute('src', BLOB_URL);
  // The same bytes come back from the store, not just some URL.
  const bytes = await rowVideo(page, 1).evaluate((v) => fetch(v.src).then((r) => r.arrayBuffer()).then((b) => Array.from(new Uint8Array(b))));
  expect(Buffer.from(bytes).equals(CLIP.buffer)).toBe(true);
  await expect(rowVideo(page, 0)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('a removed video is gone after a reload and leaves nothing stored', async ({ page }) => {
  const errors = await openBuild(page);
  await uploadOn(page, 1);
  await page.click('[data-action="deckZoom:1"]');
  await page.click('#modal [data-action="deckVideoOff:1"]');
  await expect(page.locator('#modal .slide-video')).toHaveCount(0);
  await expect.poll(() => storedIds(page)).toEqual([]);
  await reloadToBuild(page);
  await expect(rowVideo(page, 1)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('on load, stored videos no slide points at are deleted', async ({ page }) => {
  const errors = await openBuild(page);
  await uploadOn(page, 1);
  // The slides are rebuilt from the answers: the old slide and its video id are gone.
  await page.evaluate(() => { state.scenes = null; getScenes(); persist(); });
  await reloadToBuild(page);
  await expect.poll(() => storedIds(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('a video on the user\'s own slides is kept while the sample is open', async ({ page }) => {
  const errors = await openApp(page);
  await page.fill('#guideText', 'A redesign of the onboarding flow for a banking app.');
  await page.press('#guideText', 'Enter');
  await page.click('#sidebar [data-page="build"]');
  await expect(page.locator('.page-build')).toBeVisible();
  await uploadOn(page, 1);
  const id = await page.evaluate(() => state.scenes[1].video);
  await page.click('#sidebar [data-page="dump"]');
  await page.evaluate(() => loadSample());
  await page.reload();
  await expect.poll(() => storedIds(page)).toEqual([id]);
  expect(errors).toEqual([]);
});

test('a file the browser can\'t play is refused and nothing is stored', async ({ page }) => {
  const errors = await openBuild(page);
  await page.click('[data-action="deckZoom:1"]');
  await page.setInputFiles('#modal [data-deck-video="1"]', { name: 'clip.mov', mimeType: 'video/quicktime', buffer: Buffer.from('not a video') });
  await expect(page.locator('#toast')).toContainText(/换成 MP4、WebM 或 MOV 再试|Use MP4, WebM or MOV instead/);
  await expect(page.locator('#modal .slide-video')).toHaveCount(0);
  expect(await page.evaluate(() => state.scenes[1].video)).toBeUndefined();
  expect(await storedIds(page)).toEqual([]);
  expect(errors).toEqual([]);
});

// Every video string in the page is the reviewed copy, word for word (placeholders are filled in at run time).
test('video copy in the page matches docs/product-specs/copy/video-prompt.json', () => {
  const copy = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/product-specs/copy/video-prompt.json'), 'utf8'));
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  for (const [key, text] of Object.entries(copy)) {
    // No defensible length limit was measured, so that row is left out (design-system/components/VideoPrompt).
    const want = key !== 'video-format.length';
    for (const lang of ['zh', 'en']) expect(html.includes(`'${text[lang]}'`), `${key} ${lang}`).toBe(want);
  }
});

test('the exported presentation carries the video itself, not a link that dies with the page', async ({ page }) => {
  const errors = await openBuild(page);
  await uploadOn(page, 1);
  const html = await page.evaluate(() => presentationExport());
  expect(html).not.toContain('blob:');
  // The size check works the final length out before reading the video; it must match what the export makes.
  const predicted = await page.evaluate(async () => {
    const shell = presentationHTML(), u = videoOf(state.scenes[1]), b = await (await fetch(u)).blob();
    return shell.length + (shell.split(u).length - 1) * (`data:${b.type};base64,`.length + 4 * Math.ceil(b.size / 3) - u.length);
  });
  expect(html.length).toBe(predicted);
  const m = html.match(/<video class="slide-video" src="data:video\/webm;base64,([^"]+)"/);
  expect(m).not.toBeNull();
  expect(Buffer.from(m[1], 'base64').equals(CLIP.buffer)).toBe(true);
  // The download button goes through the same path.
  const [download] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => exportHTML())]);
  const file = fs.readFileSync(await download.path(), 'utf8');
  expect(file).toContain('data:video/webm;base64,' + CLIP.buffer.toString('base64'));
  expect(file).not.toContain('blob:');
  expect(errors).toEqual([]);
});

// PM 2026-10-27 (#72): past the browser's string limit the export used to throw and download nothing, with no message.
// Copy: docs/product-specs/copy/export-errors.json (#73).
const TOO_LARGE = {
  zh: '下载没成功：演示文件里的视频加起来太大，浏览器处理不了。回到「页面和讲稿」，移除几个视频或换成小一点的，再下载。',
  en: 'Download failed. The videos in the presentation add up to more than the browser can handle. In Slides & script, remove some videos or use smaller ones, then download again.',
};
const FAILED = { zh: '下载没成功，再试一次。', en: 'Download failed. Try again.' };

async function openPublishWithVideo(page) {
  const errors = await openBuild(page);
  await uploadOn(page, 1);
  await page.click('#sidebar [data-page="publish"]');
  await expect(page.locator('.pkg-download')).toBeEnabled();
  const downloads = [];
  page.on('download', (d) => downloads.push(d.suggestedFilename()));
  return { errors, downloads, lang: await page.evaluate(() => state.lang) };
}

test('videos too large for one presentation: no download, the reason shows next to the button', async ({ page }) => {
  const { errors, downloads, lang } = await openPublishWithVideo(page);
  // Report every blob as 400 MiB (past the ~384 MiB measured ceiling) and count video reads.
  await page.evaluate(() => {
    window.__size = Object.getOwnPropertyDescriptor(Blob.prototype, 'size');
    Object.defineProperty(Blob.prototype, 'size', { configurable: true, get: () => 400 * 1024 * 1024 });
    window.__reads = 0;
    const read = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function (b) { window.__reads++; return read.call(this, b); };
  });
  await page.click('[data-action="downloadPackage"]');
  const err = page.locator('#content .pkg-error[role="alert"]');
  const errText = err.locator('span');
  await expect(errText).toHaveText(TOO_LARGE[lang]);
  await page.waitForTimeout(500);
  expect(downloads).toEqual([]);
  // Stopped before reading any video into memory.
  expect(await page.evaluate(() => window.__reads)).toBe(0);
  // Changing the files clears it; with real sizes the download goes through.
  await page.evaluate(() => Object.defineProperty(Blob.prototype, 'size', window.__size));
  await page.click('.pkg-item input[data-pkg="talk.md"]');
  await expect(err).toHaveCount(0);
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="downloadPackage"]')]);
  expect(download.suggestedFilename()).toBe('lumi-story.zip');
  await expect(err).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('an export that fails for another reason says so and does not blame the videos', async ({ page }) => {
  const { errors, downloads, lang } = await openPublishWithVideo(page);
  await page.evaluate(() => {
    FileReader.prototype.readAsDataURL = function () { setTimeout(() => this.onerror && this.onerror(new ProgressEvent('error'))); };
  });
  await page.click('[data-action="downloadPackage"]');
  const err = page.locator('#content .pkg-error[role="alert"]');
  const errText = err.locator('span');
  await expect(errText).toHaveText(FAILED[lang]);
  await page.waitForTimeout(500);
  expect(downloads).toEqual([]);
  // The message survives a re-render of the page.
  await page.click('#sidebar [data-page="publish"]');
  await expect(errText).toHaveText(FAILED[lang]);
  expect(errors).toEqual([]);
});
