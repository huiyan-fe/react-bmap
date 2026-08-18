/**
 * 通用组件工厂 — 消除 Overlay / Control / Layer 组件的重复代码。
 *
 * 每个具体组件只需声明：
 * - 工厂方法（driver.createXxx）
 * - 哪个 prop 是 position（→ setOverlayPosition）
 * - 哪个 prop 是 path（→ setOverlayPath）
 * - 哪些 props 是 options（→ setOverlayOptions）
 *
 * 工厂内部统一处理：mount→create→add、unmount→remove、props change→setter。
 */
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useMapContext } from '../context/MapContext';
import { useOverlayTarget, OverlayTargetContext } from '../context/OverlayTargetContext';
import type { OverlayTargetStore } from '../context/OverlayTargetContext';
import { stableStringify } from '../utils/stableStringify';
import { devWarn } from './debugWarn';
import type { BMapDriver } from '../drivers/types';
import type {
  ControlHandle,
  LayerHandle,
  MapHandle,
  OverlayHandle,
  Point,
} from '../types';

// ─────────────── Overlay 组件工厂 ───────────────

export interface OverlayComponentConfig<P> {
  /** 工厂方法：用 driver 创建 overlay */
  factory: (driver: BMapDriver, props: P) => OverlayHandle | null;
  /** position 属性名（变化时调 setOverlayPosition） */
  positionProp?: keyof P & string;
  /** path 属性名（变化时调 setOverlayPath） */
  pathProp?: keyof P & string;
  /** options 属性名列表（变化时调 setOverlayOptions） */
  optionProps?: Array<keyof P & string>;
  /**
   * 只能在 constructor 设置的 props（SDK 无对应 setter 方法）。
   * 这些 props 变化时框架自动重建 overlay 实例（cleanup → create），用户无需手写 key。
   */
  ctorOnlyProps?: Array<keyof P & string>;
  /** 是否支持 children 嵌套（如 Marker 嵌 InfoWindow） */
  supportsChildren?: boolean;
  /** overlay 级事件订阅（SDK 事件 → prop 回调） */
  events?: Array<{ sdk: string; prop: keyof P & string }>;
  /** 组件显示名（用于 React DevTools） */
  displayName?: string;
  /**
   * 值对象模式：跳过 addOverlay/removeOverlay。
   * 用于 Symbol/Icon/IconSequence 等不是 Overlay 的值对象。
   * 组件仍然创建 SDK 实例并管理 setter，但不自动加到地图。
   * 用户通过 ref 或 hooks 拿到 handle 传给父组件（如 Marker icon）。
   */
  skipMount?: boolean;
}

export function createOverlayComponent<P extends { children?: ReactNode }>(
  config: OverlayComponentConfig<P>,
) {
  const Comp = memo(function OverlayComponentImpl(props: P) {
    const { map, driver } = useMapContext();
    const target = useOverlayTarget();
    const ref = useRef<OverlayHandle | null>(null);
    // 挂载时从 SDK 实例读到的 option 默认值，prop 变回 undefined 时用它还原
    const optionBaselineRef = useRef<Record<string, unknown>>({});
    // 保持对最新 props 的引用，供 create effect 读取。
    const propsRef = useRef(props);
    propsRef.current = props;

    // ─── OverlayTargetContext store ───
    // 用 ref 持有当前 handle + 订阅者列表，store 对象身份永远稳定（只创建一次）。
    // 子组件通过 useSyncExternalStore 订阅；本组件 effect 写入 ref 后立即通知，
    // React 在同一 commit 周期内同步触发订阅者重渲染，避免旧实现里 useState 二次渲染导致的时序错位。
    const targetRef = useRef<OverlayHandle | null>(null);
    const listenersRef = useRef<Set<() => void>>(new Set());
    const store = useMemo<OverlayTargetStore>(() => ({
      type: 'overlay' as const,
      subscribe: (cb: () => void) => {
        listenersRef.current.add(cb);
        return () => { listenersRef.current.delete(cb); };
      },
      getTarget: () => targetRef.current,
    }), []);
    const notify = () => listenersRef.current.forEach(cb => cb());

    // Marker3D 的延迟重建会把 ref.current 换成新实例。事件订阅 effect 的 deps 里
    // 没有实例身份，必须显式 bump 一个版本号让它重新订阅，否则监听器留在已被移除的旧实例上。
    const [instanceVersion, setInstanceVersion] = useState(0);

    // ─── ctorOnlyProps: 计算 ctorKey，变化时触发创建 effect 重建 overlay ───
    const ctorKey = config.ctorOnlyProps
      ? stableStringify(config.ctorOnlyProps.map(k => (props as any)[k]))
      : '';

    // ─── 创建 ───
    useLayoutEffect(() => {
      if (!map || !driver) return;
      // 剥离 children（React 内部字段不能传给 SDK 构造函数）
      // 同时剥离 undefined/null 值：SDK 根据「是否传了第二个参数」和「opts 有哪些 key」
      // 选择不同的内部代码路径。传 {rotation: undefined} 和不传 rotation 是不同行为。
      // 只传用户显式设值的字段，与正常 SDK 用法 new Marker(point) 一致。
      const { children: _children, ...rawProps } = propsRef.current as any;
      void _children;
      const factoryProps: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rawProps)) {
        if (v !== undefined && v !== null) factoryProps[k] = v;
      }
      const handle = config.factory(driver, factoryProps as P);
      if (!handle) return;
      ref.current = handle;
      // 立即写入 ref 并通知订阅者：子组件（如 ContextMenu）会同步重渲染，
      // 其 useLayoutEffect 在 cleanup 后会用新的 target 重新挂载。
      targetRef.current = handle;
      notify();
      // 值对象（Symbol/Icon 等）不调 addOverlay
      if (!config.skipMount) {
        // Hotspot 不是标准 Overlay，用 addHotspot 代替 addOverlay
        if ((handle as any).type === 'hotspot') {
          driver.addHotspot?.(map, handle);
        } else if (target?.addOverlay) target.addOverlay(handle);
        else driver.addOverlay(map, handle);
      }
      // 同步设置一次 options：StrictMode 双调用会重建 overlay（新实例），
      // 但 setOverlayOptions 的独立 useEffect deps 不含 marker 引用、不会重跑。
      // 必须在这里对新实例立即设置 enableDragging 等，否则 v3.0 默认 disabled 的开关不生效。
      if (config.optionProps) {
        // 先记录 SDK 默认值，供之后 prop 变回 undefined 时还原（见 options 更新 effect）。
        // 只记「挂载时用户没传」的 key：这时 getter 读到的才是 SDK 自己的默认值。
        // 用户挂载时就传了值的 key，getter 读到的是用户的值，冒充默认值还原反而更误导，
        // 宁可缺席、让上层照旧告警。
        const defaultableKeys = config.optionProps.filter(k => factoryProps[k] === undefined);
        optionBaselineRef.current = defaultableKeys.length > 0
          ? driver.snapshotOverlayOptions(handle, defaultableKeys)
          : {};
        const initOpts: Record<string, unknown> = {};
        for (const k of config.optionProps) {
          const v = factoryProps[k];
          if (v !== undefined && v !== null) initOpts[k] = v;
        }
        if (Object.keys(initOpts).length > 0) {
          driver.setOverlayOptions(handle, initOpts);
        }
      }
      // 同步设置 visible（ctorOnlyProps 变化也会走这里，确保新实例可见性正确）
      if (factoryProps.visible === false) {
        driver.hideOverlay(handle);
      }
      // Marker3D SDK bug: 首次 addOverlay 后 size/shape 不渲染（无 setSize/setShape 方法）
      // 同一实例 removeOverlay+addOverlay 也不生效——SDK 构造时捕获了 WebGL 状态
      // 必须：延迟创建全新实例并替换
      let reAddTimer: ReturnType<typeof setTimeout> | undefined;
      if ((handle as any).type === 'marker3d') {
        reAddTimer = setTimeout(() => {
          if (ref.current !== handle || !map) return;
          try {
            const newHandle = config.factory(driver, factoryProps as P);
            if (!newHandle) return;
            driver.removeOverlay(map, handle);
            driver.addOverlay(map, newHandle);
            ref.current = newHandle;
            targetRef.current = newHandle;
            // 重新设置 optionProps
            if (config.optionProps) {
              const initOpts: Record<string, unknown> = {};
              for (const k of config.optionProps) {
                const v = (factoryProps as Record<string, unknown>)[k];
                if (v !== undefined && v !== null) initOpts[k] = v;
              }
              if (Object.keys(initOpts).length > 0) {
                driver.setOverlayOptions(newHandle, initOpts);
              }
            }
            if (factoryProps.visible === false) {
              driver.hideOverlay(newHandle);
            }
            // 通知事件订阅 effect 重新绑到新实例上
            setInstanceVersion(v => v + 1);
          } catch {}
        }, 500);
      }
      return () => {
      if (reAddTimer) clearTimeout(reAddTimer);
      // Marker3D 的延迟重建可能已经把 ref.current 换成了新实例，闭包里的 handle
      // 那时已被移除。必须以 ref.current 为准，否则新实例会永远留在地图上。
      const current = ref.current ?? handle;
      // 值对象不调 removeOverlay
      if (!config.skipMount) {
        // Hotspot 用 removeHotspot 代替 removeOverlay
        if ((current as any)?.type === 'hotspot') {
          driver.removeHotspot?.(map, current);
        } else if (target?.removeOverlay) target.removeOverlay(current);
        else if (map) driver.removeOverlay(map, current);
      }
        ref.current = null;
        targetRef.current = null;
        notify();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, driver, target, ctorKey]);

    // ─── position 更新 ───
    const posVal = config.positionProp ? props[config.positionProp] : undefined;
    const posKey = stableStringify(posVal);
    useEffect(() => {
      if (ref.current && driver && posVal != null) {
        driver.setOverlayPosition(ref.current, posVal as unknown as Point);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [driver, posKey]);

    // ─── path 更新 ───
    const pathVal = config.pathProp ? props[config.pathProp] : undefined;
    const pathKey = stableStringify(pathVal);
    useEffect(() => {
      if (ref.current && driver && pathVal != null) {
        driver.setOverlayPath(ref.current, pathVal as Point[]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [driver, pathKey]);

    // ─── options 更新 ───
    const optSnapshot = config.optionProps
      ? config.optionProps.reduce<Record<string, unknown>>((acc, k) => {
          if (props[k] !== undefined) acc[k] = props[k];
          return acc;
        }, {})
      : {};
    const optKey = stableStringify(optSnapshot);
    const appliedOptKeysRef = useRef<string[]>([]);
    useEffect(() => {
      if (!ref.current || !driver || !config.optionProps) return;
      const nextKeys = Object.keys(optSnapshot);
      // props 从有值变 undefined 时快照里就没有这个 key，setOverlayOptions 拿不到任何信息，
      // driver 的 setter 分支都是 typeof 判断、传 undefined 也是 no-op。
      // 受控语义要求「传 undefined 就回到默认」，所以这里改用挂载时抓的 SDK 默认值回写；
      // 只有连默认值都拿不到的 key（SDK 无 getter/setter，或挂载时用户就传了值）才告警。
      const removed = appliedOptKeysRef.current.filter(k => !nextKeys.includes(k));
      if (removed.length > 0) {
        const restorable: Record<string, unknown> = {};
        const unrestorable: string[] = [];
        for (const k of removed) {
          if (k in optionBaselineRef.current) restorable[k] = optionBaselineRef.current[k];
          else unrestorable.push(k);
        }
        if (Object.keys(restorable).length > 0) {
          unrestorable.push(...driver.restoreOverlayOptions(ref.current, restorable));
        }
        if (unrestorable.length > 0) {
          devWarn(
            `${config.displayName ?? 'Overlay'} 的 ${unrestorable.join(' / ')} 由有值变为 undefined，`
            + '框架拿不到 SDK 默认值可还原（覆盖物仍保持上一次设置）。'
            + '请显式传入目标值，或改用 key 强制重建组件',
          );
        }
      }
      appliedOptKeysRef.current = nextKeys;
      if (nextKeys.length > 0) {
        driver.setOverlayOptions(ref.current, optSnapshot);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [driver, optKey]);

    // ─── 可见性（show/hide，Overlay 基类方法） ───
    const visible = (props as any).visible;
    useEffect(() => {
      if (!ref.current || !driver) return;
      if (visible === false) driver.hideOverlay(ref.current);
      else driver.showOverlay(ref.current);
    }, [driver, visible]);

    // ─── overlay 级事件订阅 ───
    const eventKey = stableStringify(
      (config.events ?? []).map(e => `${e.sdk}:${typeof props[e.prop]}`)
    );
    const handlersRef = useRef<Record<string, unknown>>({});
    (config.events ?? []).forEach(e => { handlersRef.current[e.prop] = props[e.prop]; });
    useEffect(() => {
      if (!ref.current || !driver || !config.events) return;
      const unsubs: Array<() => void> = [];
      for (const { sdk, prop } of config.events) {
        unsubs.push(driver.addEventListener(ref.current, sdk, (raw: unknown) => {
          const fn = handlersRef.current[prop];
          if (typeof fn === 'function') {
            const r = raw as Record<string, unknown>;
            fn(r?.point ?? r?.latLng ?? raw, raw);
          }
        }));
      }
      return () => unsubs.forEach(u => u());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [driver, eventKey, ctorKey, instanceVersion]);

    // ─── children 嵌套 ───
    if (!props.children) return null;
    if (!config.supportsChildren) return null;

    return (
      <OverlayTargetContext.Provider value={store}>
        {props.children}
      </OverlayTargetContext.Provider>
    );
  });
  Comp.displayName = config.displayName || 'OverlayComponent';
  return Comp;
}

// ─────────────── Control 组件工厂 ───────────────

export interface ControlComponentConfig<P> {
  factory: (driver: BMapDriver, props: P) => ControlHandle | null;
  /**
   * 可通过 Control 基类或具体控件 setter 响应式更新的 props。
   * 注意：这类 prop 在 null/undefined 与有值之间切换时控件会整体重建
   * （见下方 optionDefaultKey），控件内部的交互状态会丢失 —— 需要稳定状态时
   * 不要让 option prop 在「不传」和「传」之间来回切换，给一个固定值即可。
   */
  optionProps?: Array<keyof P & string>;
  /** 只能在 constructor options 中读取的 props，变化时自动重建控件 */
  ctorOnlyProps?: Array<keyof P & string>;
  /** Control 级事件订阅（SDK 事件 → prop 回调） */
  events?: Array<{ sdk: string; prop: keyof P & string }>;
  displayName?: string;
}

export function createControlComponent<P>(
  config: ControlComponentConfig<P>,
) {
  const Comp = memo(function ControlComponentImpl(props: P) {
    const { map, driver } = useMapContext();
    const ref = useRef<ControlHandle | null>(null);
    const propsRef = useRef(props);
    propsRef.current = props;

    const ctorKey = config.ctorOnlyProps
      ? stableStringify(config.ctorOnlyProps.map(k => (props as any)[k]))
      : '';
    const optionDefaultKey = config.optionProps
      ? stableStringify(config.optionProps.map(k => (props as any)[k] == null))
      : '';

    useLayoutEffect(() => {
      if (!map || !driver) return;
      const { children: _c, visible: _v, ...rawCtrl } = propsRef.current as any;
      void _c; void _v;
      const ctrlProps: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rawCtrl)) { if (v !== undefined && v !== null) ctrlProps[k] = v; }
      const handle = config.factory(driver, ctrlProps as P);
      if (!handle) return;
      ref.current = handle;
      driver.addControl(map, handle);

      if (config.optionProps) {
        const initOpts: Record<string, unknown> = {};
        for (const k of config.optionProps) {
          const v = ctrlProps[k];
          if (v !== undefined && v !== null) initOpts[k] = v;
        }
        // 不在 useLayoutEffect 中调用 setControlOptions（会导致 setAnchor 重置 SDK 默认 offset）
        // 构造函数已经设置了所有选项，后续变更由 useEffect 处理
      }
      if ((propsRef.current as any).visible === false) driver.hideControl(handle);

      return () => {
        driver.removeControl(map, handle);
        ref.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, driver, ctorKey, optionDefaultKey]);

    const optSnapshot = config.optionProps
      ? config.optionProps.reduce<Record<string, unknown>>((acc, k) => {
          if ((props as any)[k] !== undefined) acc[k] = (props as any)[k];
          return acc;
        }, {})
      : {};
    const optKey = stableStringify(optSnapshot);
    const firstRunRef = useRef(true);
    useEffect(() => {
      if (!ref.current || !driver || !config.optionProps) return;
      // 跳过首次运行：构造函数已设置所有选项，首次 setControlOptions 会调用 setAnchor 重置 SDK 默认 offset
      if (firstRunRef.current) { firstRunRef.current = false; return; }
      if (Object.keys(optSnapshot).length > 0) driver.setControlOptions(ref.current, optSnapshot);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [driver, optKey]);

    const visible = (props as any).visible;
    useEffect(() => {
      if (!ref.current || !driver) return;
      if (visible === false) driver.hideControl(ref.current);
      else driver.showControl(ref.current);
    }, [driver, visible]);

    const eventKey = stableStringify(
      (config.events ?? []).map(e => `${e.sdk}:${typeof (props as any)[e.prop]}`),
    );
    const handlersRef = useRef<Record<string, unknown>>({});
    (config.events ?? []).forEach(e => { handlersRef.current[e.prop] = (props as any)[e.prop]; });
    useEffect(() => {
      if (!ref.current || !driver || !config.events) return;
      const unsubs: Array<() => void> = [];
      for (const { sdk, prop } of config.events) {
        unsubs.push(driver.addEventListener(ref.current, sdk, (raw: unknown) => {
          const fn = handlersRef.current[prop];
          if (typeof fn === 'function') fn(raw);
        }));
      }
      return () => unsubs.forEach(unsub => unsub());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [driver, eventKey, ctorKey]);

    return null;
  });
  Comp.displayName = config.displayName || 'ControlComponent';
  return Comp;
}

// ─────────────── Layer 组件工厂 ───────────────

export interface LayerComponentConfig<P> {
  factory: (driver: BMapDriver, props: P) => LayerHandle | null;
  /** 添加方法名，默认 'addLayer' */
  addMethod?: keyof BMapDriver;
  /** 移除方法名，默认 'removeLayer' */
  removeMethod?: keyof BMapDriver;
  /** React StrictMode 下复用同一个 SDK layer 实例，避免 add/remove 不成对 */
  reuseHandle?: boolean;
  /** 延后一拍添加 layer，让 StrictMode 的模拟卸载可以取消首次 add */
  deferMount?: boolean;
  /** 事件列表（SDK 事件名 → React 回调 prop 名） */
  events?: ReadonlyArray<{ sdk: string; prop: keyof P & string }>;
  displayName?: string;
}

export function createLayerComponent<P>(
  config: LayerComponentConfig<P>,
) {
  const Comp = memo(function LayerComponentImpl(props: P) {
    const { map, driver } = useMapContext();
    const ref = useRef<LayerHandle | null>(null);
    const cbRefs = useRef<Record<string, ((e: any) => void) | undefined>>({});

    // 保持事件回调最新引用
    if (config.events) {
      for (const ev of config.events) {
        cbRefs.current[ev.prop] = (props as any)[ev.prop];
      }
    }

    // 图层没有 setter 抽象（driver 只有 addLayer/removeLayer），props 变化只能靠重建生效。
    // 用值比较而不是引用比较：stableStringify 把函数折叠成 'fn'，所以内联的
    // tileLoadFunction / onclick 之类不会造成无意义的重建。
    const { children: _keyChildren, ...propsForKey } = props as any;
    void _keyChildren;
    const layerKey = stableStringify(propsForKey);
    // reuseHandle 是为 StrictMode 的双次挂载准备的（props 没变才复用）；
    // props 真的变了必须造新实例，否则新配置永远不生效。
    const handleKeyRef = useRef<string | null>(null);

    useLayoutEffect(() => {
      if (!map || !driver) return;
      const { children: _c2, ...rawLayer } = props as any; void _c2;
      const layerProps: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rawLayer)) { if (v !== undefined && v !== null) layerProps[k] = v; }
      let handle = config.reuseHandle && handleKeyRef.current === layerKey ? ref.current : null;
      if (!handle) {
        handle = config.factory(driver, layerProps as P);
        if (!handle) return;
        ref.current = handle;
        handleKeyRef.current = layerKey;
      }
      const add = config.addMethod ?? 'addLayer';
      const remove = config.removeMethod ?? 'removeLayer';
      let mounted = false;
      let mountTimer: ReturnType<typeof setTimeout> | null = null;
      const mountLayer = () => {
        mounted = true;
        (driver as any)[add](map, handle);
      };
      if (config.deferMount) mountTimer = setTimeout(mountLayer, 0);
      else mountLayer();

      // 注册事件
      // 走 driver.addEventListener：裸 SDK 的 addEventListener 不返回退订函数，
      // 直接用它的返回值收集 unsub 等于永远收不到，卸载后回调仍在（reuseHandle 的图层还会叠加）。
      const unsubs: Array<() => void> = [];
      if (config.events && handle.raw) {
        for (const ev of config.events) {
          unsubs.push(driver.addEventListener(handle, ev.sdk, (e: any) => cbRefs.current[ev.prop]?.(e)));
        }
      }

      return () => {
        unsubs.forEach(u => u());
        if (mountTimer) clearTimeout(mountTimer);
        if (mounted) (driver as any)[remove](map, handle);
        if (!config.reuseHandle) ref.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, driver, layerKey]);

    return null;
  });
  Comp.displayName = config.displayName || 'LayerComponent';
  return Comp;
}
