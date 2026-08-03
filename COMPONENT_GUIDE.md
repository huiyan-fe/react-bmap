# 新增 Layer 组件开发指南

> 每次新增一个 Layer 组件，必须按下面流程完成。Layer 通过 `create -> map.addLayer -> map.removeLayer` 管理生命周期；与 Overlay 不同，Layer 没有运行时 setter，所有字段仅在 constructor 读取，props 变化时需要重建。使用 `createLayerComponent` 工厂，通过 `factory` / `addMethod` / `removeMethod` 三个配置项完成挂载。

## 1. 对照 SDK dts 梳理功能

打开 `/Users/yuexiangmiao/workspace/studio/baidu/mapopen-fe/bmap-jsapi-dts/src/layer/` 下对应的 `.d.ts` 文件，逐项确认：

- **类文件**：`XxxLayer.d.ts`，确认 constructor 参数、实例方法和继承关系。
- **Options 文件**：`XxxLayerOptions.d.ts`，确认所有可传字段，不要只抄常见字段。
- **EventMap 文件**：Layer 通常无事件（SDK 大部分 Layer 类没有 `addEventListener`），确认是否有。
- **版本标注**：重点看 `@since`、`@removed`、`@hide`，判断 v3/v4 是否都支持。
- **挂载方式**：普通 Layer 走 `map.addLayer()`；部分 Layer 有专用 Map 方法，例如 `addNormalLayer` / `addGeoJSONLayer` / `addDistrictLayer` / `setTrafficOn`。
- **setter 能力**：Layer 一般没有运行时 setter；如果 SDK 有 `setXxx` 方法且需要响应式更新，需在 `createLayerComponent` 之外手写组件（参考 `TileLayer.tsx`）。

## 2. 框架实现（src/）

### 2.1 capabilityMatrix.ts - 版本能力

如果该 Layer 不是 v3/v4 共有能力，先更新 `src/drivers/capabilityMatrix.ts`：

```ts
// v4+ 图层类（class 本身存在性）
const V4_LAYER_CLASS: Capability[] = [
  'NormalLayer', 'GeoJSONLayer', 'DistrictLayer',
  'XxxLayer',
];

// v4+ Map 图层方法
const V4_MAP_LAYER: Capability[] = [
  'Map.addNormalLayer', 'Map.removeNormalLayer',
  'Map.addGeoJSONLayer', 'Map.removeGeoJSONLayer',
  'Map.addDistrictLayer', 'Map.removeDistrictLayer',
  'Map.setTrafficOn', 'Map.setTrafficOff',
  'Map.addXxxLayer', 'Map.removeXxxLayer',
];

// 全版本共有
const COMMON: Capability[] = [
  // ...
  'TileLayer', 'CustomLayer', 'CanvasLayer', 'TrafficLayer',
  'XxxLayer',
];
```

判断规则：

- SDK dts 没有 `@since 4.0` / `@removed 4.0`，且 v3/v4 都有类：放 `COMMON`。
- `@since 4.0` 或 v3 无类：放 `V4_LAYER_CLASS`。
- `@removed 4.0` 或仅 v3 有类：当前无 `V3_LAYER_ONLY` 集合，在 v3 driver 中显式 override。
- 如果 Layer 有专用 Map 方法（非通用 `addLayer`），对应的 `Map.addXxxLayer` / `Map.removeXxxLayer` 也要加入能力矩阵。
- capability 名称必须与 driver 工厂使用的名称完全一致。

### 2.2 drivers/types.ts - Driver 接口

在 `BMapDriver` 的 Layer 工厂区域补充创建方法：

```ts
// ─────────────── 29. Layer 工厂 ───────────────
createXxxLayer(options?: unknown): LayerHandle | null;
```

如果该 Layer 有专用 Map 方法（非通用 `addLayer` / `removeLayer`），在图层命令区域补充：

```ts
// ─────────────── 15. 图层 ───────────────
addXxxLayer(map: MapHandle, layer: LayerHandle): void;
removeXxxLayer(map: MapHandle, layer: LayerHandle): void;
```

注意点：

- 所有 Layer 工厂签名统一为 `(options?: unknown) => LayerHandle | null`，不要为了必填参数拆出位置参数（与 Overlay 不同）。
- `| null` 返回值是框架约定：版本不支持时返回 `null`，组件渲染 `null`。

### 2.3 v4Driver.ts - 创建工厂

在 `src/drivers/v4Driver.ts` 的 Layer 工厂区域补充实现：

```ts
// ─────────────── 29. Layer 工厂 ───────────────
createXxxLayer: (o) => createLayerFactory('XxxLayer', () => new rawSDK.XxxLayer(o), 'xxx'),
```

注意点：

- 第一个参数是 capability 名称，和 `capabilityMatrix.ts` 完全一致。
- 第三个参数是 `LayerHandle['kind']`，使用稳定的小写语义名，如 `'tile'`、`'normal'`、`'xxx'`。
- `createLayerFactory` 内部会做 capability 检查 + 构造 + 包装成 `LayerHandle`，不需要重复写 try/catch。
- 如果 constructor 需要位置参数（如 `new BMap.TileLayer(opts)`），在 lambda 内完成转换。

如果该 Layer 有专用 Map 方法，在 `v4Driver.ts` 的图层命令区域补充：

```ts
addXxxLayer: (map, l) => { try { (map as any).raw?.addXxxLayer?.((l as any).raw); } catch { /* ignore */ } },
removeXxxLayer: (map, l) => { try { (map as any).raw?.removeXxxLayer?.((l as any).raw); } catch { /* ignore */ } },
```

### 2.4 v3Driver.ts - v3 差异处理

`v3Driver.ts` 默认继承 v4 driver 的实现。遇到版本差异时必须显式处理：

- v4-only Layer：在 v3 driver 中返回 unsupported/null。
- v3-only Layer：在 v3 driver 中显式实现，避免被 v4 capability 闭包拦住。
- constructor 签名 v3/v4 不一致：在 v3 driver 中 override。
- v3 有专用 Map 方法的 Layer：在 v3 driver 中 override 对应的 `addXxxLayer` / `removeXxxLayer`。

示例（v4-only Layer 在 v3 中 unsupported）：

```ts
createXxxLayer: () => { reportUnsupported('XxxLayer', version, behavior); return null; },
```

示例（v3 的通用 `addLayer` 走 `addTileLayer`）：

```ts
addLayer: (map, l) => { (map.raw as any).addTileLayer?.((l as any).raw); },
removeLayer: (map, l) => { (map.raw as any).removeTileLayer?.((l as any).raw); },
```

### 2.5 Layer/types.ts - Props 和 Options 类型

当前 Layer 类型集中在 `src/components/Layer/index.tsx` 内联定义。新增组件时先补 Options，再补 Props：

```ts
export interface XxxLayerOptions {
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  visible?: boolean;
  zIndex?: number;
  // 对照 XxxLayerOptions.d.ts 写全字段
}

export type XxxLayerProps = XxxLayerOptions;
```

类型要求：

- Layer 的 Props 通常就是 Options 本身（`export type XxxLayerProps = XxxLayerOptions`），因为没有 constructor 必填位置参数需要拆出。
- SDK 写成 `Object` / `any` / `unknown` 的字段，要尽量细化成项目可用类型。
- v3-only / v4-only 字段用注释标明 `@since` / `@removed`。
- 如果字段较多或多个 Layer 共用类型，可拆到独立文件（参考 `types-skd.ts`）。

### 2.6 Layer/index.tsx - 组件配置

使用 `createLayerComponent` 工厂，配置 `factory` + 可选的 `addMethod` / `removeMethod`：

```ts
export const XxxLayer = createLayerComponent<XxxLayerProps>({
  displayName: 'XxxLayer',
  factory: (d, p) => d.createXxxLayer(p),
});
```

有专用 Map 方法的 Layer 示例：

```ts
export const XxxLayer = createLayerComponent<XxxLayerProps>({
  displayName: 'XxxLayer',
  factory: (d, p) => d.createXxxLayer(p),
  addMethod: 'addXxxLayer',
  removeMethod: 'removeXxxLayer',
});
```

配置规则：

- 默认 `addMethod` / `removeMethod` 是 `'addLayer'` / `'removeLayer'`，对应 `map.addLayer()` / `map.removeLayer()`。
- 有专用 Map 方法的 Layer 必须显式写 `addMethod` / `removeMethod`，例如 `NormalLayer` 用 `'addNormalLayer'` / `'removeNormalLayer'`。
- `TrafficLayer` 比较特殊：用 `'setTrafficOn'` / `'setTrafficOff'`，且这两个方法不接收 layer handle 参数。
- Layer 没有 `optionProps` / `ctorOnlyProps` / `events` / `positionProp` / `pathProp` / `skipMount` / `supportsChildren` —— 所有字段只在 constructor 读取，props 变化时需要手动重建（用 `key` 或 `visible` 开关）。
- 如果 Layer 需要响应式更新或复杂生命周期，手写独立组件（参考 `TileLayer.tsx`），不要塞进工厂。

### 2.7 index.ts - 对外导出

在 `src/index.ts` 的 Layer 导出区域补充组件和类型：

```ts
export { XxxLayer } from './components/Layer';
export type { XxxLayerProps } from './components/Layer';
```

如果新增了独立 Options 类型，也补充导出：

```ts
export type { XxxLayerOptions } from './components/Layer';
```

## 3. 测试页（test/）

### 3.1 创建独立 Layer 页面

优先创建独立测试页：

`test/src/pages/layer/XxxLayerPage.tsx`

测试页必须覆盖：

- constructor 必填参数，例如 `tileUrlTemplate`、`dataSource`、`name`。
- 挂载/卸载开关，验证 `addLayer` / `removeLayer`（或专用 Map 方法）生命周期。
- `visible` 显示/隐藏开关。
- v3/v4 差异用 `useCapabilities()` 和 `cap-tag` 标注，unsupported 时不要渲染组件。
- reset all 按钮恢复默认状态，常用预设按钮覆盖典型配置。
- 如果 Layer 有可响应式更新的字段（需手写组件支持），每个字段对应一个输入控件。

### 3.2 简单模板页

简单的 Layer 可以用 `makeLayerTestPage` 起步：

```ts
export const XxxLayerPage = makeLayerTestPage('XxxLayer', XxxLayer, { opacity: 0.5 });
```

模板只提供显示/隐藏开关 + 当前 Props 展示。复杂 Layer 或需要逐字段编辑的必须手写页面。

### 3.3 注册路由

1. `test/src/pages/layer/index.tsx` 导出页面：

```ts
export { XxxLayerPage } from './XxxLayerPage';
```

2. `test/src/config.ts` 添加或确认条目：

```ts
{ id: 'xxx-layer', name: 'XxxLayer', category: L, ready: true },
```

3. `test/src/App.tsx` 的 `PAGE_MAP` 添加映射：

```ts
'xxx-layer': LayerPages.XxxLayerPage,
```

## 4. 检查清单

完成后逐项确认：

- [ ] SDK dts 中 `XxxLayerOptions` 的每个字段都有类型声明或明确不支持说明。
- [ ] `Object` / `any` / `unknown` 字段已尽量细化。
- [ ] v3/v4 能力已放入正确 capability 集合（`COMMON` / `V4_LAYER_CLASS` / `V4_MAP_LAYER`）。
- [ ] `drivers/types.ts` 增加了 `createXxxLayer`；有专用 Map 方法的也增加了 `addXxxLayer` / `removeXxxLayer`。
- [ ] `v4Driver.ts` 增加了 `createXxxLayer`，使用 `createLayerFactory`；有专用 Map 方法的也增加了实现。
- [ ] v3/v4 差异已在 `v3Driver.ts` override 或明确 unsupported。
- [ ] `Layer/index.tsx` 导出了 `XxxLayer`，配置了 `factory` + `addMethod` / `removeMethod`。
- [ ] `src/index.ts` 对外导出了组件和 Props 类型。
- [ ] 测试页覆盖显示/隐藏、挂载/卸载、constructor props、版本标签、reset、预设。
- [ ] v3-only / v4-only 页在 unsupported 版本不会渲染组件。
- [ ] `npm run build` 通过。

## 5. 参考实现

- `src/components/Layer/index.tsx`：通用 Layer 组件配置入口（18 个组件，工厂生成）。
- `src/components/Layer/TileLayer.tsx`：手写 Layer 组件参考（有响应式更新需求时）。
- `src/components/Layer/types.ts`：TileLayer Options 类型参考。
- `src/components/Layer/types-skd.ts`：SDK 辅助类型（如 Copyright）。
- `src/utils/createComponent.tsx`：`createLayerComponent` 生命周期：create/add/remove（无 update）。
- `src/drivers/v4Driver.ts`：`createLayerFactory`、`addLayer` / `removeLayer`、专用 Map 方法实现。
- `src/drivers/v3Driver.ts`：v3-only / v4-only 差异 override。
- `src/drivers/capabilityMatrix.ts`：v3/v4 Layer 能力归类。
- `test/src/pages/layer/`：Layer 独立测试页。
- `test/src/pages/templates.tsx`：`makeLayerTestPage` 简单模板。
