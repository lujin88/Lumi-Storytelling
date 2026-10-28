const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = path.join(__dirname, 'renders');
const APP = `file://${path.join(ROOT, 'index.html')}`;
const THEME_D = fs.readFileSync(path.join(__dirname, 'theme-d.css'), 'utf8');

const viewports = [
  { width: 390, height: 844 },
  { width: 1512, height: 900 },
  { width: 1905, height: 900 },
];

const pages = [
  { label: '第 1 步 · 收集素材', slug: 'step-1', target: 'dump' },
  { label: '第 2 步 · 找到故事', slug: 'step-2', target: 'story' },
  { label: '第 3 步 · 页面和讲稿', slug: 'step-3', target: 'build' },
  { label: '第 5 步 · 下载文件', slug: 'step-5', target: 'publish' },
  { label: '设置', slug: 'settings', target: 'settings' },
];

const layerTokens = ['base', 'rail', 'paper', 'surface', 'elevated'];
const semanticChecks = [
  { label: 'Primary button text', foreground: 'base', background: 'ink', threshold: 4.5, kind: 'normal text' },
  { label: 'Selected / focus icon', foreground: 'blue', background: 'soft', threshold: 3, kind: 'icon / focus' },
  { label: 'Information text / icon', foreground: 'info', background: 'soft', threshold: 4.5, kind: 'normal text' },
  { label: 'Supported status', foreground: 'ok', background: 'elevated', threshold: 4.5, kind: 'normal text' },
  { label: 'Stated status', foreground: 'warn', background: 'elevated', threshold: 4.5, kind: 'normal text' },
  { label: 'Missing status', foreground: 'danger', background: 'elevated', threshold: 4.5, kind: 'normal text' },
];

function parseHex(hex) {
  const value = hex.trim().replace('#', '').slice(0, 6);
  return [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16));
}

function luminance(hex) {
  return parseHex(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

async function openState(page, { target, theme }) {
  await page.goto(APP);
  await page.evaluate((isDark) => document.documentElement.classList.toggle('dark', isDark), theme === 'dark');
  if (theme === 'dark') await page.addStyleTag({ content: THEME_D });
  if (target !== 'dump') {
    await page.evaluate(() => {
      loadSample();
      document.querySelector('.toast')?.remove();
    });
    await page.evaluate((next) => go(next), target);
  }
  await page.evaluate(() => document.querySelector('.toast')?.remove());
  await page.locator('#content h1').waitFor({ state: 'visible' });
  await page.waitForTimeout(120);
}

async function capture(browser) {
  fs.mkdirSync(OUT, { recursive: true });
  const checks = [];
  const files = {};
  let computedTokens = null;

  for (const viewport of viewports) {
    files[viewport.width] = { light: [], dark: [] };
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport });
      await context.route(/^https?:/, (route) => route.abort());
      const page = await context.newPage();
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));

      for (const entry of pages) {
        await openState(page, { target: entry.target, theme });
        const file = path.join(OUT, `${theme === 'dark' ? 'd-dark' : 'light-baseline'}-${viewport.width}-${entry.slug}.png`);
        await page.screenshot({ path: file, animations: 'disabled' });
        files[viewport.width][theme].push({ ...entry, file });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        checks.push({ theme, page: entry.slug, width: viewport.width, overflow, errors: [...errors] });
        if (overflow > 0) throw new Error(`${theme} ${entry.slug} ${viewport.width}: ${overflow}px horizontal overflow`);
        if (errors.length) throw new Error(`${theme} ${entry.slug} ${viewport.width}: ${errors.join('; ')}`);

        if (!computedTokens && theme === 'dark') {
          computedTokens = await page.evaluate(() => {
            const style = getComputedStyle(document.documentElement);
            const names = ['base', 'rail', 'paper', 'surface', 'elevated', 'line', 'ink', 'muted', 'blue', 'soft', 'info', 'ok', 'warn', 'danger'];
            return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(`--${name}`).trim()]));
          });
        }
      }
      await context.close();
    }
  }
  return { checks, files, computedTokens };
}

function contrastTable(tokens) {
  const rows = [];
  for (const background of layerTokens) {
    for (const foreground of ['ink', 'muted']) {
      rows.push({
        label: `${foreground === 'ink' ? 'Primary' : 'Secondary'} text on ${background}`,
        foreground,
        background,
        kind: 'normal text',
        threshold: 4.5,
      });
    }
    rows.push({
      label: `Essential boundary on ${background}`,
      foreground: 'line',
      background,
      kind: 'component boundary / icon',
      threshold: 3,
    });
  }
  rows.push(...semanticChecks);
  return rows.map((row) => {
    const ratio = contrast(tokens[row.foreground], tokens[row.background]);
    return {
      ...row,
      foregroundHex: tokens[row.foreground],
      backgroundHex: tokens[row.background],
      ratio: Number(ratio.toFixed(2)),
      pass: ratio >= row.threshold,
    };
  });
}

async function makeSheet(browser, width, grouped) {
  const context = await browser.newContext({ viewport: { width: 1720, height: 1000 } });
  const page = await context.newPage();
  const rows = pages.map((entry, index) => {
    const light = grouped.light[index];
    const dark = grouped.dark[index];
    const image = (file) => fs.readFileSync(file).toString('base64');
    return `<section><h2>${entry.label}</h2><div class="pair">
      <figure><figcaption>浅色基线 · 未改动</figcaption><img src="data:image/png;base64,${image(light.file)}"></figure>
      <figure><figcaption>D 暮色书库 · 台面 / 光晕 · Lumi 100%</figcaption><img src="data:image/png;base64,${image(dark.file)}"></figure>
    </div></section>`;
  }).join('');
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;padding:40px 48px 64px;background:#171513;color:#f5f0eb;font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    header{display:flex;align-items:end;justify-content:space-between;gap:24px;padding-bottom:24px;border-bottom:1px solid #665d58}h1{margin:0;font-size:32px}header p{margin:0;color:#c7bdb6}
    section{margin-top:32px}h2{margin:0 0 12px;font-size:18px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0;padding:12px;border:1px solid #665d58;border-radius:12px;background:#211e1d}figcaption{margin-bottom:9px;color:#e5ddd7;font-size:13px;font-weight:650}img{display:block;width:100%;height:auto;border-radius:7px;background:#111}
  </style><header><div><h1>D · 暮色书库</h1><p>浅色保持原样；深色使用五层暖灰与 Lumi 台面 / 光晕</p></div><p>${width}px · 第 1 / 2 / 3 / 5 步 + 设置</p></header>${rows}`);
  const file = path.join(OUT, `review-d-${width}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await context.close();
  return file;
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const result = await capture(browser);
    const contrast = contrastTable(result.computedTokens);
    const failed = contrast.filter((row) => !row.pass);
    if (failed.length) throw new Error(`WCAG failures: ${failed.map((row) => row.label).join(', ')}`);
    const sheets = [];
    for (const viewport of viewports) sheets.push(await makeSheet(browser, viewport.width, result.files[viewport.width]));
    fs.writeFileSync(path.join(__dirname, 'CHECKS.json'), `${JSON.stringify({
      source: { app: 'index.html', theme: 'theme-d.css' },
      captures: result.checks,
      tokens: result.computedTokens,
      contrast,
      sheets: sheets.map((file) => path.relative(__dirname, file)),
    }, null, 2)}\n`);
  } finally {
    await browser.close();
  }
})();
