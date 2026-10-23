// @ts-check
const path = require('path');
const { expect } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const APP_URL = 'file://' + path.join(ROOT, 'index.html');
// Same page served over http, so tests can cover behavior that differs by origin.
const HTTP_ORIGIN = 'http://lumi.test';
const HTTP_APP_URL = HTTP_ORIGIN + '/index.html';

/**
 * Open the prototype with all network blocked (AI calls go to the provider or a
 * local relay; tests must never reach either) and collect uncaught page errors.
 * `storage` is written to localStorage before the page script runs.
 */
async function openApp(page, { storage = {}, http = false } = {}) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.context().route(/^https?:/, (route) => route.abort());
  if (http) {
    // Page routes win over the context-wide abort above.
    await page.route(HTTP_ORIGIN + '/**', (route) => {
      const rel = decodeURIComponent(new URL(route.request().url()).pathname);
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT + path.sep)) return route.abort();
      return route.fulfill({ path: file }).catch(() => route.abort());
    });
  }
  if (Object.keys(storage).length) {
    await page.addInitScript((entries) => {
      if (sessionStorage.getItem('__seeded')) return;
      for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
      sessionStorage.setItem('__seeded', '1');
    }, storage);
  }
  await page.goto(http ? HTTP_APP_URL : APP_URL);
  await expect(page.locator('#content h1')).toBeVisible();
  return errors;
}

/** Step 1: put notes in through the composer and pick a purpose. */
async function fillStepOne(page, notes) {
  await page.fill('#guideText', notes);
  await page.press('#guideText', 'Enter');
  await page.click('[data-action="purpose:interview"]');
}

/** Current story score as a number, read from the score card ("7/10"). */
async function storyScore(page) {
  const text = await page.locator('.sc-head').innerText();
  const m = text.match(/(\d+)\s*\/\s*10/);
  if (!m) throw new Error('score not found in: ' + text);
  return Number(m[1]);
}

module.exports = { APP_URL, HTTP_APP_URL, openApp, fillStepOne, storyScore };
