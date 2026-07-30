/**
 * useSymbol — 创建 Symbol 值对象的 hook。
 * Symbol 是值对象（非 Overlay），用作 Marker 的 icon 参数。
 *
 * @example
 * ```tsx
 * function MyMarker() {
 *   const symbol = useSymbol({ path: BMap_Symbol_SHAPE_STAR, fillColor: '#f00', scale: 5 });
 *   return <Marker position={pt} icon={symbol} />;
 * }
 * ```
 *
 * path 变化时重建 Symbol；其余选项走 setOverlayOptions（setScale/setFillColor 等）。
 * 返回 OverlayHandle，可直接传给 Marker 的 icon 或 driver.createMarker。
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useMapContext } from '../context/MapContext';
import { stableStringify } from '../utils/stableStringify';
import type { OverlayHandle } from '../types';
import type { SymbolProps } from '../components/Overlay/types';

export function useSymbol(props: SymbolProps): OverlayHandle | null {
  const { driver } = useMapContext();
  const ref = useRef<OverlayHandle | null>(null);

  // path 变化时重建（constructor 第一参数）
  const pathKey = stableStringify(props.path);

  useLayoutEffect(() => {
    if (!driver) return;
    const h = driver.createSymbol(props.path, props);
    ref.current = h;
    return () => { ref.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, pathKey]);

  // 其余选项走 setOverlayOptions
  const optKey = stableStringify({
    fillColor: props.fillColor,
    fillOpacity: props.fillOpacity,
    scale: props.scale,
    rotation: props.rotation,
    strokeColor: props.strokeColor,
    strokeOpacity: props.strokeOpacity,
    strokeWeight: props.strokeWeight,
    anchor: props.anchor,
  });
  useEffect(() => {
    if (!driver || !ref.current) return;
    driver.setOverlayOptions(ref.current, {
      fillColor: props.fillColor,
      fillOpacity: props.fillOpacity,
      scale: props.scale,
      rotation: props.rotation,
      strokeColor: props.strokeColor,
      strokeOpacity: props.strokeOpacity,
      strokeWeight: props.strokeWeight,
      anchor: props.anchor,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, optKey]);

  return ref.current;
}
