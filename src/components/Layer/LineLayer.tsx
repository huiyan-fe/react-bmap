/**
 * LineLayer — 线图层（手写组件）。
 * @since 4.0
 *
 * 组件方式：
 * ```tsx
 * <LineLayer
 *   selectedColor="#ff7a45"
 *   style={{ strokeColor: '#2a6cf6', strokeWeight: 6, strokeStyle: 'solid' }}
 *   data={geojson}
 *   enablePicked
 * />
 * ```
 *
 * 实现要点：
 * - mount → driver.createLineLayer + addLayer
 * - data 变化 → raw.setData()
 * - style 变化 → raw.setStyleOptions() + raw.doOnceDraw()（运行时更新，不重建图层）
 */
import { memo, useLayoutEffect, useRef, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';
import { useLatest } from '../../utils/useLatest';
import { debugWarn } from '../../utils/debugWarn';

/** 数据驱动样式表达式，如 ['match', ['get', 'name'], 'a', '#f00', '#00f']（SDK 表达式语法） */
export type LineStyleExpr = unknown[];

export interface LineLayerStyle {
  strokeColor?: string | LineStyleExpr;
  strokeWeight?: number | LineStyleExpr;
  strokeOpacity?: number | LineStyleExpr;
  strokeStyle?: string | LineStyleExpr;
  strokeLineCap?: string;
  strokeLineJoin?: string;
  borderColor?: string | LineStyleExpr;
  borderWeight?: number | LineStyleExpr;
  dashArray?: number[];
  strokeTextureUrl?: string | LineStyleExpr;
  strokeTextureWidth?: number | LineStyleExpr;
  strokeTextureHeight?: number;
  /** 是否按纹理序列渲染（贴图沿线重复） */
  sequence?: boolean;
  /** 纹理之间的间隔长度 */
  marginLength?: number;
  [k: string]: unknown;
}

export interface LineLayerOptions {
  style?: LineLayerStyle;
  idKey?: string;
  crs?: string;
  selectedColor?: string;
  selectedIndex?: number;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  enablePicked?: boolean;
  /** 拾取时是否自动切换 selectedIndex（配合 feature-state 高亮时通常设 false，自己控制状态） */
  enableChangeSelectIndexByPick?: boolean;
  autoSelect?: boolean;
  popEvent?: boolean;
}

/** 图层拾取事件对象（enablePicked=true 时点击/悬停命中要素；dataIndex=-1 表示点空白） */
export interface LineLayerEvent {
  value?: {
    dataIndex?: number;
    dataItem?: { properties?: Record<string, unknown>; [k: string]: unknown };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

export interface LineLayerProps extends LineLayerOptions {
  /** GeoJSON 数据源，变化时调用 raw.setData() */
  data?: object;
  /** 点击要素（需 enablePicked）。e.value.dataIndex 为命中要素索引，-1 表示点空白 */
  onClick?: (e: LineLayerEvent) => void;
  onRightClick?: (e: LineLayerEvent) => void;
  onMouseOver?: (e: LineLayerEvent) => void;
  onMouseOut?: (e: LineLayerEvent) => void;
  onMouseMove?: (e: LineLayerEvent) => void;
  /** 图层创建并挂载后回调，拿到原生 LineLayer 实例做命令式操作（如 updateState/clearState） */
  onReady?: (layer: any) => void;
}

const LAYER_EVENTS: Array<{ sdk: string; prop: keyof LineLayerProps }> = [
  { sdk: 'click', prop: 'onClick' },
  { sdk: 'rightclick', prop: 'onRightClick' },
  { sdk: 'mouseover', prop: 'onMouseOver' },
  { sdk: 'mouseout', prop: 'onMouseOut' },
  { sdk: 'mousemove', prop: 'onMouseMove' },
];

export const LineLayer = memo(function LineLayer(props: LineLayerProps) {
  const { style, idKey, crs, selectedColor, selectedIndex, visible, opacity, minZoom, maxZoom, zIndex, enablePicked, enableChangeSelectIndexByPick, autoSelect, popEvent, data } = props;
  const { map, driver } = useMapContext();
  const rawRef = useRef<any>(null);
  // 事件 handler / onReady 用 ref 存最新：引用变化不重绑不重建图层
  const handlersRef = useLatest({ onClick: props.onClick, onRightClick: props.onRightClick, onMouseOver: props.onMouseOver, onMouseOut: props.onMouseOut, onMouseMove: props.onMouseMove });
  const onReadyRef = useLatest(props.onReady);

  // ctorKey 不含 style：style 变化走运行时 setStyleOptions，不重建图层
  const ctorKey = `${idKey ?? ''}|${crs ?? ''}|${selectedColor ?? ''}|${selectedIndex ?? ''}|${visible ?? ''}|${opacity ?? ''}|${minZoom ?? ''}|${maxZoom ?? ''}|${zIndex ?? ''}|${enablePicked ?? ''}|${enableChangeSelectIndexByPick ?? ''}|${autoSelect ?? ''}|${popEvent ?? ''}`;

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const opts: Record<string, unknown> = {};
    if (style !== undefined) opts.style = style;
    if (idKey !== undefined) opts.idKey = idKey;
    if (crs !== undefined) opts.crs = crs;
    if (selectedColor !== undefined) opts.selectedColor = selectedColor;
    if (selectedIndex !== undefined) opts.selectedIndex = selectedIndex;
    if (visible !== undefined) opts.visible = visible;
    if (opacity !== undefined) opts.opacity = opacity;
    if (minZoom !== undefined) opts.minZoom = minZoom;
    if (maxZoom !== undefined) opts.maxZoom = maxZoom;
    if (zIndex !== undefined) opts.zIndex = zIndex;
    if (enablePicked !== undefined) opts.enablePicked = enablePicked;
    if (enableChangeSelectIndexByPick !== undefined) opts.enableChangeSelectIndexByPick = enableChangeSelectIndexByPick;
    if (autoSelect !== undefined) opts.autoSelect = autoSelect;
    if (popEvent !== undefined) opts.popEvent = popEvent;

    const handle = driver.createLineLayer(opts);
    if (!handle) return;
    rawRef.current = (handle as any).raw;
    driver.addLayer(map, handle);

    // 绑定图层事件：handler 走 handlersRef 读最新，绑定一次，随图层重建（ctorKey）重绑
    const raw = rawRef.current;
    const bound: Array<{ sdk: string; fn: (e: LineLayerEvent) => void }> = [];
    if (raw && typeof raw.addEventListener === 'function') {
      for (const { sdk, prop } of LAYER_EVENTS) {
        const fn = (e: LineLayerEvent) => {
          const h = handlersRef.current[prop as keyof typeof handlersRef.current];
          if (typeof h === 'function') h(e);
        };
        try { raw.addEventListener(sdk, fn); bound.push({ sdk, fn }); } catch { /* ignore */ }
      }
    }

    if (data && rawRef.current) {
      try { rawRef.current.setData?.(data); } catch (e) { debugWarn('LineLayer.setData', e); }
    }

    // 暴露原生 layer 实例，供命令式调用（updateState/clearState 等）
    onReadyRef.current?.(rawRef.current);

    return () => {
      for (const { sdk, fn } of bound) {
        try { raw.removeEventListener?.(sdk, fn); } catch { /* ignore */ }
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  // style 变化 → 运行时 setStyleOptions（不重建图层）
  const styleKey = style ? JSON.stringify(style) : '';
  useEffect(() => {
    if (!rawRef.current || !style) return;
    try {
      rawRef.current.setStyleOptions?.(style);
      rawRef.current.doOnceDraw?.();
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleKey]);

  return null;
});
