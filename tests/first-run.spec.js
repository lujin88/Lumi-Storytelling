// @ts-check
// PRD 8.12 first-time use and the browser key check. Provider APIs are mocked with
// page routes; every other request is blocked by openApp, so no real key or call is used.
const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

const CLAUDE_KEY = 'FAKE-CLAUDE-KEY-FOR-TEST-ONLY';
const CLAUDE_MODELS = 'https://api.anthropic.com/v1/models**';
const card = (page) => page.locator('.first-run');
const claudeRow = (page) => page.locator('.prov-row', { has: page.locator('#key-claude') });

/** Answer the Claude model list the way the API does for a good or a wrong key. */
function mockClaude(page, ok) {
  return page.route(CLAUDE_MODELS, (route) => route.fulfill(ok
    ? { json: { data: [{ id: 'claude-opus-5-5' }] } }
    : { status: 401, json: { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } } }));
}

async function connectClaudeFromCard(page) {
  await card(page).locator('[data-action="firstRunConnect"]').click();
  await expect(page.locator('#key-claude')).toBeFocused();
  await page.fill('#key-claude', CLAUDE_KEY);
  await claudeRow(page).locator('[data-action="connectApi:claude"]').click();
}

test('a new browser shows the first-run card before any AI call', async ({ page }) => {
  const calls = [];
  page.on('request', (r) => { if (/^https?:/.test(r.url())) calls.push(r.url()); });
  const errors = await openApp(page);
  await expect(card(page)).toBeVisible();
  await expect(card(page)).toContainText('先连接 Claude');
  expect(calls).toEqual([]);
  expect(errors).toEqual([]);
});

test('a valid Claude key is checked and the user lands back on step 1', async ({ page }) => {
  const errors = await openApp(page);
  let sent = null;
  await page.route(CLAUDE_MODELS, (route) => {
    sent = route.request().headers();
    return route.fulfill({ json: { data: [] } });
  });
  await connectClaudeFromCard(page);
  await expect(page.locator('.page-dump')).toBeVisible();
  await expect(card(page)).toHaveCount(0);
  expect(sent?.['x-api-key']).toBe(CLAUDE_KEY);
  expect(sent?.['anthropic-dangerous-direct-browser-access']).toBe('true');
  await page.click('#sidebar [data-page="settings"]');
  await expect(claudeRow(page).locator('.connection-status')).toHaveText('已连接');
  expect(errors).toEqual([]);
});

test('a wrong key shows a one-line error in its row and is not marked connected', async ({ page }) => {
  const errors = await openApp(page);
  await mockClaude(page, false);
  await connectClaudeFromCard(page);
  await expect(page.locator('.page-settings')).toBeVisible();
  await expect(claudeRow(page).locator('.connection-status')).toHaveText('连接失败');
  const err = page.locator('.prov-err');
  await expect(err).toHaveCount(1);
  await expect(err).toHaveText('Claude 不认这个密钥。重新复制一个再试。');
  // The error sits inside its row, so the row grows and its divider moves below the text.
  await expect(claudeRow(page).locator('.prov-err')).toHaveCount(1);
  const [errBox, rowBox, inputBox] = await Promise.all([err.boundingBox(), claudeRow(page).boundingBox(), page.locator('#key-claude').boundingBox()]);
  const rowPadBottom = await claudeRow(page).evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
  expect(errBox.y).toBeGreaterThanOrEqual(inputBox.y + inputBox.height);
  expect(errBox.y + errBox.height).toBeLessThanOrEqual(rowBox.y + rowBox.height - rowPadBottom + 0.5);
  // Typing a new key clears the old error.
  await page.fill('#key-claude', CLAUDE_KEY + '-2');
  await expect(err).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('after skipping, an AI action shows an inline connect prompt, not silence', async ({ page }) => {
  const errors = await openApp(page);
  await card(page).locator('[data-action="firstRunSample"]').click();
  await expect(card(page)).toHaveCount(0);
  await page.click('#sidebar [data-page="build"]');
  await page.fill('#guideText', '把标题改短一点');
  await page.click('#footer [data-action="send"]');
  // Step 3 edits go to Claude first (PRD 8.13); the typed text stays in the box.
  const prompt = page.locator('.connect-prompt');
  await expect(prompt).toContainText('这一步要用 Claude');
  await expect(page.locator('#guideText')).toHaveValue('把标题改短一点');
  await prompt.locator('[data-action="connectPrompt:claude"]').click();
  await expect(page.locator('#key-claude')).toBeFocused();
  expect(errors).toEqual([]);
});

test('each optional provider says what it unlocks and shows its status', async ({ page }) => {
  const errors = await openApp(page);
  await page.click('#sidebar [data-page="settings"]');
  for (const [id, unlocks] of [['openai', '图片'], ['gemini', '语音转文字'], ['jimeng', '视频']]) {
    const row = page.locator('.prov-row', { has: page.locator(`[data-action="connectApi:${id}"]`) });
    await expect(row.locator('.prov-doc')).toContainText(unlocks);
    await expect(row.locator('.connection-status')).toHaveText('未连接');
  }
  expect(errors).toEqual([]);
});

test('the card does not show again once Claude is connected', async ({ page }) => {
  const errors = await openApp(page, { http: true });
  await mockClaude(page, true);
  await connectClaudeFromCard(page);
  await expect(card(page)).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#content h1')).toBeVisible();
  await expect(card(page)).toHaveCount(0);
  await page.click('#sidebar [data-page="settings"]');
  await expect(claudeRow(page).locator('.connection-status')).toHaveText('已连接');
  expect(errors).toEqual([]);
});

test('each failure kind has its own one-line message', async ({ page }) => {
  const errors = await openApp(page);
  await page.route('https://api.openai.com/v1/models', (route) =>
    route.fulfill({ status: 429, json: { error: { code: 'insufficient_quota', type: 'insufficient_quota' } } }));
  await page.route('https://generativelanguage.googleapis.com/**', (route) =>
    route.fulfill({ status: 400, json: { error: { status: 'INVALID_ARGUMENT', details: [{ reason: 'API_KEY_INVALID' }] } } }));
  // Claude is left on the default abort: a network failure.
  await page.click('#sidebar [data-page="settings"]');
  const cases = [
    ['claude', 'FAKE-CLAUDE-KEY-FOR-TEST-ONLY', '连不上 Claude。检查网络后再试。'],
    ['openai', 'FAKE-OPENAI-KEY-FOR-TEST-ONLY', 'OpenAI 账户没有额度了。充值后再试。'],
    ['gemini', 'FAKE-GEMINI-KEY-FOR-TEST-ONLY', 'Gemini 不认这个密钥。重新复制一个再试。'],
    // Opened as a file, Jimeng goes to the local service, which isn't running here.
    ['jimeng', null, '本地服务没有开。在项目文件夹运行 node server，再试一次。'],
  ];
  for (const [id, key, message] of cases) {
    if (key) await page.fill(`#key-${id}`, key);
    await page.click(`[data-action="connectApi:${id}"]`);
    const row = page.locator('.prov-row', { has: page.locator(`[data-action="connectApi:${id}"]`) });
    await expect(row.locator('.connection-status')).toHaveText('连接失败');
    await expect(row.locator('.prov-err')).toHaveText(message);
  }
  expect(errors).toEqual([]);
});
