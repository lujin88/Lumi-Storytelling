// @ts-check
// Chrome shares one localStorage across every file:// page, so keys saved there are
// readable by any local HTML file. Keys and the GitHub token persist only on http(s);
// opened as a file they stay in memory and any old copies are wiped.
// Lu chose this on 2026-10-23; see decisions.md.
const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

const KEY = 'FAKE-CLAUDE-KEY-FOR-TEST-ONLY';
const TOKEN = 'FAKE-GITHUB-TOKEN-FOR-TEST-ONLY';
const stored = (page, name) => page.evaluate((k) => localStorage.getItem(k), name);

async function typeClaudeKey(page) {
  await page.click('#sidebar [data-page="settings"]');
  await page.fill('#key-claude', KEY);
}

test('file://: a typed key is not saved and is gone after reload', async ({ page }) => {
  const errors = await openApp(page);
  await typeClaudeKey(page);
  expect(await stored(page, 'lumi-api-keys-v1')).toBeNull();
  await expect(page.locator('.settings-note')).toContainText('双击打开时不会保存密钥');
  await page.reload();
  await page.click('#sidebar [data-page="settings"]');
  await expect(page.locator('#key-claude')).toHaveValue('');
  expect(errors).toEqual([]);
});

test('file://: keys and token saved by older versions are wiped on load', async ({ page }) => {
  const errors = await openApp(page, {
    storage: {
      'lumi-api-keys-v1': JSON.stringify({ claude: KEY }),
      'lumi-github-token-v1': TOKEN,
    },
  });
  expect(await stored(page, 'lumi-api-keys-v1')).toBeNull();
  expect(await stored(page, 'lumi-github-token-v1')).toBeNull();
  await page.click('#sidebar [data-page="settings"]');
  await expect(page.locator('#key-claude')).toHaveValue('');
  expect(errors).toEqual([]);
});

test('file://: a verified GitHub token is not saved', async ({ page }) => {
  const errors = await openApp(page);
  // The local service answers the token check; nothing reaches GitHub.
  await page.route('http://127.0.0.1:4317/api/github/test', (route) =>
    route.fulfill({ json: { account: { login: 'tester' } } }));
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="publish"]');
  // No button opens this dialog on main today; open it the way the handler would.
  await page.evaluate(() => /** @type {any} */ (window).githubConnectModal());
  await page.fill('#githubToken', TOKEN);
  await page.click('[data-action="startGithubAuth"]');
  await expect(page.locator('#modal')).not.toBeVisible();
  expect(await stored(page, 'lumi-github-token-v1')).toBeNull();
  expect(errors).toEqual([]);
});

test('http: a typed key and the GitHub token survive a reload', async ({ page }) => {
  const errors = await openApp(page, { http: true, storage: { 'lumi-github-token-v1': TOKEN } });
  await typeClaudeKey(page);
  expect(JSON.parse((await stored(page, 'lumi-api-keys-v1')) || '{}').claude).toBe(KEY);
  await expect(page.locator('.settings-note')).not.toContainText('双击打开');
  await page.reload();
  await page.click('#sidebar [data-page="settings"]');
  await expect(page.locator('#key-claude')).toHaveValue(KEY);
  expect(await stored(page, 'lumi-github-token-v1')).toBe(TOKEN);
  expect(errors).toEqual([]);
});
