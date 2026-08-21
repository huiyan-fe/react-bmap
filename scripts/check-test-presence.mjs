#!/usr/bin/env node
// 反腐化门禁：确保每个 hook 实现都至少被一个测试文件引用。
//
// 目的：迭代过程中新增 hook 时，若忘记写测试，本脚本会在 CI 中失败并指名道姓，
// 而不是让未覆盖的 hook 悄无声息地混进主干。
//
// 规则：
//   1. 枚举 src/hooks/*.ts 与 src/hooks/services/*.ts（排除 index.ts）作为 hook 清单。
//   2. 枚举所有 *.test.ts / *.test.tsx（排除 __snapshots__）作为测试语料。
//   3. 某 hook 名以词边界形式出现在任一测试文件中即视为“已覆盖”。
//   4. ALLOWLIST 列出当前已知未写专项测试的 hook——它们缺测不算失败，但会以
//      warning 形式列出，作为可见的技术债。
//   5. 若某个 ALLOWLIST 里的 hook 现在已经有测试了，说明 allowlist 过期，
//      同样报错——强制及时收敛白名单，避免它变成永久豁免。
//
// 退出码：0 = 通过；1 = 有未豁免的缺测 hook，或 allowlist 已过期。

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const srcRoot = join(repoRoot, 'src');

// 当前已知缺少专项测试的 hook。写测试后请从此处删除对应条目。
// 见 TESTING.md「反腐化门禁」小节。
const ALLOWLIST = new Set([
  // 服务类 hook：均遵循 useGeocoder / useDrivingRoute 的同一套契约
  // （createXxx → {isNull, raw}，supported/unsupported/requestId-stale/cancel）。
  // 已有 useGeocoder、useDrivingRoute 两个代表性 L4 测试；其余待逐个补齐。
  'useAutocomplete',
  'useBoundary',
  'useBusLineSearch',
  'useConvertor',
  'useGeolocation',
  'useLocalCity',
  'useLocalSearch',
  'usePanoramaService',
  'usePlaceDetail',
  'useRidingRoute',
  'useTransitRoute',
  'useTruckRoute',
  'useWalkingRoute',
]);

/** 递归收集匹配 predicate 的文件绝对路径。 */
function walk(dir, predicate, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(full, predicate, out);
    } else if (predicate(full, entry.name)) {
      out.push(full);
    }
  }
  return out;
}

// 1. hook 实现清单：src/hooks 与 src/hooks/services 顶层的 use*.ts（排除 index.ts）。
function collectHookNames() {
  const dirs = [join(srcRoot, 'hooks'), join(srcRoot, 'hooks', 'services')];
  const names = new Set();
  for (const dir of dirs) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const m = entry.name.match(/^(use[A-Z]\w*)\.ts$/);
      if (m) names.add(m[1]);
    }
  }
  return [...names].sort();
}

// 2. 测试语料：所有 *.test.ts / *.test.tsx，排除快照目录。
function collectTestSources() {
  const files = walk(
    srcRoot,
    (full, name) =>
      (name.endsWith('.test.ts') || name.endsWith('.test.tsx')) &&
      !full.includes('__snapshots__'),
  );
  return files.map((f) => readFileSync(f, 'utf8'));
}

function isReferenced(hook, sources) {
  const re = new RegExp(`\\b${hook}\\b`);
  return sources.some((src) => re.test(src));
}

function main() {
  const hooks = collectHookNames();
  const sources = collectTestSources();

  const tested = [];
  const missing = [];
  for (const hook of hooks) {
    (isReferenced(hook, sources) ? tested : missing).push(hook);
  }

  // allowlist 过期检测：被豁免的 hook 若已有测试，应从 allowlist 移除。
  const staleAllowlist = [...ALLOWLIST].filter((h) => tested.includes(h));
  // 真正缺测（且未豁免）的 hook。
  const unexcused = missing.filter((h) => !ALLOWLIST.has(h));
  // 已知缺测（豁免中）的 hook——仅作提示。
  const excused = missing.filter((h) => ALLOWLIST.has(h));

  console.log(`[test-presence] hooks=${hooks.length} tested=${tested.length} missing=${missing.length}`);

  if (excused.length) {
    console.log(`\n[test-presence] 已豁免（缺专项测试，技术债）：`);
    for (const h of excused) console.log(`  - ${h}`);
  }

  let failed = false;

  if (unexcused.length) {
    failed = true;
    console.error(`\n[test-presence] ✗ 以下 hook 缺少测试且未在 ALLOWLIST 中：`);
    for (const h of unexcused) console.error(`  - ${h}`);
    console.error(`  → 请为其补充测试，或（临时）加入 scripts/check-test-presence.mjs 的 ALLOWLIST。`);
  }

  if (staleAllowlist.length) {
    failed = true;
    console.error(`\n[test-presence] ✗ 以下 hook 已有测试，请从 ALLOWLIST 移除：`);
    for (const h of staleAllowlist) console.error(`  - ${h}`);
  }

  if (failed) {
    process.exit(1);
  }
  console.log(`\n[test-presence] ✓ 通过`);
}

main();
