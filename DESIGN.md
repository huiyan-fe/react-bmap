# React-BMap 设计规范

> 用 React 组件 + Hooks 完整覆盖百度地图 JSAPI 3.0 / 4.0 两个版本。
>
> **核心架构：Driver 模式**。库不修改 SDK 全局原型，用 driver 包装原始 SDK；组件/Hook 通过 driver 调用；能力差异由 driver 内部处理。
>
> 具体支持的类/方法/常量以 `bmap-jsapi-dts` 为准，开发时对照实现，本文档不罗列。

---

## 0. 设计总则

1. **声明式优先，命令式兜底**：可视对象用 JSX；副作用用 Hook；命令/动画用 `ref`。
2. **Driver 模式而非原型 patch**：库**绝不修改** `window.BMap` / `BMap.Map.prototype` / 命名空间。每个版本一个 driver 实现，包装原始 SDK。所有调用走 `driver.xxx()`。
3. **能力差异显式表达**：每个 driver 暴露 `capabilities: ReadonlySet<Capability>`。组件/Hook 用 `driver.capabilities.has('xxx')` 检测，**不写字符串版本比较**。
4. **不支持的操作有明确语义**（绝不静默伪造）：
   - 命令：根据策略 throw `UnsupportedCapabilityError` 或 warn 后 return；返回 `CommandResult`。
   - 工厂：返回 `null`，组件渲染 `null`。
   - Getter：返回 `undefined`，**绝不返回伪造默认值**。
5. **能力矩阵自动生成**：从 `bmap-jsapi-dts` 的 `@since`/`@removed` 标注自动生成 v3/v4 能力对照表，避免人工维护遗漏。
6. **React 规范严格执行**：render 纯净；外部资源在 effect 中创建；StrictMode 双调用必须正确 cleanup；外部状态用 `useSyncExternalStore`；Portal 由 React 管生命周期。
7. **`<BMapProvider>` 负责加载 + 选 driver**；`<Map>` 负责创建实例 + 提供子树 Context。
8. **受控/非受控并存**；事件 `onXxx`（状态变化 `onXxxChange`，瞬时 `onXxx`）。
9. **失败安全 + SSR/并发友好**。
10. **类型优先**：核心类型来自 dts v4；v3 额外能力通过 driver 类型扩展。

---

## 1. 能力分三大类

| 分类 | 判定 | 承载 |
|------|------|------|
| **A. 可视组件** | 在地图上渲染可视对象，挂载即 add、卸载即 remove | React 组件 |
| **B. 副作用能力** | 无可视输出；异步服务、事件订阅、查询 | Hook |
| **C. 命令式能力** | 一次性、批量、动画 | `forwardRef` / 工具函数 |

判定流程：
```
新增能力 → 渲染可视对象？─ 是 → 组件
         └ 否 → 异步/事件/查询？─ 是 → Hook
             └ 否 → 命令/动画/批量？─ 是 → ref/util
```

---

## 2. Driver 架构

### 2.1 整体形态

```
┌─────────────────────────────────────────────────────────────┐
│                      用户应用层                              │
│   <BMapProvider> <Map> <Marker> ...  useMapStatus() ...     │
└──────────────────────────┬──────────────────────────────────┘
                           │ 调用
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              主工程代码（与版本无关）                         │
│   组件 / Hook / MapRef  →  只调用 driver 上的方法            │
│   零 SDK 原型访问；零 version 字符串比较                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ driver.xxx(map, ...)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│             BMapDriver 接口（统一契约）                      │
│                                                             │
│   readonly version: '3.0' | '4.0'                           │
│   readonly rawSDK:    unknown      // 原始 SDK 引用，只读    │
│   readonly capabilities: ReadonlySet<Capability>            │
│   readonly unsupportedBehavior: 'throw'|'warn'|'ignore'    │
│                                                             │
│   150+ 方法（覆盖 dts Map 类全量 + Overlay/Control/Layer/   │
│   Service/ContextMenu/Panorama 工厂）                       │
│                                                             │
│   不支持时的语义（DESIGN.md §12，绝不污染返回类型）：        │
│   - 命令 void      → throw / warn+noop / ignore+noop        │
│   - Getter（原类型）→ throw / warn+兜底值 / ignore+兜底值    │
│   - 工厂 Handle    → null（构造不存在的类只能 null）        │
└──────────────────────────┬──────────────────────────────────┘
                           │ createV4Driver / createV3Driver
              ┌────────────┴────────────┐
              ▼                         ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│      v4Driver            │  │      v3Driver            │
│  （baseline，主工程同构） │  │  （继承 v4 + 覆盖差异）   │
│                          │  │                          │
│  · 4.0 原生方法 1:1 透传  │  │  · 共有方法继承 v4       │
│  · 3.0-only 方法 unsupported │  · 3.0-only 真实实现     │
│  · capabilities = v4 矩阵 │  │  · 4.0-only 方法 unsupported │
│                          │  │  · capabilities = v3 矩阵 │
└─────────────┬────────────┘  └─────────────┬────────────┘
              │                             │
              └──────────────┬──────────────┘
                             │ 持有 rawSDK（只读不改）
                             ▼
              ┌──────────────────────────────┐
              │  window.BMap（原始 SDK）      │
              │  · 不修改 prototype           │
              │  · 不做命名空间别名           │
              │  · 第三方/微前端看到干净实例  │
              └──────────────────────────────┘
```

**关键约束**：
- 主工程永远调 `driver.xxx()`，从不直接 `map.xxx()` 或 `new SDK.Xxx()`。
- driver 内部持有原始 SDK 引用，**不修改原型、不写命名空间别名**。
- 用户/第三方/微前端看到的是干净的 `window.BMap`。

### 2.2 Driver 接口骨架

driver 接口是「所有版本 API 并集」，具体方法列表开发时按 dts 实现。形态示例：

```ts
interface BMapDriver {
  readonly version: '3.0' | '4.0';
  readonly rawSDK: unknown;                 // 原始 SDK 引用，只读不改
  readonly capabilities: ReadonlySet<Capability>;
  readonly unsupportedBehavior: UnsupportedBehavior;

  // Map 工厂（完整清理：detach listeners、clear overlays、清空 container、原生 destroy）
  createMap(container, opts): MapHandle;
  destroyMap(handle): void;

  // Overlay 工厂（不支持返回 null）
  createMarker(opts): OverlayHandle | null;
  createPrism(opts): OverlayHandle | null;       // v3 → null
  createHotspot(opts): OverlayHandle | null;     // v4 → null
  // ... 其它覆盖物同模式

  // Overlay 操作
  addOverlay(map, ov) / removeOverlay(map, ov) / clearOverlays(map) / getOverlays(map): void | OverlayHandle[];

  // Overlay 属性 setter（按类型分发）
  setOverlayPath(ov, path) / setOverlayPosition(ov, point) / setOverlayOptions(ov, opts): void;

  // Control / Layer / ContextMenu / Panorama 工厂 + 操作（同 Overlay 模式）

  // Map 命令（不支持时 throw 或 warn，返回 CommandResult）
  setCenter(map, c, opts?): CommandResult;
  flyTo(map, point, level, opts?): CommandResult;
  enableMapClick(map): CommandResult;
  // ... 其它命令同模式

  // Map Getter（不支持返回 undefined，绝不伪造）
  getCenter(map): Point;
  getHeading(map): number | undefined;           // v3 → undefined
  isLoaded(map): boolean | undefined;            // v3 → undefined，不返回 true
  getSpots(map): OverlayHandle[] | undefined;    // v3 → undefined，不返回 []
  // ... 其它 getter 同模式

  // 服务工厂（不支持返回 isNull: true 的 ServiceHandle）
  createRidingRoute(opts): ServiceHandle;        // v3 → isNull: true
  searchService(svc, query, callbacks): () => void;
  getServiceResults(svc): unknown | null;

  // 事件（统一 add/remove，返回 unsubscribe）
  addEventListener(target, type, handler): () => void;
}
```

### 2.3 Driver 实现模式

```ts
// src/drivers/v4Driver.ts
export function createV4Driver(rawSDK: any, opts: { unsupportedBehavior }): BMapDriver {
  const capabilities = CAPABILITY_MATRIX.v4;       // 自动生成（§3）

  const reportUnsupported = (cap: Capability) => {
    if (opts.unsupportedBehavior === 'throw')
      throw new UnsupportedCapabilityError(cap, '4.0');
    if (opts.unsupportedBehavior === 'warn')
      console.warn(`[react-bmap] ${cap} not supported in 4.0`);
  };

  return {
    version: '4.0',
    rawSDK,
    capabilities,
    unsupportedBehavior: opts.unsupportedBehavior,

    createMap(container, mapOpts) {
      const raw = new rawSDK.Map(container, mapOpts);
      return { __brand: 'MapHandle', raw };
    },

    destroyMap(handle) {
      const raw = handle.raw as BMap.Map;
      raw.clearOverlays();
      detachAllListeners(raw);                     // 库内部 WeakMap 记录的订阅
      if (typeof raw.destroy === 'function') raw.destroy();
      // v3 没 destroy 时清空 container 子节点
    },

    flyTo(map, point, level, flyOpts) {
      if (!capabilities.has('flyTo')) {
        reportUnsupported('flyTo');
        return { ok: false, reason: 'unsupported', capability: 'flyTo' };
      }
      (map.raw as any).flyTo(point, level, flyOpts);
      return { ok: true };
    },

    isLoaded(map) {
      if (!capabilities.has('isLoaded')) return undefined;     // 不返回 true
      return (map.raw as any).isLoaded();
    },

    createPrism(ovOpts) {
      if (!capabilities.has('prism')) { reportUnsupported('prism'); return null; }
      const raw = new rawSDK.Prism(ovOpts.path, ovOpts);
      return { __brand: 'OverlayHandle', raw, type: 'prism' };
    },

    createRidingRoute(svcOpts) {
      if (!capabilities.has('ridingRoute'))
        return { __brand: 'ServiceHandle', raw: null, isNull: true };
      return { __brand: 'ServiceHandle', raw: new rawSDK.RidingRoute(svcOpts), isNull: false };
    },

    // ... 其它方法同模式
  };
}
```

v3 driver 真实实现 v3-only（`enableMapClick`/`setMapStyle` v1/`setPanorama`...），4.0-only 走 unsupported。

### 2.4 capabilities 内部决策

组件层用 driver 的工厂/方法时，**driver 内部已做能力判断**：
- 工厂返回 `null` → 组件渲染 `null`。
- 命令返回 `CommandResult` 或 throw → 用户可显式判断。
- getter 返回 `undefined` → 用户自然处理。

用户**不强制**写能力判断，但可选 `useCapabilities()` 预判（见 §6.1.2）。

---

## 3. 能力矩阵自动生成

### 3.1 来源

从 `bmap-jsapi-dts` 仓库的 `src/**/*.d.ts` 自动扫描 JSDoc 标注：
- `@since 4.0` → v4 独有
- `@removed 4.0` → v4 移除（即 v3 独有）
- 无标注 → 全版本共有

### 3.2 生成脚本

```ts
// scripts/gen-capability-matrix.ts（构建期运行）
const matrix: Record<'v3' | 'v4', Set<Capability>> = { v3: new Set(), v4: new Set() };

for (const node of allNodes) {
  const since = getJSDocTag(node, '@since');
  const removed = getJSDocTag(node, '@removed');
  if (!since && !removed) { matrix.v3.add(...); matrix.v4.add(...); }
  if (since === '4.0') matrix.v4.add(...);
  if (!removed) matrix.v3.add(...);
}


writeFileSync('src/drivers/capabilityMatrix.ts', '...');  // AUTO-GENERATED
```

每次 dts 升级跑 `npm run gen:capabilities`。CI 校验矩阵与 driver 实现一致。

---

## 4. JSAPI 加载层：`<BMapProvider>`

### 4.1 职责

```
<BMapProvider version="4.0" ak="...">    ← 加载 JSAPI；创建 driver；注入 Context
  <Map>                                    ← 用 driver 创建实例
    <Marker/> ...
  </Map>
</BMapProvider>
```

加载流程：
1. 通过 `@baidumap/jsapi-loader` 加载 JSAPI。
2. 用 generation token 标记本次请求；超时后即使脚本到达也忽略。
3. 加载成功 → 拿到原始 SDK（**不修改原型、不做别名**）。
4. 按 version 创建 driver。
5. driver 写入 `BMapContext`。

### 4.2 加载缓存 key（不只看 version）

JSAPI 是全局单例，但同 version 不同 AK/serviceHost/language 也视为不同加载请求：

```ts
const loadKey = stableHash({ version, ak, serviceHost, language, plugins });
```

- 首次以 loadKey 注册到全局 Promise registry。
- 同 loadKey 复用。
- 不同 loadKey 触发 `onLoadConflict(current, requested)`，dev 环境 `console.error`，**不强行覆盖**。

### 4.3 超时与竞态

```ts
const generation = useRef(0);
useEffect(() => {
  const my = ++generation.current;
  load({...}).then(sdk => {
    if (my !== generation.current) return;      // 已被新请求取代
    setReady(sdk);
  }).catch(err => {
    if (my !== generation.current) return;
    setError(err);
  });
  return () => { generation.current++; };
}, [loadKey]);
```

### 4.4 Provider Props

```ts
interface BMapProviderProps {
  ak: string;
  version?: '3.0' | '4.0';                 // 默认 '4.0'
  protocol?: 'http' | 'https';
  serviceHost?: string;
  language?: string;
  plugins?: string[];
  timeout?: number;                                // 默认 10000
  globalConfig?: Record<string, unknown>;
  unsupportedBehavior?: 'throw' | 'warn' | 'ignore';   // 默认 'warn'
  onError?: (err: Error) => void;
  onLoadConflict?: (current, requested) => void;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  children?: ReactNode;
}
```

### 4.5 SSR 安全

`window` 访问全包 guard。SSR 下 `status: 'loading'`，渲染 `fallback`。

### 4.6 两个 Context

```ts
interface BMapContextValue {
  status: 'loading' | 'ready' | 'error';
  driver: BMapDriver | null;
  version: '3.0' | '4.0';
  error: Error | null;
}

interface MapContextValue {
  map: MapHandle | null;
  driver: BMapDriver;
}
```

---

## 5. 容器组件：`<Map>`

### 5.1 React 规范要点

1. **`useLayoutEffect`** 创建地图，避免首帧空白。
2. **完整 cleanup**：detach listeners、clear overlays、destroy 或清空 container。
3. **依赖数组**：含 driver/status/container/onReady，不用空依赖闭包。
4. **StrictMode 安全**：cleanup 必须真正释放，第二次 mount 干净创建。

### 5.2 实现骨架

```tsx
function Map({ center, zoom, heading, tilt,
              defaultCenter, defaultZoom, defaultHeading, defaultTilt,
              mapStyle, mapStyleV2, onReady, ...events, children, className, style, errorFallback }) {
  const { driver, status } = useBMapContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapHandle | null>(null);
  const onReadyRef = useLatest(onReady);
  const eventsRef = useLatest(events);

  // 受控循环抑制
  const internalUpdateRef = useRef(false);

  // ─── 创建地图（useLayoutEffect 避免闪烁） ───
  useLayoutEffect(() => {
    if (status !== 'ready' || !driver || !containerRef.current) return;

    const container = containerRef.current;
    const initial = buildInitialOptions({ defaultCenter, defaultZoom, /* ... */ });
    const handle = driver.createMap(container, initial);
    setMap(handle);
    onReadyRef.current?.(handle);

    // 注册受控回调
    const unsubs = [
      driver.addEventListener(handle, 'moveend', () => {
        if (internalUpdateRef.current) return;          // 抑制循环
        eventsRef.current.onCenterChange?.(wrap(driver.getCenter(handle)));
      }),
      driver.addEventListener(handle, 'zoomend', () => {
        if (internalUpdateRef.current) return;
        eventsRef.current.onZoomChange?.(wrap(driver.getZoom(handle)));
      }),
      // ... click / headingchange / tiltchange 等同理
    ];

    return () => {
      unsubs.forEach(u => u());
      driver.destroyMap(handle);                        // 完整 cleanup
      setMap(null);
    };
  }, [driver, status]);                                 // ★ 不含受控 props

  // ─── 受控同步（独立 effect，带循环抑制） ───
  useLayoutEffect(() => {
    if (!map || !driver || !center) return;
    if (!pointEquals(driver.getCenter(map), center, 1e-7)) {
      internalUpdateRef.current = true;
      driver.setCenter(map, center);
      requestAnimationFrame(() => { internalUpdateRef.current = false; });
    }
  }, [map, driver, center]);

  // zoom / heading / tilt / mapStyle / mapStyleV2 类似

  if (status === 'error') return <>{errorFallback ?? null}</>;

  return (
    <div ref={containerRef} className={className} style={style}>
      {map && (
        <MapContext.Provider value={{ map, driver }}>
          {children}
        </MapContext.Provider>
      )}
    </div>
  );
}
```

最低 React 18，统一 `forwardRef`。

---

## 6. Hook

### 6.1 实例与状态

| Hook | 返回 | 用途 |
|------|------|------|
| `useMap()` | `MapHandle \| null` | 拿地图句柄 |
| `useDriver()` | `BMapDriver \| null` | 拿 driver |
| `useMapRef()` | `MapRef` | 命令式句柄 |
| `useMapStatus()` | `MapSnapshot \| null` | 见 §6.1.1 |
| `useCapabilities()` | `ReadonlySet<Capability>` | 显式能力检测（可选） |

#### 6.1.1 `useMapStatus`（useSyncExternalStore 完整规范）

```ts
type MapSnapshot = {
  center: { lng: number; lat: number } | null;        // 不可变 plain object
  zoom: number | null;
  bounds: { sw: Point; ne: Point } | null;
  size: { width: number; height: number } | null;
  heading: number | null;
  tilt: number | null;
};

function useMapStatus(): MapSnapshot | null {
  const { map, driver } = useMapContext();
  const cachedRef = useRef<MapSnapshot | null>(null);

  return useSyncExternalStore(
    (cb) => {                                          // subscribe
      if (!map || !driver) return () => {};
      const unsubs = [
        driver.addEventListener(map, 'moveend', cb),
        driver.addEventListener(map, 'zoomend', cb),
        driver.addEventListener(map, 'resize', cb),
        driver.addEventListener(map, 'headingchange', cb),
        driver.addEventListener(map, 'tiltchange', cb),
      ];
      return () => unsubs.forEach(u => u());
    },
    () => {                                            // getSnapshot
      if (!map || !driver) return null;
      const next = readSnapshot(map, driver);
      if (shallowEqual(cachedRef.current, next)) return cachedRef.current;
      cachedRef.current = next;
      return next;
    },
    () => null                                         // getServerSnapshot
  );
}
```

要点：
- snapshot 是库自定义的 plain object，**不暴露 SDK 实例**（避免可变性问题）。
- 缓存 + shallowEqual，避免无限循环。
- `getServerSnapshot` 返回 null。
- map 替换时 subscribe 自动重订阅（依赖 map）。

#### 6.1.2 `useCapabilities`

```ts
function useCapabilities(): ReadonlySet<Capability> {
  const driver = useDriver();
  return driver?.capabilities ?? new Set<Capability>();
}
```

### 6.2 事件订阅（ref 化 + null map 安全）

```ts
function useMapEvent<K extends MapEventType>(type: K, handler: (e: BMapEvent) => void) {
  const { map, driver } = useMapContext();
  const handlerRef = useLatest(handler);
  useEffect(() => {
    if (!map || !driver) return;
    return driver.addEventListener(map, type, (e) => handlerRef.current(e));
  }, [map, driver, type]);
}
```

### 6.3 服务 Hook（render 阶段不构造 + 过期请求保护）

```ts
function useDrivingRoute(opts) {
  const driver = useDriver();
  const svcRef = useRef<ServiceHandle | null>(null);
  const requestIdRef = useRef(0);
  const [state, setState] = useState<{
    data: unknown; loading: boolean; error: Error | null; supported: boolean;
  }>({ data: undefined, loading: false, error: null, supported: true });

  // service 在 effect 中创建（不在 render 阶段）
  useEffect(() => {
    if (!driver) return;
    const svc = driver.createDrivingRoute(opts);
    svcRef.current = svc;

    if (svc.isNull) {
      setState({ data: undefined, loading: false,
                 error: new UnsupportedCapabilityError('drivingRoute', driver.version),
                 supported: false });
      return;
    }
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { svcRef.current = null; };
  }, [driver, stableStringify(opts)]);

  const run = useCallback((query) => {
    if (!svcRef.current || svcRef.current.isNull) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));

    return driver.searchService(svcRef.current, query, {
      onSuccess: (data) => {
        if (requestId !== requestIdRef.current) return;     // 过期请求忽略
        setState({ data, loading: false, error: null, supported: true });
      },
      onError: (err) => {
        if (requestId !== requestIdRef.current) return;
        setState(s => ({ ...s, loading: false, error: err }));
      },
    });
  }, [driver]);

  const cancel = useCallback(() => { requestIdRef.current++; }, []);

  return { ...state, run, cancel };
}
```

要点：
- service 在 **effect 中创建**，render 纯净。
- 不支持时**生产环境也设 error**（语义一致，不区分 dev/prod）。
- `requestIdRef` 防止过期请求覆盖。
- 卸载时 `svcRef.current = null`。

服务 Hook 清单开发时按 dts 实现，本节不罗列。

### 6.4 计算 Hook

`useDistance`/`useViewport`/`usePixelFromPoint`/`usePointFromPixel`/`useLnglatToMercator`/`useMercatorToLnglat` 等，统一通过 driver 调用对应 map 方法，不支持时 data 为 undefined。

---

## 7. C 类：命令式能力：MapRef

```ts
interface MapRef {
  // 全部 driver 命令/getter 透传，签名一致
  // 示例：
  getCenter(): Point;
  setCenter(c, opts?): CommandResult;
  flyTo(point, level, opts?): CommandResult;
  enableMapClick(): CommandResult;
  getMapScreenshot(): string | undefined;
  isLoaded(): boolean | undefined;
  addLayer(layer, kind): void;
  destroy(): void;
  // ... 完整方法开发时按 dts 实现
}

function useMapRef(): MapRef {
  const { map, driver } = useMapContext();
  return useMemo(() => new MapRefImpl(map, driver), [map, driver]);
}
```

`MapRefImpl` 内部全部 `driver.xxx(this.map, ...)` 透传，无版本判断。

调用方：
- 默认直接 `mapRef.flyTo(...)`，看返回值/异常。
- 严格场景用 `useCapabilities().has('flyTo')` 预判。

---

## 8. 事件模型

### 8.1 命名规范

| 类别 | 规则 | 示例 |
|------|------|------|
| **状态变化类** | `onXxxChange`/`Start`/`End` | `onCenterChange`/`onZoomChange`/`onHeadingChange`/`onTiltChange`/`onMoveStart`/`onMoveEnd`/`onZoomEnd`/`onDragEnd` |
| **瞬时交互类** | `onXxx` | `onClick`/`onDoubleClick`/`onRightClick`/`onMouseMove`/`onMouseOver`/`onMouseOut`/`onDrag`/`onTouchStart`/`onLongPress` |

### 8.2 统一事件对象

```ts
type BMapEvent = {
  type: string;
  target: MapHandle | OverlayHandle | null;
  point?: Point;
  pixel?: Pixel;
  overlay?: OverlayHandle;
  raw: unknown;
};
```

driver 内部把 SDK 原始事件包装成 BMapEvent（`raw` 保留原对象）。

### 8.3 清理

所有订阅在 useEffect 中注册/卸载，map 实例替换自动重订阅。

---

## 9. 受控/非受控与生命周期

### 9.1 覆盖物生命周期（拆创建/更新两个 effect）

```tsx
function Polyline({ path, strokeColor, strokeWeight, ... }) {
  const { map, driver } = useMapContext();
  const ovRef = useRef<OverlayHandle | null>(null);

  // 创建（仅依赖 map/driver，path 用初始值）
  useLayoutEffect(() => {
    if (!map || !driver) return;
    const ov = driver.createPolyline({ path, strokeColor, strokeWeight, ... });
    if (!ov) return;                                    // 不支持时 driver 返回 null
    ovRef.current = ov;
    driver.addOverlay(map, ov);
    return () => {
      driver.removeOverlay(map, ov);
      ovRef.current = null;
    };
  }, [map, driver]);

  // 更新 path（用户传新数组，不重建 overlay）
  useEffect(() => {
    if (ovRef.current) driver.setOverlayPath(ovRef.current, path);
  }, [path]);

  // 更新 style
  useEffect(() => {
    if (ovRef.current) driver.setOverlayOptions(ovRef.current, { strokeColor, strokeWeight });
  }, [strokeColor, strokeWeight]);

  return null;
}
```

**关键**：path 数组每次 render 都是新引用，但只触发 setter effect，不触发 create effect。

### 9.2 受控 vs 非受控

```tsx
<Map defaultCenter={pt} defaultZoom={11} />            // 非受控
<Map center={c} zoom={z} onCenterChange={setC} />      // 受控
```

### 9.3 `<Map>` 受控循环抑制

详见 §5.2：
- `internalUpdateRef` 标记「这次是库内部 setCenter 触发的 moveend」。
- `pointEquals(a, b, 1e-7)` 经纬度误差容忍，避免无意义更新。
- 受控 effect 在 setCenter 后 `requestAnimationFrame` 释放 flag。

### 9.4 Marker 拖拽受控

视觉位置由 SDK 内部管理，React 状态 `onDragEnd` 后同步——预期行为，组件注释中明示。

### 9.5 加载就绪

`status: 'ready'` 后 `<Map>` 才 createMap；`onReady(map)`；`useMap()` 返回 `null` 时子组件条件渲染。

---

## 10. 嵌套 Context 与组合模式

### 10.1 `<CustomOverlay>` / `<Control>` render-prop（用 Portal，不手动 unmount）

```tsx
function CustomOverlay({ position, pane, offset, children }) {
  const { map, driver } = useMapContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<OverlayHandle | null>(null);
  const pixelRef = useRef<Pixel | null>(null);

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const container = document.createElement('div');
    container.style.position = 'absolute';
    containerRef.current = container;

    const overlay = driver.createCustomOverlay({
      position, pane, offset,
      initialize: () => container,
      draw: (pixel) => {
        pixelRef.current = pixel;
        container.style.transform =
          `translate(${pixel.x + offset[0]}px, ${pixel.y + offset[1]}px)`;
      },
    });
    overlayRef.current = overlay;
    driver.addOverlay(map, overlay);

    return () => {
      driver.removeOverlay(map, overlay);
      containerRef.current = null;
    };
  }, [map, driver, pane]);

  useEffect(() => {
    if (overlayRef.current) driver.setOverlayPosition(overlayRef.current, position);
  }, [position]);

  // Portal：让 React 自然管理 children 生命周期
  return containerRef.current
    ? createPortal(children({ point: position, pixel: pixelRef.current, map }), containerRef.current)
    : null;
}
```

**要点**：
- 用 `createPortal`，**不调用 `unmountComponentAtNode`**（React 19 已移除）。
- 默认 transform 定位，不触发 React 重渲染。
- 卸载时只 `removeOverlay` + 让 containerRef 失效，React 自然把 Portal 子树从 DOM 移除。

### 10.2 `<MarkerClusterer>` + `<Marker>`

`<MarkerClusterer>` 创建 clusterer 实例，写入 `OverlayTargetContext`。`<Marker>` 读 Context：有值时 `driver.clusterAddMarker(clusterer, marker)`；无值时 `driver.addOverlay(map, marker)`。

```tsx
<MarkerClusterer gridSize={60}>
  {points.map(p => <Marker key={p.id} position={p} />)}
</MarkerClusterer>
```

### 10.3 `<ContextMenu>` + `<MenuItem>`

```
<Marker>                         provides MarkerContext + OverlayTargetContext(marker)
  <ContextMenu>                  reads OverlayTargetContext；provides ContextMenuContext(menu)
    <MenuItem/>                  reads ContextMenuContext
  </ContextMenu>
</Marker>
```

`<ContextMenu>` 根据 `OverlayTargetContext` 决定 target（map 或 overlay）。`<MenuItem>` 调 `driver.addMenuItem(menu, item, insertIndex)`——v3 上 insertIndex 被 JS 静默忽略（按 push 顺序）。

### 10.4 `<Panorama>` + `<PanoramaLabel>`

`<Panorama>` 必须在 `<BMapProvider>` 内，可在 `<Map>` 外或内。`driver.createPanorama` 返回独立 MapHandle，写入 `PanoramaContext`，unmount 时 `driver.destroyPanorama`。

### 10.5 `<DrawingManager>` 产物转 React

库提供 `normalizeOverlay(handle, mode)` 工具从 OverlayHandle 提取数据（`path`/`position`/`center`/`radius`）。**库不自动 removeOverlay**，保留实例给用户决定：

```tsx
<DrawingManager
  drawingMode="polygon"
  onOverlayComplete={(e) => {
    const data = normalizeOverlay(e.overlay, 'polygon');  // 先 normalize
    setShapes(s => [...s, data.path]);
    driver.removeOverlay(e.map, e.overlay);                // 用户决定是否销毁
  }}
/>
{shapes.map((p, i) => <Polygon key={i} path={p} />)}
```

事件参数含：`overlay`（OverlayHandle）、`drawingMode`、`map`（MapHandle）。

---

## 11. 错误处理、SSR、并发

### 11.1 错误边界

- 可选导出 `<BMapErrorBoundary>`。
- `<Map>` 失败默认 `errorFallback`（不传默认 `null`）+ `onError` + `console.error`。
- 不支持能力按 `unsupportedBehavior`：`throw` 抛 `UnsupportedCapabilityError`（被 ErrorBoundary 捕获）；`warn`/`ignore` 不抛。

### 11.2 SSR

`window` 访问全包 guard；SSR 下 `status: 'loading'`；`useMapStatus` 的 `getServerSnapshot` 返回 `null`。

### 11.3 React 18 并发

- 外部状态统一 `useSyncExternalStore`。
- 高频事件（mousemove/dragging）直接调 handler 不触发 React 渲染。
- 受控变更在 `useLayoutEffect` 中 apply。

### 11.4 StrictMode 验证

库开发时强制跑：
- `<Map>` 在 StrictMode 下 mount-unmount-mount 不泄漏（map 实例、listener、container 子节点）。
- 覆盖物 mount-unmount-mount 不重复添加。
- service Hook 在 StrictMode 下不重复 `new`。

---

## 12. Capability 策略

### 12.1 三种策略（全局设置）

| 策略 | 行为 | 适用 |
|------|------|------|
| `'throw'` | 不支持时抛 `UnsupportedCapabilityError` | 严格项目，早暴露（推荐默认） |
| `'warn'`（当前默认） | console.warn 后**返回兜底值**（getter）或 noop（命令） | 宽松项目，业务可继续运行 |
| `'ignore'` | 静默返回兜底值/noop | 用户已知差异、自己负责 |

Provider 配置：`<BMapProvider unsupportedBehavior="throw">`。**整个应用统一策略**，调用方无需每次传参。

### 12.2 不支持能力的语义（**不污染原函数返回类型**）

**核心原则**：Getter 与命令的签名**与 dts 完全一致**（如 `getHeading(): number`、`flyTo(...): void`）。版本不支持时，行为由全局 `unsupportedBehavior` 决定，**绝不在返回类型上加 `| undefined`**。

| 类型 | dts 签名 | 不支持时（按 behavior） |
|------|---------|----------------------|
| 命令 | `flyTo(point, level, opts?): void` | throw → 抛错；warn → console.warn + noop；ignore → 静默 noop |
| Getter | `getHeading(): number` | throw → 抛错；warn → console.warn + 返回兜底值；ignore → 静默返回兜底值 |
| 工厂 | `new Marker(point, opts)` → 我们包装为 `createMarker(): MarkerHandle` | 仍返回 `MarkerHandle \| null`（无法构造不存在的类，只能返回 null） |

**兜底值**：
- number: `NaN`（业务可用 `Number.isNaN()` 检测，符合 IEEE 754 语义）
- string: `''`
- Point/Bounds/Size 等复杂对象：返回**全 undefined 字段**的对象（如 `{ lng: undefined, lat: undefined } as Point`）——类型符合，运行时业务读取字段得到 undefined

用户若选了 warn/ignore，需自行用 `useCapabilities()` 预判或用 `Number.isNaN()` 等检测兜底值。

### 12.3 用户主动检测（推荐）

无论哪种 behavior，推荐用 `useCapabilities()` 显式预判。**capability 命名采用命名空间前缀**，无歧义：

| 命名规则 | 含义 | 示例 |
|---------|------|------|
| `PascalCase` | 类是否存在（覆盖物/控件/图层/服务/全景） | `Prism`、`Marker`、`NavigationControl3D`、`NormalLayer`、`RidingRoute` |
| `ClassName.method` | 某类的方法是否存在（跨版本差异） | `Map.flyTo`、`Map.enableMapClick`、`Map.setMapStyleV2`、`Marker.openInfoWindow` |

```tsx
const caps = useCapabilities();

// 类存在性
caps.has('Marker');              // 全版本 true
caps.has('Prism');               // 仅 v4 true
caps.has('NormalLayer');         // 仅 v4 true
caps.has('RidingRoute');         // 仅 v4 true
caps.has('Hotspot');             // 仅 v3 true

// 方法存在性
caps.has('Map.flyTo');           // 仅 v4 true
caps.has('Map.enableMapClick');  // 仅 v3 true
caps.has('Map.setMapStyleV2');   // 仅 v4+ true
caps.has('Marker.openInfoWindow'); // 仅 v4+ true（v3 是 Map.openInfoWindow）

if (caps.has('Map.flyTo')) {
  const h = mapRef.getHeading();   // 类型 number，无 undefined 污染
}
```

或用 `tryOp` 工具包一层，在 throw 模式下拿 Result 类型：

```tsx
import { tryOp } from 'react-bmap';
const r = tryOp(() => mapRef.flyTo(point, level));
if (!r.ok) { /* fallback */ }
```

### 12.4 为什么不污染返回类型

之前的设计把「不支持」信号塞进返回值（如 `getHeading(): number | undefined`），有三个问题：
1. **类型与 dts 不一致**，用户读 dts 期望 `number`，实际要 null-check。
2. **静默失败**：返回 `undefined` 让 `if (heading > 0)` 这种代码静默走错分支，比抛错更难排查。
3. **三套语义**：命令 `CommandResult` / 工厂 `Handle | null` / Getter `T | undefined`，认知负担大。

新设计：
- 类型 100% 匹配 dts
- 失败信号通过 throw 显式表达（默认）
- 全局策略统一控制，调用方零噪音
- 工厂保留 `| null`（构造不存在的类无法避免）

---

## 13. 多版本差异说明

具体差异开发时按 `bmap-jsapi-dts` 的 `@since`/`@removed` 标注自动生成能力矩阵（§3）。**本文档不罗列**。

典型差异示例（说明模式，非完整清单）：
- 4.0-only：`flyTo`/`setHeading`/`setTilt`/`addNormalLayer`/`addGeoJSONLayer`/`Prism`/`NavigationControl3D`/`RidingRoute`/`getMapScreenshot`/`lnglatToMercator` 等。
- 3.0-only：`enableMapClick`/`enable3DBuilding`/`setPanorama`(map 绑定)/`addHotspot`/`setMapStyle`(v1) 等。
- 共有：`Marker`/`Polyline`/`Polygon`/`Label`/`Circle`/`setCenter`/`setZoom`/`panTo`/`LocalSearch`/`Geocoder`/`DrivingRoute` 等基础能力。


---

## 14. 常量

库**自己静态定义**所有 `BMAP_*` 常量（不依赖 SDK 运行时）：

```ts
// src/constants/index.ts（开发时按 dts 全部转录）
export const BMAP_ANCHOR_TOP_LEFT = 0;
export const BMAP_NORMAL_MAP = 'B_NORMAL_MAP';
// ...
```

ES module 静态导出，不受 SDK 异步加载影响。

---

## 15. 目录结构

```
src/
  drivers/                  # Driver 实现（不动 SDK 原型）
    types.ts                # 接口、Handle 类型、Capability
    capabilityMatrix.ts     # 自动生成
    v4Driver.ts / v3Driver.ts
    createDriver.ts
    unsupported.ts          # UnsupportedCapabilityError, CommandResult
  loader/                   # JSAPI 加载层
    registry.ts             # loadKey 缓存 + generation token
    loadV3.ts / loadV4.ts
    stableHash.ts
  context/                  # BMapContext / MapContext / 嵌套 Context
  provider/                 # BMapProvider
  components/
    Map/                    # Map / MapRef / useMapStatus / lifecycle 工具
    Overlay/                # Marker / Polyline / ... / CustomOverlay(render-prop)
    Control/                # 各控件 + Control(render-prop)
    Layer/                  # 各图层 + MarkerClusterer / MapvLayer
    Menu/                   # ContextMenu / MenuItem
    Panorama/               # Panorama / PanoramaLabel
    Tool/                   # DrawingManager
  hooks/                    # useMap / useDriver / useMapRef / useMapStatus
                             # useCapabilities / useMapEvent / useMapEvents
                             # services/ panorama/ 计算 hooks
  utils/                    # geometry / event / normalizeOverlay / shallowEqual
                             # useLatest / stableStringify / pointEquals
  errorBoundary/            # BMapErrorBoundary
  constants/                # 静态 BMAP_*
  types/
  index.ts

scripts/
  gen-capability-matrix.ts  # 从 dts 自动生成
```

---

## 16. 命名约定

- 组件 PascalCase；Hook `use` camelCase；工具 camelCase。
- Props：`XxxProps`，对应 `XxxOptions`；受控字段用 `Omit<MapOptions, ...> & {...}`。
- 常量原样 `BMAP_*`，库静态定义。
- 事件：状态变化 `onXxxChange/Start/End`，瞬时 `onXxx`。
- 用户代码可不写版本分支；库内部用 driver.capabilities 检测。

---

## 17. 使用示例

### 17.1 最小（4.0）

```tsx
<BMapProvider ak="YOUR_AK" version="4.0">
  <Map center={{ lng: 116.404, lat: 39.915 }} zoom={12} style={{ height: 600 }}>
    <Marker position={{ lng: 116.404, lat: 39.915 }}>
      <InfoWindow open>Hello</InfoWindow>
    </Marker>
  </Map>
</BMapProvider>
```

### 17.2 显式能力检测（可选）

```tsx
const caps = useCapabilities();
return caps.has('navigationControl3D')
  ? <NavigationControl3D />
  : <NavigationControl />;
```

### 17.3 调 3.0-only API（v4 上 throw 或 warn）

```tsx
const mapRef = useMapRef();
useEffect(() => {
  try { mapRef.enableMapClick(); }
  catch (e) {
    if (e instanceof UnsupportedCapabilityError) { /* 4.0 上 fallback */ }
  }
}, []);
```

### 17.4 调 4.0-only API（v3 上 unsupported）

```tsx
const result = mapRef.flyTo(point, 16);
if (!result.ok) { /* v3 上 fallback */ }
```

### 17.5 服务 Hook（不支持时统一语义）

```tsx
const { data, loading, error, supported } = useRidingRoute({ ... });
if (!supported) return <div>当前版本不支持骑行路线</div>;
if (loading) return <Spinner />;
if (error) return <ErrorView error={error} />;
return <Polyline path={data.getPath()} />;
```

### 17.6 MarkerClusterer / DrawingManager

```tsx
<MarkerClusterer gridSize={60}>
  {points.map(p => <Marker key={p.id} position={p} />)}
</MarkerClusterer>

<DrawingManager drawingMode="polygon" onOverlayComplete={(e) => {
  const data = normalizeOverlay(e.overlay, 'polygon');
  setShapes(s => [...s, data.path]);
  driver.removeOverlay(e.map, e.overlay);
}} />
```

---

## 18. 设计自检清单（必须满足）

下列条目是本设计的硬约束，每条对应前文具体章节。实现完成或评审时逐项检查，违反任意一条都算设计漏洞：

1. **Driver 模式而非原型 patch** — 库代码不修改 `window.BMap` / `BMap.Map.prototype` / 命名空间别名（§2）。
2. **不伪造 getter 返回值** — 不支持时返回 `undefined`，绝不返回 `() => true` / `() => 3` / `() => []` 等「看似合法的默认值」（§12.2）。
3. **能力矩阵从 dts 自动生成** — `src/drivers/capabilityMatrix.ts` 由脚本生成，CI 校验与 driver 实现一致；不接受人工手维护（§3）。
4. **render 阶段纯净** — SDK service / overlay / map 实例都在 effect 中 `new`，不在 render 主体调用构造函数（§5.2/§6.3/§9.1）。
5. **Map 用 useLayoutEffect + 完整 cleanup** — 创建地图用 layout effect；cleanup 含 detach listeners、clear overlays、destroy 或清空 container；不空依赖闭包（§5.2）。
6. **覆盖物拆创建/更新 effect** — 创建 effect 仅依赖 map/driver，path/position/style 用独立 setter effect，避免依赖重建导致闪烁（§9.1）。
7. **CustomOverlay 用 Portal 不手动 unmount** — 不调用 `unmountComponentAtNode`（React 19 已移除）；子树生命周期由 React 管（§10.1）。
8. **useMapStatus 全规范** — 稳定 subscribe、缓存 snapshot、`getServerSnapshot`、不暴露 SDK 实例、shallowEqual 防无限循环（§6.1.1）。
9. **受控循环抑制** — center/zoom/heading/tilt 同步用 `internalUpdateRef` + `pointEquals(a, b, 1e-7)` 防回流循环（§5.2/§9.3）。
10. **StrictMode 双调用通过** — mount-unmount-mount 不泄漏（map 实例、listener、container 子节点）；service 不重复 `new`；覆盖物不重复 add（§11.4）。
11. **loader 完整 loadKey + generation token** — loadKey 含 version/ak/serviceHost/language/plugins；超时后到达的脚本被 generation token 忽略（§4.2/§4.3）。
12. **dev/prod 一致 error 语义** — 服务 Hook 在不支持时无论 dev/prod 都设 `error: UnsupportedCapabilityError`；只有日志输出可选，公共状态语义不区分环境（§6.3）。
13. **服务 Hook 过期请求保护** — 用 `requestIdRef` 忽略过期回调；卸载后 setState 由 React 吞掉（§6.3）。
14. **常量库静态定义** — `BMAP_*` 在 `src/constants/index.ts` 静态导出，不从异步加载的 SDK 取（§14）。
15. **真实 SDK E2E 测试矩阵** — CI 对 3.0/4.0 三个真实在线 SDK 跑同一套组件测试集，验证 driver 行为（§3 + §11.4）。

---

## 19. 边界

1. 不做 UI 组件库；不内置状态管理；不重造渲染引擎。
2. 服务 Hook 真实调用 JSAPI，不 mock。

5. **库不修改 SDK 原型、不做命名空间别名**：所有版本差异通过 driver 抽象承载。
6. **能力矩阵从 dts 自动生成**：避免人工维护遗漏；CI 校验矩阵与 driver 实现一致。
