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

// Fake keys for mocked provider calls. Tests must never see a real key.
const KEYS = {
  claude: 'FAKE-CLAUDE-KEY-FOR-TEST-ONLY',
  openai: 'FAKE-OPENAI-KEY-FOR-TEST-ONLY',
  gemini: 'FAKE-GEMINI-KEY-FOR-TEST-ONLY',
};
const CLAUDE = 'https://api.anthropic.com/v1/messages';
// The page re-checks saved keys on load (PRD 8.12); these answer that check with "valid".
const KEY_CHECKS = [
  'https://api.anthropic.com/v1/models**',
  'https://api.openai.com/v1/models**',
  'https://generativelanguage.googleapis.com/v1beta/models?**',
];

/** Open over http with the given keys saved; the load-time key check passes. */
async function openWithKeys(page, ids) {
  for (const url of KEY_CHECKS) await page.route(url, (route) => route.fulfill({ json: { data: [], models: [] } }));
  const keys = Object.fromEntries(ids.map((id) => [id, KEYS[id]]));
  const errors = await openApp(page, { http: true, storage: { 'lumi-api-keys-v1': JSON.stringify(keys) } });
  for (const id of ids) await expect.poll(() => page.evaluate((id) => state.providerStatus[id], id)).toBe('connected');
  const logs = [];
  page.on('console', (m) => logs.push(m.text()));
  return { errors, logs };
}

/** A Messages API reply as server-sent events (stream: true), with the text split over two deltas. */
function claudeSSE(text) {
  const ev = (type, data) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`;
  const half = Math.ceil(text.length / 2);
  return ev('message_start', { message: { id: 'msg_test', type: 'message', role: 'assistant', content: [], stop_reason: null } })
    + ev('content_block_start', { index: 0, content_block: { type: 'text', text: '' } })
    + ev('ping', {})
    + ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text: text.slice(0, half) } })
    + ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text: text.slice(half) } })
    + ev('content_block_stop', { index: 0 })
    + ev('message_delta', { delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 1 } })
    + ev('message_stop', {});
}

/** Fulfill a Claude route with `output` as a streamed JSON reply. */
function fulfillClaude(route, output) {
  return route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: claudeSSE(JSON.stringify(output)) });
}

module.exports = { APP_URL, HTTP_APP_URL, KEYS, CLAUDE, openApp, openWithKeys, fillStepOne, storyScore, claudeSSE, fulfillClaude };
