# 新增 Service Hook 开发指南

> 每次新增一个 Service Hook，必须按下面流程完成。Service 是命令式异步 API，通过 `createServiceHook` 工厂包装成 React Hook，返回 `{ data, loading, error, supported, run, cancel }`。不支持的服务返回 `isNull: true` 的 ServiceHandle，Hook 转为 `supported: false`。

## 1. 对照 SDK dts 梳理功能

打开 `/Users/yuexiangmiao/workspace/studio/baidu/mapopen-fe/bmap-jsapi-dts/src/service/` 下对应的 `.d.ts` 文件，逐项确认：

- **类文件**：`Xxx.d.ts`，确认 constructor 参数、实例方法（如 `search`、`setSearchCompleteCallback`、`getResults`）、回调类型。
- **Options 文件**：`XxxOptions.d.ts`，确认所有可传字段。
- **Result 文件**：确认搜索结果类型（如 `LocalResultPoi`、`DrivingRouteResult`）。
- **EventMap 文件**：确认回调事件名和事件对象结构。
- **版本标注**：重点看 `@since`、`@removed`，判断 v3/v4 是否都支持。
- **搜索方法**：确认 SDK 的异步模式 — 大多数服务是「注册完成回调 + 调 `search(query)`」，但有些服务有特殊方法（如 `Geocoder.getPoint`、`Boundary.get`、`Convertor.translate`）。

## 2. 框架实现（src/）

### 2.1 capabilityMatrix.ts - 版本能力

更新 `src/drivers/capabilityMatrix.ts`：

```ts
// v4+ 服务类
const V4_SERVICE: Capability[] = [
  'RidingRoute', 'Geolocation', 'LocalCity', 'PlaceDetail',
  'Xxx',
];

// 全版本共有
const COMMON: Capability[] = [
  // ...
  'LocalSearch', 'Geocoder', 'DrivingRoute', 'WalkingRoute',
  'TransitRoute', 'BusLineSearch', 'Autocomplete', 'Boundary',
  'Convertor', 'PanoramaService',
  'Xxx',
];
```

判断规则：

- SDK dts 没有 `@since 4.0` / `@removed 4.0`，且 v3/v4 都有类：放 `COMMON`。
- `@since 4.0` 或 v3 无类：放 `V4_SERVICE`。
- `@removed 4.0` 或仅 v3 有类：在 v3 driver 中显式实现，v4 中不返回 `isNull`。

### 2.2 drivers/types.ts - Driver 接口

在 `BMapDriver` 的服务工厂区域补充创建方法：

```ts
// ─────────────── 32. 服务工厂 ───────────────
createXxx(options?: unknown): ServiceHandle;
```

注意：

- 所有服务工厂返回 `ServiceHandle`（不是 `ServiceHandle | null`）。
- 不支持时返回 `isNull: true` 的 ServiceHandle，**不返回 null**，**不调 reportUnsupported**。

### 2.3 v4Driver.ts - 创建工厂

在 `src/drivers/v4Driver.ts` 的服务工厂区域补充实现：

```ts
createXxx: (o) => createServiceFactory('Xxx', () => new rawSDK.Xxx(o)),
```

`createServiceFactory` 内部逻辑：

- 检查 `capabilities.has(cap)`，不支持时返回 `serviceHandle(null, true)`（`isNull: true`）。
- 支持时 `try { return serviceHandle(ctor(), false); } catch { return serviceHandle(null, true); }`。
- **不调 `reportUnsupported`** — 静默返回 isNull，由 Hook 层处理。

如果 constructor 有位置参数，在 lambda 内拆出：

```ts
createDrivingRoute: (o) => createServiceFactory('DrivingRoute', () => new rawSDK.DrivingRoute((o as any)?.location, o)),
```

### 2.4 searchService - 异步搜索

`searchService` 统一处理 SDK 的异步搜索模型（`v4Driver.ts` 已实现）：

```ts
searchService(service, query, callbacks) {
  const raw = rawOf(service);
  if (!raw) return () => {};
  let cancelled = false;
  const safeCb = (fn) => (data) => { if (!cancelled) fn?.(data); };
  if (typeof raw.setSearchCompleteCallback === 'function') raw.setSearchCompleteCallback(safeCb(callbacks.onSuccess));
  else if (typeof raw.setSearchComplete === 'function') raw.setSearchComplete(safeCb(callbacks.onSuccess));
  try { raw.search?.(query); } catch (err) { (safeCb(callbacks.onError))(err); }
  return () => { cancelled = true; };
}
```

如果新服务的异步模式不同（如 `Geocoder.getPoint` / `Boundary.get` / `Convertor.translate`），在 `searchService` 中按 `raw` 类型分发，或在 Hook 中手写调用逻辑。

### 2.5 v3Driver.ts - v3 差异处理

`v3Driver.ts` 默认继承 v4 driver。遇到 v4-only 服务时显式 override：

```ts
// 4.0+ 服务在 v3 不支持（工厂返回 isNull: true）
createXxx: () => ({ __brand: 'ServiceHandle' as const, raw: null, isNull: true }),
```

### 2.6 createServiceHook - Hook 工厂

在 `src/hooks/services/index.ts` 中用 `createServiceHook` 工厂创建 Hook：

```ts
export const useXxx = createServiceHook('Xxx', (d, loc, opts) => d.createXxx(opts));
```

`createServiceHook` 内部：

1. **service 在 effect 中创建** — 依赖 `stableStringify(locationOrOpts)` / `stableStringify(searchOpts)` 生成稳定 key。
2. **isNull 检查** — `svc.isNull === true` 时返回 `supported: false` + `error: UnsupportedCapabilityError`。
3. **run(query)** — 自增 `requestIdRef`，先取消上一次，调 `driver.searchService(svc, query, { onSuccess, onError })`。
4. **过期请求保护** — 连续 `run` 时只有最新一次请求能 `setState`。
5. **cancel()** — `requestIdRef++` 使在途请求回调全部过期 + 调 driver 返回的取消函数。

返回 `{ data, loading, error, supported, run, cancel }`。

### 2.7 types/results.ts - 结果类型

在 `src/types/results.ts` 中补充搜索结果类型：

```ts
export interface XxxResult {
  // 对照 SDK dts 的结果类型写全字段
}

export interface XxxResultItem {
  // 单条结果项
}
```

### 2.8 index.ts - 对外导出

在 `src/index.ts` 的 Service Hooks 导出区域补充：

```ts
export {
  useLocalSearch, useGeocoder, useDrivingRoute, useWalkingRoute,
  useRidingRoute, useTransitRoute, useBusLineSearch, useAutocomplete,
  useBoundary, useGeolocation, useLocalCity, usePlaceDetail, useConvertor,
  usePanoramaService, useXxx,
} from './hooks/services';
```

结果类型在 `src/index.ts` 的结果类型区域补充：

```ts
export type {
  // ...
  XxxResult, XxxResultItem,
} from './types/results';
```

## 3. 测试页（test/）

### 3.1 创建独立 Service 页面

`test/src/pages/service/XxxPage.tsx`

测试页必须覆盖：

- `useCapabilities()` 能力检测 + `cap-tag` 标注，unsupported 时不渲染搜索 UI。
- `useXxx()` Hook 返回值展示：`data` / `loading` / `error` / `supported`。
- 查询输入框 + `run` 按钮 + `cancel` 按钮。
- 结果列表展示（对照 SDK dts 的结果字段）。
- reset 按钮。
- v3/v4 差异标注。

### 3.2 简单模板页

简单的 Service 可以用 `makeServiceTestPage` 起步：

```ts
export const XxxPage = makeServiceTestPage({
  name: 'useXxx',
  hook: useXxx,
  defaultQuery: '餐厅',
});
```

模板提供：能力标签 + 查询输入框 + run/cancel 按钮 + loading/error/data 状态展示。

### 3.3 注册路由

1. `test/src/pages/service/index.tsx` 导出页面：

```ts
export { XxxPage } from './XxxPage';
```

2. `test/src/config.ts` 添加条目：

```ts
{ id: 'xxx', name: 'useXxx', category: S, ready: true },
```

3. `test/src/App.tsx` 的 `PAGE_MAP` 添加映射：

```ts
xxx: ServicePages.XxxPage,
```

## 4. 检查清单

完成后逐项确认：

- [ ] SDK dts 中 `XxxOptions` 的每个字段都有类型声明或明确不支持说明。
- [ ] SDK dts 中搜索结果类型的每个字段都有类型声明。
- [ ] v3/v4 能力已放入正确 capability 集合。
- [ ] `drivers/types.ts` 增加了 `createXxx`。
- [ ] `v4Driver.ts` 增加了 `createXxx`，使用 `createServiceFactory`。
- [ ] v3/v4 差异已在 `v3Driver.ts` override 或明确 isNull。
- [ ] `searchService` 支持新服务的异步模式（或 Hook 中手写调用逻辑）。
- [ ] `hooks/services/index.ts` 增加了 `useXxx`。
- [ ] `types/results.ts` 增加了 `XxxResult` 等结果类型。
- [ ] `src/index.ts` 对外导出了 Hook 和结果类型。
- [ ] 测试页覆盖能力标签、查询、run/cancel、loading/error/data、结果展示、reset。
- [ ] v3-only / v4-only 页在 unsupported 版本显示 `supported: false`。
- [ ] `npm run build` 通过。

## 5. 参考实现

- `src/hooks/services/index.ts`：`createServiceHook` 工厂 + 14 个 Hook。
- `src/hooks/services/useLocalSearch.ts`：手写参考实现（DESIGN.md §6.3 示例），独立文件。
- `src/drivers/v4Driver.ts`：`createServiceFactory`、14 个服务工厂、`searchService`、`getServiceResults`。
- `src/drivers/v3Driver.ts`：v4-only 服务的 isNull override。
- `src/drivers/capabilityMatrix.ts`：`COMMON` / `V4_SERVICE` 服务能力归类。
- `src/utils/stableStringify.ts`：稳定序列化（对象 key 排序），用于 effect 依赖。
- `src/drivers/unsupported.ts`：`UnsupportedCapabilityError`，Hook 层不支持时返回。
- `test/src/pages/service/`：Service 独立测试页。
- `test/src/pages/templates.tsx`：`makeServiceTestPage` 简单模板。
