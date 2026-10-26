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
  await expect.poll(() => page.evaluate(() => localStorage.getItem('lumi-api-keys-v1'))).toContain(keyMarkers.gemini);
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

/** Step 2 with two open follow-ups and one answered, as Lumi's review leaves them. */
async function storyWithFollowups(page) {
  await openApp(page);
  await fillStepOne(page, NOTES);
  await page.click('#footer [data-action="next"]');
  await page.evaluate(() => {
    state.followups = [
      { parent: 'outcome', q: '你写了「我们」。这里面哪个判断是你自己做的？', text: '' },
      { parent: 'stake', q: '续约推迟了多久？', text: '推迟了一个季度。' },
      { parent: 'decision', q: '你放弃了什么？', text: '' },
    ];
    state.three = ['', '', ''];
    state.focus = null; state.editing = null; render();
  });
}

test('clicking any row opens the editor in that row, in all three groups', async ({ page }) => {
  await storyWithFollowups(page);
  // Empty and answered rows alike: story question, follow-up, "three things".
  for (const action of ['focus:reframe', 'focus:stake', 'fuFocus:0', 'fuFocus:1', 'three:0', 'three:2']) {
    const row = page.locator(`[data-action="${action}"]`);
    await row.click();
    await expect(row.locator('.inline-edit'), action).toBeFocused();
    await expect(row).toHaveAttribute('aria-current', 'step');
    // Only one row editor at a time.
    await expect(page.locator('#content .inline-edit')).toHaveCount(1);
  }
});

test('switching from one row editor to another keeps the new editor open and its typing', async ({ page }) => {
  await openApp(page);
  await fillStepOne(page, NOTES);
  await page.click('#footer [data-action="next"]');
  await page.evaluate(() => {
    state.found.reframe = { text: '先前的回答。' };
    state.found.stake = { text: '推迟了一个季度。' };
    render();
  });
  await page.click('[data-action="focus:reframe"]');
  await expect(page.locator('[data-action="focus:reframe"] .inline-edit')).toBeFocused();
  await page.keyboard.type('改');
  await page.click('[data-action="focus:stake"]');
  await page.keyboard.type('X');
  // The first editor saves on its way out, 180ms later; the new one must survive that.
  await page.waitForTimeout(400);
  const editor = page.locator('[data-action="focus:stake"] .inline-edit');
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('推迟了一个季度。X');
  expect(await page.evaluate(() => [state.editing, state.found.reframe.text])).toEqual(['stake', '先前的回答。改']);
});

test('text typed in a row and then in the composer lands in that same row, in all three groups', async ({ page }) => {
  await storyWithFollowups(page);
  const cases = [
    ['fuFocus:0', () => state.followups[0].text, () => [state.followups[1].text, state.followups[2].text]],
    ['three:1', () => state.three[1], () => [state.three[0], state.three[2]]],
    ['focus:reframe', () => state.found.reframe?.text, () => [state.found.wisdom?.text || '']],
  ];
  for (const [action, own, others] of cases) {
    const before = await page.evaluate(`(${others})()`);
    await page.click(`[data-action="${action}"]`);
    await page.keyboard.type('PART1');
    // A "three things" row can start with Lumi's draft in it; the whole row text moves.
    const typed = await page.locator('#content .inline-edit').inputValue();
    await page.click('#guideText');
    await expect(page.locator('#content .inline-edit'), action).toHaveCount(0);
    await expect(page.locator('#guideText'), action).toBeFocused();
    await expect(page.locator('#guideText'), action).toHaveValue(typed);
    await page.keyboard.type('PART2');
    await page.keyboard.press('Enter');
    expect(await page.evaluate(`(${own})()`), action).toBe(typed + 'PART2');
    expect(await page.evaluate(`(${others})()`), action).toEqual(before);
  }
});

test('a composer draft stays with the row it was written for', async ({ page }) => {
  await storyWithFollowups(page);
  // A draft typed for fu0 is saved to fu0 when another row opens; that row's own text then moves alone.
  await page.click('[data-action="fuFocus:0"]');
  await page.click('#guideText');
  await page.keyboard.type('DRAFT_A');
  await page.click('[data-action="fuFocus:2"]');
  await page.keyboard.type('B_TEXT');
  await page.click('#guideText');
  await expect(page.locator('#guideText')).toHaveValue('B_TEXT');
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => state.followups.map(x => x.text))).toEqual(['DRAFT_A', '推迟了一个季度。', 'B_TEXT']);
  // Same with nothing typed in the second row: the composer is empty, so nothing goes into it.
  await page.evaluate(() => { state.followups[0].text = ''; state.followups[2].text = ''; state.focus = null; render(); });
  for (const leave of ['click', 'Escape']) {
    await page.click('[data-action="fuFocus:0"]');
    await page.click('#guideText');
    await page.keyboard.type('DRAFT_A');
    await page.click('[data-action="fuFocus:2"]');
    if (leave === 'click') await page.click('#guideText'); else { await page.keyboard.press('Escape'); await page.click('#guideText'); }
    await expect(page.locator('#guideText'), leave).toHaveValue('');
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => state.followups.map(x => x.text)), leave).toEqual(['DRAFT_A', '推迟了一个季度。', '']);
    await page.evaluate(() => { state.followups[0].text = ''; state.focus = null; render(); });
  }
});

test('Esc in the composer discards a draft moved from a row and leaves the row as it was', async ({ page }) => {
  await storyWithFollowups(page);
  await page.click('[data-action="fuFocus:1"]');
  await page.keyboard.type(' X');
  await page.click('#guideText');
  await expect(page.locator('#guideText')).toHaveValue('推迟了一个季度。 X');
  await page.keyboard.press('Escape');
  await expect(page.locator('#guideText')).toHaveValue('');
  await page.click('[data-action="fuFocus:0"]');
  expect(await page.evaluate(() => state.followups.map(x => x.text))).toEqual(['', '推迟了一个季度。', '']);
});

test('Esc that closes an input method candidate list keeps the text, in the row and in the composer', async ({ page }) => {
  await storyWithFollowups(page);
  const imeEsc = sel => page.evaluate(s => document.querySelector(s).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', isComposing: true, bubbles: true, cancelable: true })), sel);
  await page.click('[data-action="fuFocus:1"]');
  await page.keyboard.type(' X');
  await imeEsc('#content .inline-edit');
  await expect(page.locator('#content .inline-edit')).toHaveValue('推迟了一个季度。 X');
  await page.click('#guideText');
  await expect(page.locator('#guideText')).toHaveValue('推迟了一个季度。 X');
  await imeEsc('#guideText');
  await expect(page.locator('#guideText')).toHaveValue('推迟了一个季度。 X');
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => state.followups[1].text)).toBe('推迟了一个季度。 X');
});

test('an answered row moved to the composer is not copied when the selection changes', async ({ page }) => {
  await storyWithFollowups(page);
  await page.click('[data-action="fuFocus:1"]');
  await page.click('#guideText');
  await expect(page.locator('#guideText')).toHaveValue('推迟了一个季度。');
  // Another row, Esc, and a page switch all leave the composer empty and fu1 unchanged.
  await page.click('[data-action="fuFocus:0"]');
  await page.keyboard.press('Escape');
  await expect(page.locator('#guideText')).toHaveValue('');
  await page.click('[data-action="fuFocus:1"]');
  await page.click('#guideText');
  await page.evaluate(() => { go('dump'); go('story'); });
  await expect(page.locator('#guideText')).toHaveValue('');
  await page.click('[data-action="fuFocus:0"]');
  await page.keyboard.type('NEW0');
  await page.click('#guideText');
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => state.followups.map(x => x.text))).toEqual(['NEW0', '推迟了一个季度。', '']);
});

test('a step 4 answer edited in its row and continued in the composer is written once', async ({ page }) => {
  await storyWithFollowups(page);
  await page.evaluate(() => { state.defend = { 0: 'ANS' }; go('defend'); });
  await page.evaluate(() => { document.querySelector('details.q-card[data-def="0"]').open = true; });
  await page.click('[data-action="defEdit:0"]');
  await page.keyboard.type(' more');
  await page.click('#guideText');
  await expect(page.locator('#content .inline-edit')).toHaveCount(0);
  await expect(page.locator('#guideText')).toHaveValue('');
  await page.keyboard.type('PLUS');
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => state.defend[0])).toBe('ANS more。PLUS');
});

test('Lumi\'s review and the score card open the row editor on empty rows too', async ({ page }) => {
  await storyWithFollowups(page);
  await page.evaluate(() => { delete state.found.reframe; render(); });
  const go = await page.evaluate(() => {
    const b = document.createElement('button'); b.dataset.action = 'reviewGo:reframe'; document.body.append(b); b.click(); b.remove();
    return document.activeElement?.dataset?.edit;
  });
  expect(go).toBe('reframe');
  await expect(page.locator('[data-action="focus:reframe"] .inline-edit')).toBeFocused();
  await page.keyboard.press('Escape');
  const jump = await page.evaluate(() => {
    const b = document.createElement('button'); b.dataset.action = 'auditJump:pivot'; document.body.append(b); b.click(); b.remove();
    return document.activeElement?.dataset?.edit;
  });
  expect(jump).toBe('reframe');
  await expect(page.locator('#content .inline-edit')).toHaveCount(1);
});

test('an answer typed in the row saves it and moves the composer to the next open follow-up', async ({ page }) => {
  await storyWithFollowups(page);
  await page.click('[data-action="fuFocus:0"]');
  await page.locator('[data-action="fuFocus:0"] .inline-edit').fill('分组方式是我定的。');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-action="fuFocus:0"] .f-text')).toHaveText('分组方式是我定的。');
  await expect(page.locator('[data-action="fuFocus:2"]')).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('#guideText')).toHaveAttribute('placeholder', '回答这个追问…');
});

test('the composer answers the row that is open in the editor', async ({ page }) => {
  await storyWithFollowups(page);
  await page.click('[data-action="fuFocus:2"]');
  // Moving to the composer saves and closes the row editor, so the two never edit at once.
  await page.click('#guideText');
  await expect(page.locator('#content .inline-edit')).toHaveCount(0);
  await page.keyboard.type('全自动生成。');
  await expect(page.locator('#guideText')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-action="fuFocus:2"] .f-text')).toHaveText('全自动生成。');
  expect(await page.evaluate(() => state.followups[0].text)).toBe('');
});

/** Safari fires the keydown that confirms or closes an input method after compositionend: isComposing is false, keyCode is 229. */
const imeKeydown = (page, selector, key) => page.evaluate(([s, k]) => {
  const e = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
  Object.defineProperty(e, 'keyCode', { value: 229 });
  return document.querySelector(s).dispatchEvent(e);
}, [selector, key]);

test('Enter that confirms an input method does not send the composer', async ({ page }) => {
  await openApp(page);
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="story"]');
  const before = await page.evaluate(() => JSON.stringify([state.found, state.answers]));
  await page.click('#guideText');
  await page.keyboard.type('IME');
  expect(await imeKeydown(page, '#guideText', 'Enter')).toBe(true);
  await expect(page.locator('#guideText')).toHaveValue('IME');
  expect(await page.evaluate(() => JSON.stringify([state.found, state.answers]))).toBe(before);
});

test('Enter or Esc that closes an input method keeps the row editor open with its text', async ({ page }) => {
  await openApp(page);
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="story"]');
  const id = await page.evaluate(() => FOUNDATION.find((f) => foundationValue(f).text).id);
  const saved = await page.evaluate((k) => foundationValue(FOUNDATION.find((f) => f.id === k)).text, id);
  await page.click(`[data-action="focus:${id}"]`);
  await page.keyboard.type(' X');
  for (const key of ['Enter', 'Escape']) {
    expect(await imeKeydown(page, '#content .inline-edit', key), key).toBe(true);
    await expect(page.locator('#content .inline-edit'), key).toHaveValue(saved + ' X');
  }
  expect(await page.evaluate((k) => foundationValue(FOUNDATION.find((f) => f.id === k)).text, id)).toBe(saved);
  await page.keyboard.press('Escape');
  await expect(page.locator('#content .inline-edit')).toHaveCount(0);
});

test('Enter or Esc that closes an input method stays in the slide field', async ({ page }) => {
  await openApp(page);
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="build"]');
  const field = page.locator('#content [data-deck-field="title"]').first();
  await field.evaluate((el) => { el.contentEditable = 'true'; el.focus(); });
  for (const key of ['Enter', 'Escape']) {
    expect(await imeKeydown(page, '#content [data-deck-field="title"]', key), key).toBe(true);
    await expect(field, key).toBeFocused();
  }
  await page.keyboard.press('Escape');
  await expect(field).not.toBeFocused();
});

test('Esc that closes an input method keeps a draft moved into the composer', async ({ page }) => {
  await storyWithFollowups(page);
  await page.click('[data-action="fuFocus:1"]');
  await page.keyboard.type(' X');
  await page.click('#guideText');
  expect(await imeKeydown(page, '#guideText', 'Escape')).toBe(true);
  await expect(page.locator('#guideText')).toHaveValue('推迟了一个季度。 X');
});

test('Enter that confirms an input method does not add the custom audience yet', async ({ page }) => {
  await openApp(page);
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="dump"]');
  const field = page.locator('#audNew');
  await field.fill('设计总监');
  const before = await page.evaluate(() => JSON.stringify(audCustom()));
  expect(await imeKeydown(page, '#audNew', 'Enter')).toBe(true);
  await expect(field).toHaveValue('设计总监');
  expect(await page.evaluate(() => JSON.stringify(audCustom()))).toBe(before);
  await field.press('Enter');
  expect(await page.evaluate(() => audCustom())).toContain('设计总监');
});

// Full-site list (2026-10-26): an empty project scored 0/10 but step 5 still said the story was ready.
// Copy: docs/product-specs/copy/step5-not-ready.json (UX copy, 42bce62). Condition A: empty project only.
for (const [lang, copy] of [
  ['zh', { title: '你的故事还没准备好。', sub: '先回到「收集素材」，把你知道的写下来。', note: '还没有内容可以评分', subNo: '素材里还找不到这些问题的答案。先到「找到故事」答几个。', noteNo: '还没有答案可以评分', readyTitle: '你的故事，准备好了。', ready: '已准备' }],
  ['en', { title: 'Your story isn’t ready yet.', sub: 'Go back to Gather and write down what you know.', note: 'Nothing to score yet', subNo: 'Your notes don’t answer the story questions yet. Answer a few in Find the story.', noteNo: 'No answers to score yet', readyTitle: 'Your story is ready.', ready: 'Ready' }],
]) {
  test(`step 5 says an empty project is not ready, and a story with answers is (${lang})`, async ({ page }) => {
    const errors = await openApp(page, { storage: { 'lumi-workbench-v1': JSON.stringify({ lang }) } });
    await page.evaluate(() => go('publish'));
    await expect(page.locator('#content h1')).toHaveText(copy.title);
    await expect(page.locator('#content .heading p')).toHaveText(copy.sub);
    await expect(page.locator('.dl-score strong')).toContainText('0/10');
    await expect(page.locator('.dl-score p')).toHaveText(copy.note);
    await expect(page.locator('.dl-ready')).toHaveCount(0);
    // Content with a low score is not an empty project: the normal copy, not this set (cross review, 42bce62).
    await page.evaluate(() => { state.found[FOUNDATION[0].id] = { text: 'x' }; go('publish'); });
    expect(await page.evaluate(() => audit().total)).toBeLessThanOrEqual(2);
    await expect(page.locator('#content h1')).toHaveText(copy.readyTitle);
    await expect(page.locator('.dl-score p')).not.toHaveText(copy.note);
    await page.evaluate(() => { delete state.found[FOUNDATION[0].id]; loadSample(); go('publish'); });
    await expect(page.locator('#content h1')).toHaveText(copy.readyTitle);
    await expect(page.locator('.dl-score p')).not.toHaveText(copy.note);
    await expect(page.locator('.dl-ready')).toHaveText(copy.ready);
    expect(errors).toEqual([]);
  });

  // Condition B (UX copy, 030e711): step 1 has notes, but no story question has an answer, either typed
  // or found in the notes. "Go back to Gather" is wrong for them; they wrote notes already.
  test(`step 5 tells a user whose notes answer no question to go to Find the story (${lang})`, async ({ page }) => {
    const errors = await openApp(page, { storage: { 'lumi-workbench-v1': JSON.stringify({ lang }) } });
    await page.evaluate(() => { state.brief = '   \n '; go('publish'); });
    await expect(page.locator('#content .heading p')).toHaveText(copy.sub); // whitespace is not notes
    await page.evaluate(() => { state.brief = 'Hello. 你好。'; go('publish'); });
    expect(await page.evaluate(() => openFoundations().length === FOUNDATION.length)).toBe(true);
    await expect(page.locator('#content h1')).toHaveText(copy.title);
    await expect(page.locator('#content .heading p')).toHaveText(copy.subNo);
    await expect(page.locator('.dl-score strong')).toContainText('0/10');
    await expect(page.locator('.dl-score p')).toHaveText(copy.noteNo);
    await expect(page.locator('.dl-ready')).toHaveCount(0);
    // One answer from the notes alone makes it a story with content: the normal copy.
    await page.evaluate((notes) => { state.brief = 'Hello. ' + notes; go('publish'); }, NOTES);
    expect(await page.evaluate(() => openFoundations().length < FOUNDATION.length)).toBe(true);
    await expect(page.locator('#content h1')).toHaveText(copy.readyTitle);
    await expect(page.locator('.dl-score p')).not.toHaveText(copy.noteNo);
    expect(errors).toEqual([]);
  });
}
