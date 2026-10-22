// @ts-check
const { test, expect } = require('@playwright/test');
const { openApp, fillStepOne, storyScore } = require('./helpers');

const NOTES = '我重新设计了团队的研究流程。产品经理反对，我放弃了自动生成，结果交付时间从两周降到三天。';

test('loads with five steps and no page errors', async ({ page }) => {
  const errors = await openApp(page);
  await expect(page.locator('#sidebar [data-page]')).toHaveCount(7); // 5 steps + help + settings
  for (const step of ['dump', 'story', 'build', 'defend', 'publish']) {
    await expect(page.locator(`#sidebar [data-page="${step}"]`)).toBeVisible();
  }
  await expect(page.locator('#sidebar [data-page="dump"]')).toHaveClass(/active/);
  expect(errors).toEqual([]);
});

test('language toggle switches the UI to English', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('#content h1')).toContainText('把你的项目');
  await page.locator('#sidebar [data-action="lang:en"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#content h1')).not.toContainText('把你的项目');
});

test('step 1 needs notes and a purpose before Next', async ({ page }) => {
  await openApp(page);
  const next = page.locator('#footer [data-action="next"]');
  await expect(next).toBeDisabled();
  await fillStepOne(page, NOTES);
  await expect(next).toBeEnabled();
  await next.click();
  await expect(page.locator('#sidebar [data-page="story"]')).toHaveClass(/active/);
  await expect(page.locator('.sc-head')).toBeVisible();
});

test('notes survive a reload', async ({ page }) => {
  await openApp(page);
  await fillStepOne(page, NOTES);
  await page.reload();
  await page.click('#sidebar [data-page="story"]');
  await expect(page.locator('ol.foundation').first()).toContainText('产品经理反对');
});

test('answering a story question raises the score', async ({ page }) => {
  await openApp(page);
  await fillStepOne(page, NOTES);
  await page.click('#footer [data-action="next"]');
  const before = await storyScore(page);
  // Question 02 (reframe) is empty in NOTES; an "以为…其实…" answer fills the turning point.
  await page.click('[data-action="focus:reframe"]');
  await page.fill('#guideText', '大家以为是效率问题，其实是团队不信任自动生成的结论。');
  await page.press('#guideText', 'Enter');
  await expect.poll(() => storyScore(page)).toBeGreaterThan(before);
});

test('download excludes saved API keys', async ({ page }) => {
  const marker = 'FAKE-KEY-FOR-TEST-ONLY';
  await openApp(page, {
    storage: { 'lumi-api-keys-v1': JSON.stringify({ claude: marker, openai: '', gemini: '', jimeng: '' }) },
  });
  await expect.poll(() => page.evaluate(() => localStorage.getItem('lumi-api-keys-v1'))).toContain(marker);
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="publish"]');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('[data-action="downloadPackage"]'),
  ]);
  expect(download.suggestedFilename()).toBe('lumi-story.zip');
  const fs = require('fs');
  const zip = fs.readFileSync(await download.path());
  // Guard that the archive is searchable as bytes (stored, not compressed).
  expect(zip.includes(Buffer.from('lumi-project.json'))).toBe(true);
  expect(zip.includes(Buffer.from('"brief"'))).toBe(true);
  expect(zip.includes(Buffer.from(marker))).toBe(false);
});
