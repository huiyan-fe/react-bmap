/**
 * DOMLayer — 自定义 DOM 覆盖物图层（手写组件）。
 * @since 4.0
 *
 * 组件方式：
 * ```tsx
 * <DOMLayer
 *   createDOM={(properties, point) => { ... return HTMLElement; }}
 *   data={geojson}
 *   minZoom={5}
 *   enableDraggingMap
 * />
 * ```
 *
 * 实现要点：
 * - constructor: (createDOM, opts) — 第一个参数是创建 DOM 的回调
 * - data 变化 → raw.setData()
 */
import { memo, useLayoutEffect, useRef, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';

export interface DOMLayerOptions {
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  offsetX?: number;
  offsetY?: number;
  anchors?: [number, number];
  coordinate?: string;
  enableDraggingMap?: boolean;
  visible?: boolean;
  data?: object | null;
}

export interface DOMLayerProps extends DOMLayerOptions {
  /** 创建 DOM 元素的回调，接收 properties 和 point，返回 HTMLElement */
  createDOM: (properties: object, point: { lng: number; lat: number }) => HTMLElement;
  /** GeoJSON 数据源，变化时调用 raw.setData() */
  data?: object;
}

export const DOMLayer = memo(function DOMLayer(props: DOMLayerProps) {
  const { createDOM, minZoom, maxZoom, zIndex, offsetX, offsetY, anchors, coordinate, enableDraggingMap, visible, data } = props;
  const { map, driver } = useMapContext();
  const rawRef = useRef<any>(null);

  // create + add（constructor 选项变化时重建）
  const ctorKey = `${minZoom ?? ''}|${maxZoom ?? ''}|${zIndex ?? ''}|${offsetX ?? ''}|${offsetY ?? ''}|${anchors?.join(',') ?? ''}|${coordinate ?? ''}|${enableDraggingMap ?? ''}|${visible ?? ''}`;

  useLayoutEffect(() => {
    if (!map || !driver || !createDOM) return;

    const opts: Record<string, unknown> = {};
    if (minZoom !== undefined) opts.minZoom = minZoom;
    if (maxZoom !== undefined) opts.maxZoom = maxZoom;
    if (zIndex !== undefined) opts.zIndex = zIndex;
    if (offsetX !== undefined) opts.offsetX = offsetX;
    if (offsetY !== undefined) opts.offsetY = offsetY;
    if (anchors !== undefined) opts.anchors = anchors;
    if (coordinate !== undefined) opts.coordinate = coordinate;
    if (enableDraggingMap !== undefined) opts.enableDraggingMap = enableDraggingMap;
    if (visible !== undefined) opts.visible = visible;

    const handle = driver.createDOMLayer({ createDOM, ...opts });
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
  }, [map, driver, ctorKey, createDOM]);

  // data 变化 → setData
  const dataKey = data ? JSON.stringify(data) : '';
  useEffect(() => {
    if (!rawRef.current || !data) return;
    try { rawRef.current.setData?.(data); } catch { /* noop */ }
  }, [dataKey]);

  return null;
});
