/**
 * PointShapeLayer — 点形状图层（手写组件）。
 * @since 4.0 使用 2D 几何图形（圆形、方形、三角形、五角星等）渲染点数据。
 *
 * 组件方式：
 * ```tsx
 * <PointShapeLayer style={{ shapeType: 2, size: 20, color: '#ff0000' }} data={geojson} />
 * ```
 */
import { memo, useLayoutEffect, useRef, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';

export interface PointShapeStyle {
  visibility?: boolean;
  shapeType?: number;
  anchor?: number;
  size?: number;
  scale?: number;
  rotation?: number;
  offset?: [number, number];
  color?: string;
  opacity?: number;
  strokeColor?: string;
  strokeWeight?: number;
}

export interface PointShapeLayerOptions {
  isFlat?: boolean;
  style?: PointShapeStyle;
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

export interface PointShapeLayerProps extends PointShapeLayerOptions {
  data?: object;
}

export const PointShapeLayer = memo(function PointShapeLayer(props: PointShapeLayerProps) {
  const { isFlat, style, idKey, crs, selectedIndex, selectedColor, visible, opacity, minZoom, maxZoom, zIndex, enablePicked, autoSelect, popEvent, pickWidth, pickHeight, data } = props;
  const { map, driver } = useMapContext();
  const rawRef = useRef<any>(null);

  const styleKey = style ? JSON.stringify(style) : '';
  const ctorKey = `${isFlat ?? ''}|${idKey ?? ''}|${crs ?? ''}|${selectedIndex ?? ''}|${selectedColor ?? ''}|${visible ?? ''}|${opacity ?? ''}|${minZoom ?? ''}|${maxZoom ?? ''}|${zIndex ?? ''}|${enablePicked ?? ''}|${autoSelect ?? ''}|${popEvent ?? ''}|${pickWidth ?? ''}|${pickHeight ?? ''}|${styleKey}`;

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const opts: Record<string, unknown> = {};
    if (isFlat !== undefined) opts.isFlat = isFlat;
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

    const handle = driver.createPointShapeLayer(opts);
    if (!handle) return;
    rawRef.current = (handle as any).raw;
    driver.addLayer(map, handle);

    if (data && rawRef.current) {
      try { rawRef.current.setData?.(data); } catch { /* noop */ }
    }

    return () => {
      driver.removeLayer(map, handle);
      rawRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, ctorKey]);

  const dataKey = data ? JSON.stringify(data) : '';
  useEffect(() => {
    if (!rawRef.current || !data) return;
    try { rawRef.current.setData?.(data); } catch { /* noop */ }
  }, [dataKey]);

  return null;
});
