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
  isFlat?: boolean;
  drawPart?: boolean;
  selectedIndex?: number;
  selectedColor?: string;
  enablePicked?: boolean;
  /** 拾取时是否自动切换 selectedIndex（配合 feature-state 高亮时通常设 false，自己控制状态） */
  enableChangeSelectIndexByPick?: boolean;
  autoSelect?: boolean;
  popEvent?: boolean;
  pickWidth?: number;
  pickHeight?: number;
  /** 命中要素时是否自动改变鼠标样式 */
  mouseStyleChange?: boolean;
  /** 参考中心点（Point） */
  referCenter?: unknown;
  isTop?: boolean;
  isLowText?: boolean;
  // ─── 受控选项（变化走对应 setter 平滑更新，不重建图层）───
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
}

export interface FillLayerProps extends FillLayerOptions {
  /** GeoJSON 数据源，变化时调用 raw.setData() */
  data?: object;
  /** setData 第二参（如 { changeCenter: true } 自动定位到数据范围） */
  setDataParams?: object;
  /** 点击要素（需 enablePicked）。e.value.dataItem.properties 为选中要素属性 */
  onClick?: (e: FillLayerEvent) => void;
  /** 双击要素（需 enablePicked） */
  onDblClick?: (e: FillLayerEvent) => void;
  onRightClick?: (e: FillLayerEvent) => void;
  /** 鼠标在要素上移动（需 enablePicked）。SDK 不派发 mouseover/mouseout */
  onMouseMove?: (e: FillLayerEvent) => void;
  /** 图层挂载后回调，拿到原生 FillLayer 实例做命令式操作（如 updateState/clearState） */
  onReady?: (layer: any) => void;
}

/** 图层拾取事件对象（enablePicked=true 时点击/命中要素） */
export interface FillLayerEvent {
  value?: { dataIndex?: number; dataItem?: { properties?: Record<string, unknown>; [k: string]: unknown }; [k: string]: unknown };
  [k: string]: unknown;
}

// SDK LayerNormalMgr 只派发 onclick/ondblclick/onrightclick/onmousemove 四种，没有 mouseover/mouseout
const LAYER_EVENTS: Array<{ sdk: string; prop: keyof FillLayerProps }> = [
  { sdk: 'click', prop: 'onClick' },
  { sdk: 'dblclick', prop: 'onDblClick' },
  { sdk: 'rightclick', prop: 'onRightClick' },
  { sdk: 'mousemove', prop: 'onMouseMove' },
];

export const FillLayer = memo(function FillLayer(props: FillLayerProps) {
  const {
    border, style, idKey, crs, isFlat, drawPart, selectedIndex, selectedColor,
    enablePicked, enableChangeSelectIndexByPick, autoSelect, popEvent, pickWidth, pickHeight,
    mouseStyleChange, referCenter, isTop, isLowText,
    visible, opacity, minZoom, maxZoom, zIndex, data, setDataParams,
  } = props;
  const { map, driver } = useMapContext();
  const rawRef = useRef<any>(null);
  // 事件 handler / onReady 用 ref 存最新：引用变化不重绑不重建图层
  const handlersRef = useLatest({ onClick: props.onClick, onDblClick: props.onDblClick, onRightClick: props.onRightClick, onMouseMove: props.onMouseMove });
  const onReadyRef = useLatest(props.onReady);
  const setDataParamsRef = useLatest(setDataParams);

  // ctorKey 只含真正的构造期选项；style 与 visible/opacity/zIndex/minZoom/maxZoom 都走运行时更新，不进 ctorKey
  const ctorKey = [
    border, idKey, crs, isFlat, drawPart, selectedIndex, selectedColor,
    enablePicked, enableChangeSelectIndexByPick, autoSelect, popEvent, pickWidth, pickHeight,
    mouseStyleChange, isTop, isLowText,
  ].map(v => v ?? '').join('|');

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const opts: Record<string, unknown> = {};
    const put = (k: string, v: unknown) => { if (v !== undefined) opts[k] = v; };
    put('border', border); put('style', style);
    put('idKey', idKey); put('crs', crs); put('isFlat', isFlat); put('drawPart', drawPart);
    put('selectedIndex', selectedIndex); put('selectedColor', selectedColor);
    put('enablePicked', enablePicked); put('enableChangeSelectIndexByPick', enableChangeSelectIndexByPick);
    put('autoSelect', autoSelect); put('popEvent', popEvent);
    put('pickWidth', pickWidth); put('pickHeight', pickHeight);
    put('mouseStyleChange', mouseStyleChange); put('referCenter', referCenter);
    put('isTop', isTop); put('isLowText', isLowText);
    // 受控字段的初始值也随构造传入（后续变化走 setter）
    put('visible', visible); put('opacity', opacity);
    put('minZoom', minZoom); put('maxZoom', maxZoom); put('zIndex', zIndex);

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
      try { rawRef.current.setData?.(data, setDataParamsRef.current); } catch (e) { debugWarn('FillLayer.setData', e); }
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
    try { rawRef.current.setData?.(data, setDataParamsRef.current); } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  // style 变化 → 运行时 setStyleOptions（不重建图层，与 LineLayer 对齐）
  const styleKey = style ? JSON.stringify(style) : '';
  useEffect(() => {
    if (!rawRef.current || !style) return;
    try {
      rawRef.current.setStyleOptions?.(style);
      rawRef.current.doOnceDraw?.();
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleKey]);

  // 受控选项 → 对应 setter 平滑更新，不重建图层
  useEffect(() => { if (rawRef.current && visible !== undefined) try { rawRef.current.setVisible?.(visible); } catch { /* noop */ } }, [visible]);
  useEffect(() => { if (rawRef.current && opacity !== undefined) try { rawRef.current.setOpacity?.(opacity); } catch { /* noop */ } }, [opacity]);
  useEffect(() => { if (rawRef.current && zIndex !== undefined) try { rawRef.current.setZIndex?.(zIndex); } catch { /* noop */ } }, [zIndex]);
  useEffect(() => { if (rawRef.current && minZoom !== undefined) try { rawRef.current.setMinZoom?.(minZoom); } catch { /* noop */ } }, [minZoom]);
  useEffect(() => { if (rawRef.current && maxZoom !== undefined) try { rawRef.current.setMaxZoom?.(maxZoom); } catch { /* noop */ } }, [maxZoom]);

  return null;
});
