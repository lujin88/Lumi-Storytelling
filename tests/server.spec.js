// @ts-check
// The local static server (server/index.js), driven over HTTP.
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
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = JSON.parse(text); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, json, text });
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
