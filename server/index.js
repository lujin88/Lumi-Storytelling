// Local service for Jimeng (即梦) only. Claude, OpenAI and Gemini are called
// from the browser with the user's own key (decisions.md, 2026-10-23).
//
// It drives the Dreamina CLI that is already signed in on this computer, so it
// must only ever answer this computer, and only the Lumi page it serves:
// - listens on loopback only (127.0.0.1 and ::1), never deployed;
// - rejects any Host header but its own (blocks DNS rebinding);
// - runs API calls only for its own origin, so another website open in the
//   same browser cannot spend the user's credits.
// Nothing here logs request bodies, CLI output or account details.

'use strict';

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_PORT = 4317; // index.html: LOCAL_API
const MAX_BODY = 12 * 1024 * 1024; // one first-frame image as a data URL
const CLI_TIMEOUT_MS = 30000;
const VIDEO = {
  model: 'seedance2.0mini', // decisions.md 2026-10-22: mini is the default
  resolution: '720p', // the only resolution the CLI accepts for mini (dreamina image2video -h)
  durations: [4, 15], // seedance2.0 family range (dreamina image2video -h)
  ratios: ['1:1', '3:4', '16:9', '4:3', '9:16', '21:9'],
};
const IMAGE_TYPES = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };
const STATIC_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

class ApiError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

function runCli(bin, args) {
  return new Promise((resolve, reject) => {
    execFile(bin, args, { timeout: CLI_TIMEOUT_MS, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err && err.code === 'ENOENT') return reject(new ApiError(503, 'jimeng_cli_missing'));
      if (err && err.killed) return reject(new ApiError(504, 'jimeng_timeout'));
      const out = String(stdout || '');
      if (!err) {
        try {
          return resolve(JSON.parse(out));
        } catch {
          // Not JSON: fall through and read it as an error message.
        }
      }
      // Only read the text on failure: a successful reply echoes the user's prompt.
      const text = out + '\n' + String(stderr || '');
      if (/not\s*logged\s*in|login\s*required|dreamina\s+(re)?login|未登录|请先登录/i.test(text)) {
        return reject(new ApiError(401, 'jimeng_login'));
      }
      if (/credit/i.test(text) && /insufficient|not enough|不足/i.test(text)) {
        return reject(new ApiError(402, 'jimeng_no_credit'));
      }
      reject(new ApiError(502, 'jimeng_failed'));
    });
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new ApiError(413, 'too_large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new ApiError(400, 'bad_request'));
      }
    });
    req.on('error', () => reject(new ApiError(400, 'bad_request')));
  });
}

function createHandler({ port = DEFAULT_PORT, dreamina = process.env.DREAMINA_BIN || 'dreamina' } = {}) {
  const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`]);
  const origins = new Set([...hosts].map((h) => 'http://' + h));
  const submitIds = new Set(); // tasks this server started; status is only served for these

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
    try {
      const data = await fsp.readFile(file);
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch {
      send(res, 404, { code: 'not_found' });
    }
  }

  async function jimengTest() {
    const data = await runCli(dreamina, ['user_credit']);
    const credits = Number(data && data.total_credit);
    if (!Number.isFinite(credits)) throw new ApiError(502, 'jimeng_failed');
    return { ok: true, credits };
  }

  async function jimengVideo(body) {
    const m = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(body.image || ''));
    const prompt = String(body.prompt || '').trim();
    const duration = body.duration === undefined ? VIDEO.durations[0] : Number(body.duration);
    const ratio = body.ratio === undefined ? null : String(body.ratio);
    if (!m || !prompt || prompt.length > 2000) throw new ApiError(400, 'bad_request');
    if (!Number.isInteger(duration) || duration < VIDEO.durations[0] || duration > VIDEO.durations[1]) throw new ApiError(400, 'bad_request');
    if (ratio !== null && !VIDEO.ratios.includes(ratio)) throw new ApiError(400, 'bad_request');
    const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'lumi-jimeng-'));
    try {
      const image = path.join(dir, 'first-frame' + IMAGE_TYPES[m[1]]);
      await fsp.writeFile(image, Buffer.from(m[2], 'base64'));
      const args = ['image2video', '--image=' + image, '--prompt=' + prompt, '--video_resolution=' + VIDEO.resolution,
        '--model_version=' + VIDEO.model, '--duration=' + duration, '--poll=0'];
      if (ratio) args.push('--ratio=' + ratio);
      const data = await runCli(dreamina, args);
      const submitId = data && typeof data.submit_id === 'string' ? data.submit_id : '';
      if (!submitId) throw new ApiError(502, 'jimeng_failed');
      submitIds.add(submitId);
      return { submitId, status: 'queued' };
    } finally {
      await fsp.rm(dir, { recursive: true, force: true });
    }
  }

  async function jimengVideoStatus(body) {
    const submitId = String(body.submitId || '');
    if (!submitIds.has(submitId)) throw new ApiError(404, 'not_found');
    const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'lumi-jimeng-'));
    try {
      const data = await runCli(dreamina, ['query_result', '--submit_id=' + submitId, '--download_dir=' + dir]);
      const status = data && data.gen_status;
      if (status === 'fail') throw new ApiError(502, 'jimeng_failed');
      if (status !== 'success') return { status: 'running' };
      const files = (await fsp.readdir(dir)).filter((f) => f.toLowerCase().endsWith('.mp4'));
      if (!files.length) throw new ApiError(502, 'jimeng_failed');
      const video = await fsp.readFile(path.join(dir, files[0]));
      submitIds.delete(submitId);
      return { status: 'done', video: 'data:video/mp4;base64,' + video.toString('base64') };
    } finally {
      await fsp.rm(dir, { recursive: true, force: true });
    }
  }

  const routes = {
    '/api/providers/jimeng/test': jimengTest,
    '/api/jimeng/video': jimengVideo,
    '/api/jimeng/video/status': jimengVideoStatus,
  };

  async function route(req, res) {
    if (!hosts.has(String(req.headers.host || '').toLowerCase())) return send(res, 403, { code: 'forbidden' });
    let url;
    try {
      url = new URL(req.url, 'http://localhost');
    } catch {
      return send(res, 400, { code: 'bad_request' });
    }
    if (!url.pathname.startsWith('/api/')) {
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { code: 'not_allowed' });
      return serveStatic(req, res, url);
    }
    const origin = req.headers.origin;
    // A page opened from file:// sends "Origin: null". Let it read why it was
    // refused, but never run anything for it: sandboxed frames on any website
    // send the same value.
    const nullCors = origin === 'null' ? { 'Access-Control-Allow-Origin': 'null', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST' } : {};
    if (req.method === 'OPTIONS') return origin === 'null' ? (res.writeHead(204, nullCors), res.end()) : send(res, 403, { code: 'forbidden' });
    if (origin === 'null') return send(res, 403, { code: 'open_from_server' }, nullCors);
    if (!origins.has(origin)) return send(res, 403, { code: 'forbidden' });
    const handler = routes[url.pathname];
    if (!handler) return send(res, 404, { code: 'not_found' });
    if (req.method !== 'POST') return send(res, 405, { code: 'not_allowed' });
    try {
      send(res, 200, await handler(await readJson(req)));
    } catch (err) {
      if (err instanceof ApiError) return send(res, err.status, { code: err.code });
      send(res, 500, { code: 'jimeng_failed' });
    }
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
  console.log(`Lumi local service (Jimeng only) is running. Open http://127.0.0.1:${port}`);
  return servers;
}

if (require.main === module) listen();

module.exports = { createHandler, listen, DEFAULT_PORT };
