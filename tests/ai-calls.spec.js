// @ts-check
// Task 14: the page calls Claude, OpenAI and Gemini straight from the browser.
// Every provider is mocked with page routes and every other request is blocked by
// openApp, so no real key or network call is used. Keys are FAKE-… markers.
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

const ROOT = path.resolve(__dirname, '..');
const prompt = (id) => fs.readFileSync(path.join(ROOT, 'prompts', id + '.md'), 'utf8').trim();
const example = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, 'prompts', 'examples', id + '.json'), 'utf8'));

const KEYS = {
  claude: 'FAKE-CLAUDE-KEY-FOR-TEST-ONLY',
  openai: 'FAKE-OPENAI-KEY-FOR-TEST-ONLY',
  gemini: 'FAKE-GEMINI-KEY-FOR-TEST-ONLY',
};
const CLAUDE = 'https://api.anthropic.com/v1/messages';
const OPENAI = 'https://api.openai.com/v1/images/edits';
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models/**';
// OpenAI's "edited" image: a marker, so the test can tell it from the upload.
const EDITED_B64 = Buffer.from('edited-image').toString('base64');
// 1×1 PNG, the uploaded image.
const PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNg+M/wHwAEAQH/7yMK/wAAAABJRU5ErkJggg==';

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

async function openBuild(page, ids) {
  const out = await openWithKeys(page, ids);
  await page.click('[data-action="loadSample"]');
  await page.click('#sidebar [data-page="build"]');
  await expect(page.locator('.page-build')).toBeVisible();
  return out;
}

async function sendOnBuild(page, text) {
  await page.fill('#guideText', text);
  await page.click('#footer [data-action="send"]');
}

/** Claude replies the way the Messages API does with structured output. */
function claudeReplies(page, output, seen = []) {
  return page.route(CLAUDE, (route) => {
    seen.push({ headers: route.request().headers(), body: route.request().postDataJSON() });
    return route.fulfill({ json: { type: 'message', role: 'assistant', content: [{ type: 'text', text: JSON.stringify(output) }], stop_reason: 'end_turn' } });
  });
}

async function uploadImage(page) {
  await page.setInputFiles('#fileInput', { name: 'shot.png', mimeType: 'image/png', buffer: Buffer.from(PNG_B64, 'base64') });
  await expect.poll(() => page.evaluate(() => /^data:image\/png/.test(state.generatedImage || ''))).toBe(true);
}

const slideTitle = (page, i) => page.locator(`#slide-${i} h2`);
const inlineError = (page) => page.locator('.connect-prompt[role="alert"]');

function expectNoKeyIn(logs) {
  for (const key of Object.values(KEYS)) expect(logs.join('\n')).not.toContain(key);
}

test.describe('step 3 send', () => {
  test('a text edit goes to Claude once and updates the slide (example: step3-edit)', async ({ page }) => {
    const ex = example('step3-edit');
    const { errors, logs } = await openBuild(page, ['claude', 'openai']);
    const seen = [];
    let openaiCalls = 0;
    await claudeReplies(page, ex.modelOutput, seen);
    await page.route(OPENAI, (route) => { openaiCalls++; return route.abort(); });
    await sendOnBuild(page, ex.request);
    await expect(slideTitle(page, ex.expect.slide)).toHaveText(ex.expect.title);
    await expect(page.locator('#guideText')).toHaveValue('');
    expect(seen).toHaveLength(1);
    const { headers, body } = seen[0];
    expect(headers['x-api-key']).toBe(KEYS.claude);
    expect(headers['anthropic-version']).toBe('2023-06-01');
    expect(headers['anthropic-dangerous-direct-browser-access']).toBe('true');
    expect(body.model).toBe('claude-opus-5-5');
    expect(body.system).toBe(prompt('step3-edit'));
    expect(body.output_config.format.type).toBe('json_schema');
    const input = JSON.parse(body.messages[0].content);
    expect(input.request).toBe(ex.request);
    expect(input.language).toBe('zh');
    expect(input.slides.length).toBeGreaterThan(0);
    expect(input.skill.id).toBe('case-study-storytelling');
    expect(openaiCalls).toBe(0);
    expectNoKeyIn(logs);
    expect(errors).toEqual([]);
  });

  test('an image request goes to Claude, then OpenAI edits the uploaded image (example: image-edit)', async ({ page }) => {
    const ex = example('image-edit');
    const { errors, logs } = await openBuild(page, ['claude', 'openai']);
    await uploadImage(page);
    await claudeReplies(page, ex.claudeOutput);
    let sent = null;
    await page.route(OPENAI, (route) => {
      sent = { headers: route.request().headers(), body: route.request().postDataBuffer()?.toString('latin1') || '' };
      return route.fulfill({ json: { created: 0, data: [{ b64_json: EDITED_B64 }] } });
    });
    await sendOnBuild(page, ex.request);
    await expect.poll(() => sent !== null).toBe(true);
    expect(sent.headers.authorization).toBe('Bearer ' + KEYS.openai);
    expect(sent.headers['content-type']).toMatch(/^multipart\/form-data/);
    expect(sent.body).toContain('name="model"\r\n\r\ngpt-image-2.5-sunburst');
    // FormData sends line breaks inside a text field as CRLF.
    expect(sent.body).toContain('name="prompt"\r\n\r\n' + ex.expect.promptStartsWith + '\r\n\r\n' + prompt('image-edit'));
    expect(sent.body).toContain('name="image"; filename="image.png"');
    await expect(page.locator('#guideText')).toHaveValue('');
    await expect(inlineError(page)).toHaveCount(0);
    expect(await page.evaluate(() => state.generatedImage)).toBe('data:image/png;base64,' + EDITED_B64);
    expectNoKeyIn(logs);
    expect(errors).toEqual([]);
  });

  // OpenAI removed gpt-image-1 on 2026-10-23 and removes gpt-image-1-mini on 2026-12-01.
  // Any saved image model outside the 2.5 list moves to Sunburst. Only the openai entry is
  // written back: a provider with no saved choice (Claude here) keeps following the default.
  for (const old of ['gpt-image-1', 'gpt-image-1-mini', '', 'dall-e-3', null]) {
    test(`a saved image model ${JSON.stringify(old)} moves to Sunburst; other saved models stay`, async ({ page }) => {
      const errors = await openApp(page, { http: true, storage: { 'lumi-models-v1': JSON.stringify({ gemini: 'gemini-custom', openai: old }) } });
      expect(await page.evaluate(() => state.models)).toMatchObject({ claude: 'claude-opus-5-5', gemini: 'gemini-custom', openai: 'gpt-image-2.5-sunburst' });
      expect(JSON.parse(await page.evaluate(() => localStorage.getItem('lumi-models-v1')))).toEqual({ gemini: 'gemini-custom', openai: 'gpt-image-2.5-sunburst' });
      await page.click('#sidebar [data-page="settings"]');
      const select = page.locator('select[data-model="openai"]');
      await expect(select).toHaveValue('gpt-image-2.5-sunburst');
      await expect(select.locator('option')).toHaveText(['Image 2.5 Sunburst', 'Image 2.5 Flare']);
      expect(errors).toEqual([]);
    });
  }

  test('a saved Claude model is not changed by the image model migration', async ({ page }) => {
    const errors = await openApp(page, { http: true, storage: { 'lumi-models-v1': JSON.stringify({ claude: 'claude-haiku-5-5', openai: 'gpt-image-1' }) } });
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('lumi-models-v1')))).toEqual({ claude: 'claude-haiku-5-5', openai: 'gpt-image-2.5-sunburst' });
    expect(await page.evaluate(() => state.models.claude)).toBe('claude-haiku-5-5');
    expect(errors).toEqual([]);
  });

  test('nothing saved: nothing is written, the default is Sunburst', async ({ page }) => {
    const errors = await openApp(page, { http: true });
    expect(await page.evaluate(() => state.models.openai)).toBe('gpt-image-2.5-sunburst');
    expect(await page.evaluate(() => localStorage.getItem('lumi-models-v1'))).toBeNull();
    expect(errors).toEqual([]);
  });

  test('a saved GPT Image 2.5 Flare stays, and choosing a model in Settings is saved', async ({ page }) => {
    const errors = await openApp(page, { http: true, storage: { 'lumi-models-v1': JSON.stringify({ openai: 'gpt-image-2.5-flare' }) } });
    expect(await page.evaluate(() => state.models.openai)).toBe('gpt-image-2.5-flare');
    await page.click('#sidebar [data-page="settings"]');
    const select = page.locator('select[data-model="openai"]');
    await expect(select).toHaveValue('gpt-image-2.5-flare');
    await select.selectOption('gpt-image-2.5-sunburst');
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('lumi-models-v1')))).toEqual({ openai: 'gpt-image-2.5-sunburst' });
    expect(errors).toEqual([]);
  });

  // Settings writes only the provider the user changed, so the Claude default is never pinned.
  test('changing only the OpenAI model in Settings saves only openai and keeps a saved Gemini model', async ({ page }) => {
    const errors = await openApp(page, { http: true, storage: { 'lumi-models-v1': JSON.stringify({ gemini: 'gemini-custom' }) } });
    await page.click('#sidebar [data-page="settings"]');
    await page.locator('select[data-model="openai"]').selectOption('gpt-image-2.5-flare');
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('lumi-models-v1')))).toEqual({ gemini: 'gemini-custom', openai: 'gpt-image-2.5-flare' });
    expect(errors).toEqual([]);
  });

  test('a corrupt saved model entry does not block saving a Settings choice', async ({ page }) => {
    const errors = await openApp(page, { http: true, storage: { 'lumi-models-v1': '{not json' } });
    await page.click('#sidebar [data-page="settings"]');
    await page.locator('select[data-model="openai"]').selectOption('gpt-image-2.5-flare');
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('lumi-models-v1')))).toEqual({ openai: 'gpt-image-2.5-flare' });
    expect(errors).toEqual([]);
  });

  test('an image request with no image says to upload one, without calling OpenAI', async ({ page }) => {
    const { errors } = await openBuild(page, ['claude', 'openai']);
    await page.evaluate(() => { state.generatedImage = null; });
    await claudeReplies(page, example('image-edit').claudeOutput);
    let openaiCalls = 0;
    await page.route(OPENAI, (route) => { openaiCalls++; return route.abort(); });
    await sendOnBuild(page, '把图里的背景换成深蓝色');
    await expect(inlineError(page)).toContainText('改图要先有图。用左侧加号上传要修改的图片，再发送一次。');
    await expect(page.locator('#guideText')).toHaveValue('把图里的背景换成深蓝色');
    expect(openaiCalls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('an image request without OpenAI shows the inline connect prompt and keeps the text', async ({ page }) => {
    const { errors } = await openBuild(page, ['claude']);
    await claudeReplies(page, example('image-edit').claudeOutput);
    await sendOnBuild(page, '把图里的背景换成深蓝色');
    const connect = page.locator('.connect-prompt');
    await expect(connect).toContainText('这一步要用 OpenAI');
    await expect(page.locator('#guideText')).toHaveValue('把图里的背景换成深蓝色');
    expect(errors).toEqual([]);
  });

  const claudeFailures = [
    ['wrong key', (route) => route.fulfill({ status: 401, json: { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } } }), 'Claude 不认这个密钥。重新复制一个再试。', true],
    ['no credit', (route) => route.fulfill({ status: 400, json: { type: 'error', error: { type: 'invalid_request_error', message: 'Your credit balance is too low to access the Anthropic API.' } } }), 'Claude 账户没有额度了。充值后再试。', true],
    ['network', (route) => route.abort('internetdisconnected'), '连不上 Claude。检查网络后再试。', false],
    ['unusable reply', (route) => route.fulfill({ json: { content: [{ type: 'text', text: '{"target":' }], stop_reason: 'max_tokens' } }), 'Claude 这次没有给出结果。再试一次。', false],
    ['unknown target', (route) => route.fulfill({ json: { content: [{ type: 'text', text: JSON.stringify({ target: 'video', reply: '好了', image_instruction: '', slides: [], script: '' }) }], stop_reason: 'end_turn' } }), 'Claude 这次没有给出结果。再试一次。', false],
    ['too many requests', (route) => route.fulfill({ status: 429, json: { type: 'error', error: { type: 'rate_limit_error', message: 'Rate limited' } } }), 'Claude 现在请求太多，或到了用量上限。过一会儿再试。', false],
    ['overloaded', (route) => route.fulfill({ status: 529, json: { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } } }), 'Claude 暂时没有响应。过一会儿再试。', false],
    ['server error', (route) => route.fulfill({ status: 500, json: { type: 'error', error: { type: 'api_error', message: 'Internal server error' } } }), 'Claude 暂时没有响应。过一会儿再试。', false],
  ];
  for (const [name, reply, text, settingsLink] of claudeFailures) {
    test(`Claude failure (${name}) shows one line where the user sent, and keeps the text`, async ({ page }) => {
      const { errors, logs } = await openBuild(page, ['claude', 'openai']);
      const before = await slideTitle(page, 0).innerText();
      await page.route(CLAUDE, reply);
      await sendOnBuild(page, '把第 1 页标题改短一点');
      await expect(inlineError(page)).toContainText(text);
      await expect(inlineError(page).locator('[data-action="connectPrompt:claude"]')).toHaveCount(settingsLink ? 1 : 0);
      await expect(page.locator('#guideText')).toHaveValue('把第 1 页标题改短一点');
      await expect(slideTitle(page, 0)).toHaveText(before);
      expectNoKeyIn(logs);
      expect(errors).toEqual([]);
    });
  }

  test('an OpenAI failure shows its own line and leaves the image as it was', async ({ page }) => {
    const { errors } = await openBuild(page, ['claude', 'openai']);
    await uploadImage(page);
    const before = await page.evaluate(() => state.generatedImage);
    await claudeReplies(page, example('image-edit').claudeOutput);
    await page.route(OPENAI, (route) => route.fulfill({ status: 429, json: { error: { type: 'insufficient_quota', code: 'insufficient_quota', message: 'You exceeded your current quota.' } } }));
    await sendOnBuild(page, '把图里的背景换成深蓝色');
    await expect(inlineError(page)).toContainText('OpenAI 账户没有额度了。充值后再试。');
    expect(await page.evaluate(() => state.generatedImage)).toBe(before);
    expect(errors).toEqual([]);
  });
});

test.describe('step 3 edge cases', () => {
  test('switching language while Claude works still writes into the language the request was sent in', async ({ page }) => {
    const { errors } = await openBuild(page, ['claude']);
    let release;
    const gate = new Promise((r) => { release = r; });
    let sentLanguage = null;
    await page.route(CLAUDE, async (route) => {
      sentLanguage = JSON.parse(route.request().postDataJSON().messages[0].content).language;
      await gate;
      return route.fulfill({ json: { content: [{ type: 'text', text: JSON.stringify({ target: 'text', reply: '我把第 1 页标题改短了。', image_instruction: '', slides: [{ index: 0, title: '中文新标题', body: '中文新正文' }], script: '' }) }], stop_reason: 'end_turn' } });
    });
    await sendOnBuild(page, '把第 1 页标题改短一点');
    await expect.poll(() => sentLanguage).toBe('zh');
    await page.evaluate(() => document.querySelector('[data-action="lang:en"]').click());
    await expect.poll(() => page.evaluate(() => state.lang)).toBe('en');
    const en = await page.evaluate(() => [state.scenes[0].en, state.scenes[0].enp]);
    release();
    await expect.poll(() => page.evaluate(() => state.aiBusy)).toBe(false);
    const after = await page.evaluate(() => ({ zh: state.scenes[0].zh, zhp: state.scenes[0].zhp, en: [state.scenes[0].en, state.scenes[0].enp] }));
    expect(after.zh).toBe('中文新标题');
    expect(after.zhp).toBe('中文新正文');
    expect(after.en).toEqual(en);
    await expect(slideTitle(page, 0)).toHaveText(en[0]);
    expect(errors).toEqual([]);
  });

  const noChange = [
    ['only a reply', { target: 'text', reply: '我把第 1 页标题改短了。', image_instruction: '', slides: [], script: '' }],
    ['indexes out of range or empty titles', { target: 'text', reply: '我把第 1 页标题改短了。', image_instruction: '', slides: [{ index: 99, title: '新标题', body: '' }, { index: -1, title: '新标题', body: '' }, { index: 0, title: '  ', body: '新正文' }], script: '' }],
  ];
  for (const [name, output] of noChange) {
    test(`a valid reply that changes nothing (${name}) says so and keeps the text`, async ({ page }) => {
      const { errors } = await openBuild(page, ['claude']);
      const before = await page.evaluate(() => JSON.stringify(state.scenes));
      await claudeReplies(page, output);
      await sendOnBuild(page, '把第 1 页标题改短一点');
      await expect(inlineError(page)).toContainText('这次没有改动。换个说法再试一次。');
      await expect(page.locator('#toast')).not.toContainText('我把第 1 页标题改短了');
      await expect(page.locator('#guideText')).toHaveValue('把第 1 页标题改短一点');
      expect(await page.evaluate(() => JSON.stringify(state.scenes))).toBe(before);
      expect(errors).toEqual([]);
    });
  }

  test('a request that never answers times out, says so, and lets the user send again', async ({ page }) => {
    await page.clock.install();
    const { errors } = await openBuild(page, ['claude']);
    await page.route(CLAUDE, () => {}); // never answers
    await sendOnBuild(page, '把第 1 页标题改短一点');
    await expect.poll(() => page.evaluate(() => state.aiBusy)).toBe(true);
    await page.clock.fastForward('09:59');
    expect(await page.evaluate(() => state.aiBusy)).toBe(true);
    await page.clock.fastForward('00:02');
    await expect(inlineError(page)).toContainText('Claude 暂时没有响应。过一会儿再试。');
    await expect(page.locator('#guideText')).toHaveValue('把第 1 页标题改短一点');
    expect(await page.evaluate(() => state.aiBusy)).toBe(false);
    await page.unroute(CLAUDE);
    const ex = example('step3-edit');
    await claudeReplies(page, ex.modelOutput);
    await page.click('#footer [data-action="send"]');
    await expect(slideTitle(page, ex.expect.slide)).toHaveText(ex.expect.title);
    expect(errors).toEqual([]);
  });

  test('markup in what Claude returns is shown as text on every page, never run', async ({ page }) => {
    const { errors } = await openBuild(page, ['claude']);
    const probe = (where) => `<img src="x" onerror="window.__xss=(window.__xss||0)+1">${where}`;
    await claudeReplies(page, { target: 'text', reply: probe('reply'), image_instruction: '', slides: [{ index: 0, title: probe('title'), body: probe('body') }], script: probe('script') });
    await sendOnBuild(page, '把第 1 页标题改短一点');
    await expect(slideTitle(page, 0)).toContainText('<img');
    for (const p of ['build', 'story', 'defend', 'publish', 'talk']) {
      await page.evaluate((p) => go(p), p);
      await page.waitForTimeout(100);
    }
    expect(await page.evaluate(() => document.querySelectorAll('img[src="x"]').length)).toBe(0);
    expect(await page.evaluate(() => window.__xss || 0)).toBe(0);
    expect(errors).toEqual([]);
  });
});

/** Fake microphone: getUserMedia and MediaRecorder hand back a tiny "recording". */
function fakeMic(page, { speech }) {
  return page.addInitScript((speech) => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } });
    window.MediaRecorder = class {
      constructor() { this.state = 'inactive'; this.mimeType = 'audio/webm;codecs=opus'; }
      static isTypeSupported() { return true; }
      start() { this.state = 'recording'; }
      stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(['fake-audio'], { type: this.mimeType }) }); this.onstop?.(); }
    };
    if (speech) {
      window.__speechStarted = 0;
      window.webkitSpeechRecognition = class { start() { window.__speechStarted++; this.onstart?.(); } stop() { this.onend?.(); } };
      window.SpeechRecognition = window.webkitSpeechRecognition;
    } else {
      window.webkitSpeechRecognition = undefined;
      window.SpeechRecognition = undefined;
    }
  }, speech);
}

async function startMic(page) {
  await page.click('#footer [data-action="mic"]');
  await page.click('#modal [data-action="startMic"]');
}

test.describe('microphone', () => {
  test('with Gemini, the recording is transcribed by Gemini into the box (example: transcribe)', async ({ page }) => {
    const ex = example('transcribe');
    await fakeMic(page, { speech: true });
    const { errors, logs } = await openWithKeys(page, ['claude', 'gemini']);
    let sent = null;
    await page.route(GEMINI, (route) => {
      sent = { url: route.request().url(), headers: route.request().headers(), body: route.request().postDataJSON() };
      return route.fulfill({ json: { candidates: [{ content: { role: 'model', parts: [{ text: ex.modelOutput }] } }] } });
    });
    await startMic(page);
    await page.click('#footer [data-action="stopMic"]');
    await expect(page.locator('#guideText')).toHaveValue(ex.expect.inputBox);
    expect(sent.url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent');
    expect(sent.headers['x-goog-api-key']).toBe(KEYS.gemini);
    const [text, audio] = sent.body.contents[0].parts;
    expect(text.text).toBe(prompt('transcribe'));
    expect(audio.inlineData.mimeType).toBe('audio/webm');
    expect(Buffer.from(audio.inlineData.data, 'base64').toString()).toBe('fake-audio');
    expect(await page.evaluate(() => window.__speechStarted)).toBe(0);
    expectNoKeyIn(logs);
    expect(errors).toEqual([]);
  });

  test('a Gemini failure shows one line on the page', async ({ page }) => {
    await fakeMic(page, { speech: true });
    const { errors } = await openWithKeys(page, ['claude', 'gemini']);
    await page.route(GEMINI, (route) => route.fulfill({ status: 400, json: { error: { code: 400, status: 'INVALID_ARGUMENT', message: 'API key not valid.', details: [{ reason: 'API_KEY_INVALID' }] } } }));
    await startMic(page);
    await page.click('#footer [data-action="stopMic"]');
    await expect(inlineError(page)).toContainText('Gemini 不认这个密钥。重新复制一个再试。');
    await expect(inlineError(page).locator('[data-action="connectPrompt:gemini"]')).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('without Gemini, browser speech is used and the page says Gemini is more accurate', async ({ page }) => {
    await fakeMic(page, { speech: true });
    const { errors } = await openWithKeys(page, ['claude']);
    let geminiCalls = 0;
    await page.route(GEMINI, (route) => { geminiCalls++; return route.abort(); });
    await startMic(page);
    const tip = page.locator('.connect-prompt.tip');
    await expect(tip).toContainText('正在用浏览器自带的识别。连上 Gemini 识别更准。');
    await expect(tip.locator('[data-action="connectPrompt:gemini"]')).toHaveCount(1);
    expect(await page.evaluate(() => window.__speechStarted)).toBe(1);
    expect(geminiCalls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('without Gemini or browser speech (Firefox), the page asks to connect Gemini', async ({ page }) => {
    await fakeMic(page, { speech: false });
    const { errors } = await openWithKeys(page, ['claude']);
    await startMic(page);
    const connect = page.locator('.connect-prompt');
    await expect(connect).toContainText('这一步要用 Gemini，现在还没连接。');
    await connect.locator('[data-action="connectPrompt:gemini"]').click();
    await expect(page.locator('#key-gemini')).toBeFocused();
    expect(errors).toEqual([]);
  });
});
