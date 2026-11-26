// @ts-check
// The local static server (server/index.js), driven over HTTP.
const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');
const { test, expect } = require('@playwright/test');
const { createHandler } = require('../server');

async function start() {
  const server = http.createServer();
  await new Promise((r) => server.listen(0, '127.0.0.1', () => r(undefined)));
  const port = /** @type {import('net').AddressInfo} */ (server.address()).port;
  server.on('request', createHandler({ port }));
  return { server, port, base: `http://127.0.0.1:${port}` };
}

/** Raw request so Host and Origin can be set freely. */
function request(port, { method = 'GET', path: p = '/', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path: p, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        const text = raw.toString('utf8');
        let json = null;
        try { json = JSON.parse(text); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, json, text, raw });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

test('No API: /api/ paths, other methods and foreign Host headers are refused', async () => {
  // Jimeng was removed on 2026-10-27; every AI call goes from the browser to the provider.
  const { server, port } = await start();
  try {
    const host = `127.0.0.1:${port}`;
    for (const p of ['/api/providers/jimeng/test', '/api/jimeng/video', '/api/jimeng/video/status']) {
      expect((await request(port, { method: 'POST', path: p, headers: { host, origin: 'http://' + host } })).status, p).toBe(405);
      expect((await request(port, { path: p, headers: { host } })).status, p).toBe(404);
    }
    expect((await request(port, { method: 'OPTIONS', headers: { host, origin: 'null' } })).status).toBe(405);
    expect((await request(port, { headers: { host: `rebind.example:${port}` } })).status).toBe(403);
  } finally { server.close(); }
});

test('Static files: only index.html and assets/, no path escape', async () => {
  const { server, port } = await start();
  try {
    const host = `127.0.0.1:${port}`;
    expect((await request(port, { headers: { host } })).status).toBe(200);
    for (const p of ['/package.json', '/server/index.js', '/assets/../package.json', '/%2e%2e/%2e%2e/etc/passwd']) {
      expect((await request(port, { path: p, headers: { host } })).status, p).toBe(404);
    }
  } finally { server.close(); }
});

test('Static files answer byte ranges, so the page can seek a clip', async () => {
  const { server, port } = await start();
  try {
    const host = `127.0.0.1:${port}`;
    const p = '/assets/lumi/wave.webm';
    const file = fs.readFileSync(path.join(__dirname, '..', p));
    const size = file.length;
    const get = (range, extra = {}, method = 'GET') => request(port, { method, path: p, headers: { host, range, ...extra } });
    // Whole file still says ranges are accepted.
    const whole = await request(port, { path: p, headers: { host } });
    expect(whole.status).toBe(200);
    expect(whole.headers['accept-ranges']).toBe('bytes');
    expect(Number(whole.headers['content-length'])).toBe(size);
    for (const [range, first, last] of [['bytes=0-99', 0, 99], ['bytes=100-', 100, size - 1], ['bytes=-50', size - 50, size - 1], [`bytes=10-${size + 999}`, 10, size - 1], [`bytes=-${size + 999}`, 0, size - 1]]) {
      const r = await get(range);
      expect(r.status, range).toBe(206);
      expect(r.headers['content-range'], range).toBe(`bytes ${first}-${last}/${size}`);
      expect(r.headers['accept-ranges'], range).toBe('bytes');
      expect(r.headers['content-type'], range).toBe('video/webm');
      expect(Number(r.headers['content-length']), range).toBe(last - first + 1);
      expect(r.raw.equals(file.subarray(first, last + 1)), range).toBe(true);
    }
    // HEAD with a range: same headers, no body.
    const head = await get('bytes=0-99', {}, 'HEAD');
    expect(head.status).toBe(206);
    expect(head.headers['content-range']).toBe(`bytes 0-99/${size}`);
    expect(head.text).toBe('');
    // Past the end: 416 with the real size.
    for (const range of [`bytes=${size}-`, `bytes=${size + 5}-${size + 10}`, 'bytes=-0']) {
      const r = await get(range);
      expect(r.status, range).toBe(416);
      expect(r.headers['content-range'], range).toBe(`bytes */${size}`);
      expect(r.text, range).toBe('');
    }
    // Malformed or several ranges: ignored, the whole file (RFC 9110 14.2). So is any If-Range:
    // the server sends no ETag or Last-Modified, so no validator can match.
    for (const [range, extra] of [['bytes=0-9,20-29', {}], ['bytes=9-0', {}], ['bytes=-', {}], ['items=0-9', {}], ['bytes=a-b', {}], ['bytes=0-9', { 'if-range': '"x"' }]]) {
      const r = await get(range, extra);
      expect(r.status, range).toBe(200);
      expect(r.headers['content-range'], range).toBeUndefined();
      expect(Number(r.headers['content-length']), range).toBe(size);
    }
    // A range never opens a file outside index.html and assets/.
    for (const bad of ['/package.json', '/server/index.js', '/assets/../package.json', '/%2e%2e/%2e%2e/etc/passwd', '/assets/lumi/../../server/index.js', '/design-system/components/Button/preview.html', '/assets/../design-system/components/Button/preview.html']) {
      const r = await request(port, { path: bad, headers: { host, range: 'bytes=0-9' } });
      expect(r.status, bad).toBe(404);
      expect(r.headers['content-range'], bad).toBeUndefined();
    }
  } finally { server.close(); }
});

test('A malformed request gets an error and the service keeps running', async () => {
  const { server, port } = await start();
  try {
    const host = `127.0.0.1:${port}`;
    expect((await request(port, { path: '/%E0%A4%A', headers: { host } })).status).toBe(400);
    const raw = await new Promise((resolve) => {
      const s = net.connect(port, '127.0.0.1', () => s.end(`GET //[ HTTP/1.1\r\nHost: ${host}\r\nConnection: close\r\n\r\n`));
      let out = '';
      s.on('data', (c) => { out += c; });
      s.on('close', () => resolve(out));
    });
    expect(String(raw).split('\r\n')[0]).toBe('HTTP/1.1 400 Bad Request');
    expect((await request(port, { headers: { host } })).status).toBe(200);
  } finally { server.close(); }
});
