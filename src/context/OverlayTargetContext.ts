import { createContext, useContext, useRef, useSyncExternalStore } from 'react';
import type { OverlayHandle, MapHandle } from '../types';

/**
 * OverlayTargetContext — 嵌套组件（MarkerClusterer/ContextMenu 等）的目标注入。
 *
 * 例：
 * - <MarkerClusterer> 提供该 context，<Marker> 读取后调 clusterer.addMarker。
 * - <Marker> 提供该 context，<ContextMenu> 读取后挂到 marker 而不是 map。
 *
 * 设计要点（修复了 ctxTarget 通过 useState 传播导致的子组件首渲染读到 null 的问题）：
 * - Context 持有 **store**（身份稳定，仅创建一次），暴露 subscribe/getTarget。
 * - 消费者通过 useSyncExternalStore 订阅 target 变化，store 内部用 ref 同步更新：
 *   父组件 useLayoutEffect 创建 handle 后立即写入 ref 并通知订阅者，
 *   React 会在同一 commit 周期内同步触发订阅者重渲染，避免「先挂到 map 再切到 marker」的时序错位。
 */
export interface OverlayTargetStore {
  type: 'clusterer' | 'overlay' | 'marker' | 'map';
  /** 订阅 target 变化；返回取消订阅函数 */
  subscribe: (cb: () => void) => () => void;
  /** 同步读取当前 target（父级尚未挂载时为 null） */
  getTarget: () => OverlayHandle | MapHandle | null;
  addOverlay?: (overlay: OverlayHandle) => void;
  removeOverlay?: (overlay: OverlayHandle) => void;
}

/**
 * useOverlayTarget 返回的快照对象。
 * 身份稳定：仅当 store 或内部 target 引用变化时才换新对象，便于在 effect deps 中使用。
 */
export interface OverlayTargetValue {
  type: 'clusterer' | 'overlay' | 'marker' | 'map';
  target: OverlayHandle | MapHandle | null;
  addOverlay?: (overlay: OverlayHandle) => void;
  removeOverlay?: (overlay: OverlayHandle) => void;
}

/** @deprecated 用 OverlayTargetStore / OverlayTargetValue 替代。保留别名以兼容旧导入。 */
export type OverlayTargetContextValue = OverlayTargetStore;

export const OverlayTargetContext = createContext<OverlayTargetStore | null>(null);

const emptySubscribe = () => () => {};
const emptyGetTarget = (): OverlayHandle | MapHandle | null => null;

/**
 * 读取父级 overlay 目标的实时快照。
 *
 * - 父级未提供 context（如直接挂在 <Map> 下）→ 返回 null，调用方按 map 兜底。
 * - 父级已提供但 target 尚未就绪（父级首次渲染、handle 在 layout effect 中创建）→ 返回 `{ target: null }`，
 *   父级 effect 完成后会通过 useSyncExternalStore 同步通知本组件重渲染，无需等待额外 commit。
 *
 * 返回值 identity 严格稳定：仅当 store.type 或 target 引用变化时才换新对象。
 * 故意不用 useMemo —— React 18+ 的 useMemo 可能「忘记」缓存导致重渲染时返回新对象，
 * 进而触发消费方 effect deps 变化 → cleanup+remount menu → SDK 内部状态被搞坏。
 */
export function useOverlayTarget(): OverlayTargetValue | null {
  const store = useContext(OverlayTargetContext);
  // store 为 null 时也要提供稳定的空 snapshot，避免 useSyncExternalStore 报错。
  const target = useSyncExternalStore(
    store ? store.subscribe : emptySubscribe,
    store ? store.getTarget : emptyGetTarget,
    emptyGetTarget,
  );
  // 用 ref + 引用对比替代 useMemo，确保 identity 完全稳定（不被 React 「忘记」）。
  const lastRef = useRef<OverlayTargetValue | null>(null);
  if (store) {
    const last = lastRef.current;
    if (!last
      || last.target !== target
      || last.type !== store.type
      || last.addOverlay !== store.addOverlay
      || last.removeOverlay !== store.removeOverlay) {
      lastRef.current = {
        type: store.type,
        target,
        addOverlay: store.addOverlay,
        removeOverlay: store.removeOverlay,
      };
    }
  } else {
    lastRef.current = null;
  }
  return lastRef.current;
}
