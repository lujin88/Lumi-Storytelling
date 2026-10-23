// @ts-check
// The local Jimeng service (server/index.js), driven over HTTP with a fake
// Dreamina CLI. No real CLI runs and no credits are spent.
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const net = require('net');
const { test, expect } = require('@playwright/test');
const { createHandler } = require('../server');

/** Write a fake `dreamina` that prints `stdout` and exits with `code`. */
function fakeCli(dir, { stdout = '', code = 0 } = {}) {
  const bin = path.join(dir, 'dreamina');
  fs.writeFileSync(bin, `#!/bin/sh\ncat <<'OUT'\n${stdout}\nOUT\nexit ${code}\n`, { mode: 0o755 });
  return bin;
}

async function start(dreamina) {
  const server = http.createServer();
  await new Promise((r) => server.listen(0, '127.0.0.1', () => r(undefined)));
  const port = /** @type {import('net').AddressInfo} */ (server.address()).port;
  server.on('request', createHandler({ port, dreamina }));
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

let tmp;
test.beforeEach(() => { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lumi-server-test-')); });
test.afterEach(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

test('Jimeng check returns credits from the CLI and nothing else', async () => {
  const { server, port } = await start(fakeCli(tmp, { stdout: '{"total_credit":120,"user_id":"u1","user_name":"Someone","vip_level":1}' }));
  try {
    const host = `127.0.0.1:${port}`;
    const res = await request(port, { method: 'POST', path: '/api/providers/jimeng/test', headers: { host, origin: 'http://' + host } });
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ ok: true, credits: 120 });
  } finally { server.close(); }
});

test('Jimeng check maps login and missing CLI to their own codes', async () => {
  const loggedOut = await start(fakeCli(tmp, { stdout: 'Error: not logged in, run dreamina login', code: 1 }));
  const missing = await start(path.join(tmp, 'no-such-binary'));
  try {
    for (const [{ port }, status, code] of [[loggedOut, 401, 'jimeng_login'], [missing, 503, 'jimeng_cli_missing']]) {
      const host = `127.0.0.1:${port}`;
      const res = await request(port, { method: 'POST', path: '/api/providers/jimeng/test', headers: { host, origin: 'http://' + host } });
      expect(res.status).toBe(status);
      expect(res.json).toEqual({ code });
    }
  } finally { loggedOut.server.close(); missing.server.close(); }
});

test('API refuses other websites, file:// pages and foreign Host headers', async () => {
  const { server, port } = await start(fakeCli(tmp, { stdout: '{"total_credit":1}' }));
  try {
    const host = `127.0.0.1:${port}`;
    const call = (headers) => request(port, { method: 'POST', path: '/api/providers/jimeng/test', headers });
    expect((await call({ host, origin: 'https://evil.example' })).status).toBe(403);
    expect((await call({ host })).status).toBe(403); // no Origin
    const fromFile = await call({ host, origin: 'null' });
    expect(fromFile.status).toBe(403);
    expect(fromFile.json).toEqual({ code: 'open_from_server' });
    expect((await call({ host: `rebind.example:${port}`, origin: `http://rebind.example:${port}` })).status).toBe(403);
  } finally { server.close(); }
});

test('Static files: only index.html and assets/, no path escape', async () => {
  const { server, port } = await start(fakeCli(tmp));
  try {
    const host = `127.0.0.1:${port}`;
    expect((await request(port, { headers: { host } })).status).toBe(200);
    for (const p of ['/package.json', '/server/index.js', '/assets/../package.json', '/%2e%2e/%2e%2e/etc/passwd']) {
      expect((await request(port, { path: p, headers: { host } })).status, p).toBe(404);
    }
  } finally { server.close(); }
});

test('A malformed request gets an error and the service keeps running', async () => {
  const { server, port } = await start(fakeCli(tmp));
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

test('Video submit rejects bad input before calling the CLI', async () => {
  const marker = path.join(tmp, 'called');
  const bin = path.join(tmp, 'dreamina');
  fs.writeFileSync(bin, `#!/bin/sh\ntouch ${marker}\necho '{"submit_id":"s1"}'\n`, { mode: 0o755 });
  const { server, port } = await start(bin);
  try {
    const host = `127.0.0.1:${port}`;
    const post = (body) => request(port, { method: 'POST', path: '/api/jimeng/video', headers: { host, origin: 'http://' + host, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const image = 'data:image/png;base64,iVBORw0KGgo=';
    for (const body of [{ prompt: 'wave' }, { image, prompt: '' }, { image, prompt: 'wave', duration: 99 }, { image, prompt: 'wave', ratio: '2:1' }]) {
      expect((await post(body)).status, JSON.stringify(body)).toBe(400);
    }
    expect(fs.existsSync(marker)).toBe(false);
    const ok = await post({ image, prompt: 'wave' });
    expect(ok.json).toEqual({ submitId: 's1', status: 'queued' });
    // Status is only served for tasks this server started.
    const status = await request(port, { method: 'POST', path: '/api/jimeng/video/status', headers: { host, origin: 'http://' + host }, body: JSON.stringify({ submitId: 'someone-else' }) });
    expect(status.status).toBe(404);
  } finally { server.close(); }
});
