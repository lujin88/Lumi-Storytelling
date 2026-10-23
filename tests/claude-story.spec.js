// @ts-check
// Task 15: Claude drafts the step 2 answers, reviews and scores them on Next, and drafts the
// step 4 answers. Claude is mocked with streamed replies and every other request is blocked,
// so no real key or network call is used.
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { KEYS, CLAUDE, openWithKeys, fillStepOne, storyScore, fulfillClaude } = require('./helpers');

const ROOT = path.resolve(__dirname, '..');
const prompt = (id) => fs.readFileSync(path.join(ROOT, 'prompts', id + '.md'), 'utf8').trim();
const example = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, 'prompts', 'examples', id + '.json'), 'utf8'));

/** Answer each Claude call by its system prompt; `outputs` maps prompt id to the reply. */
function claudeByPrompt(page, outputs, seen = []) {
  return page.route(CLAUDE, (route) => {
    const body = route.request().postDataJSON();
    const id = Object.keys(outputs).find((k) => body.system === prompt(k));
    seen.push({ id, body, headers: route.request().headers(), input: JSON.parse(body.messages[0].content) });
    return id ? fulfillClaude(route, outputs[id]) : route.abort();
  });
}

const rows = (page) => page.evaluate(() => Object.fromEntries(FOUNDATION.map((f) => [f.id, foundationValue(f)])));
const busyLine = (page) => page.locator('#footer #aiStatus');

async function openSample(page, ids = ['claude']) {
  const out = await openWithKeys(page, ids);
  await page.click('[data-action="loadSample"]');
  return out;
}

test.describe('step 2 drafts', () => {
  test('Claude drafts from the notes; a quote not in the notes is dropped (example: draft-answers)', async ({ page }) => {
    const ex = example('draft-answers');
    const { errors, logs } = await openWithKeys(page, ['claude']);
    const seen = [];
    await claudeByPrompt(page, { 'draft-answers': ex.modelOutput }, seen);
    await fillStepOne(page, ex.notes);
    await page.click('#footer [data-action="next"]');
    await expect.poll(async () => (await rows(page)).stake.text).toBe(ex.expect.drafted.stake);
    const r = await rows(page);
    for (const [id, text] of Object.entries(ex.expect.drafted)) expect(r[id]).toEqual({ text, src: 'brief' });
    for (const id of ex.expect.missing) expect(r[id]).toEqual({ text: '', src: 'missing' });
    await expect(page.locator('.foundation-item').first().locator('.f-status')).toHaveText('初稿');
    expect(seen).toHaveLength(1);
    const { body, headers, input } = seen[0];
    expect(headers['x-api-key']).toBe(KEYS.claude);
    expect(body.stream).toBe(true);
    expect(body.output_config.format.type).toBe('json_schema');
    expect(input.notes).toBe(ex.notes);
    expect(input.questions.map((q) => q.id)).toEqual(['stake', 'reframe', 'challenge', 'decision', 'outcome', 'wisdom']);
    // Drafts are kept for these notes: coming back doesn't call Claude again.
    await page.click('#sidebar [data-page="dump"]');
    await page.click('#sidebar [data-page="story"]');
    expect(seen).toHaveLength(1);
    expect(logs.join('\n')).not.toContain(KEYS.claude);
    expect(errors).toEqual([]);
  });

  test('a quote matches across whitespace and full-/half-width punctuation, and only then', async ({ page }) => {
    await openWithKeys(page, ['claude']);
    const notes = '研究负责人反对，他担心 AI 写的结论客户不信。以前要花三天：资料散落在「Notion」里。';
    const check = (quote) => page.evaluate(([q, n]) => quoted(q, n), [quote, notes]);
    expect(await check('研究负责人反对, 他担心AI写的结论客户不信.')).toBe(true);
    expect(await check('以前要花三天:资料散落在"Notion"里')).toBe(true);
    expect(await check('研究负责人同意，他担心 AI 写的结论客户不信。')).toBe(false);
    expect(await check('以前要花两天')).toBe(false);
    expect(await check('')).toBe(false);
  });

  test('without Claude, step 2 keeps the rule draft and makes no call', async ({ page }) => {
    const ex = example('draft-answers');
    await openWithKeys(page, []);
    let calls = 0;
    await page.route(CLAUDE, (route) => { calls++; return route.abort(); });
    await fillStepOne(page, ex.notes);
    await page.click('#footer [data-action="next"]');
    await expect(page.locator('.page-story')).toBeVisible();
    expect((await rows(page)).challenge.text).toBe('研究负责人反对，他担心 AI 写的结论客户不信。');
    expect(calls).toBe(0);
  });

  test('a failed draft shows one line on step 2 and keeps the rule draft', async ({ page }) => {
    const ex = example('draft-answers');
    const { errors } = await openWithKeys(page, ['claude']);
    await page.route(CLAUDE, (route) => route.fulfill({ status: 529, json: { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } } }));
    await fillStepOne(page, ex.notes);
    await page.click('#footer [data-action="next"]');
    await expect(page.locator('.connect-prompt[role="alert"]')).toContainText('Claude 暂时没有响应。过一会儿再试。');
    expect((await rows(page)).challenge.src).toBe('brief');
    expect(errors).toEqual([]);
  });
});

test.describe('step 2 review and score', () => {
  test('Next asks Claude for follow-ups and a score (examples: review-answers, score-story)', async ({ page }) => {
    const rv = example('review-answers'), sc = example('score-story');
    const { errors } = await openSample(page);
    await page.click('#sidebar [data-page="story"]');
    expect(await storyScore(page)).toBe(sc.expect.ruleTotal);
    const seen = [];
    await claudeByPrompt(page, { 'review-answers': rv.modelOutput, 'score-story': sc.modelOutput }, seen);
    await page.click('#footer [data-action="next"]');
    await expect.poll(() => page.evaluate(() => state.followups.map(({ parent, q }) => ({ parent, q })))).toEqual(rv.expect.followups);
    expect(seen.map((x) => x.id).sort()).toEqual(['review-answers', 'score-story']);
    for (const { body, input } of seen) {
      expect(body.stream).toBe(true);
      expect(input.answers).toHaveLength(6);
      expect(input.answers[0]).toEqual({ id: 'stake', question: expect.any(String), answer: expect.stringContaining('三天') });
    }
    // The follow-up is open, so the user stays on step 2 with it focused.
    await expect(page.locator('.page-story')).toBeVisible();
    expect(await page.evaluate(() => state.focus)).toBe('fu0');
    expect(await page.evaluate(() => state.claudeScore.dims)).toEqual(sc.expect.dims);
    expect(await storyScore(page)).toBe(sc.expect.total);
    // The answers themselves are untouched.
    expect(await page.evaluate(() => state.found.outcome.text)).toBe('试点四周后，从三天缩短到四小时；研究团队开始复用我们的模板。');
    // Once the text changes, the card falls back to the rule score until the next review.
    await page.evaluate(() => { state.found.wisdom.text += ' 下次我会先找反对的人聊。'; render(); });
    expect(await storyScore(page)).toBe(await page.evaluate(() => ruleAudit().total));
    expect(seen).toHaveLength(2);
    expect(errors).toEqual([]);
  });

  test('a dimension with nothing written scores 0 whatever Claude says; scores are whole numbers 0–2', async ({ page }) => {
    await openWithKeys(page, ['claude']);
    const values = { stake: '客户要等三天。', reframe: '', challenge: '', decision: '我放弃了全自动。', outcome: '', wisdom: '' };
    const dims = (list) => page.evaluate(([out, v]) => checkScore(out, v), [{ dims: list }, values]);
    const all = (score, quote) => ['tension', 'decision', 'pivot', 'signal', 'afterlife'].map((id) => ({ id, score, quote, reason: '' }));
    expect(await dims(all(2, '我放弃了全自动'))).toEqual({ tension: 0, decision: 2, pivot: 0, signal: 2, afterlife: 0 });
    expect(await dims(all(-3, '我放弃了全自动'))).toEqual({ tension: 0, decision: 0, pivot: 0, signal: 0, afterlife: 0 });
    expect(await dims(all(1.6, '我放弃了全自动'))).toEqual({ tension: 0, decision: 2, pivot: 0, signal: 2, afterlife: 0 });
    // A score with a quote that isn't in the answers is 0.
    expect(await dims(all(2, '我们提前两周上线'))).toEqual({ tension: 0, decision: 0, pivot: 0, signal: 0, afterlife: 0 });
    // A reply missing a dimension is not used at all.
    expect(await dims(all(2, '我放弃了全自动').slice(1))).toBeNull();
  });

  test('Lumi does not jump when the card switches from the rule score to a higher Claude score', async ({ page }) => {
    await openSample(page);
    await page.click('#sidebar [data-page="story"]');
    await page.evaluate(() => { state.found.challenge.text = '这件事很难，推进很慢。'; render(); });
    const rule = await storyScore(page);
    expect(rule).toBe(9);
    await expect.poll(() => page.evaluate(() => lumiAnim.state), { timeout: 5000 }).toBe('idle');
    await page.evaluate(() => { const set = lumiAnim.set.bind(lumiAnim); window.__sets = []; lumiAnim.set = (s) => { window.__sets.push(s); return set(s); }; });
    const dims = [['tension', '这件事很难'], ['decision', '代价是比纯自动慢一些'], ['pivot', '其实是步骤之间没人负责交接'], ['signal', '我放弃了全自动生成'], ['afterlife', '从三天缩短到四小时']].map(([id, quote]) => ({ id, score: 2, quote, reason: '' }));
    await claudeByPrompt(page, { 'review-answers': { followups: [{ id: 'challenge', question: '具体是谁觉得难？' }] }, 'score-story': { dims } });
    await page.click('#footer [data-action="next"]');
    await expect.poll(() => storyScore(page)).toBe(10);
    expect(await page.evaluate(() => window.__sets)).not.toContain('jump');
  });

  test('if the Claude review fails, the rules review and the error shows on step 2', async ({ page }) => {
    const { errors } = await openSample(page);
    await page.click('#sidebar [data-page="story"]');
    await page.evaluate(() => { state.found.challenge.text = '这件事很难，推进很慢。'; render(); });
    await page.route(CLAUDE, (route) => route.abort('internetdisconnected'));
    await page.click('#footer [data-action="next"]');
    await expect(page.locator('.connect-prompt[role="alert"]')).toContainText('连不上 Claude。检查网络后再试。');
    // Same follow-ups the rules give without Claude.
    await expect.poll(() => page.evaluate(() => state.followups.map((x) => x.parent))).toContain('challenge');
    expect(await page.evaluate(() => state.followups.map(({ parent, q }) => ({ parent, q })))).toEqual(await page.evaluate(() => ruleFollowups()));
    expect(await page.evaluate(() => state.claudeScore)).toBeNull();
    expect(errors).toEqual([]);
  });
});

test.describe('step 4 drafts', () => {
  test('Claude drafts from step 2; a number not in step 2 becomes [待补] (example: draft-defend)', async ({ page }) => {
    const ex = example('draft-defend');
    const { errors } = await openSample(page);
    const seen = [];
    await claudeByPrompt(page, { 'draft-defend': ex.modelOutput }, seen);
    await page.click('#sidebar [data-page="defend"]');
    await expect.poll(() => page.evaluate(() => state.defend[4])).toBe(ex.expect.answers['4']);
    expect(await page.evaluate(() => state.defend[0])).toBe(ex.expect.answers['0']);
    // Questions Claude didn't answer get the rule draft (the step 2 answer).
    expect(await page.evaluate(() => state.defend[2])).toBe(await page.evaluate(() => state.found.challenge.text));
    expect(await page.evaluate(() => [0, 4].map((i) => state.defIsDraft[i]))).toEqual([true, true]);
    await expect(page.locator('.q-card[data-def="4"] .def-ans')).toContainText('效率提升了 [待补]%');
    expect(seen).toHaveLength(1);
    const { body, input } = seen[0];
    expect(body.stream).toBe(true);
    expect(input.language).toBe('zh');
    expect(input.questions.map((q) => q.index)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(input.questions[4]).toEqual({ index: 4, question: expect.any(String), evidence: 'stated', answer: expect.stringContaining('四小时') });
    expect(input.story.map((x) => x.id)).toEqual(['stake', 'reframe', 'challenge', 'decision', 'outcome', 'wisdom']);
    expect(errors).toEqual([]);
  });

  test('the number check keeps numbers from step 2 and replaces the rest', async ({ page }) => {
    await openWithKeys(page, []);
    const source = '试点四周后，从三天缩短到四小时；两个大客户推迟了续约。覆盖 12 个项目，提升 3.5 倍。';
    const guard = (text, L = 'zh') => page.evaluate(([x, s, l]) => guardNumbers(x, s, l), [text, source, L]);
    expect(await guard('从三天缩短到四小时，覆盖 12 个项目。')).toBe('从三天缩短到四小时，覆盖 12 个项目。');
    expect(await guard('从三天缩短到两小时，覆盖 15 个项目，提升 3.5 倍。')).toBe('从三天缩短到[待补]，覆盖 [待补] 个项目，提升 3.5 倍。');
    expect(await guard('覆盖 １２ 个项目')).toBe('覆盖 １２ 个项目');
    expect(await guard('Saved 40% of the time.', 'en')).toBe('Saved [Needed]% of the time.');
  });
});

test.describe('busy line and cancel', () => {
  test('the busy line names the request, can be cancelled from the keyboard, and a late reply writes nothing', async ({ page }) => {
    const { errors } = await openSample(page);
    await page.click('#sidebar [data-page="build"]');
    const before = await page.locator('#slide-0 h2').innerText();
    let pending = null;
    await page.route(CLAUDE, (route) => { pending = route; });
    await page.fill('#guideText', '把第 1 页标题改短一点');
    await page.click('#footer [data-action="send"]');
    await expect(busyLine(page)).toContainText('Lumi 正在改你的页面和讲稿…');
    await expect(busyLine(page)).toHaveAttribute('aria-live', 'polite');
    const cancel = busyLine(page).getByRole('button', { name: '取消' });
    await expect(cancel).toBeVisible();
    // Appearing doesn't take focus; the cancel link is reachable and works from the keyboard.
    expect(await page.evaluate(() => document.activeElement?.dataset.action)).not.toBe('cancelAi');
    await cancel.focus();
    await page.keyboard.press('Enter');
    await expect(busyLine(page)).toContainText('已取消，没有改动。');
    await expect(busyLine(page).getByRole('button')).toHaveCount(0);
    await expect(page.locator('#guideText')).toHaveValue('把第 1 页标题改短一点');
    expect(await page.evaluate(() => state.aiBusy)).toBe(false);
    // The reply arrives after the cancel: nothing is written.
    await expect.poll(() => pending !== null).toBe(true);
    await fulfillClaude(pending, example('step3-edit').modelOutput).catch(() => {});
    await page.waitForTimeout(300);
    await expect(page.locator('#slide-0 h2')).toHaveText(before);
    expect(await page.evaluate(() => state.answers.some((x) => x.startsWith('[build]')))).toBe(false);
    await expect(page.locator('.connect-prompt[role="alert"]')).toHaveCount(0);
    // Sending again works.
    await page.unroute(CLAUDE);
    await claudeByPrompt(page, { 'step3-edit': example('step3-edit').modelOutput });
    await page.click('#footer [data-action="send"]');
    await expect(page.locator('#slide-0 h2')).toHaveText(example('step3-edit').expect.title);
    await expect(busyLine(page)).toBeEmpty();
    expect(errors).toEqual([]);
  });

  test('step 2 answers can still be sent while Claude drafts', async ({ page }) => {
    const ex = example('draft-answers');
    const { errors } = await openWithKeys(page, ['claude']);
    await page.route(CLAUDE, () => {}); // never answers
    await fillStepOne(page, ex.notes);
    await page.click('#footer [data-action="next"]');
    await expect(busyLine(page)).toContainText('Lumi 正在起草你的回答…');
    await page.fill('#guideText', '我自己定了先做研究员确认这一步。');
    await page.click('#footer [data-action="send"]');
    await expect.poll(() => page.evaluate(() => Object.values(state.found).map((x) => x.text))).toContain('我自己定了先做研究员确认这一步。');
    await expect(busyLine(page)).toContainText('Lumi 正在起草你的回答…');
    expect(errors).toEqual([]);
  });

  test('a step 2 draft cancelled before Claude answers writes nothing and leaves the rule draft', async ({ page }) => {
    const ex = example('draft-answers');
    const { errors } = await openWithKeys(page, ['claude']);
    let pending = null;
    await page.route(CLAUDE, (route) => { pending = route; });
    await fillStepOne(page, ex.notes);
    await page.click('#footer [data-action="next"]');
    await expect(busyLine(page)).toContainText('Lumi 正在起草你的回答…');
    // The busy line doesn't move focus from the page title.
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('H1');
    await busyLine(page).getByRole('button', { name: '取消' }).click();
    await expect(busyLine(page)).toContainText('已取消，没有改动。');
    await expect(busyLine(page).getByRole('button')).toHaveCount(0);
    await expect.poll(() => pending !== null).toBe(true);
    await fulfillClaude(pending, ex.modelOutput).catch(() => {});
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => state.drafted)).toBeNull();
    expect((await rows(page)).challenge.text).toBe('研究负责人反对，他担心 AI 写的结论客户不信。');
    expect(errors).toEqual([]);
  });

  test('the busy text follows the request: review on step 2, drafting on step 4', async ({ page }) => {
    await openSample(page);
    await page.route(CLAUDE, () => {}); // never answers
    await page.click('#sidebar [data-page="story"]');
    await page.click('#footer [data-action="next"]');
    await expect(busyLine(page)).toContainText('Lumi 正在看你的故事…');
    await busyLine(page).getByRole('button', { name: '取消' }).click();
    await page.click('#sidebar [data-page="defend"]');
    await expect(busyLine(page)).toContainText('Lumi 正在起草追问的回答…');
    await page.click('[data-action="lang:en"]');
    await expect(busyLine(page)).toContainText('Lumi is drafting your follow-up answers…');
  });

  test('with reduced motion the busy icon does not spin', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openSample(page);
    await page.route(CLAUDE, () => {});
    await page.click('#sidebar [data-page="story"]');
    await page.click('#footer [data-action="next"]');
    await expect(busyLine(page).locator('.ai-spin')).toHaveCSS('animation-name', 'none');
  });

  test('without reduced motion the busy icon spins', async ({ page }) => {
    await openSample(page);
    await page.route(CLAUDE, () => {});
    await page.click('#sidebar [data-page="story"]');
    await page.click('#footer [data-action="next"]');
    await expect(busyLine(page).locator('.ai-spin')).toHaveCSS('animation-name', 'aiSpin');
  });
});

test('a streamed reply split across chunks is joined before it is parsed', async ({ page }) => {
  await openWithKeys(page, []);
  const out = await page.evaluate(async () => {
    const text = JSON.stringify({ ok: '三天变四小时' });
    const sse = `event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: text.slice(0, 7) } })}\n\nevent: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: text.slice(7) } })}\n\nevent: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}\n\n`;
    const bytes = new TextEncoder().encode(sse), cuts = [5, 31, 60, 61, 62, bytes.length];
    let at = 0;
    const body = new ReadableStream({ pull(c) { const end = cuts.shift(); if (end === undefined) return c.close(); c.enqueue(bytes.slice(at, end)); at = end; } });
    const r = await readClaudeStream('claude', new Response(body, { headers: { 'content-type': 'text/event-stream' } }));
    return { text: r.content[0].text, stop: r.stop_reason };
  });
  expect(JSON.parse(out.text)).toEqual({ ok: '三天变四小时' });
  expect(out.stop).toBe('end_turn');
});
