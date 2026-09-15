/**
 * useRawControl — 把任意「继承 BMap.Control 的原生实例」挂到 React 组件树上，
 * 由库统一管理 addControl/removeControl 生命周期。
 *
 * 与内置控件组件（NavigationControl 等）的区别：内置组件封装好了；useRawControl 是
 * escape hatch，用户完全掌控 Control 子类的 initialize/DOM，库只管挂载卸载。
 *
 * ```tsx
 * // 原生命名空间用全局 BMap（loader 已把 v4 的 BMapGL 归一为 window.BMap）；
 * // 想避开全局也可从 useDriver().rawSDK 取。
 * class MyControl extends BMap.Control { initialize(map){ ...return dom; } }
 * function Demo() {
 *   const ref = useRawControl(() => new MyControl(), []);
 *   return null;
 * }
 * ```
 */
import { useLayoutEffect, useRef } from 'react';
import type { DependencyList, RefObject } from 'react';
import { useMapContext } from '../context/MapContext';
import type { ControlHandle } from '../types';

export function useRawControl<T = unknown>(
  create: () => T,
  deps: DependencyList = [],
  onCreate?: (instance: T) => void,
): RefObject<T | null> {
  const { map, driver } = useMapContext();
  // create/onCreate 常是内联函数（每次 render 新引用）。用 ref 存最新，避免把它们放进依赖
  // 导致每次父组件重渲染都销毁重建控件（闪烁）。重建时机只由显式 deps 控制。
  const createRef = useRef(create);
  createRef.current = create;
  const onCreateRef = useRef(onCreate);
  onCreateRef.current = onCreate;
  const instanceRef = useRef<T | null>(null);

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const instance = createRef.current();
    instanceRef.current = instance;
    // 把用户的原生实例包成 ControlHandle（driver.addControl 内部用 handle.raw 取原生对象）
    const handle: ControlHandle = { __brand: 'ControlHandle', raw: instance, type: 'raw' };
    driver.addControl(map, handle);
    onCreateRef.current?.(instance);

    return () => {
      driver.removeControl(map, handle);
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, ...deps]);

  return instanceRef;
}
