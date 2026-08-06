/**
 * MapMask — 区域掩膜组件（v4+ WebGL only）。
 * SDK constructor(path: Point[], options) — 注意是 Point 数组，不是 Bounds。
 * 无 setter（showRegion/isBuildingMask/isPoiMask/isMapMask 都是构造参数）。
 */
import { memo, useLayoutEffect, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';
import { stableStringify } from '../../utils/stableStringify';
import type { Bounds } from '../../types';

export interface MapMaskOptions {
  showRegion?: 'inside' | 'outside';
  isBuildingMask?: boolean;
  isPoiMask?: boolean;
  isMapMask?: boolean;
}

export interface MapMaskProps extends MapMaskOptions {
  bounds: Bounds;
}

export const MapMask = memo(function MapMask(props: MapMaskProps) {
  const { bounds, ...opts } = props;
  const { map, driver } = useMapContext();
  const handleRef = useRef<any>(null);

  const boundsKey = stableStringify(bounds);
  const optsKey = stableStringify(opts);

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const SDK = (globalThis as any).BMap;
    if (!SDK?.MapMask) return;

    // SDK 期望 Point[]（闭合路径），不是 Bounds
    const sw = bounds.sw;
    const ne = bounds.ne;
    const pts = [
      new SDK.Point(sw.lng, sw.lat),
      new SDK.Point(ne.lng, sw.lat),
      new SDK.Point(ne.lng, ne.lat),
      new SDK.Point(sw.lng, ne.lat),
      new SDK.Point(sw.lng, sw.lat), // 闭合
    ];
    const mask = new SDK.MapMask(pts, opts);
    handleRef.current = mask;
    driver.addOverlay(map, { __brand: 'OverlayHandle' as const, raw: mask, type: 'custom' });

    return () => {
      driver.removeOverlay(map, { __brand: 'OverlayHandle' as const, raw: mask, type: 'custom' });
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, boundsKey, optsKey]);

  return null;
});
