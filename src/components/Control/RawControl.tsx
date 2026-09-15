/**
 * RawControl — useRawControl 的组件糖。
 *
 * 把任意继承 BMap.Control 的原生实例挂到 React 组件树上，库负责 addControl/removeControl。
 * 重建时机由 deps 控制（语义同 useEffect deps）；create 引用变化不会重建。
 *
 * ```tsx
 * <RawControl
 *   create={() => new MyControl()}
 *   deps={[]}
 *   onReady={(inst) => { ctrlRef.current = inst; }}
 * />
 * ```
 */
import { memo } from 'react';
import type { DependencyList } from 'react';
import { useRawControl } from '../../hooks/useRawControl';

export interface RawControlProps<T = unknown> {
  /** 创建原生 Control 实例的工厂；仅在挂载 / deps 变化时调用 */
  create: () => T;
  /** 重建依赖，变化时销毁旧实例并用 create 重建（默认 []：只挂载一次） */
  deps?: DependencyList;
  /** 实例创建并挂载后回调，用于拿到实例做命令式操作 */
  onReady?: (instance: T) => void;
}

function RawControlImpl<T = unknown>({ create, deps = [], onReady }: RawControlProps<T>): null {
  useRawControl(create, deps, onReady);
  return null;
}

export const RawControl = memo(RawControlImpl) as typeof RawControlImpl;
