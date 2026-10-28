// Counts the frames where step 1's Lumi disappears from the screen (the "flash" Lu saw).
// Not part of `npm test`: it records the screen, so it is slow and measures, not asserts.
//
//   node tests/tools/lumi-flash-probe.js [chromium|webkit] [enter|firsttype|nav] [runs]
//
// enter:     type a few characters, stop, press Enter (render() rebuilds the page).
// firsttype: the first keystroke after the page opens (wave -> think for the first time).
// nav:       go to Settings and back; counts frames where the title fades (the page's
//            `arrive` animation), which should still play when the page changes.
// Every run opens the page fresh at 1900 x 1000. Chrome frames come from the DevTools
// screencast (every composited frame); WebKit has no screencast, so its run is recorded
// as a 25 fps video and read back frame by frame, which can miss a gap shorter than 40 ms.
// A frame counts as "Lumi gone" when under 5% of the Lumi box is darker than the paper.
// domGapFrames / movedFrames come from the page itself, once per animation frame: no Lumi the
// browser can paint, or a Lumi that is not where the first one was (x,y,w,h in lumiBox).
const path = require('path');
const fs = require('fs');
const os = require('os');
const pw = require('@playwright/test');

const [browserName = 'chromium', mode = 'enter', runsArg = '10'] = process.argv.slice(2);
const RUNS = Number(runsArg);
const APP_URL = 'file://' + path.resolve(__dirname, '..', '..', process.env.LUMI_PAGE || 'index.html');
const VIEW = { width: 1900, height: 1000 };

/** Seconds since the action started, for each step, so a gap can be traced to its trigger. */
let marks = [];
const mark = (m) => marks.push({ m, at: Date.now() / 1000 });

async function act(page) {
  const ta = page.locator('#guideText');
  marks = []; mark('start');
  if (mode === 'nav') {
    await page.click('#sidebar [data-page="settings"]'); await page.waitForTimeout(600);
    await page.click('#sidebar [data-page="dump"]'); await page.waitForTimeout(800);
    return;
  }
  await ta.click();
  if (mode === 'firsttype') { await page.keyboard.type('我', { delay: 0 }); await page.waitForTimeout(800); return; }
  await page.keyboard.type('我做了一个研究工具', { delay: 60 });
  await page.waitForTimeout(1500);
  mark('enter');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
}

/** Record one run; returns { frames: [dataURL...] | video path, box, title, startMs }. */
async function record(browser, dir) {
  const chrome = browserName === 'chromium';
  const ctx = await browser.newContext({ viewport: VIEW, locale: 'zh-CN', ...(chrome ? {} : { recordVideo: { dir, size: VIEW } }) });
  const t0 = Date.now();
  const page = await ctx.newPage();
  // Second opinion that does not depend on the recording's frame rate: on every animation
  // frame, is there a Lumi the browser can paint (a shown image that has decoded, or a shown
  // clip with a frame), inside a page that is not fading in?
  await page.addInitScript(() => {
    window.__gaps = []; window.__moved = [];
    const tick = () => {
      const art = document.querySelector('.intro-art');
      if (art && window.__watch) {
        const shown = [...art.querySelectorAll('img[data-lumi], video[data-lumi-video]')].filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
        const painted = shown.some((e) => e.tagName === 'IMG' ? e.complete && e.naturalWidth > 0 : e.readyState >= 2 && Number(getComputedStyle(e).opacity) > 0.5);
        const page = Number(getComputedStyle(art.closest('.page')).opacity);
        if (!painted || page < 0.5) window.__gaps.push(Math.round(performance.now() - window.__watch));
        // Every Lumi on screen must sit exactly where the first one did (no jump while clips swap).
        const at = shown.map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round).join(','); });
        window.__box = window.__box || at[0];
        if (at.some((b) => b !== window.__box)) window.__moved.push(at.join(' '));
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto(APP_URL);
  await page.locator('.intro-art').waitFor();
  await page.waitForTimeout(2000); // the wave clip is loaded and playing
  const rect = (sel) => page.locator(sel).first().evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const box = await rect('.intro-art'), title = await rect('#content h1');
  const frames = [], times = [];
  let cdp;
  if (chrome) {
    cdp = await ctx.newCDPSession(page);
    cdp.on('Page.screencastFrame', (f) => { frames.push('data:image/png;base64,' + f.data); times.push(f.metadata.timestamp); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
  }
  const startMs = Date.now() - t0;
  await page.evaluate(() => { window.__watch = performance.now(); });
  await act(page);
  const domGaps = mode === 'nav' ? [] : await page.evaluate(() => window.__gaps);
  const moved = mode === 'nav' ? [] : await page.evaluate(() => window.__moved);
  const lumiBox = await page.evaluate(() => window.__box);
  const endMs = Date.now() - t0;
  if (chrome) await cdp.send('Page.stopScreencast');
  const video = chrome ? null : page.video();
  await ctx.close();
  return { frames, times, marks, domGaps, moved, lumiBox, video: video && await video.path(), box, title, startMs, endMs };
}

/** Share of each region darker than the paper, per frame, decoded in a Chrome page. */
async function analyse(reader, rec) {
  return reader.evaluate(async ({ rec, W }) => {
    const c = document.createElement('canvas'), g = c.getContext('2d', { willReadFrequently: true });
    const dark = (src, r) => {
      const s = (src.videoWidth || src.naturalWidth) / W, x = Math.round(r.x * s), y = Math.round(r.y * s), w = Math.round(r.w * s), h = Math.round(r.h * s);
      c.width = w; c.height = h; g.drawImage(src, x, y, w, h, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data; let n = 0;
      for (let i = 0; i < d.length; i += 4) if (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2] < 200) n++;
      return n / (w * h);
    };
    const out = [];
    if (rec.frames.length) {
      for (const url of rec.frames) { const im = new Image(); im.src = url; await im.decode(); out.push({ lumi: dark(im, rec.box), title: dark(im, rec.title) }); }
      return out;
    }
    const v = document.createElement('video'); v.muted = true; v.src = rec.videoUrl;
    await new Promise((ok, no) => { v.onloadeddata = ok; v.onerror = no; });
    for (let t = rec.startMs / 1000; t < rec.endMs / 1000; t += 0.04) {
      v.currentTime = t; await new Promise((ok) => { v.onseeked = ok; });
      out.push({ lumi: dark(v, rec.box), title: dark(v, rec.title) });
    }
    return out;
  }, { rec: { ...rec, videoUrl: rec.video && 'file://' + rec.video }, W: VIEW.width });
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumi-flash-'));
  const browser = await pw[browserName].launch(browserName === 'chromium' ? { channel: 'chrome' } : {});
  const readerBrowser = await pw.chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files'] });
  const reader = await readerBrowser.newPage();
  await reader.goto('file://' + dir);
  const rows = [];
  for (let i = 0; i < RUNS; i++) {
    const rec = await record(browser, dir);
    const f = await analyse(reader, rec);
    const gone = f.filter((x) => x.lumi < 0.05).length;
    const base = Math.max(...f.map((x) => x.title));
    const faded = f.filter((x) => x.title < base * 0.5).length;
    const t0 = rec.times.length ? rec.marks[0].at : 0, at = (k) => rec.times.length ? +(rec.times[k] - t0).toFixed(3) : +(k * 0.04).toFixed(2);
    const goneAt = f.map((x, k) => x.lumi < 0.05 ? at(k) : null).filter((x) => x !== null);
    rows.push({ run: i + 1, frames: f.length, lumiGone: gone, titleFaded: faded, goneAt, domGapFrames: rec.domGaps.length, movedFrames: rec.moved.length, lumiBox: rec.lumiBox, marks: rec.marks.map((m) => `${m.m}@${(m.at - rec.marks[0].at).toFixed(2)}`).join(' ') });
    console.log(JSON.stringify(rows.at(-1)));
  }
  console.log(JSON.stringify({ browser: browserName, mode, runs: RUNS, lumiGoneTotal: rows.reduce((a, r) => a + r.lumiGone, 0), runsWithGap: rows.filter((r) => r.lumiGone).length, titleFadedTotal: rows.reduce((a, r) => a + r.titleFaded, 0), domGapFramesTotal: rows.reduce((a, r) => a + r.domGapFrames, 0), movedFramesTotal: rows.reduce((a, r) => a + r.movedFrames, 0) }));
  await readerBrowser.close(); await browser.close();
  fs.rmSync(dir, { recursive: true, force: true });
})();
