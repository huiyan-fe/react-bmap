/**
 * MapMask — 区域掩膜组件（v4+ WebGL only）。
 * SDK constructor(path: Point[], options) — 注意是 Point 数组（闭合路径），不是 Bounds。
 * 无 setter（showRegion/isBuildingMask/isPoiMask/isMapMask 都是构造参数）。
 *
 * 区域两种传法（二选一，`points` 优先）：
 * - `points`：任意多边形路径（Point[]），直接对应 SDK 的 path 入参，可画不规则遮罩区；未闭合时自动补上首点。
 * - `bounds`：矩形区域简写 { sw, ne }，内部转成矩形四角路径。
 */
import { memo, useLayoutEffect, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';
import { stableStringify } from '../../utils/stableStringify';
import { tryGetSDK } from '../../utils/sdk';
import { devWarn } from '../../utils/debugWarn';
import { buildMaskPath, maskOptionsOf } from './maskPath';
import type { MapMaskOptions } from './maskPath';
import type { Bounds, Point } from '../../types';

export type { MapMaskOptions } from './maskPath';

export interface MapMaskProps extends MapMaskOptions {
  /** 任意多边形遮罩路径（Point[]）；与 bounds 二选一，同时传时以 points 为准。未闭合会自动补首点。 */
  points?: Point[];
  /** 矩形遮罩区简写 { sw, ne }，内部转成矩形路径；与 points 二选一。 */
  bounds?: Bounds;
}

export const MapMask = memo(function MapMask(props: MapMaskProps) {
  const { bounds, points } = props;
  const { map, driver } = useMapContext();
  const handleRef = useRef<any>(null);

  const boundsKey = stableStringify(bounds);
  const pointsKey = stableStringify(points);
  const optsKey = stableStringify(maskOptionsOf(props));

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const SDK = tryGetSDK();
    if (!SDK?.MapMask) return;

    // path 构建与 <Map mask> 共用同一套逻辑（points 优先，否则 bounds 转矩形）
    const pts = buildMaskPath(SDK, props);
    if (!pts) {
      devWarn('MapMask 需要传 points 或 bounds 之一，本次未渲染。');
      return;
    }

    const mask = new SDK.MapMask(pts as any, maskOptionsOf(props) as Record<string, unknown>);
    handleRef.current = mask;
    driver.addOverlay(map, { __brand: 'OverlayHandle' as const, raw: mask, type: 'custom' });

    return () => {
      driver.removeOverlay(map, { __brand: 'OverlayHandle' as const, raw: mask, type: 'custom' });
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, boundsKey, pointsKey, optsKey]);

  return null;
});
