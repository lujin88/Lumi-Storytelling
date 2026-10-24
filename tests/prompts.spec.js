// @ts-check
// prompts/ is the source of truth. index.html carries a copy of each prompt because the
// page is one file and can't fetch prompts/ over file://. Run scripts/embed-prompts.js
// after editing a prompt. Each prompt's example is exercised in ai-calls.spec.js.
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const prompts = fs.readdirSync(path.join(ROOT, 'prompts')).filter((f) => f.endsWith('.md'));

test('every prompt in prompts/ is embedded in index.html unchanged', () => {
  expect(prompts.sort()).toEqual(['draft-answers.md', 'draft-defend.md', 'image-edit.md', 'review-answers.md', 'score-story.md', 'step3-edit.md', 'transcribe.md']);
  for (const f of prompts) {
    const id = f.slice(0, -3);
    const m = html.match(new RegExp(`<script type="text/plain" id="prompt-${id}">([\\s\\S]*?)</script>`));
    expect(m, `prompt-${id} missing from index.html`).not.toBeNull();
    expect(m[1], `${f} differs from index.html; run node scripts/embed-prompts.js`).toBe(fs.readFileSync(path.join(ROOT, 'prompts', f), 'utf8').trim());
  }
});

test('every prompt has an example', () => {
  for (const f of prompts) {
    expect(fs.existsSync(path.join(ROOT, 'prompts', 'examples', f.replace(/\.md$/, '.json'))), f).toBe(true);
  }
});
