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
import { useLatest } from '../../utils/useLatest';
import { debugWarn } from '../../utils/debugWarn';

export interface DOMLayerOptions {
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  offsetX?: number;
  offsetY?: number;
  anchors?: [number, number];
  coordinate?: string;
  enableDraggingMap?: boolean;
  /**
   * 延迟一拍定位（默认 true）：首次 draw 以 opacity=0 完成定位，setTimeout(0) 后用真实宽高重新定位再显示。
   * 消除「子元素宽度首次测量不准 → 二次 draw 位置跳变」的初始化抖动。仅在首次渲染生效，不影响后续更新。
   * 需要严格同步显示时可传 false 关闭。
   */
  nextTick?: boolean;
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
  // nextTick 默认 true：消除首次定位的宽度测量抖动，显式传 false 关闭
  const nextTick = props.nextTick ?? true;
  const { map, driver } = useMapContext();
  const rawRef = useRef<any>(null);
  // createDOM 常被写成内联箭头函数（如 createDOM={p => createEl(p, onPick)}），每次父组件重渲染
  // （例如点击回调里 setState）都是新引用。若把它放进创建 effect 的依赖，会导致整个图层销毁重建、
  // 所有 DOM 重新创建 → 肉眼看到闪烁。这里用 useLatest 存最新 createDOM，并用一个引用稳定的
  // wrapper 传给 SDK：既不因 createDOM 引用变化触发重建，wrapper 内部又始终调用到最新的 createDOM。
  const createDOMRef = useLatest(createDOM);
  const stableCreateDOMRef = useRef<((properties: object, point: { lng: number; lat: number }) => HTMLElement) | null>(null);
  if (!stableCreateDOMRef.current) {
    stableCreateDOMRef.current = (properties, point) => createDOMRef.current(properties, point);
  }
  const stableCreateDOM = stableCreateDOMRef.current;
  // 已经喂给当前 raw 的 data 指纹。建图层时会先 setData 一次，这里记下来让下面的 data effect
  // 跳过同一份数据的重复调用：SDK 的 setData 会重建子覆盖物，而 nextTick 定位是 setTimeout，
  // 第二次 setData 抹掉上一批 DOM 后定时器才回调，就会 Cannot read properties of null (reading 'style')。
  const appliedDataKeyRef = useRef<string | null>(null);
  const dataKey = data ? JSON.stringify(data) : '';

  // create + add（constructor 选项变化时重建）
  const ctorKey = `${minZoom ?? ''}|${maxZoom ?? ''}|${zIndex ?? ''}|${offsetX ?? ''}|${offsetY ?? ''}|${anchors?.join(',') ?? ''}|${coordinate ?? ''}|${enableDraggingMap ?? ''}|${nextTick}|${visible ?? ''}`;

  useLayoutEffect(() => {
    if (!map || !driver || !stableCreateDOM) return;

    const opts: Record<string, unknown> = { nextTick };
    if (minZoom !== undefined) opts.minZoom = minZoom;
    if (maxZoom !== undefined) opts.maxZoom = maxZoom;
    if (zIndex !== undefined) opts.zIndex = zIndex;
    if (offsetX !== undefined) opts.offsetX = offsetX;
    if (offsetY !== undefined) opts.offsetY = offsetY;
    if (anchors !== undefined) opts.anchors = anchors;
    if (coordinate !== undefined) opts.coordinate = coordinate;
    if (enableDraggingMap !== undefined) opts.enableDraggingMap = enableDraggingMap;
    if (visible !== undefined) opts.visible = visible;

    const handle = driver.createDOMLayer({ createDOM: stableCreateDOM, ...opts });
    if (!handle) return;
    rawRef.current = (handle as any).raw;
    driver.addLayer(map, handle);

    // mount 后如果有 data，立即 setData
    if (data && rawRef.current) {
      try {
        rawRef.current.setData?.(data);
        appliedDataKeyRef.current = dataKey;
      } catch (e) { debugWarn('DOMLayer.setData', e); }
    }

    return () => {
      driver.removeLayer(map, handle);
      rawRef.current = null;
      appliedDataKeyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, ctorKey]);

  // data 变化 → setData（建图层时已喂过的同一份数据不再重复调用）
  useEffect(() => {
    if (!rawRef.current || !data) return;
    if (appliedDataKeyRef.current === dataKey) return;
    try {
      rawRef.current.setData?.(data);
      appliedDataKeyRef.current = dataKey;
    } catch { /* noop */ }
  }, [dataKey]);

  return null;
});
