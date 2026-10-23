#!/usr/bin/env node
// Copies prompts/*.md into index.html as <script type="text/plain" id="prompt-NAME"> blocks.
// The page is one file opened over file://, so it can't fetch prompts/ at run time.
// prompts/ is the source of truth; tests/prompts.spec.js fails if the two drift apart.
// Usage: node scripts/embed-prompts.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGE = path.join(ROOT, 'index.html');
const ANCHOR = '<script type="application/json" id="case-study-storytelling-skill">';

function promptBlocks() {
  return fs.readdirSync(path.join(ROOT, 'prompts'))
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const text = fs.readFileSync(path.join(ROOT, 'prompts', f), 'utf8').trim();
      if (/<\/script/i.test(text)) throw new Error(`${f} contains "</script"`);
      return `<script type="text/plain" id="prompt-${f.slice(0, -3)}">${text}</script>\n`;
    });
}

let html = fs.readFileSync(PAGE, 'utf8');
html = html.replace(/<script type="text\/plain" id="prompt-[\w-]+">[\s\S]*?<\/script>\n/g, '');
const at = html.indexOf(ANCHOR);
if (at < 0) throw new Error('anchor not found in index.html');
html = html.slice(0, at) + promptBlocks().join('') + html.slice(at);
fs.writeFileSync(PAGE, html);
