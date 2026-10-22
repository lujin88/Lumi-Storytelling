// @ts-check
const { defineConfig } = require('@playwright/test');

// The page is one static file, so tests open it over file:// and need no server.
// Default browser is the locally installed Google Chrome; set PW_CHANNEL=chromium
// to use Playwright's bundled Chromium instead (`npx playwright install chromium`).
module.exports = defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    channel: process.env.PW_CHANNEL || 'chrome',
    acceptDownloads: true,
    viewport: { width: 1280, height: 800 },
    locale: 'zh-CN',
  },
});
