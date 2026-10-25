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

test('download excludes saved API keys and GitHub token', async ({ page }) => {
  // One distinct marker per secret, so a leak names the field that leaked.
  const keyMarkers = {
    claude: 'FAKE-CLAUDE-KEY-FOR-TEST-ONLY',
    openai: 'FAKE-OPENAI-KEY-FOR-TEST-ONLY',
    gemini: 'FAKE-GEMINI-KEY-FOR-TEST-ONLY',
    jimeng: 'FAKE-JIMENG-KEY-FOR-TEST-ONLY',
  };
  const githubMarker = 'FAKE-GITHUB-TOKEN-FOR-TEST-ONLY';
  // Over http, because file:// pages no longer load saved keys (see key-storage.spec.js).
  await openApp(page, {
    http: true,
    storage: {
      'lumi-api-keys-v1': JSON.stringify(keyMarkers),
      'lumi-github-token-v1': githubMarker,
    },
  });
  await expect.poll(() => page.evaluate(() => localStorage.getItem('lumi-api-keys-v1'))).toContain(keyMarkers.jimeng);
  expect(await page.evaluate(() => localStorage.getItem('lumi-github-token-v1'))).toBe(githubMarker);
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
  for (const [name, marker] of [...Object.entries(keyMarkers), ['github', githubMarker]]) {
    expect(zip.includes(Buffer.from(marker)), `${name} secret leaked into the download`).toBe(false);
  }
});

test('follow-up rows use the same row format as the story questions', async ({ page }) => {
  await openApp(page);
  await fillStepOne(page, NOTES);
  await page.click('#footer [data-action="next"]');
  // Two follow-ups as Lumi's review leaves them: one open, one answered.
  await page.evaluate(() => {
    state.followups = [
      { parent: 'outcome', q: '你写了「我们」。这里面哪个判断是你自己做的？', text: '' },
      { parent: 'stake', q: '续约推迟了多久？', text: '推迟了一个季度。' },
    ];
    state.focus = null; state.editing = null; render();
  });
  const fuRow = page.locator('ol.fu-list > li').first();
  await expect(fuRow).toBeVisible();
  await expect(fuRow.locator('.f-num')).toHaveText('01');
  await expect(page.locator('ol.fu-list .fu-from')).toHaveCount(0);
  const look = (row) => row.evaluate((el) => {
    const s = getComputedStyle(el), q = getComputedStyle(el.querySelector('.f-q')), n = getComputedStyle(el.querySelector('.f-num'));
    // Only the number column: the chip column is as wide as its label.
    return [s.gridTemplateColumns.split(' ')[0], s.columnGap, s.padding, s.borderBottom, s.backgroundColor, s.boxShadow, q.fontSize, q.fontWeight, n.fontSize, n.color].join(' | ');
  });
  // Neither row selected: identical. Then both selected in turn: identical too.
  await page.click('[data-action="focus:stake"]');
  const answeredFu = page.locator('ol.fu-list > li').nth(1);
  await expect(answeredFu.locator('.f-text')).toHaveText('推迟了一个季度。');
  const storyRow = page.locator('ol.foundation:not(.fu-list) > li').nth(1);
  expect(await look(fuRow)).toBe(await look(storyRow));
  const storySelected = await look(page.locator('[data-action="focus:stake"]'));
  await page.click('[data-action="fuFocus:0"]');
  await expect(page.locator('[data-action="fuFocus:0"]')).toHaveAttribute('aria-current', 'step');
  expect(await look(page.locator('[data-action="fuFocus:0"]'))).toBe(storySelected);
});
