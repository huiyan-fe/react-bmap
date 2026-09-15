/**
 * RawOverlay — useRawOverlay 的组件糖。
 *
 * 把任意继承 BMap.Overlay 的原生实例挂到 React 组件树上，库负责 addOverlay/removeOverlay。
 * 重建时机由 deps 控制（语义同 useEffect deps）；create 引用变化不会重建。
 *
 * ```tsx
 * <RawOverlay
 *   create={() => new MyOverlay(point)}
 *   deps={[point.lng, point.lat]}
 *   onReady={(inst) => { instRef.current = inst; }}
 * />
 * ```
 */
import { memo } from 'react';
import type { DependencyList } from 'react';
import { useRawOverlay } from '../../hooks/useRawOverlay';

export interface RawOverlayProps<T = unknown> {
  /** 创建原生 Overlay 实例的工厂；仅在挂载 / deps 变化时调用 */
  create: () => T;
  /** 重建依赖，变化时销毁旧实例并用 create 重建（默认 []：只挂载一次） */
  deps?: DependencyList;
  /** 实例创建并挂载后回调，用于拿到实例做命令式操作 */
  onReady?: (instance: T) => void;
}

function RawOverlayImpl<T = unknown>({ create, deps = [], onReady }: RawOverlayProps<T>): null {
  useRawOverlay(create, deps, onReady);
  return null;
}

export const RawOverlay = memo(RawOverlayImpl) as typeof RawOverlayImpl;
