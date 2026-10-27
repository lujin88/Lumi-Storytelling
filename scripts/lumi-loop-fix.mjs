import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

// Re-export a range of an existing transparent VP9 clip without changing its frames.
// Use a versioned output name; inspect the result before copying it into assets/lumi/.
// Usage: node scripts/lumi-loop-fix.mjs input.webm outdir pose-v2 first last [crf] [webp quality]
const [,, input, outputDir, name, firstArg, lastArg, crfArg = '20', qualityArg = '84'] = process.argv;
if (!input || !outputDir || !name || firstArg === undefined || lastArg === undefined) {
  throw new Error('usage: node lumi-loop-fix.mjs input.webm outdir name first last [crf] [webp quality]');
}
const first = Number(firstArg), last = Number(lastArg), crf = Number(crfArg), quality = Number(qualityArg);
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { maxBuffer: 160 * 1024 * 1024, ...options });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')}\n${result.stderr?.toString()}`);
  return result.stdout;
}
const [width, height] = run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', input]).toString().trim().split(',').map(Number);
const buffer = run('ffmpeg', ['-v', 'error', '-c:v', 'libvpx-vp9', '-i', input, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-']);
const frameBytes = width * height * 4, frameCount = buffer.length / frameBytes;
if (!Number.isInteger(frameCount) || !Number.isInteger(first) || !Number.isInteger(last) || first < 0 || last >= frameCount || first >= last) {
  throw new Error('invalid frame range');
}
const selected = buffer.subarray(first * frameBytes, (last + 1) * frameBytes);
const selectedCount = last - first + 1;
const webm = join(outputDir, `${name}.webm`), webp = join(outputDir, `${name}.webp`);
const framesDir = join(outputDir, `${name}-webp-frames`);
if ([webm, webp, framesDir].some(existsSync)) throw new Error('output exists: choose a new versioned name');
mkdirSync(outputDir, { recursive: true });
run('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${width}x${height}`, '-r', '24', '-i', '-', '-an', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', String(crf), '-row-mt', '1', '-auto-alt-ref', '0', webm], { input: selected });
mkdirSync(framesDir, { recursive: true });
const webpFrames = [];
const webpCount = Math.min(40, selectedCount);
const webpFrameMs = Math.round(selectedCount * 1000 / (24 * webpCount));
for (let i = 0; i < webpCount; i++) {
  const frame = Math.round(i * (selectedCount - 1) / (webpCount - 1));
  webpFrames.push(selected.subarray(frame * frameBytes, (frame + 1) * frameBytes));
}
run('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${width}x${height}`, '-r', '10', '-i', '-', join(framesDir, 'f%04d.png')], { input: Buffer.concat(webpFrames) });
const pngs = readdirSync(framesDir).filter(f => f.endsWith('.png')).sort();
const muxArgs = [];
for (const png of pngs) {
  const src = join(framesDir, png), dst = src.replace(/\.png$/, '.webp');
  run('cwebp', ['-quiet', '-q', String(quality), '-alpha_q', '85', '-m', '6', '-sharp_yuv', src, '-o', dst]);
  muxArgs.push('-frame', dst, `+${webpFrameMs}+0+0+1-b`);
}
run('webpmux', [...muxArgs, '-loop', '0', '-bgcolor', '0,0,0,0', '-o', webp]);
if ([webm, webp].some(path => statSync(path).size >= 1048576)) throw new Error('output exceeds the 1 MiB asset limit');
console.log(JSON.stringify({ input: basename(input), sourceFrames: frameCount, first, last, frames: selectedCount, crf, quality, webpFrameMs, webm: statSync(webm).size, webp: statSync(webp).size, outputDir }));
