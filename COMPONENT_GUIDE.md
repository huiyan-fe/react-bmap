# 新增 Overlay 组件开发指南

> 每次新增一个 Overlay 组件（如 Polyline、Circle、Polygon 等），必须按照以下流程完成全部步骤。

## 1. 对照 SDK dts 梳理功能

打开 `/Users/yuexiangmiao/workspace/studio/baidu/mapopen-fe/bmap-jsapi-dts/src/overlay/` 下对应的 `.d.ts` 文件，逐项确认：

- **Options**：`XxxOptions.d.ts` 里的所有字段
- **事件**：`OverlayEvent.d.ts` 里的 `XxxEventMap`（如 `PolylineEventMap`、`CircleEventMap` 等）
- **方法**：`Xxx.d.ts` 类定义里的所有 setter / enable / disable 方法
- **版本标注**：`@since`、`@removed`、`@hide` 标注，区分 v3/v4 能力

## 2. 框架实现（src/）

按以下顺序实现，每一步参考已实现的组件（Marker、Label 是最完整的参考）：

### 2.1 types.ts — 类型定义

```ts
// 1. 定义 Options 接口（对照 SDK dts 的 XxxOptions）
export interface XxxOptions {
  strokeColor?: string;
  // ... 所有 SDK Options 字段
  // unknown 类型要细化（如 styles → Record<string, string | number>）
}

// 2. 定义 Props（继承 Options + OverlayReactProps + 事件回调）
export interface XxxProps extends XxxOptions, OverlayReactProps {
  // 必需的几何参数
  path: Point[]; // 或 center + radius 等
  // 事件回调（对照 XxxEventMap）
  onClick?: (point: Point, raw: unknown) => void;
  onRightClick?: (point: Point, raw: unknown) => void;
  // ... 所有事件
}
```

### 2.2 v4Driver.ts — 驱动实现

```ts
// 1. createXxx — 只提取 Options 字段传给 constructor（不要把事件回调等无关 props 传进去）
createXxx: (geo, o) => {
  const raw = o as Record<string, unknown>;
  const ctorOpts: Record<string, unknown> = {};
  if (raw?.strokeColor) ctorOpts.strokeColor = raw.strokeColor;
  // ... 只提取属于 constructor Options 的字段
  // SDK 无 setter 的字段（如 enableClicking）也在这里传给 constructor
  const hasOpts = Object.keys(ctorOpts).length > 0;
  return createOverlayFactory('Xxx', () =>
    hasOpts ? new rawSDK.Xxx(rawGeo, ctorOpts) : new rawSDK.Xxx(rawGeo),
  'xxx');
},

// 2. setOverlayOptions — 补充该组件特有的 setter
//    通用 setter（setStrokeColor, setTitle 等）已有，只需补充缺失的
```

### 2.3 Overlay/index.tsx — 组件配置

```ts
export const Xxx = createOverlayComponent<XxxProps>({
  displayName: 'Xxx',
  factory: (d, p) => d.createXxx(p.path /* 或其他几何参数 */, p),
  pathProp: 'path',  // 或 positionProp: 'center'
  optionProps: [
    // SDK 有对应 setter 的字段（变化时调 setOverlayOptions）
    'strokeColor', 'strokeWeight', 'enableMassClear', ...
  ],
  ctorOnlyProps: [
    // SDK 没有 setter 的字段（变化时自动重建实例）
    'enableClicking', ...
  ],
  events: [
    // 对照 XxxEventMap，列出所有事件
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'rightclick', prop: 'onRightClick' },
    ...
  ],
  supportsChildren: true,  // 如果该组件支持嵌套子组件（如 InfoWindow、ContextMenu）
});
```

### 2.4 index.ts — 导出

```ts
export { Xxx } from './components/Overlay';
export type { XxxProps, XxxOptions } from './components/Overlay';
```

## 3. 测试页（test/）

在 `test/src/pages/overlay/` 下创建 `XxxPage.tsx`，参考 MarkerPage / LabelPage 的完整模式。

### 必须覆盖的测试项

| 类别 | 测试控件 |
|---|---|
| **构造选项** | 每个字段对应的输入控件（text/number/checkbox/slider） |
| **v3/v4 差异** | v4+ 字段标注 `<span className="cap-tag">` 能力标签 |
| **事件** | 所有事件的实时日志（click, dblclick, rightclick, mousedown, ...） |
| **visible** | show/hide checkbox |
| **enableClicking** | checkbox（ctorOnlyProps，自动重建） |
| **enableMassClear** | checkbox |
| **重置** | reset all 按钮 |
| **预设** | 常用预设值按钮 |

### 注册到路由

1. `test/src/pages/overlay/index.tsx`：从模板生成改为独立导出
```ts
export { XxxPage } from './XxxPage';
```

2. `test/src/config.ts`：确认 PAGES 列表里已有对应条目（通常已有）

## 4. 检查清单

完成后逐项确认：

- [ ] SDK dts 里的**每个 Options 字段**都有类型声明
- [ ] SDK dts 里的**每个事件**都有 `onXxx` 回调
- [ ] SDK dts 里的**每个 setter 方法**都在 `setOverlayOptions` 或创建逻辑里实现
- [ ] **没有 setter 的字段**放在 `ctorOnlyProps`
- [ ] **有 setter 的字段**放在 `optionProps`
- [ ] `unknown` 类型已细化为具体类型
- [ ] v3/v4 差异字段有 `@since` / `@removed` 注释
- [ ] 测试页覆盖所有字段 + 事件 + visible + reset
- [ ] `npx tsc` 和 `npm run build` 通过

## 5. 参考组件

| 组件 | 参考价值 |
|---|---|
| **Marker** | 最完整的参考：icon/shadow/animation/events/ContextMenu/InfoWindow/PlaceDetail |
| **Label** | events/styles/opacity/width 的处理模式 |
