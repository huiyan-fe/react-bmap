/**
 * FeatureLayer — 矢量要素图层（手写组件，继承 NormalLayer）。
 * @since 4.0
 *
 * 组件方式：
 * ```tsx
 * <FeatureLayer
 *   idKey="id"
 *   crs="BD09LL"
 *   enablePicked
 *   selectedColor="rgba(255, 0, 0, 1.0)"
 *   data={geojson}
 * />
 * ```
 *
 * 实现要点：
 * - mount → driver.createFeatureLayer + addLayer
 * - data 变化 → raw.setData()
 * - constructor 选项变化 → 重建
 */
import { memo, useLayoutEffect, useRef, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';
import { debugWarn } from '../../utils/debugWarn';
import type { NormalLayerOptions } from './index';
import type { Point } from '../../types';

export interface FeatureLayerOptions extends NormalLayerOptions {
  /** 数据项属性 key */
  idKey?: string;
  /** 来源坐标系，可选 BD09LL、BD09MC、GCJ02 */
  crs?: string;
  /** 选中数据索引 */
  selectedIndex?: number;
  /** 选中数据颜色 */
  selectedColor?: string;
}

export interface FeatureLayerProps extends FeatureLayerOptions {
  /** GeoJSON 数据源，变化时调用 raw.setData() */
  data?: object;
}

export const FeatureLayer = memo(function FeatureLayer(props: FeatureLayerProps) {
  const { idKey, crs, selectedIndex, selectedColor, data, visible, opacity, enablePicked, autoSelect, zIndex, minZoom, maxZoom } = props;
  const { map, driver } = useMapContext();
  const rawRef = useRef<any>(null);

  // create + add（constructor 选项变化时重建）
  const ctorKey = `${idKey ?? ''}|${crs ?? ''}|${selectedIndex ?? ''}|${selectedColor ?? ''}|${visible ?? ''}|${opacity ?? ''}|${enablePicked ?? ''}|${autoSelect ?? ''}|${zIndex ?? ''}|${minZoom ?? ''}|${maxZoom ?? ''}`;

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const opts: Record<string, unknown> = {};
    if (idKey !== undefined) opts.idKey = idKey;
    if (crs !== undefined) opts.crs = crs;
    if (selectedIndex !== undefined) opts.selectedIndex = selectedIndex;
    if (selectedColor !== undefined) opts.selectedColor = selectedColor;
    if (visible !== undefined) opts.visible = visible;
    if (opacity !== undefined) opts.opacity = opacity;
    if (enablePicked !== undefined) opts.enablePicked = enablePicked;
    if (autoSelect !== undefined) opts.autoSelect = autoSelect;
    if (zIndex !== undefined) opts.zIndex = zIndex;
    if (minZoom !== undefined) opts.minZoom = minZoom;
    if (maxZoom !== undefined) opts.maxZoom = maxZoom;

    const handle = driver.createFeatureLayer(opts);
    if (!handle) return;
    rawRef.current = (handle as any).raw;
    driver.addLayer(map, handle);

    // mount 后如果有 data，立即 setData
    if (data && rawRef.current) {
      try { rawRef.current.setData?.(data); } catch (e) { debugWarn('FeatureLayer.setData', e); }
    }

    return () => {
      driver.removeLayer(map, handle);
      rawRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, ctorKey]);

  // data 变化 → setData
  const dataKey = data ? JSON.stringify(data) : '';
  useEffect(() => {
    if (!rawRef.current || !data) return;
    try { rawRef.current.setData?.(data); } catch { /* noop */ }
  }, [dataKey]);

  return null;
});
