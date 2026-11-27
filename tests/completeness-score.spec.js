// @ts-check
const { test, expect } = require('@playwright/test');
const { openApp, openWithKeys, CLAUDE, fulfillClaude } = require('./helpers');

// Research item #1 samples (lumi-story-logic.md):
// 1) Garbage keywords-only answers that used to score 10/10 under regex ruleAudit.
const GARBAGE_FOUND = {
  stake: { text: '客户。' },
  reframe: { text: '我发现了。' },
  challenge: { text: '客户很担心。' },
  decision: { text: '代价很大。' },
  outcome: { text: '有反馈。' },
  wisdom: { text: '下次。' },
};

// 2) Concrete story without regex keywords that used to score 6/10 under regex ruleAudit.
const GOOD_FOUND = {
  stake: { text: '大客户每周要等三天才能看到研究结论，两个项目因此推迟了续约讨论。' },
  reframe: { text: '大家起初说工具太慢，查了记录才看到卡在步骤交接。' },
  challenge: { text: '研究负责人不愿意让 AI 写结论。' },
  decision: { text: '我选了每一步让研究员复核，没有做全自动。' },
  outcome: { text: '试点四周后，出结论从三天缩短到四小时，研究团队开始按这套流程走。' },
  wisdom: { text: '先让人信任流程，再谈效率，以后更早拉研究负责人一起定边界。' },
};

async function seedFound(page, found, lang = 'zh') {
  await page.evaluate(({ f, l }) => {
    state.lang = l;
    state.brief = '项目笔记。';
    state.purpose = 'interview';
    state.duration = '10';
    state.found = JSON.parse(JSON.stringify(f));
    state.claudeScore = null;
    go('story');
  }, { f: found, l: lang });
}

test.describe('completeness vs content quality score', () => {
  test('without a key, garbage keywords-only answers show 6/6 completeness and no 10/10 quality score', async ({ page }) => {
    const errors = await openApp(page);
    await seedFound(page, GARBAGE_FOUND);

    // Step 2: completeness only, never "评分" or "10/10".
    await expect(page.locator('.sc-label')).toHaveText('完整度');
    await expect(page.locator('.sc-num')).toHaveText('6/6');
    await expect(page.locator('.sc-note')).toHaveText('接上 key 才能评内容');
    await expect(page.locator('.sc-head')).not.toContainText('10/10');
    await expect(page.locator('.sc-head')).not.toContainText('评分');

    // Step 5: completeness only, never "评分" or "10/10".
    await page.click('#sidebar [data-page="publish"]');
    await expect(page.locator('.dl-preview .dl-score strong')).toHaveText('完整度 6/6');
    await expect(page.locator('.dl-preview .dl-score p')).toContainText('接上 key 才能评内容');
    await expect(page.locator('.dl-preview .dl-score')).not.toContainText('10/10');
    await expect(page.locator('.dl-preview .dl-score')).not.toContainText('评分');

    // English copy without a key.
    await page.evaluate(() => { state.lang = 'en'; go('story'); });
    await expect(page.locator('.sc-label')).toHaveText('Completeness');
    await expect(page.locator('.sc-num')).toHaveText('6/6');
    await expect(page.locator('.sc-note')).toHaveText('Connect a key to score content');
    await expect(page.locator('.sc-head')).not.toContainText('/10');

    expect(errors).toEqual([]);
  });

  test('without a key, concrete story without regex keywords also shows 6/6 completeness (not 6/10)', async ({ page }) => {
    const errors = await openApp(page);
    await seedFound(page, GOOD_FOUND);

    await expect(page.locator('.sc-label')).toHaveText('完整度');
    await expect(page.locator('.sc-num')).toHaveText('6/6');
    await expect(page.locator('.sc-note')).toHaveText('接上 key 才能评内容');
    await expect(page.locator('.sc-head')).not.toContainText('6/10');

    await page.click('#sidebar [data-page="publish"]');
    await expect(page.locator('.dl-preview .dl-score strong')).toHaveText('完整度 6/6');
    await expect(page.locator('.dl-preview .dl-score p')).toContainText('接上 key 才能评内容');
    expect(errors).toEqual([]);
  });

  test('completeness counts all 6 questions including stake, ignores whitespace-only answers, and Fix jumps to the missing question', async ({ page }) => {
    const errors = await openApp(page);
    await seedFound(page, {
      stake: { text: '   ' },
      reframe: { text: '真正问题是交接没人负责。' },
      challenge: { text: '研究负责人担心质量。' },
      decision: { text: '我选了人工复核。' },
      outcome: { text: '缩短到四小时。' },
      wisdom: { text: '' },
    });

    await expect(page.locator('.sc-label')).toHaveText('完整度');
    await expect(page.locator('.sc-num')).toContainText('4/6');
    await expect(page.locator('.sc-num')).toContainText('缺 2 题');

    await page.click('.sc-head');
    const items = await page.evaluate(() =>
      [...document.querySelectorAll('.sc-dims li')].map((li) => [
        li.querySelector('.sc-dn')?.textContent,
        li.querySelector('.sc-st')?.textContent,
      ])
    );
    expect(items).toEqual([
      ['为什么重要', '未填'],
      ['真正的问题', '已填'],
      ['真正的难点', '已填'],
      ['关键决定', '已填'],
      ['结果', '已填'],
      ['学到了什么', '未填'],
    ]);

    // Clicking Fix on stake opens the inline editor for stake.
    await page.click('.sc-dims [data-action="auditJump:stake"]');
    await expect(page.locator('[data-action="focus:stake"] .inline-edit')).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('Lumi jump follows completeness: filling stake jumps, editing an already-filled answer does not', async ({ page }) => {
    const errors = await openApp(page);
    await seedFound(page, {
      stake: { text: '' },
      reframe: { text: '大家起初说工具太慢。' },
      challenge: { text: '这件事很难。' },
      decision: { text: '选了人工复核。' },
      outcome: { text: '变快了。' },
      wisdom: { text: '下次早点沟通。' },
    });
    await expect.poll(() => page.evaluate(() => lumiAnim.state), { timeout: 5000 }).toBe('idle');

    // Editing an already-filled answer to add old regex keywords does NOT raise completeness or jump.
    await page.evaluate(() => {
      const set = lumiAnim.set.bind(lumiAnim);
      window.__sets = [];
      lumiAnim.set = (s) => { window.__sets.push(s); return set(s); };
      state.found.challenge.text = '产品经理反对，担心不可信。';
      render();
    });
    expect(await page.evaluate(() => ruleAudit().total)).toBe(5);
    expect(await page.evaluate(() => window.__sets)).not.toContain('jump');

    // Filling the previously empty stake question raises completeness 5 -> 6 and triggers jump.
    await page.click('[data-action="focus:stake"]');
    await page.fill('#guideText', '客户每周要等三天才能看到结论。');
    await page.press('#guideText', 'Enter');
    await expect.poll(() => page.evaluate(() => ruleAudit().total)).toBe(6);
    expect(await page.evaluate(() => window.__sets)).toContain('jump');
    expect(errors).toEqual([]);
  });

  test('signal checks only decision and challenge for first-person "我"/"I"', async ({ page }) => {
    await openWithKeys(page, ['claude']);
    const check = (values, signalDim) => page.evaluate(([v, sig]) => {
      const dims = [
        { id: 'tension', score: 0, quote: '', reason: '' },
        { id: 'decision', score: 0, quote: '', reason: '' },
        { id: 'pivot', score: 0, quote: '', reason: '' },
        sig,
        { id: 'afterlife', score: 0, quote: '', reason: '' },
      ];
      return checkScore({ dims }, v).signal;
    }, [values, signalDim]);

    const garbageValues = Object.fromEntries(Object.entries(GARBAGE_FOUND).map(([k, v]) => [k, v.text]));
    // "我发现了。" is in reframe, NOT decision/challenge -> quote fails -> 0.
    expect(await check(garbageValues, { id: 'signal', score: 2, quote: '我发现了。', reason: '' })).toBe(0);
    // "代价很大" is in decision, but neither decision nor challenge has "我"/"I" -> capped at 1.
    expect(await check(garbageValues, { id: 'signal', score: 2, quote: '代价很大', reason: '' })).toBe(1);

    // Neither decision nor challenge has an answer, even though stake has "我" -> 0.
    expect(await check(
      { stake: '我负责这个项目。', reframe: '', challenge: '', decision: '', outcome: '', wisdom: '' },
      { id: 'signal', score: 2, quote: '我负责这个项目', reason: '' },
    )).toBe(0);

    // Only "我们" (no standalone "我") in decision -> capped at 1.
    expect(await check(
      { stake: '', reframe: '', challenge: '研究负责人担心。', decision: '我们选了每一步复核。', outcome: '', wisdom: '' },
      { id: 'signal', score: 2, quote: '我们选了每一步复核', reason: '' },
    )).toBe(1);

    // Good sample: "我" in decision -> 2.
    const goodValues = Object.fromEntries(Object.entries(GOOD_FOUND).map(([k, v]) => [k, v.text]));
    expect(await check(goodValues, { id: 'signal', score: 2, quote: '我选了每一步让研究员复核，没有做全自动', reason: '' })).toBe(2);

    // English "I" in challenge -> 2.
    expect(await check(
      { stake: '', reframe: '', challenge: 'I pushed back on skipping user testing.', decision: '', outcome: '', wisdom: '' },
      { id: 'signal', score: 2, quote: 'I pushed back on skipping user testing', reason: '' },
    )).toBe(2);
  });

  test('with Claude key: quality score comes only from score-story with verified quotes, and disappears if key is disconnected', async ({ page }) => {
    const { errors } = await openWithKeys(page, ['claude']);
    await seedFound(page, GARBAGE_FOUND);

    // Before Next review: completeness only, never 10/10.
    await expect(page.locator('.sc-label')).toHaveText('完整度');
    await expect(page.locator('.sc-num')).toHaveText('6/6');
    await expect(page.locator('.sc-note')).toHaveText('只看完整度。点「下一步」后 Lumi 会评内容');

    // Mock review-answers + score-story on Next:
    // Even if model tries to give garbage sample high scores, unquoted dims drop to 0 and signal from reframe drops to 0.
    await page.route(CLAUDE, (route) => {
      const body = route.request().postDataJSON();
      if (body.system.includes('followups')) {
        return fulfillClaude(route, { followups: [{ id: 'challenge', question: '具体是谁担心什么？' }] });
      }
      return fulfillClaude(route, {
        dims: [
          { id: 'tension', score: 1, quote: '客户很担心。', reason: '只说担心，没说谁和为什么。' },
          { id: 'decision', score: 1, quote: '代价很大。', reason: '没说放弃了什么。' },
          { id: 'pivot', score: 0, quote: '', reason: '没写前后对比。' },
          { id: 'signal', score: 2, quote: '我发现了。', reason: '引用来自 reframe，应被校验清零。' },
          { id: 'afterlife', score: 1, quote: '有反馈。', reason: '没有具体数字或教训。' },
        ],
      });
    });

    await page.click('#footer [data-action="next"]');
    await expect.poll(() => page.evaluate(() => !!state.claudeScore)).toBe(true);

    // Garbage sample scores 3/10 (tension 1 + decision 1 + pivot 0 + signal 0 + afterlife 1).
    await expect(page.locator('.sc-label')).toHaveText('内容质量分');
    await expect(page.locator('.sc-num')).toContainText('3/10');
    expect(await page.evaluate(() => state.claudeScore.dims)).toEqual({
      tension: 1, decision: 1, pivot: 0, signal: 0, afterlife: 1,
    });

    // Step 5 also shows Claude content quality score.
    await page.click('#sidebar [data-page="publish"]');
    await expect(page.locator('.dl-preview .dl-score strong')).toHaveText('内容质量分 3/10');

    // If Claude key is disconnected, quality score is no longer shown.
    await page.evaluate(() => { state.keys.claude = ''; state.providerStatus.claude = 'disconnected'; render(); });
    await expect(page.locator('.dl-preview .dl-score strong')).toHaveText('完整度 6/6');
    await expect(page.locator('.dl-preview .dl-score p')).toContainText('接上 key 才能评内容');

    await page.click('#sidebar [data-page="story"]');
    await expect(page.locator('.sc-label')).toHaveText('完整度');
    await expect(page.locator('.sc-num')).toHaveText('6/6');
    await expect(page.locator('.sc-note')).toHaveText('接上 key 才能评内容');
    expect(errors).toEqual([]);
  });

  test('score-story prompt scopes signal to decision and challenge', async ({ page }) => {
    await openApp(page);
    const promptText = await page.locator('#prompt-score-story').textContent();
    expect(promptText).toContain('`signal`, from `decision` and `challenge`');
    expect(promptText).not.toContain('`signal`, from all answers');
  });
});
