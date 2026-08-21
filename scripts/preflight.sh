#!/usr/bin/env bash
# 上线前自动门禁：typecheck → 单测(含快照/契约) → hook 在场门禁 → 构建。
# 全绿才可发版。真实浏览器 E2E（npm run test:manual, L5）需手动另跑。
set -euo pipefail

# 本机 node 工具链不在默认 PATH 上，补上再跑。
export PATH="/usr/local/bin:$PATH"

cd "$(dirname "$0")/.."

echo "==> [1/4] typecheck"
npm run typecheck

echo "==> [2/4] 单元测试（L1~L4 + 导出快照 + 驱动契约）"
npm run test

echo "==> [3/4] hook 测试在场门禁"
npm run test:presence

echo "==> [4/4] 构建 + dts 产出"
npm run build

echo "✓ preflight 全部通过，可以发版（记得手动跑一次 npm run test:manual）"
