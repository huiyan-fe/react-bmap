/**
 * useRawOverlay — 把任意「继承 BMap.Overlay 的原生实例」挂到 React 组件树上，
 * 由库统一管理 addOverlay/removeOverlay 生命周期。
 *
 * 适用场景：用户已有原生自定义覆盖物（自己写 initialize/draw 的 Overlay 子类），
 * 想在 React 里用，又不想每处都手写 useMapContext + addOverlay + cleanup 样板。
 *
 * 与 CustomOverlay 的区别：
 * - CustomOverlay：React children 通过 portal 渲染，用户不写 initialize/draw。
 * - useRawOverlay：用户完全掌控 initialize/draw（原生 Overlay 子类），库只管挂载卸载。
 *
 * ```tsx
 * // 原生命名空间用全局 BMap（loader 已把 v4 的 BMapGL 归一为 window.BMap）；
 * // 想避开全局也可从 useDriver().rawSDK 取。
 * class MyOverlay extends BMap.Overlay { initialize(map){...} draw(){...} }
 * function Demo() {
 *   const ref = useRawOverlay(() => new MyOverlay(point), [point]);
 *   // ref.current 可命令式调用
 *   return null;
 * }
 * ```
 */
import { useLayoutEffect, useRef } from 'react';
import type { DependencyList, RefObject } from 'react';
import { useMapContext } from '../context/MapContext';
import { useOverlayTarget } from '../context/OverlayTargetContext';
import type { OverlayHandle } from '../types';

export function useRawOverlay<T = unknown>(
  create: () => T,
  deps: DependencyList = [],
  onCreate?: (instance: T) => void,
): RefObject<T | null> {
  const { map, driver } = useMapContext();
  const target = useOverlayTarget();
  // create/onCreate 常是内联函数（每次 render 新引用）。用 ref 存最新，避免把它们放进依赖
  // 导致每次父组件重渲染都销毁重建覆盖物（闪烁）。重建时机只由显式 deps 控制。
  const createRef = useRef(create);
  createRef.current = create;
  const onCreateRef = useRef(onCreate);
  onCreateRef.current = onCreate;
  const instanceRef = useRef<T | null>(null);

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const instance = createRef.current();
    instanceRef.current = instance;
    // 把用户的原生实例包成 OverlayHandle（driver.addOverlay 内部用 handle.raw 取原生对象）
    const handle: OverlayHandle = { __brand: 'OverlayHandle', raw: instance, type: 'raw' };
    // 若嵌套在 MarkerClusterer 等提供 OverlayTarget 的父级下，挂到父级；否则挂到 map
    if (target?.addOverlay) target.addOverlay(handle);
    else driver.addOverlay(map, handle);
    onCreateRef.current?.(instance);

    return () => {
      if (target?.removeOverlay) target.removeOverlay(handle);
      else driver.removeOverlay(map, handle);
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, target, ...deps]);

  return instanceRef;
}
