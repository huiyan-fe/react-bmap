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
import { useLatest } from '../../utils/useLatest';
import { debugWarn } from '../../utils/debugWarn';

/** 数据驱动样式表达式，如 ['match', ['get', 'name'], '海淀区', 'red', '#aecde8'] */
export type FillStyleExpr = unknown[];

export interface FillLayerStyle {
  fillColor?: string | FillStyleExpr;
  fillOpacity?: number | FillStyleExpr;
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
  borderWeight?: number | FillStyleExpr;
  borderColor?: string | FillStyleExpr;
  strokeTextureUrl?: string;
  strokeTextureWidth?: number;
  strokeTextureHeight?: number;
  strokeLineJoin?: string;
  strokeLineCap?: string;
  strokeColor?: string | FillStyleExpr;
  strokeWeight?: number | FillStyleExpr;
  strokeOpacity?: number | FillStyleExpr;
  strokeStyle?: string;
  dashArray?: number[];
  height?: number | FillStyleExpr;
  [k: string]: unknown;
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
  /** 点击要素（需 enablePicked）。e.value.dataItem.properties 为选中要素属性 */
  onClick?: (e: FillLayerEvent) => void;
  onRightClick?: (e: FillLayerEvent) => void;
  onMouseOver?: (e: FillLayerEvent) => void;
  onMouseOut?: (e: FillLayerEvent) => void;
  onMouseMove?: (e: FillLayerEvent) => void;
  /** 图层挂载后回调，拿到原生 FillLayer 实例做命令式操作（如 updateState/clearState） */
  onReady?: (layer: any) => void;
}

/** 图层拾取事件对象（enablePicked=true 时点击/悬停命中要素） */
export interface FillLayerEvent {
  value?: { dataIndex?: number; dataItem?: { properties?: Record<string, unknown>; [k: string]: unknown }; [k: string]: unknown };
  [k: string]: unknown;
}

const LAYER_EVENTS: Array<{ sdk: string; prop: keyof FillLayerProps }> = [
  { sdk: 'click', prop: 'onClick' },
  { sdk: 'rightclick', prop: 'onRightClick' },
  { sdk: 'mouseover', prop: 'onMouseOver' },
  { sdk: 'mouseout', prop: 'onMouseOut' },
  { sdk: 'mousemove', prop: 'onMouseMove' },
];

export const FillLayer = memo(function FillLayer(props: FillLayerProps) {
  const { border, style, idKey, crs, selectedIndex, selectedColor, visible, opacity, minZoom, maxZoom, zIndex, enablePicked, autoSelect, popEvent, pickWidth, pickHeight, data } = props;
  const { map, driver } = useMapContext();
  const rawRef = useRef<any>(null);
  // 事件 handler / onReady 用 ref 存最新：引用变化不重绑不重建图层
  const handlersRef = useLatest({ onClick: props.onClick, onRightClick: props.onRightClick, onMouseOver: props.onMouseOver, onMouseOut: props.onMouseOut, onMouseMove: props.onMouseMove });
  const onReadyRef = useLatest(props.onReady);

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

    // 绑定图层事件：handler 走 handlersRef 读最新，绑定一次，随图层重建（ctorKey）重绑
    const raw = rawRef.current;
    const bound: Array<{ sdk: string; fn: (e: FillLayerEvent) => void }> = [];
    if (raw && typeof raw.addEventListener === 'function') {
      for (const { sdk, prop } of LAYER_EVENTS) {
        const fn = (e: FillLayerEvent) => {
          const h = handlersRef.current[prop as keyof typeof handlersRef.current];
          if (typeof h === 'function') h(e);
        };
        try { raw.addEventListener(sdk, fn); bound.push({ sdk, fn }); } catch { /* ignore */ }
      }
    }

    // mount 后如果有 data，立即 setData
    if (data && rawRef.current) {
      try { rawRef.current.setData?.(data); } catch (e) { debugWarn('FillLayer.setData', e); }
    }

    // 暴露原生 layer 实例，供命令式调用
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
  }, [dataKey]);

  // style 变化已通过 ctorKey 重建处理，无需额外 setStyleOptions

  return null;
});
