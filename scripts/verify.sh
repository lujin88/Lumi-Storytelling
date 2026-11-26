#!/usr/bin/env bash
# 本项目的自动验证。每个 PR 由 .github/workflows/verify.yml 跑；退出码不是 0，merge-pr.sh 就不合并。
# 开发在本地开 PR 前也先跑一遍：bash scripts/verify.sh
# 不能做：为了变绿删掉或跳过检查。改这个文件的 PR，QA 要逐行看删了什么（harness-core checks.md 第 6 节）。
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== 文档结构"
bash scripts/check-docs.sh

echo "== 装依赖"
npm ci --no-audit --no-fund

# CI 上没有 Google Chrome，用 Playwright 自带的 Chromium；本地默认还是用 Chrome（见 playwright.config.js）
if [ -n "${CI:-}" ]; then
  npx playwright install --with-deps chromium
  export PW_CHANNEL=chromium
fi

echo "== 全部 Playwright 测试（含 prompts/ 和 index.html 是否一致，tests/prompts.spec.js）"
npm test
