const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = __dirname;
const APP = `file://${path.join(ROOT, 'index.html')}`;
const pages = [
  ['step-1', 'dump'],
  ['step-2', 'story'],
  ['step-3', 'build'],
  ['step-5', 'publish'],
  ['settings', 'settings'],
];

function rgb(value) {
  const match = value.match(/[\d.]+/g);
  if (!match) throw new Error(`Cannot parse color: ${value}`);
  return match.slice(0, 3).map(Number);
}

function luminance(value) {
  const [r, g, b] = rgb(value).map((channel) => {
    const v = channel / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function computed(page, selector) {
  return page.locator(selector).first().evaluate((element) => {
    const style = getComputedStyle(element);
    let background = style.backgroundColor;
    let ancestor = element.parentElement;
    while ((background === 'rgba(0, 0, 0, 0)' || background === 'transparent') && ancestor) {
      background = getComputedStyle(ancestor).backgroundColor;
      ancestor = ancestor.parentElement;
    }
    return {
      color: style.color,
      background,
      border: style.borderColor,
      opacity: style.opacity,
    };
  });
}

async function addTheme(page, css) {
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  if (css) await page.addStyleTag({ content: css });
  await page.evaluate(() => document.documentElement.dataset.capture = 'dark-direction');
}

async function openPage(page, css, appPage) {
  await page.goto(APP);
  await addTheme(page, css);
  if (appPage !== 'dump') {
    await page.evaluate(() => {
      loadSample();
      document.querySelector('.toast')?.remove();
    });
    await page.evaluate((target) => go(target), appPage);
    await addTheme(page, css);
    await page.evaluate(() => document.querySelector('.toast')?.remove());
  }
  await page.locator('#content h1').waitFor({ state: 'visible' });
}

async function makeSheet(browser, direction, width, captures) {
  const context = await browser.newContext({ viewport: { width: 1540, height: 900 } });
  const page = await context.newPage();
  const label = direction === 'A'
    ? 'A · Night Paper / 夜间纸张'
    : direction === 'B'
      ? 'B · Blueprint / 蓝图工作台'
      : 'Before · current dark mode / 当前深色模式';
  const body = captures.map(({ name, file }) => `
    <figure>
      <figcaption>${name}</figcaption>
      <img src="data:image/png;base64,${fs.readFileSync(file).toString('base64')}">
    </figure>`).join('');
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;padding:48px;background:#0c1117;color:#f3f6f8;font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    header{display:flex;align-items:end;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid #435061}
    h1{margin:0;font-size:30px;font-weight:650}p{margin:0;color:#aeb9c5}
    main{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}
    figure{margin:0;padding:14px;background:#141b24;border:1px solid #435061;border-radius:10px}
    figcaption{margin:0 0 10px;font-size:14px;font-weight:650;color:#dce5ee}
    img{display:block;width:100%;height:auto;border-radius:6px;background:#111}
    .mobile img{width:390px;max-width:100%;margin:auto}
  </style><header><h1>${label}</h1><p>current main · ${width}px · Step 1 / 2 / 3 / 5 / Settings</p></header><main class="${width === 390 ? 'mobile' : ''}">${body}</main>`);
  await page.screenshot({ path: path.join(OUT, `direction-${direction.toLowerCase()}-${width}.png`), fullPage: true });
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const checks = [];
  try {
    for (const direction of ['current', 'A', 'B']) {
      const css = direction === 'current'
        ? ''
        : fs.readFileSync(path.join(OUT, `theme-${direction.toLowerCase()}.css`), 'utf8');
      for (const width of [1905, 390]) {
        const height = width === 390 ? 844 : 900;
        const context = await browser.newContext({ viewport: { width, height } });
        await context.route(/^https?:/, (route) => route.abort());
        const page = await context.newPage();
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        const captures = [];
        for (const [name, appPage] of pages) {
          await openPage(page, css, appPage);
          if (appPage === 'build') {
            await page.locator('.deck-title').first().hover();
          }
          const file = path.join(OUT, `${direction.toLowerCase()}-${width}-${name}.png`);
          await page.screenshot({ path: file, animations: 'disabled' });
          captures.push({ name, file });
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
          if (overflow > 0) throw new Error(`${direction} ${width} ${name} overflow: ${overflow}px`);
          checks.push({ direction, width, page: name, overflow, errors: [...errors] });
        }

        if (direction !== 'current') {
          await openPage(page, css, 'dump');
          const connect = await computed(page, '.first-run .secondary');
          await openPage(page, css, 'build');
          await page.locator('.deck-title').first().hover();
          const titleHover = await computed(page, '.deck-title');
          const thumbnailTitle = await computed(page, '.deck-row:nth-child(2) .slide h2');
          const muted = await computed(page, '.section-count');
          checks.push({
            direction,
            width,
            measured: {
              connectButton: { ...connect, contrast: ratio(connect.color, connect.background) },
              deckTitleHover: { ...titleHover, contrast: ratio(titleHover.color, titleHover.background) },
              thumbnailTitle: { ...thumbnailTitle, contrast: ratio(thumbnailTitle.color, thumbnailTitle.background) },
              mutedText: { ...muted, contrast: ratio(muted.color, muted.background) },
            },
          });
        }
        await makeSheet(browser, direction, width, captures);
        await context.close();
      }
    }
    fs.writeFileSync(path.join(OUT, 'CHECKS.json'), `${JSON.stringify(checks, null, 2)}\n`);
  } finally {
    await browser.close();
  }
})();
