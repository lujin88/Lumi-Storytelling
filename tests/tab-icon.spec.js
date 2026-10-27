// @ts-check
// Tab icon (Lu chose A2 on 10-27): favicon 16/32 and the iOS home-screen icon.
const fs = require('fs');
const path = require('path');
const http = require('http');
const { test, expect } = require('@playwright/test');
const { createHandler } = require('../server');

const ROOT = path.join(__dirname, '..');
const ICONS = [
  { rel: 'icon', href: 'assets/icons/favicon-32.png', size: 32 },
  { rel: 'icon', href: 'assets/icons/favicon-16.png', size: 16 },
  { rel: 'apple-touch-icon', href: 'assets/icons/apple-touch-icon.png', size: 180 },
];

/** Width and height from a PNG's IHDR chunk. */
function pngSize(file) {
  const b = fs.readFileSync(file);
  expect(b.subarray(1, 4).toString('latin1')).toBe('PNG');
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

test('The page declares each tab icon, and each file has the size it claims', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const head = html.slice(0, html.indexOf('</title>') + 400);
  for (const { rel, href, size } of ICONS) {
    expect(head).toContain(`<link rel="${rel}"${rel === 'icon' ? ' type="image/png"' : ''} sizes="${size}x${size}" href="${href}">`);
    expect(pngSize(path.join(ROOT, href))).toEqual([size, size]);
  }
});

test('The local server serves the tab icons as PNG', async () => {
  const server = http.createServer();
  await new Promise((r) => server.listen(0, '127.0.0.1', () => r(undefined)));
  const port = /** @type {import('net').AddressInfo} */ (server.address()).port;
  server.on('request', createHandler({ port, dreamina: '/nonexistent' }));
  try {
    for (const { href } of ICONS) {
      const res = await fetch(`http://127.0.0.1:${port}/${href}`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('image/png');
    }
  } finally {
    server.close();
  }
});
