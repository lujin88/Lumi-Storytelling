// Local static server for Lumi on http://127.0.0.1:4317. It only serves
// index.html and assets/. Every AI call (Claude, OpenAI, Gemini) goes from
// the browser to the provider with the user's own key (decisions.md,
// 2026-10-23); nothing here sees a key. Video is not generated in Lumi: the
// user makes it elsewhere and uploads it (Lu, 2026-10-27, #lumi-storytelling).
// Opened over http, the page can keep keys in localStorage; opened as a file
// it cannot (index.html: KEYS_PERSIST).
// - listens on loopback only (127.0.0.1 and ::1), never deployed;
// - rejects any Host header but its own (blocks DNS rebinding).

'use strict';

const http = require('http');
const fsp = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_PORT = 4317; // index.html: LOCAL_API
const STATIC_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

/**
 * One "bytes=" range as [first, last], 'unsatisfiable', or null to send the
 * whole file. Malformed and multi-part ranges are ignored (RFC 9110 14.2).
 */
function byteRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(header || '').trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  if (m[1] === '') { // suffix: the last N bytes
    const n = Number(m[2]);
    return n > 0 && size > 0 ? [Math.max(0, size - n), size - 1] : 'unsatisfiable';
  }
  const first = Number(m[1]);
  const last = m[2] === '' ? Infinity : Number(m[2]);
  if (last < first) return null;
  return first < size ? [first, Math.min(last, size - 1)] : 'unsatisfiable';
}

function createHandler({ port = DEFAULT_PORT } = {}) {
  const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`]);

  function send(res, status, body, headers = {}) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
    res.end(JSON.stringify(body));
  }

  async function serveStatic(req, res, url) {
    let rel;
    try {
      rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
    } catch {
      return send(res, 400, { code: 'bad_request' }); // malformed %-escape
    }
    const file = path.resolve(ROOT, rel);
    const allowed = file === path.join(ROOT, 'index.html') || file.startsWith(path.join(ROOT, 'assets') + path.sep);
    const type = STATIC_TYPES[path.extname(file).toLowerCase()];
    if (!allowed || !type) return send(res, 404, { code: 'not_found' });
    let data;
    try {
      data = await fsp.readFile(file);
    } catch {
      return send(res, 404, { code: 'not_found' });
    }
    const headers = { 'Content-Type': type, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
    // Chrome only seeks a <video> when the server answers byte ranges.
    // We send no validators, so an If-Range can never match: send the whole file.
    const range = req.headers['if-range'] === undefined ? byteRange(req.headers.range, data.length) : null;
    if (range === 'unsatisfiable') {
      res.writeHead(416, { ...headers, 'Content-Range': `bytes */${data.length}` });
      return res.end();
    }
    const [status, body] = range ? [206, data.subarray(range[0], range[1] + 1)] : [200, data];
    if (range) headers['Content-Range'] = `bytes ${range[0]}-${range[1]}/${data.length}`;
    res.writeHead(status, { ...headers, 'Content-Length': body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  }

  async function route(req, res) {
    if (!hosts.has(String(req.headers.host || '').toLowerCase())) return send(res, 403, { code: 'forbidden' });
    let url;
    try {
      url = new URL(req.url, 'http://localhost');
    } catch {
      return send(res, 400, { code: 'bad_request' });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { code: 'not_allowed' });
    return serveStatic(req, res, url);
  }

  // One malformed request must not take the service down for the whole session.
  return (req, res) => route(req, res).catch(() => {
    if (!res.headersSent) send(res, 500, { code: 'server_error' });
    else res.destroy();
  });
}

function listen(port = Number(process.env.LUMI_PORT) || DEFAULT_PORT) {
  // Two listeners so both 127.0.0.1 and localhost (often ::1 on macOS) work.
  const handler = createHandler({ port });
  const servers = ['127.0.0.1', '::1'].map((host) => {
    const server = http.createServer(handler);
    server.on('error', (err) => {
      if (host === '::1' && (err.code === 'EADDRNOTAVAIL' || err.code === 'EAFNOSUPPORT')) return; // no IPv6 loopback
      console.error(err.code === 'EADDRINUSE' ? `Port ${port} is already in use.` : `Lumi local service stopped: ${err.code || 'error'}`);
      process.exit(1);
    });
    server.listen(port, host);
    return server;
  });
  console.log(`Lumi is running. Open http://127.0.0.1:${port}`);
  return servers;
}

if (require.main === module) listen();

module.exports = { createHandler, listen, DEFAULT_PORT };
