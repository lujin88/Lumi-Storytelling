#!/usr/bin/env bash
# Mechanical checks for harness docs. Run from a repo root (core or project layer).
set -u
fail=0
err(){ echo "FAIL: $*"; fail=1; }

[ -f AGENTS.md ] || err "AGENTS.md missing"
[ -f CLAUDE.md ] || err "CLAUDE.md missing (Claude Code does not read AGENTS.md by itself)"
if [ -f AGENTS.md ]; then
  n=$(wc -l < AGENTS.md); [ "$n" -le 120 ] || err "AGENTS.md has $n lines; keep it a map (<=120)"
fi

# Every role card has the required fields
for f in roles/*.md; do
  [ -e "$f" ] || continue
  for k in 职责 输入 产出 交给谁 不能做; do grep -q "\*\*$k\*\*" "$f" || err "$f missing **$k**"; done
done

# Project layer
if [ -f handoff.md ]; then
  for h in 现在在做什么 等\ Lu\ 决定的事 最近完成的 下一步; do grep -q "## $h" handoff.md || err "handoff.md missing section: $h"; done
  recent=$(awk '/^## 最近完成的/{f=1;next}/^## /{f=0}f&&/^- ./' handoff.md | wc -l)
  [ "$recent" -le 5 ] || err "handoff.md lists $recent recent items (max 5)"
fi
[ -f decisions.md ] && { grep -q '| 日期 | 决定 | 原因 |' decisions.md || err "decisions.md table header changed"; }

# Links in markdown point to files that exist
grep -rhoE '`[A-Za-z0-9_./-]+\.md`' --include=*.md . | tr -d '`' | sort -u | while read -r p; do
  case "$p" in */*) [ -e "$p" ] || [ -e "templates/project/$p" ] || echo "WARN: referenced $p not found";; esac
done

[ $fail -eq 0 ] && echo "docs OK"
exit $fail
