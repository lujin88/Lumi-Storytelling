const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = __dirname;
const APP = `file://${path.join(ROOT, 'index.html')}`;
const WIDTH = 1905;
const HEIGHT = 900;
const pages = [
  ['第 1 步 · 收集素材', 'step-1', 'dump'],
  ['第 2 步 · 找到故事', 'step-2', 'story'],
  ['第 5 步 · 下载文件', 'step-5', 'publish'],
];

const directions = {
  C: {
    name: '暖纸工作台 / Warm Folio',
    idea: 'Sana 式亮一层的纸面承载故事；细纹与顶部高光让 flat 仍有触感。',
    refs: 'Sana AI · Remote · Apple base/elevated',
    dim: 'brightness 83% · saturation 92%',
    palette: [
      ['环境底', '#1E1A17'],
      ['侧栏', '#25211D'],
      ['故事纸面', '#2B2621'],
      ['卡片', '#342E27'],
      ['弹窗', '#3B342D'],
    ],
  },
  D: {
    name: '暮色书库 / Dusk Library',
    idea: 'Higgsfield 式多平面分层；内容成为带顶部高光的前景面板。',
    refs: 'Higgsfield · Linear · Apple base/elevated',
    dim: 'brightness 80% · saturation 90%',
    palette: [
      ['环境底', '#211E1D'],
      ['侧栏', '#292523'],
      ['内容底', '#302B29'],
      ['前景面板', '#393330'],
      ['卡片 / 弹窗', '#433C38'],
    ],
  },
};

const treatmentCss = {
  C: {
    stage: `
      html.dark #content .intro-art,
      html.dark #content .dl-stage { position: relative; isolation: isolate; }
      html.dark #content .intro-art::before,
      html.dark #content .dl-stage::before {
        content: ""; position: absolute; z-index: -1; left: 50%; bottom: 4%;
        width: 116%; height: 42%; transform: translateX(-50%); border-radius: 50%;
        background: radial-gradient(ellipse at center, #c69b6742 0 30%, #8c70502b 52%, transparent 74%);
        border-bottom: 1px solid #c6aa8740;
      }
      html.dark #content .sc-ring { border-radius: 50%; background: radial-gradient(circle, #7d674b70, #44382f 72%); }
      html.dark #content img[data-lumi], html.dark #content video[data-lumi-video] {
        filter: drop-shadow(0 18px 24px #00000038) !important;
      }
    `,
    dim: `
      html.dark #content img[data-lumi], html.dark #content video[data-lumi-video] {
        filter: brightness(.83) saturate(.92) contrast(.98) drop-shadow(0 16px 22px #00000030) !important;
      }
    `,
  },
  D: {
    stage: `
      html.dark #content .intro-art,
      html.dark #content .dl-stage { position: relative; isolation: isolate; }
      html.dark #content .intro-art::before,
      html.dark #content .dl-stage::before {
        content: ""; position: absolute; z-index: -1; left: 50%; bottom: 3%;
        width: 112%; height: 34%; transform: translateX(-50%); border-radius: 50%;
        background: linear-gradient(180deg, #d5bfae24, transparent 46%), #51484270;
        border-top: 1px solid #d8c7ba52; box-shadow: 0 18px 32px #00000030;
      }
      html.dark #content .sc-ring { border-radius: 50%; background: #514842; box-shadow: inset 0 1px #ffffff24; }
      html.dark #content img[data-lumi], html.dark #content video[data-lumi-video] {
        filter: drop-shadow(0 18px 24px #00000042) !important;
      }
    `,
    dim: `
      html.dark #content img[data-lumi], html.dark #content video[data-lumi-video] {
        filter: brightness(.80) saturate(.90) contrast(.98) drop-shadow(0 16px 22px #00000034) !important;
      }
    `,
  },
};

function rgb(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16));
}

function luminance(hex) {
  return rgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

async function openPage(page, theme, treatment, target) {
  await page.goto(APP);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.addStyleTag({ content: theme });
  await page.addStyleTag({ content: treatment });
  if (target !== 'dump') {
    await page.evaluate(() => {
      loadSample();
      document.querySelector('.toast')?.remove();
    });
    await page.evaluate((next) => go(next), target);
    await page.evaluate(() => document.querySelector('.toast')?.remove());
  }
  await page.locator('#content h1').waitFor({ state: 'visible' });
  await page.waitForTimeout(80);
}

async function captureDirection(browser, direction) {
  const theme = fs.readFileSync(path.join(OUT, `theme-${direction.toLowerCase()}.css`), 'utf8');
  const captures = { stage: [], dim: [] };
  const checks = [];

  for (const treatment of ['stage', 'dim']) {
    const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
    await context.route(/^https?:/, (route) => route.abort());
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
    for (const [label, slug, target] of pages) {
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await openPage(page, theme, treatmentCss[direction][treatment], target);
      const file = path.join(OUT, `${direction.toLowerCase()}-${treatment}-${slug}.png`);
      await page.screenshot({ path: file, animations: 'disabled' });
      captures[treatment].push({ label, file });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      checks.push({ direction, treatment, page: slug, width: WIDTH, overflow, errors });
      if (overflow > 0) throw new Error(`${direction} ${treatment} ${slug}: ${overflow}px horizontal overflow`);
      if (errors.length) throw new Error(`${direction} ${treatment} ${slug}: ${errors.join('; ')}`);
    }
    await context.close();
  }
  return { captures, checks };
}

async function makeSheet(browser, direction, captures) {
  const meta = directions[direction];
  const context = await browser.newContext({ viewport: { width: 1680, height: 1000 } });
  const page = await context.newPage();
  const rows = pages.map(([label], index) => {
    const stage = captures.stage[index];
    const dim = captures.dim[index];
    return `<section>
      <h2>${label}</h2>
      <div class="pair">
        <figure><figcaption>台面 / 光晕 · Lumi 素材 100%</figcaption><img src="data:image/png;base64,${fs.readFileSync(stage.file).toString('base64')}"></figure>
        <figure><figcaption>压暗 · ${meta.dim}</figcaption><img src="data:image/png;base64,${fs.readFileSync(dim.file).toString('base64')}"></figure>
      </div>
    </section>`;
  }).join('');
  const chips = meta.palette.map(([label, color], index) => `<div class="chip"><i style="background:${color}"></i><span>${index + 1}. ${label}<b>${color}</b></span></div>`).join('');
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;padding:42px 48px 60px;background:#141210;color:#f5efe8;font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    header{display:grid;grid-template-columns:116px minmax(0,1fr);gap:26px;padding-bottom:28px;border-bottom:1px solid #625950}
    .letter{width:104px;height:104px;display:grid;place-items:center;border:1px solid #8f8174;border-radius:20px;background:#211e1b;font-size:72px;font-weight:750;line-height:1}
    h1{margin:2px 0 8px;font-size:34px;line-height:1.15}header p{margin:0;color:#cabfb5;font-size:16px}.refs{margin-top:6px!important;font-size:13px!important;color:#9f9389!important}
    .palette{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}.chip{display:flex;align-items:center;gap:8px;padding:7px 10px 7px 7px;border:1px solid #4f4841;border-radius:9px;background:#1d1a18}.chip i{width:28px;height:28px;border-radius:6px;border:1px solid #ffffff1c}.chip span{font-size:12px;color:#cfc5bc}.chip b{display:block;color:#f5efe8;font-weight:600;font-variant-numeric:tabular-nums}
    section{margin-top:34px}h2{margin:0 0 12px;font-size:19px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0;padding:12px;border:1px solid #4e4741;border-radius:12px;background:#1d1a18;box-shadow:0 18px 40px #0005}figcaption{margin:0 0 9px;color:#ded4cb;font-size:13px;font-weight:650}img{display:block;width:100%;height:auto;border-radius:7px;background:#111}
  </style><header><div class="letter">${direction}</div><div><h1>${meta.name}</h1><p>${meta.idea}</p><p class="refs">参考机制：${meta.refs}</p><div class="palette">${chips}</div></div></header>${rows}`);
  await page.screenshot({ path: path.join(OUT, `direction-${direction.toLowerCase()}-1905.png`), fullPage: true });
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const allChecks = [];
  try {
    for (const direction of Object.keys(directions)) {
      const result = await captureDirection(browser, direction);
      allChecks.push(...result.checks);
      await makeSheet(browser, direction, result.captures);
    }
    const contrast = Object.fromEntries(Object.entries(directions).map(([key, value]) => [key, {
      primaryOnBase: ratio('#F4EEE6', value.palette[0][1]),
      mutedOnPaper: ratio(key === 'C' ? '#C1B7AB' : '#C7BDB6', value.palette[2][1]),
    }]));
    fs.writeFileSync(path.join(OUT, 'CHECKS.json'), `${JSON.stringify({ captures: allChecks, contrast }, null, 2)}\n`);
  } finally {
    await browser.close();
  }
})();
