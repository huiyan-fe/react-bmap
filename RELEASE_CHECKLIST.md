# 上线前检查清单（Release Checklist）

发版前逐项确认。前四步为自动门禁（进 CI、秒级、无需 AK/联网），全绿才可发版；
第 5 步为人工真机冒烟。

## 一键自动门禁

```bash
# 跨平台（CI 用）
npm run preflight

# 本机一键（已内置 node PATH 修复）
./scripts/preflight.sh
```

`preflight` = `typecheck → test → test:presence → build`，任一步失败即停。

## 逐项清单

### 1. 静态与类型（L0）
- [ ] `npm run typecheck` 通过（`tsc --noEmit`）
- [ ] `npm run build` 成功，且 `dist/index.d.ts` 正常产出

### 2. 单元测试（L1~L4）
- [ ] `npm run test` 全绿（当前 22 文件 / 137 用例）
- [ ] 导出快照 `src/__tests__/exports.test.ts` 未意外变动
- [ ] 驱动契约 `src/drivers/__tests__/driverContract.test.ts` 通过（v3/v4 方法集平价）

### 3. 反腐化门禁
- [ ] `npm run test:presence` 通过（每个 hook 都被测试引用）

### 4. 包出口自检
- [ ] `package.json` 的 `main`/`module`/`types`/`exports` 指向的产物真实存在
- [ ] 冒烟：`import { Map, BMapProvider } from 'react-bmap'` 可解析
- [ ] （可选）`publint` + `@arethetypeswrong/cli`

### 5. 真实浏览器 E2E（L5 · 人工，不进 CI）
- [ ] `npm run test:manual`（需 AK / 联网 / WebGL）
- [ ] Marker3D 两条重建路径正常
- [ ] Panorama 正常
- [ ] 一张真实地图上各 Layer 能正常加载

## 改动时的联动纪律

- [ ] 改了公开导出（`src/index.ts`）→ 已 `npx vitest -u` 更新导出快照，并在提交里说明增删原因
- [ ] 新增了 hook → 已补测试；或临时加入 `scripts/check-test-presence.mjs` 的 `ALLOWLIST` 并留 TODO
- [ ] 改了 driver 方法 → v3/v4 两侧都已同步

## 发布动作（确认门禁全绿后）

- [ ] 版本号已按 semver 更新（`package.json` version）
- [ ] `CHANGELOG` / release notes 已更新（如有）
- [ ] 确认发布 registry 与账号正确（公网 npm 用对应账号，勿误发到内网镜像）
- [ ] `npm publish`（`prepublishOnly` 会自动再跑一次 build）

> 覆盖率非硬门槛：`npm run test:cov` 仅统计 `utils/loader/drivers/const` 等纯逻辑目录，
> 组件层不计入阈值，属设计取舍。目标是「每个公开 API 都有至少一条断言接住」，而非追行覆盖数字。
