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
import { useLatest } from '../../utils/useLatest';
import { debugWarn } from '../../utils/debugWarn';

/** 图层拾取事件对象（enablePicked=true 时点击/悬停命中要素） */
export interface PointIconLayerEvent {
  /** 命中的要素：value.dataItem.properties 为该点的属性 */
  value?: { dataItem?: { properties?: Record<string, unknown>; [k: string]: unknown }; [k: string]: unknown };
  [k: string]: unknown;
}

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
  /** 点击要素（需 enablePicked）。e.value.dataItem.properties 为选中要素属性 */
  onClick?: (e: PointIconLayerEvent) => void;
  /** 双击要素（需 enablePicked） */
  onDblClick?: (e: PointIconLayerEvent) => void;
  onRightClick?: (e: PointIconLayerEvent) => void;
  /** 鼠标在要素上移动（需 enablePicked）。SDK 不派发 mouseover/mouseout */
  onMouseMove?: (e: PointIconLayerEvent) => void;
}

// SDK LayerNormalMgr 只派发 onclick/ondblclick/onrightclick/onmousemove 四种，没有 mouseover/mouseout
const LAYER_EVENTS: Array<{ sdk: string; prop: keyof PointIconLayerProps }> = [
  { sdk: 'click', prop: 'onClick' },
  { sdk: 'dblclick', prop: 'onDblClick' },
  { sdk: 'rightclick', prop: 'onRightClick' },
  { sdk: 'mousemove', prop: 'onMouseMove' },
];

export const PointIconLayer = memo(function PointIconLayer(props: PointIconLayerProps) {
  const { isFlat, isFixed, style, idKey, crs, selectedIndex, selectedColor, visible, opacity, minZoom, maxZoom, zIndex, enablePicked, autoSelect, popEvent, pickWidth, pickHeight, data } = props;
  const { map, driver } = useMapContext();
  const rawRef = useRef<any>(null);
  // 事件 handler 用 ref 存最新：handler 引用每次 render 变化时不重绑、不重建图层，
  // 绑定一次、调用时读最新（避免内联 onClick 导致重复挂载或闪烁）。
  const handlersRef = useLatest({ onClick: props.onClick, onDblClick: props.onDblClick, onRightClick: props.onRightClick, onMouseMove: props.onMouseMove });

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

    // 绑定图层事件：handler 走 handlersRef 读最新，绑定一次，随图层重建（ctorKey）重绑
    const raw = rawRef.current;
    const bound: Array<{ sdk: string; fn: (e: PointIconLayerEvent) => void }> = [];
    if (raw && typeof raw.addEventListener === 'function') {
      for (const { sdk, prop } of LAYER_EVENTS) {
        const fn = (e: PointIconLayerEvent) => {
          const h = handlersRef.current[prop as keyof typeof handlersRef.current];
          if (typeof h === 'function') h(e);
        };
        try { raw.addEventListener(sdk, fn); bound.push({ sdk, fn }); } catch { /* ignore */ }
      }
    }

    if (data && rawRef.current) {
      try { rawRef.current.setData?.(data); } catch (e) { debugWarn('PointIconLayer.setData', e); }
    }

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

  return null;
});
