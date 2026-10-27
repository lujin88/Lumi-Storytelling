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
  const html = await page.evaluate(async () => presentationHTML(await exportVideoURLs()));
  expect(html).not.toContain('blob:');
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
