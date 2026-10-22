// @ts-check
const path = require('path');
const { expect } = require('@playwright/test');

const APP_URL = 'file://' + path.resolve(__dirname, '..', 'index.html');

/**
 * Open the prototype with all network blocked (AI calls go to the provider or a
 * local relay; tests must never reach either) and collect uncaught page errors.
 * `storage` is written to localStorage before the page script runs.
 */
async function openApp(page, { storage = {} } = {}) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.context().route(/^https?:/, (route) => route.abort());
  if (Object.keys(storage).length) {
    await page.addInitScript((entries) => {
      if (sessionStorage.getItem('__seeded')) return;
      for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
      sessionStorage.setItem('__seeded', '1');
    }, storage);
  }
  await page.goto(APP_URL);
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

module.exports = { APP_URL, openApp, fillStepOne, storyScore };
