import { useEffect, useRef } from 'react';
import { useMapContext } from '../context/MapContext';
import { useLatest } from '../utils/useLatest';

/**
 * 订阅 Map 或 Overlay 事件。
 *
 * - handler 通过 ref 持有最新值，订阅仅一次（用户传内联函数不会重订阅）。
 * - SSR/null map 安全。
 */
export function useMapEvent(
  type: string,
  handler: (raw: unknown) => void,
): void {
  const { map, driver } = useMapContext();
  const handlerRef = useLatest(handler);

  useEffect(() => {
    if (!map || !driver) return;
    return driver.addEventListener(map, type, (raw) => handlerRef.current(raw));
  }, [map, driver, type, handlerRef]);
}
