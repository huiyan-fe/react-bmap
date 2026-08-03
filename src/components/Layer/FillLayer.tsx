/**
 * FillLayer — 面填充图层（手写组件）。
 * @since 4.0
 *
 * 组件方式：
 * ```tsx
 * <FillLayer
 *   border
 *   style={{ fillColor: 'rgba(0, 100, 255, 0.4)', strokeColor: '#ff6600', strokeWeight: 3 }}
 *   data={geojson}
 *   enablePicked
 * />
 * ```
 *
 * 实现要点：
 * - mount → driver.createFillLayer + addLayer
 * - data 变化 → raw.setData()
 * - style 变化 → raw.setStyleOptions() + raw.doOnceDraw()
 */
import { memo, useLayoutEffect, useRef, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';

export interface FillLayerStyle {
  fillColor?: string;
  fillOpacity?: number;
  pattern?: boolean;
  patternMask?: boolean;
  patternUrl?: string;
  patternMapping?: string;
  patternScale?: number;
  patternOffset?: string;
  sequence?: boolean;
  marginLength?: number;
  borderCovered?: boolean;
  borderMask?: boolean;
  borderWeight?: number;
  borderColor?: string;
  strokeTextureUrl?: string;
  strokeTextureWidth?: number;
  strokeTextureHeight?: number;
  strokeLineJoin?: string;
  strokeLineCap?: string;
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
  strokeStyle?: string;
  dashArray?: number[];
  height?: number;
}

export interface FillLayerOptions {
  border?: boolean;
  style?: FillLayerStyle;
  idKey?: string;
  crs?: string;
  selectedIndex?: number;
  selectedColor?: string;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  enablePicked?: boolean;
  autoSelect?: boolean;
  popEvent?: boolean;
  pickWidth?: number;
  pickHeight?: number;
}

export interface FillLayerProps extends FillLayerOptions {
  /** GeoJSON 数据源，变化时调用 raw.setData() */
  data?: object;
}

export const FillLayer = memo(function FillLayer(props: FillLayerProps) {
  const { border, style, idKey, crs, selectedIndex, selectedColor, visible, opacity, minZoom, maxZoom, zIndex, enablePicked, autoSelect, popEvent, pickWidth, pickHeight, data } = props;
  const { map, driver } = useMapContext();
  const rawRef = useRef<any>(null);

  // create + add（constructor 选项 + style 变化时重建，因为 setStyleOptions 可能不覆盖所有属性）
  const styleKey = style ? JSON.stringify(style) : '';
  const ctorKey = `${border ?? ''}|${idKey ?? ''}|${crs ?? ''}|${selectedIndex ?? ''}|${selectedColor ?? ''}|${visible ?? ''}|${opacity ?? ''}|${minZoom ?? ''}|${maxZoom ?? ''}|${zIndex ?? ''}|${enablePicked ?? ''}|${autoSelect ?? ''}|${popEvent ?? ''}|${pickWidth ?? ''}|${pickHeight ?? ''}|${styleKey}`;

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const opts: Record<string, unknown> = {};
    if (border !== undefined) opts.border = border;
    if (style !== undefined) opts.style = style;
    if (idKey !== undefined) opts.idKey = idKey;
    if (crs !== undefined) opts.crs = crs;
    if (selectedIndex !== undefined) opts.selectedIndex = selectedIndex;
    if (selectedColor !== undefined) opts.selectedColor = selectedColor;
    if (visible !== undefined) opts.visible = visible;
    if (opacity !== undefined) opts.opacity = opacity;
    if (minZoom !== undefined) opts.minZoom = minZoom;
    if (maxZoom !== undefined) opts.maxZoom = maxZoom;
    if (zIndex !== undefined) opts.zIndex = zIndex;
    if (enablePicked !== undefined) opts.enablePicked = enablePicked;
    if (autoSelect !== undefined) opts.autoSelect = autoSelect;
    if (popEvent !== undefined) opts.popEvent = popEvent;
    if (pickWidth !== undefined) opts.pickWidth = pickWidth;
    if (pickHeight !== undefined) opts.pickHeight = pickHeight;

    const handle = driver.createFillLayer(opts);
    if (!handle) return;
    rawRef.current = (handle as any).raw;
    driver.addLayer(map, handle);

    // mount 后如果有 data，立即 setData
    if (data && rawRef.current) {
      try { rawRef.current.setData?.(data); } catch { /* noop */ }
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

  // style 变化已通过 ctorKey 重建处理，无需额外 setStyleOptions

  return null;
});
