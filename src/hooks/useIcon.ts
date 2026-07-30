/**
 * useIcon — 创建 Icon 值对象的 hook。
 * Icon 是值对象（非 Overlay），用作 Marker 的 icon 参数。
 *
 * @example
 * ```tsx
 * function MyMarker() {
 *   const icon = useIcon({ url: 'https://...', size: { width: 30, height: 30 }, anchor: { width: 15, height: 30 } });
 *   return <Marker position={pt} icon={icon} />;
 * }
 * ```
 *
 * url 变化时重建 Icon；其余选项走 setOverlayOptions（setSize/setAnchor 等）。
 * 返回 OverlayHandle，可直接传给 Marker 的 icon 或 driver.createMarker。
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useMapContext } from '../context/MapContext';
import { stableStringify } from '../utils/stableStringify';
import type { OverlayHandle } from '../types';
import type { IconProps } from '../components/Overlay/types';

export function useIcon(props: IconProps): OverlayHandle | null {
  const { driver } = useMapContext();
  const ref = useRef<OverlayHandle | null>(null);

  // url 变化时重建（constructor 第一参数）
  const urlKey = props.url;

  useLayoutEffect(() => {
    if (!driver) return;
    const h = driver.createIcon(props.url, props.size, props);
    ref.current = h;
    return () => { ref.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, urlKey]);

  // 其余选项走 setOverlayOptions
  const optKey = stableStringify({
    size: props.size,
    anchor: props.anchor,
    imageOffset: props.imageOffset,
    imageSize: props.imageSize,
    infoWindowAnchor: props.infoWindowAnchor,
    printImageUrl: props.printImageUrl,
    srcset: props.srcset,
  });
  useEffect(() => {
    if (!driver || !ref.current) return;
    driver.setOverlayOptions(ref.current, {
      size: props.size,
      anchor: props.anchor,
      imageOffset: props.imageOffset,
      imageSize: props.imageSize,
      infoWindowAnchor: props.infoWindowAnchor,
      printImageUrl: props.printImageUrl,
      srcset: props.srcset,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, optKey]);

  return ref.current;
}
