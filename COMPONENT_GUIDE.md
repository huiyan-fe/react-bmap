# 新增 Control 组件开发指南

> 每次新增一个 Control 组件，必须按下面流程完成。Control 与 Overlay 不同：它通过 `create -> map.addControl -> map.removeControl` 管理生命周期；可响应式更新的字段放 `optionProps`，只能在 constructor 读取的字段放 `ctorOnlyProps`，显示隐藏通过 `visible` 控制。

## 1. 对照 SDK dts 梳理功能

打开 `/Users/yuexiangmiao/workspace/studio/baidu/mapopen-fe/bmap-jsapi-dts/src/control/` 下对应的 `.d.ts` 文件，逐项确认：

- **类文件**：`XxxControl.d.ts`，确认 constructor 参数、实例方法、事件或回调能力。
- **Options 文件**：`XxxControlOptions.d.ts`，确认所有可传字段。
- **版本标注**：重点看 `@since`、`@removed`、`@hide`，判断 v3/v4 是否都支持。
- **特殊回调**：如 `onLocationStart`、`onChangeSuccess` 这类通常是 options 回调，不是 React 事件订阅。
- **地图挂载方式**：普通控件必须能通过 `map.addControl(control)` / `map.removeControl(control)` 管理。

## 2. 框架实现（src/）

### 2.1 capabilityMatrix.ts - 版本能力

如果该 Control 不是 v3/v4 共有能力，先更新 `src/drivers/capabilityMatrix.ts`：

```ts
// v4+ 控件类
const V4_CONTROL: Capability[] = [
  'NavigationControl3D', 'ZoomControl', 'CityListControl', 'LocationControl', 'LogoControl',
  'XxxControl',
];

// 全版本共有控件
const COMMON: Capability[] = [
  // ...
  'NavigationControl', 'ScaleControl', 'OverviewMapControl', 'MapTypeControl',
  'CopyrightControl', 'GeolocationControl', 'PanoramaControl',
  'XxxControl',
];
```

判断规则：

- SDK dts 没有 `@since 4.0` / `@removed 4.0`，且 v3/v4 都有类：放 `COMMON`。
- `@since 4.0` 或 v3 无类：放 `V4_CONTROL`。
- `@removed 4.0` 或仅 v3 有类：新增 `V3_CONTROL_ONLY` 再并入 `v3Set`，不要放 `COMMON`。

## 2.2 drivers/types.ts - Driver 接口

在 `BMapDriver` 的 Control 工厂区域补充创建方法：

```ts
// ─────────────── 28. Control 工厂 ───────────────
createXxxControl(options?: unknown): ControlHandle | null;
```

命名必须与组件 factory 对应：组件里调用 `d.createXxxControl(p)`，driver interface、v4 driver、v3 override 必须一致。

## 2.3 v4Driver.ts - 创建工厂

在 `src/drivers/v4Driver.ts` 的 Control 工厂区域补充实现：

```ts
createXxxControl: (o) => createControlFactory(
  'XxxControl',
  () => new rawSDK.XxxControl(o),
  'xxx',
),
```

注意点：

- 第一个参数必须是 capability 名称，和 `capabilityMatrix.ts` 完全一致。
- 第三个参数是内部 handle type，使用稳定的小写语义名，如 `'zoom'`、`'cityList'`、`'xxx'`。
- 如果 SDK constructor 不接受 options，不要强传用户 props：

```ts
createXxxControl: () => createControlFactory(
  'XxxControl',
  () => new rawSDK.XxxControl(),
  'xxx',
),
```

- 如果 constructor 参数不是单个 options 对象，要在 driver 内提取位置参数，不要把 React props 原样塞给 SDK。

## 2.4 v3Driver.ts - v3 差异处理

`v3Driver.ts` 默认继承 v4 driver 的实现。遇到版本差异时必须显式处理：

- v4-only Control：在 v3 driver 中返回 unsupported/null。
- v3-only Control：在 v3 driver 中显式实现，避免被 v4 capability 闭包拦住。
- constructor 签名 v3/v4 不一致：在 v3 driver 中 override，对 v3 单独适配。

示例：

```ts
createXxxControl: (o) => {
  reportUnsupported('XxxControl', version, behavior);
  return null;
},
```

或：

```ts
createXxxControl: (o) => {
  try {
    return { __brand: 'ControlHandle', raw: new rawSDK.XxxControl(o), type: 'xxx' } as ControlHandle;
  } catch (e) {
    reportUnsupported('XxxControl', version, behavior, e);
    return null;
  }
},
```

## 2.5 Control/index.tsx - 类型和组件

当前 Control 类型和组件都集中在 `src/components/Control/index.tsx`。新增组件时按现有结构补充：

```ts
export interface XxxControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
  // 对照 XxxControlOptions.d.ts 写全字段
}

export type XxxControlProps = XxxControlOptions;

export const XxxControl = createControlComponent<XxxControlProps>({
  displayName: 'XxxControl',
  factory: (d, p) => d.createXxxControl(p),
  optionProps: ['anchor', 'offset'],
  ctorOnlyProps: ['someConstructorOnlyOption'],
  events: [
    { sdk: 'someevent', prop: 'onSomeEvent' },
  ],
});
```

类型要求：

- `anchor` 使用 `ControlAnchor`。
- `offset` 使用 `Size`。
- SDK 写成 `Object` / `any` / `unknown` 的字段，要尽量细化成项目可用类型。
- options 回调按 SDK 签名声明，例如 `(poi: { city: string; code: string | number }) => void`。
- Props 不继承 `OverlayReactProps`；如需显示隐藏，继承或内联支持 `visible?: boolean`。Control 不支持 children，事件通过 `events` 配置订阅 Control 自身的 SDK 事件。

## 2.6 index.ts - 对外导出

在 `src/index.ts` 的 Control 导出区域补充组件和类型：

```ts
export {
  NavigationControl, NavigationControl3D, ScaleControl,
  XxxControl,
} from './components/Control';

export type {
  NavigationControlProps, NavigationControl3DProps, ScaleControlProps,
  XxxControlProps,
} from './components/Control';
```

如果需要暴露 Options 类型，也从 `./components/Control` 一并导出对应 `XxxControlOptions`。

## 3. 测试页（test/）

### 3.1 快速模板页

普通 Control 可先在 `test/src/pages/control/index.tsx` 用模板注册：

```ts
import { XxxControl } from 'react-bmap';

export const XxxControlPage = makeControlTestPage('XxxControl', XxxControl, {
  anchor: 0,
});
```

模板页只覆盖：

- 组件挂载时 `addControl`
- 取消显示时 `removeControl`
- 默认 props 创建

### 3.2 复杂 Control 必须写独立页

如果 Control 有多个 options、回调、v3/v4 差异或交互状态，不要只用模板页。创建独立文件：

`test/src/pages/control/XxxControlPage.tsx`

测试页必须覆盖：

- 每个 options 字段对应一个输入控件。
- `anchor` / `offset` 可调整，并能通过重挂载生效。
- 控件显示/隐藏 checkbox，验证 remove/add 生命周期。
- options 回调有事件日志，例如定位开始、城市切换成功等。
- v3/v4 差异用 `useCapabilities()` 和 `cap-tag` 标注。
- reset all 按钮恢复默认状态。
- 常用预设按钮覆盖典型配置。

测试页里应明确区分两类字段：

- `optionProps` 字段：直接修改 props 后应立即通过 SDK setter 生效。
- `ctorOnlyProps` 字段：修改 props 后组件会自动重建控件，测试页应备注“重建”。

### 3.3 注册路由

1. `test/src/pages/control/index.tsx` 导出页面：

```ts
export { XxxControlPage } from './XxxControlPage';
```

或使用模板：

```ts
export const XxxControlPage = makeControlTestPage('XxxControl', XxxControl, defaultProps);
```

2. `test/src/config.ts` 添加或确认条目：

```ts
{ id: 'xxx-control', name: 'XxxControl', category: C, ready: true },
```

3. 如果主测试集合页面 `ControlsTestPage.tsx` 需要展示全部 Control，也同步补充。

## 4. 检查清单

完成后逐项确认：

- [ ] SDK dts 中 `XxxControlOptions` 的每个字段都有类型声明。
- [ ] `Object` / `any` / `unknown` 字段已尽量细化。
- [ ] options 回调按 SDK 签名声明，并在测试页有日志验证。
- [ ] v3/v4 能力已放入正确 capability 集合。
- [ ] `drivers/types.ts` 增加了 `createXxxControl`。
- [ ] `v4Driver.ts` 增加了 `createXxxControl`，并使用 `createControlFactory`。
- [ ] v3/v4 差异已在 `v3Driver.ts` override 或明确 unsupported。
- [ ] `Control/index.tsx` 导出了 `XxxControlOptions`、`XxxControlProps`、`XxxControl`。
- [ ] `src/index.ts` 对外导出了组件和 Props 类型。
- [ ] 测试页覆盖显示/隐藏、constructor options、版本标签、reset、预设。
- [ ] `optionProps` 字段运行时修改能通过 setter 生效；`ctorOnlyProps` 字段修改会自动重建。
- [ ] `npx tsc --noEmit` 通过。
- [ ] `npx tsc -p test/tsconfig.json --noEmit` 通过。
- [ ] `npm run build` 通过。

## 5. 参考实现

| 文件 | 参考价值 |
|---|---|
| `src/components/Control/index.tsx` | 当前所有 Control 的类型和组件配置入口 |
| `src/utils/createComponent.tsx` | `createControlComponent` 生命周期：create/add/remove |
| `src/drivers/v4Driver.ts` | `createControlFactory` 和已有 Control 工厂实现 |
| `src/drivers/capabilityMatrix.ts` | v3/v4 Control 能力归类 |
| `test/src/pages/control/index.tsx` | 简单 Control 测试页模板注册 |
| `test/src/pages/ControlsTestPage.tsx` | 多 Control 同屏能力展示 |
