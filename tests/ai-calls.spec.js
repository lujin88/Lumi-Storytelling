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
    expect(sent.body).toContain('name="model"\r\n\r\ngpt-image-1');
    // FormData sends line breaks inside a text field as CRLF.
    expect(sent.body).toContain('name="prompt"\r\n\r\n' + ex.expect.promptStartsWith + '\r\n\r\n' + prompt('image-edit'));
    expect(sent.body).toContain('name="image"; filename="image.png"');
    await expect(page.locator('#guideText')).toHaveValue('');
    await expect(inlineError(page)).toHaveCount(0);
    expect(await page.evaluate(() => state.generatedImage)).toBe('data:image/png;base64,' + EDITED_B64);
    expectNoKeyIn(logs);
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
