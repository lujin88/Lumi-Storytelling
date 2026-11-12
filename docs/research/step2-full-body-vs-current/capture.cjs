const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = path.join(__dirname, 'renders');
const APP = `file://${path.join(ROOT, 'index.html')}`;
const CANDIDATE = fs.readFileSync(path.join(__dirname, 'candidate.css'), 'utf8');
const THEME_D = fs.readFileSync(path.join(__dirname, 'theme-d.css'), 'utf8');

const viewports = [
  { width: 390, height: 844 },
  { width: 1512, height: 900 },
  { width: 1905, height: 900 },
];

function applyCandidate() {
  const fullBodyStage = () => {
    const stage = document.createElement('div');
    stage.className = 'step2-lumi-stage';
    stage.setAttribute('aria-hidden', 'true');
    stage.innerHTML = '<img src="assets/lumi/source/standing.webp" alt="">';
    return stage;
  };
  const story = document.querySelector('#content .page-story');
  if (!story) throw new Error('Step 2 page not found');
  story.classList.add('step2-full-body');

  if (innerWidth <= 720) {
    story.classList.add('step2-mobile');
    const firstPart = story.querySelector(':scope > .part-head');
    if (!firstPart) throw new Error('Step 2 first part heading not found');
    firstPart.classList.add('step2-lumi-part');
    firstPart.append(fullBodyStage());
    return;
  }

  const score = story.querySelector(':scope > .score-card');
  if (innerWidth < 1200) {
    story.classList.add('step2-compact');
    const heading = story.querySelector(':scope > .heading');
    const strip = document.createElement('div');
    strip.className = 'step2-coach-strip';
    strip.append(score, fullBodyStage());
    heading.after(strip);
    return;
  }

  story.classList.add('step2-rail');
  const copy = document.createElement('div');
  const rail = document.createElement('aside');
  copy.className = 'step2-story-copy';
  rail.className = 'step2-coach-rail';
  rail.setAttribute('aria-label', 'Lumi coaching rail');
  [...story.children].filter((child) => child !== score).forEach((child) => copy.append(child));
  rail.append(score, fullBodyStage());
  story.append(copy, rail);
}

async function openState(page, { theme, variant }) {
  await page.goto(APP);
  await page.evaluate((isDark) => document.documentElement.classList.toggle('dark', isDark), theme === 'dark');
  if (theme === 'dark') await page.addStyleTag({ content: THEME_D });
  await page.evaluate(() => {
    loadSample();
    go('story');
    document.querySelector('.toast')?.remove();
  });
  if (variant === 'full-body') {
    await page.addStyleTag({ content: CANDIDATE });
    await page.evaluate(applyCandidate);
  }
  await page.evaluate(() => document.querySelector('.toast')?.remove());
  await page.locator('#content h1').waitFor({ state: 'visible' });
  await page.waitForTimeout(120);
}

async function capture(browser) {
  fs.mkdirSync(OUT, { recursive: true });
  const checks = [];
  const files = {};

  for (const viewport of viewports) {
    files[viewport.width] = {};
    for (const theme of ['light', 'dark']) {
      files[viewport.width][theme] = {};
      for (const variant of ['current', 'full-body']) {
        const context = await browser.newContext({ viewport });
        await context.route(/^https?:/, (route) => route.abort());
        const page = await context.newPage();
        await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await openState(page, { theme, variant });
        const file = path.join(OUT, `${variant}-${theme}-${viewport.width}.png`);
        await page.screenshot({ path: file, animations: 'disabled' });
        files[viewport.width][theme][variant] = file;

        const metrics = await page.evaluate(() => {
          const rect = (selector) => {
            const el = document.querySelector(selector);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return Object.fromEntries(['x', 'y', 'width', 'height', 'right', 'bottom'].map((key) => [key, Number(r[key].toFixed(1))]));
          };
          return {
            overflow: document.documentElement.scrollWidth - innerWidth,
            page: rect('#content .page-story'),
            copy: rect('#content .step2-story-copy'),
            score: rect('#content .score-card'),
            stage: rect('#content .step2-lumi-stage'),
            firstRow: rect('#content .foundation-item'),
            mobilePart: (() => {
              const el = document.querySelector('#content .step2-lumi-part');
              const stage = el?.querySelector('.step2-lumi-stage');
              if (!el || !stage) return null;
              const partStyle = getComputedStyle(el);
              const stageStyle = getComputedStyle(stage);
              return {
                className: el.className,
                display: partStyle.display,
                columns: partStyle.gridTemplateColumns,
                stageColumn: stageStyle.gridColumn,
              };
            })(),
          };
        });
        checks.push({ width: viewport.width, theme, variant, ...metrics, errors: [...errors] });
        if (metrics.overflow > 0) throw new Error(`${variant} ${theme} ${viewport.width}: ${metrics.overflow}px horizontal overflow`);
        if (errors.length) throw new Error(`${variant} ${theme} ${viewport.width}: ${errors.join('; ')}`);
        await context.close();
      }
    }
  }
  return { checks, files };
}

async function makeSheet(browser, width, grouped) {
  const context = await browser.newContext({ viewport: { width: 1800, height: 1000 } });
  const page = await context.newPage();
  const image = (file) => fs.readFileSync(file).toString('base64');
  const rows = ['light', 'dark'].map((theme) => `
    <section>
      <h2>${theme === 'light' ? '浅色' : 'D · 暮色书库'}</h2>
      <div class="pair">
        <figure><figcaption>现状 · StoryScore 小脸</figcaption><img src="data:image/png;base64,${image(grouped[theme].current)}"></figure>
        <figure><figcaption>全身 Lumi · StoryScore + 教练栏</figcaption><img src="data:image/png;base64,${image(grouped[theme]['full-body'])}"></figure>
      </div>
    </section>`).join('');
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;padding:40px 48px 64px;background:#171513;color:#f5f0eb;font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    header{display:flex;align-items:end;justify-content:space-between;gap:24px;padding-bottom:24px;border-bottom:1px solid #665d58}h1{margin:0;font-size:32px}header p{margin:0;color:#c7bdb6}
    section{margin-top:32px}h2{margin:0 0 12px;font-size:18px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0;padding:12px;border:1px solid #665d58;border-radius:12px;background:#211e1d}figcaption{margin-bottom:9px;color:#e5ddd7;font-size:13px;font-weight:650}img{display:block;width:100%;height:auto;border-radius:7px;background:#111}
  </style><header><div><h1>第 2 步 · 全身 Lumi vs 现状</h1><p>同一内容、同一主题，只比较 Lumi 的角色尺度与版面关系</p></div><p>${width}px · 浅色 / D 暮色书库</p></header>${rows}`);
  const file = path.join(OUT, `review-step2-${width}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await context.close();
  return file;
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const result = await capture(browser);
    const sheets = [];
    for (const viewport of viewports) sheets.push(await makeSheet(browser, viewport.width, result.files[viewport.width]));
    fs.writeFileSync(path.join(__dirname, 'CHECKS.json'), `${JSON.stringify({
      source: {
        app: 'index.html',
        currentMain: true,
        selectedDarkTheme: 'theme-d.css',
        candidate: 'candidate.css',
        lumi: 'assets/lumi/source/standing.webp',
      },
      captures: result.checks,
      sheets: sheets.map((file) => path.relative(__dirname, file)),
    }, null, 2)}\n`);
  } finally {
    await browser.close();
  }
})();
