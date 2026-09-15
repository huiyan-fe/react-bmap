import { useEffect } from 'react';
import { useMapContext } from '../context/MapContext';
import { useLatest } from '../utils/useLatest';
import type { MapHandle } from '../types';

/**
 * 哨兵 Hook：在 `<Map>` **内部**使用，地图就绪后回调，把 MapHandle 上提到外层 state。
 *
 * 典型用途：service hook（`useDrivingRoute`/`useLocalSearch` 等）通常挂在 `<Map>` **外层**，
 * 它们的 `renderOptions.map` 需要一个**已就绪**的 handle。而 `useMap()` 在外层拿到的会是 null，
 * 就绪后也不一定重渲染外层。用本 Hook 在 `<Map>` 里当哨兵，就绪时把 handle 抛到外层：
 *
 * ```tsx
 * function MapReady({ onReady }: { onReady: (m: MapHandle) => void }) {
 *   useMapReady(onReady);
 *   return null;
 * }
 * // ...
 * const [map, setMap] = useState<MapHandle | null>(null);
 * useDrivingRoute({ ...options, renderOptions: { map } });
 * return <Map ...><MapReady onReady={setMap} /></Map>;
 * ```
 *
 * 说明：`<Map>` 已有 `onReady` prop，效果等价——两者任选其一即可。当你想在 JSX 子树里、
 * 而不是在 `<Map>` 的 props 上拿就绪 handle 时，用本 Hook 更顺手。
 *
 * @param onReady 地图就绪时回调（handle 非 null）。无需 memo，内部用 ref 取最新值。
 */
export function useMapReady(onReady: (map: MapHandle) => void): void {
  const { map } = useMapContext();
  const onReadyRef = useLatest(onReady);
  useEffect(() => {
    if (map) onReadyRef.current(map);
  }, [map, onReadyRef]);
}
