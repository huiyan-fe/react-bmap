/**
 * PointIconLayer — 点图标图层（手写组件）。
 * @since 4.0
 *
 * 组件方式：
 * ```tsx
 * <PointIconLayer
 *   isFlat
 *   style={{ icon: 'https://...', width: 25, height: 25 }}
 *   data={geojson}
 *   enablePicked
 * />
 * ```
 */
import { memo, useLayoutEffect, useRef, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';
import { debugWarn } from '../../utils/debugWarn';

export interface PointIconStyle {
  icon?: string;
  iconObj?: (style: object, properties: object) => { id?: number; canvas: HTMLCanvasElement };
  visibility?: boolean;
  sizes?: [number, number];
  width?: number;
  height?: number;
  userSizes?: boolean;
  anchors?: [number, number];
  offset?: [number, number];
  scale?: number;
  rotation?: number;
  opacity?: number;
}

export interface PointIconLayerOptions {
  isFlat?: boolean;
  isFixed?: boolean;
  style?: PointIconStyle;
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

export interface PointIconLayerProps extends PointIconLayerOptions {
  /** GeoJSON 数据源，变化时调用 raw.setData() */
  data?: object;
}

export const PointIconLayer = memo(function PointIconLayer(props: PointIconLayerProps) {
  const { isFlat, isFixed, style, idKey, crs, selectedIndex, selectedColor, visible, opacity, minZoom, maxZoom, zIndex, enablePicked, autoSelect, popEvent, pickWidth, pickHeight, data } = props;
  const { map, driver } = useMapContext();
  const rawRef = useRef<any>(null);

  // style + constructor 选项变化时重建
  const styleKey = style ? JSON.stringify(style) : '';
  const ctorKey = `${isFlat ?? ''}|${isFixed ?? ''}|${idKey ?? ''}|${crs ?? ''}|${selectedIndex ?? ''}|${selectedColor ?? ''}|${visible ?? ''}|${opacity ?? ''}|${minZoom ?? ''}|${maxZoom ?? ''}|${zIndex ?? ''}|${enablePicked ?? ''}|${autoSelect ?? ''}|${popEvent ?? ''}|${pickWidth ?? ''}|${pickHeight ?? ''}|${styleKey}`;

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const opts: Record<string, unknown> = {};
    if (isFlat !== undefined) opts.isFlat = isFlat;
    if (isFixed !== undefined) opts.isFixed = isFixed;
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

    const handle = driver.createPointIconLayer(opts);
    if (!handle) return;
    rawRef.current = (handle as any).raw;
    driver.addLayer(map, handle);

    if (data && rawRef.current) {
      try { rawRef.current.setData?.(data); } catch (e) { debugWarn('PointIconLayer.setData', e); }
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
