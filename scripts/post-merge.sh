#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Auto-push to GitHub if PAT and origin are configured
if [ -n "$GITHUB_PAT" ]; then
  # Ensure origin is set with current PAT (token may rotate)
  node -e "
    const fs = require('fs');
    const path = '/home/runner/workspace/.git/config';
    let cfg = fs.readFileSync(path, 'utf8');
    const url = 'https://' + process.env.GITHUB_PAT + '@github.com/zhangpanPolyu/Guojiazhongdianshiyanshi.git';
    const entry = '[remote \"origin\"]\n\turl = ' + url + '\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n';
    if (cfg.includes('[remote \"origin\"]')) {
      cfg = cfg.replace(/\[remote \"origin\"\][^\[]*/, entry);
    } else {
      cfg += '\n' + entry;
    }
    fs.writeFileSync(path, cfg);
    console.log('[post-merge] GitHub remote configured');
  "
  git --no-optional-locks push -u origin main --force 2>&1 && echo "[post-merge] Pushed to GitHub" || echo "[post-merge] GitHub push failed (non-fatal)"
fi
