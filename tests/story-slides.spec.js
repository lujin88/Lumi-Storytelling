// @ts-check
// Row 10: Lumi ② Six cards -> causal story + speaker script.
// Covers:
// 1. Causal slide order: stake -> challenge -> reframe -> decision -> outcome -> wisdom;
//    challenge question asks what the lowest point looked like.
// 2. Without key: every answered slide in the sample project has bullet points and a title <= 20 chars
//    (<= 10 English words); comma-split fallback avoids fragments (< 6 Chinese chars or < 3 English words
//    falls back to clipping the full sentence).
// 3. Without key: neutral causal transitions ("但是难的地方在于：" / "所以我当时的判断是：" / ...) without
//    jumping to conclusions for the user; missing adjacent material marks the transition [待补] / [Needed].
// 4. With key: Claude, OpenAI and Gemini all draft step 3 slides & script via story-slides; numbers not in
//    step 2 answers are replaced with [待补] / [Needed] by guardNumbers.
// 5. Pages edited by the user on step 3 are never overwritten when leaving and re-entering step 3,
//    and are only rebuilt when the user clicks "按最新回答重建" (Rebuild from answers).
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { KEYS, CLAUDE, openApp, openWithKeys, fulfillClaude } = require('./helpers');

const ROOT = path.resolve(__dirname, '..');
const prompt = (id) => fs.readFileSync(path.join(ROOT, 'prompts', id + '.md'), 'utf8').trim();
const example = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, 'prompts', 'examples', id + '.json'), 'utf8'));

const OPENAI_CHAT = 'https://api.openai.com/v1/chat/completions';
const GEMINI_GEN = 'https://generativelanguage.googleapis.com/v1beta/models/**';

test.describe('without key: causal order, <=20-char titles, points, and neutral transitions', () => {
  test('sample project builds 6 slides in causal order, every slide has points, and every title is <=20 chars', async ({ page }) => {
    const errors = await openApp(page);
    await page.click('[data-action="loadSample"]');
    await page.evaluate(() => { state.slidesDrafted = null; slidesTried = null; });
    await page.click('#sidebar [data-page="build"]');
    await expect(page.locator('.page-build')).toBeVisible();

    const scenes = await page.evaluate(() => getScenes().map((s, i) => ({
      job: s.job,
      title: s.zh,
      titleLen: s.zh.length,
      points: deckPoints(s),
      bridge: slideBridge(s, i),
      say: sayText(s, i),
    })));

    expect(scenes.map((s) => s.job)).toEqual(['stake', 'challenge', 'reframe', 'decision', 'outcome', 'wisdom']);
    for (const s of scenes) {
      expect(s.titleLen, `title "${s.title}" should be <= 20 chars`).toBeLessThanOrEqual(20);
      expect(s.titleLen, `title "${s.title}" should not be a tiny fragment`).toBeGreaterThanOrEqual(6);
      expect(s.points.length, `slide ${s.job} should have bullet points`).toBeGreaterThan(0);
    }

    // Neutral transitions on slides 2..6 (index 1..5), never presumptuous phrases
    const script = await page.evaluate(() => scriptText());
    expect(script).toContain('但是难的地方在于：');
    expect(script).toContain('所以我当时的判断是：');
    expect(script).toContain('因此我的做法是：');
    expect(script).toContain('所以最后的结果是：');
    expect(script).toContain('所以回头看，我记住的一点是：');
    expect(script).not.toContain('遇到了阻力');
    expect(script).not.toContain('真正的问题是');

    // Full script mode shows the connected spoken lines with causal transitions
    await page.click('[data-action="scriptMode:full"]');
    const says = await page.locator('#content .deck-say').allInnerTexts();
    expect(says).toHaveLength(6);
    expect(says[1]).toMatch(/^但是难的地方在于：/);
    expect(says[2]).toMatch(/^所以我当时的判断是：/);
    expect(says[3]).toMatch(/^因此我的做法是：/);
    expect(says[4]).toMatch(/^所以最后的结果是：/);
    expect(says[5]).toMatch(/^所以回头看，我记住的一点是：/);

    // Challenge question on step 2 asks what the lowest point looked like
    const challengeQ = await page.evaluate(() => FOUNDATION.find((f) => f.id === 'challenge').q);
    expect(challengeQ[0]).toContain('最糟的时候是什么样');
    expect(challengeQ[1]).toContain('lowest point');
    expect(errors).toEqual([]);
  });

  test('comma-split title fallback never produces <6-char fragments and clips the full sentence instead', async ({ page }) => {
    await openApp(page);
    const check = (sentence, lang) => page.evaluate(([s, l]) => ruleSlideTitle(s, l), [sentence, lang]);

    // First clause is only 4 chars ("研究反对") -> falls back to clipping the full sentence to 20 chars
    const shortClause = await check('研究反对，他担心 AI 生成的结论完全不可信而且客户会当场质疑。', 'zh');
    expect(shortClause).not.toBe('研究反对');
    expect(shortClause.length).toBe(20);
    expect(shortClause).toBe('研究反对，他担心 AI 生成的结论完全…');

    // First clause is 10 chars (between 6 and 20) -> uses the clean first clause
    const goodClause = await check('研究负责人当时明确反对，他担心 AI 生成的结论不可信。', 'zh');
    expect(goodClause).toBe('研究负责人当时明确反对');

    // English: first clause has only 2 words ("They objected") -> falls back to 10-word clip
    const enShort = await check('They objected, because nobody trusted automated findings in front of enterprise clients.', 'en');
    expect(enShort).not.toBe('They objected');
    expect(enShort.split(/\s+/).length).toBeLessThanOrEqual(10);

    // Unanswered adjacent slide marks the transition as [待补]
    const missingBridge = await page.evaluate(() => {
      state.found = { stake: { text: '客户每周要等三天才能看到研究结论。' } };
      state.scenes = null;
      const sc = getScenes();
      return [slideBridge(sc[1], 1, sc, 'zh'), sayText(sc[1], 1)];
    });
    expect(missingBridge[0]).toBe('[待补]');
    expect(missingBridge[1]).toContain('[待补]');
  });
});

test.describe('with key: all three providers draft slides & script and guard numbers', () => {
  test('Claude drafts causal slides & script and guardNumbers replaces invented 90% with [待补] (example: story-slides)', async ({ page }) => {
    const ex = example('story-slides');
    const { errors, logs } = await openWithKeys(page, ['claude']);
    const seen = [];
    await page.route(CLAUDE, (route) => {
      const body = route.request().postDataJSON();
      if (body.system !== prompt('story-slides')) return route.abort();
      seen.push({ headers: route.request().headers(), body, input: JSON.parse(body.messages[0].content) });
      return fulfillClaude(route, ex.modelOutput);
    });

    await page.click('[data-action="loadSample"]');
    await page.evaluate(() => { state.slidesDrafted = null; slidesTried = null; });
    await page.click('#sidebar [data-page="build"]');
    await expect.poll(() => page.evaluate(() => state.slidesDrafted !== null)).toBe(true);

    expect(seen).toHaveLength(1);
    expect(seen[0].input.answers.map((a) => a.id)).toEqual(ex.expect.order);

    const outcome = await page.evaluate(() => {
      const s = getScenes().find((x) => x.job === 'outcome');
      return { title: s.zh, points: deckPoints(s), say: sayText(s, 4) };
    });
    expect(outcome.title).toBe('四周试点从三天缩到四小时');
    expect(outcome.points).toEqual(ex.expect.outcomePoints);
    expect(outcome.say).toBe(ex.expect.outcomeSay);
    expect(logs.join('\n')).not.toContain(KEYS.claude);
    expect(errors).toEqual([]);
  });

  test('OpenAI and Gemini each draft step 3 slides & script when connected', async ({ page }) => {
    const ex = example('story-slides');

    // 1. OpenAI only
    await openWithKeys(page, ['openai']);
    let openaiCalls = 0;
    await page.route(OPENAI_CHAT, (route) => {
      openaiCalls++;
      const body = route.request().postDataJSON();
      expect(body.messages[0].content).toBe(prompt('story-slides'));
      return route.fulfill({ json: { choices: [{ message: { content: JSON.stringify(ex.modelOutput) } }] } });
    });
    await page.click('[data-action="loadSample"]');
    await page.evaluate(() => { state.slidesDrafted = null; slidesTried = null; });
    await page.click('#sidebar [data-page="build"]');
    await expect.poll(() => openaiCalls).toBe(1);
    await expect(page.locator('#content .deck-title').first()).toHaveText(ex.modelOutput.slides[0].title);

    // 2. Gemini only
    await page.evaluate(() => {
      state.keys = { claude: '', openai: '', gemini: 'FAKE-GEMINI-KEY-FOR-TEST-ONLY' };
      state.providerStatus = { claude: 'disconnected', openai: 'disconnected', gemini: 'connected' };
      state.scenes = null;
      state.slidesDrafted = null;
      slidesTried = null;
    });
    let geminiCalls = 0;
    await page.route(GEMINI_GEN, (route) => {
      geminiCalls++;
      const body = route.request().postDataJSON();
      expect(body.systemInstruction.parts[0].text).toBe(prompt('story-slides'));
      return route.fulfill({ json: { candidates: [{ content: { parts: [{ text: JSON.stringify(ex.modelOutput) }] } }] } });
    });
    await page.click('#sidebar [data-page="story"]');
    await page.click('#sidebar [data-page="build"]');
    await expect.poll(() => geminiCalls).toBe(1);
    await expect(page.locator('#content .deck-title').nth(4)).toHaveText('四周试点从三天缩到四小时');
  });

  test('slides edited by the user on step 3 are never overwritten on re-entry, and rebuild only on Rebuild from answers', async ({ page }) => {
    const ex = example('story-slides');
    const { errors } = await openWithKeys(page, ['claude']);
    let calls = 0;
    await page.route(CLAUDE, (route) => {
      const body = route.request().postDataJSON();
      if (body.system !== prompt('story-slides')) return route.abort();
      calls++;
      return fulfillClaude(route, ex.modelOutput);
    });

    // Enter step 3 before AI runs (simulate user editing slide 0 while offline/before draft)
    await page.click('[data-action="loadSample"]');
    await page.evaluate(() => {
      state.slidesDrafted = null;
      slidesTried = null;
      const sc = getScenes();
      sc[0].zh = '我自己手改的第 1 页标题';
      sc[0].userEdited = true;
    });
    await page.click('#sidebar [data-page="build"]');
    await expect.poll(() => calls).toBe(1);
    await expect.poll(() => page.evaluate(() => getScenes()[1].zh)).toBe(ex.modelOutput.slides[1].title);

    // Slide 0 was userEdited, so AI draft did NOT overwrite it; slide 1 was not edited, so it got the AI draft
    expect(await page.evaluate(() => getScenes()[0].zh)).toBe('我自己手改的第 1 页标题');

    // Now user edits slide 1 on step 3, leaves step 3, and comes back: no new call, and slide 1 stays as edited
    const title1 = page.locator('#content .deck-title').nth(1);
    await title1.evaluate((el) => { el.innerText = '手改的第 2 页标题'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.click('#sidebar [data-page="story"]');
    await page.click('#sidebar [data-page="build"]');
    expect(calls).toBe(1);
    expect(await page.evaluate(() => [getScenes()[0].zh, getScenes()[1].zh])).toEqual(['我自己手改的第 1 页标题', '手改的第 2 页标题']);

    // When a step 2 answer changes, mapStale banner appears on step 3; clicking "按最新回答重建" rebuilds all slides
    await page.evaluate(() => {
      state.found.stake.text = '客户每周要等三天才能看到研究结论，三个大客户推迟了续约。';
      state.mapStale = true;
      render();
    });
    await expect(page.locator('#content [data-action="rebuildMap"]')).toBeVisible();
    await page.click('#content [data-action="rebuildMap"]');
    await expect.poll(() => calls).toBe(2);
    await expect.poll(() => page.evaluate(() => getScenes()[0].zh)).toBe(ex.modelOutput.slides[0].title);
    expect(errors).toEqual([]);
  });
});
