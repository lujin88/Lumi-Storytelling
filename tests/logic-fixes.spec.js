// @ts-check
// Research #25525 logic items (rule-based path, no key). All network is blocked by openApp.
const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

async function sample(page) {
  const errors = await openApp(page);
  await page.evaluate(() => { loadSample(); });
  return errors;
}

test('d: step 2 asks the questions in the same order the story is told', async ({ page }) => {
  await sample(page);
  const same = await page.evaluate(() => JSON.stringify(FOUNDATION.map((f) => f.id)) === JSON.stringify(SCENE_ORDER));
  expect(same).toBe(true);
});

test('e: step 4 does not prefill an answer from step 2', async ({ page }) => {
  await sample(page);
  const out = await page.evaluate(() => { go('defend'); return { defend: state.defend || {}, drafts: state.defIsDraft || {} }; });
  expect(Object.values(out.defend).filter((x) => String(x).trim())).toEqual([]);
  await expect(page.locator('.def-ans')).toHaveCount(0);
  await expect(page.locator('.def-empty').first()).toBeVisible();
});

test('a: step 5 does not say ready while gaps or unanswered follow-ups remain', async ({ page }) => {
  await sample(page);
  await page.evaluate(() => { go('publish'); });
  await expect(page.locator('#content h1')).not.toContainText('准备好了');
  await expect(page.locator('.dl-ready')).not.toHaveText('已准备');
  await expect(page.locator('#content')).toContainText(/个追问没答|待补/);
});

test('a: step 5 says ready once nothing is open', async ({ page }) => {
  await sample(page);
  await page.evaluate(() => {
    getScenes().forEach((s, i) => {
      ['zh', 'en'].forEach((L) => { ['', 'p', 'b', 's'].forEach((k) => { if (typeof s[L + k] === 'string') s[L + k] = s[L + k].replace(/\[待补数字\]|\[待补\]|\[Needed\]/g, '12'); }); });
      if (s.job === 'outcome') { s.zhp = '从 3 天缩短到 4 小时'; s.zh = '三天缩短到四小时'; }
      state.defend = state.defend || {}; state.defend[i] = 'answer ' + i;
    });
    state.defIsDraft = {};
    go('publish');
  });
  await expect(page.locator('#content h1')).toContainText('准备好了');
});

test('b: step 3 warns when the script is far shorter than the chosen duration', async ({ page }) => {
  await sample(page);
  const info = await page.evaluate(() => { go('build'); return talkCheck(); });
  expect(info.short).toBe(true);
  expect(info.minutes).toBeLessThan(info.target);
  await expect(page.locator('#content')).toContainText(/讲稿只够|估算/);
});

test('c: reframe and challenge titles carry the turn, not a label or half of it', async ({ page }) => {
  await sample(page);
  const titles = await page.evaluate(() => Object.fromEntries(getScenes().map((s) => [s.job, s.zh])));
  expect(titles.challenge).not.toBe('研究负责人反对');
  expect(titles.reframe).not.toBe('大家以为是工具太多');
  expect(titles.reframe).toContain('交接');
});
