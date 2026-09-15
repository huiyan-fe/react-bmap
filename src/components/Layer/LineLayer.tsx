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
  // ─── 构造期选项（变化会重建图层）───
  idKey?: string;
  crs?: string;
  isFlat?: boolean;
  drawPart?: boolean;
  selectedColor?: string;
  selectedIndex?: number;
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
  // ─── LineLayer 专属折线/节点选项（构造期）───
  /** 是否渐变线 */
  isLinear?: boolean;
  /** 渐变纹理 */
  linearTexture?: unknown;
  nodeShow?: boolean;
  nodeMask?: boolean;
  nodeStrict?: boolean;
  nodeJoin?: boolean;
  nodeBreakpoint?: boolean;
  nodeMiddleShow?: boolean;
  nodeMinZoom?: number;
  linkLine?: boolean;
  // ─── 受控选项（变化走对应 setter 平滑更新，不重建图层）───
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
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
  /** setData 第二参（如 { changeCenter: true } 自动定位到数据范围） */
  setDataParams?: object;
  /** 点击要素（需 enablePicked）。e.value.dataIndex 为命中要素索引，-1 表示点空白 */
  onClick?: (e: LineLayerEvent) => void;
  /** 双击要素（需 enablePicked） */
  onDblClick?: (e: LineLayerEvent) => void;
  onRightClick?: (e: LineLayerEvent) => void;
  /** 鼠标在要素上移动（需 enablePicked）。SDK 不派发 mouseover/mouseout，hover 进出请自行用 dataIndex 变化推导 */
  onMouseMove?: (e: LineLayerEvent) => void;
  /** 图层创建并挂载后回调，拿到原生 LineLayer 实例做命令式操作（如 updateState/clearState/traceControl） */
  onReady?: (layer: any) => void;
}

// SDK LayerNormalMgr 只派发 onclick/ondblclick/onrightclick/onmousemove 四种，没有 mouseover/mouseout
const LAYER_EVENTS: Array<{ sdk: string; prop: keyof LineLayerProps }> = [
  { sdk: 'click', prop: 'onClick' },
  { sdk: 'dblclick', prop: 'onDblClick' },
  { sdk: 'rightclick', prop: 'onRightClick' },
  { sdk: 'mousemove', prop: 'onMouseMove' },
];

export const LineLayer = memo(function LineLayer(props: LineLayerProps) {
  const {
    style, idKey, crs, isFlat, drawPart, selectedColor, selectedIndex,
    enablePicked, enableChangeSelectIndexByPick, autoSelect, popEvent, pickWidth, pickHeight,
    mouseStyleChange, referCenter, isTop, isLowText,
    isLinear, linearTexture, nodeShow, nodeMask, nodeStrict, nodeJoin, nodeBreakpoint, nodeMiddleShow, nodeMinZoom, linkLine,
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
    idKey, crs, isFlat, drawPart, selectedColor, selectedIndex,
    enablePicked, enableChangeSelectIndexByPick, autoSelect, popEvent, pickWidth, pickHeight,
    mouseStyleChange, isTop, isLowText,
    isLinear, linearTexture, nodeShow, nodeMask, nodeStrict, nodeJoin, nodeBreakpoint, nodeMiddleShow, nodeMinZoom, linkLine,
  ].map(v => v ?? '').join('|');

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const opts: Record<string, unknown> = {};
    const put = (k: string, v: unknown) => { if (v !== undefined) opts[k] = v; };
    put('style', style);
    put('idKey', idKey); put('crs', crs); put('isFlat', isFlat); put('drawPart', drawPart);
    put('selectedColor', selectedColor); put('selectedIndex', selectedIndex);
    put('enablePicked', enablePicked); put('enableChangeSelectIndexByPick', enableChangeSelectIndexByPick);
    put('autoSelect', autoSelect); put('popEvent', popEvent);
    put('pickWidth', pickWidth); put('pickHeight', pickHeight);
    put('mouseStyleChange', mouseStyleChange); put('referCenter', referCenter);
    put('isTop', isTop); put('isLowText', isLowText);
    put('isLinear', isLinear); put('linearTexture', linearTexture);
    put('nodeShow', nodeShow); put('nodeMask', nodeMask); put('nodeStrict', nodeStrict);
    put('nodeJoin', nodeJoin); put('nodeBreakpoint', nodeBreakpoint);
    put('nodeMiddleShow', nodeMiddleShow); put('nodeMinZoom', nodeMinZoom); put('linkLine', linkLine);
    // 受控字段的初始值也随构造传入（后续变化走 setter）
    put('visible', visible); put('opacity', opacity);
    put('minZoom', minZoom); put('maxZoom', maxZoom); put('zIndex', zIndex);

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
      try { rawRef.current.setData?.(data, setDataParamsRef.current); } catch (e) { debugWarn('LineLayer.setData', e); }
    }

    // 暴露原生 layer 实例，供命令式调用（updateState/clearState/traceControl 等）
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

  // 受控选项 → 对应 setter 平滑更新，不重建图层
  useEffect(() => { if (rawRef.current && visible !== undefined) try { rawRef.current.setVisible?.(visible); } catch { /* noop */ } }, [visible]);
  useEffect(() => { if (rawRef.current && opacity !== undefined) try { rawRef.current.setOpacity?.(opacity); } catch { /* noop */ } }, [opacity]);
  useEffect(() => { if (rawRef.current && zIndex !== undefined) try { rawRef.current.setZIndex?.(zIndex); } catch { /* noop */ } }, [zIndex]);
  useEffect(() => { if (rawRef.current && minZoom !== undefined) try { rawRef.current.setMinZoom?.(minZoom); } catch { /* noop */ } }, [minZoom]);
  useEffect(() => { if (rawRef.current && maxZoom !== undefined) try { rawRef.current.setMaxZoom?.(maxZoom); } catch { /* noop */ } }, [maxZoom]);

  return null;
});
