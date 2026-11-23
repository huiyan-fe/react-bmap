/**
 * DeckglLayer —— deck.gl 接入图层（4.0+ Visualization）。对应 JSAPI 4.0 的 BMap.DeckglLayer。
 *
 * ⚠️ deck.gl 由宿主工程自行引入并挂到全局 `window.deck`（需含 `deck.Deck`），本组件不 import deck。
 * SDK 构造第一行就检查全局；这里创建前守卫并只告警一次。
 *
 * - `data`：deck props 对象（开放集合，最常用 `{ layers: [...] }`），变化时调 raw.setProps()，不重建 Deck。
 * - `deckProps`：额外 deck 配置（views / effects / controller / useDevicePixels 等），随构造传入。
 * - deck.gl 8.x：同一共享 GL 上下文里 Deck finalize 后无法安全重建，
 *   显隐请用 `visible`（走 setVisible），不要卸载/重建组件。
 */
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';
import { useLatest } from '../../utils/useLatest';
import { stableStringify } from '../../utils/stableStringify';
import { debugWarn } from '../../utils/debugWarn';
import type { LayerHandle } from '../../types';

export interface DeckglLayerOptions {
  /** 是否逐帧重绘（deck 动画 / 动态数据用），默认 false */
  animation?: boolean;
  /** 渲染阶段：'basemap' | 'tilelayer' | 'overlay' | 'building' | 'poi'，默认 'tilelayer' */
  renderStage?: 'basemap' | 'tilelayer' | 'overlay' | 'building' | 'poi';
  visible?: boolean;
  opacity?: number;
  zIndex?: number;
  minZoom?: number;
  maxZoom?: number;
  /** 数据可视化图层的中心参考点（渲染坐标基准），缺省用地图中心 */
  referCenter?: unknown;
}

export interface DeckglLayerProps extends DeckglLayerOptions {
  /** deck props 对象（开放集合），最常用 `{ layers: [...] }`；变化时调用 setProps（不重建 Deck） */
  data?: Record<string, unknown>;
  /** 额外 deck 构造配置（views / effects / controller / useDevicePixels 等） */
  deckProps?: Record<string, unknown>;
  /** GL 就绪、Deck 实例创建完成后调用，参数 (deck, layer) */
  onInit?: (deck: unknown, layer: DeckglLayerRef) => void;
  /** 渲染 / 创建出错时回调 */
  onError?: (err: unknown) => void;
  /** 图层销毁前回调，参数 (deck, layer) */
  onDestroy?: (deck: unknown, layer: DeckglLayerRef) => void;
}

export interface DeckglLayerRef {
  /** 更新 deck props（如 layers） */
  setProps: (props: Record<string, unknown>) => void;
  /** 内部 Deck 实例；GL 就绪前为 null */
  getDeck: () => unknown;
  /** 'pending' | 'ready' | 'error' */
  getStatus: () => string;
  getTime: () => number;
  startAnimation: () => void;
  stopAnimation: () => void;
  isAnimating: () => boolean;
}

let warnedMissingDeck = false;
function warnMissingDeck(): void {
  if (warnedMissingDeck) return;
  warnedMissingDeck = true;
  try {
    if (typeof console === 'undefined') return;
    console.warn(
      '[react-bmap] <DeckglLayer> 需要宿主工程自行引入 deck.gl 并挂到 window.deck 上（如 @deck.gl/core），' +
        '当前未检测到 window.deck.Deck，图层已跳过创建。异步加载 deck.gl 时，请等就绪后再渲染 <DeckglLayer>。',
    );
  } catch { /* 日志不能反过来把调用方搞崩 */ }
}

export const DeckglLayer = forwardRef<DeckglLayerRef, DeckglLayerProps>(function DeckglLayer(props, ref) {
  const { map, driver } = useMapContext();
  const handleRef = useRef<LayerHandle | null>(null);
  const onInitRef = useLatest(props.onInit);
  const onErrorRef = useLatest(props.onError);
  const onDestroyRef = useLatest(props.onDestroy);
  const appliedDataRef = useRef<Record<string, unknown> | undefined>(undefined);

  const rawOf = () => (handleRef.current ? (handleRef.current.raw as any) : null);

  // 稳定的命令式句柄（方法体内读 handleRef，GL 就绪前为 no-op）
  const api = useMemo<DeckglLayerRef>(() => ({
    setProps: (p) => { try { rawOf()?.setProps?.(p); } catch { /* ignore */ } },
    getDeck: () => { try { return rawOf()?.getDeck?.() ?? null; } catch { return null; } },
    getStatus: () => { try { return rawOf()?.getStatus?.() ?? 'pending'; } catch { return 'pending'; } },
    getTime: () => { try { return rawOf()?.getTime?.() ?? 0; } catch { return 0; } },
    startAnimation: () => { try { rawOf()?.startAnimation?.(); } catch { /* ignore */ } },
    stopAnimation: () => { try { rawOf()?.stopAnimation?.(); } catch { /* ignore */ } },
    isAnimating: () => { try { return !!rawOf()?.isAnimating?.(); } catch { return false; } },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  useImperativeHandle(ref, () => api, [api]);

  // visible/opacity/zIndex 走运行时 setter，不进 ctorKey —— deck 8.x 不能安全重建共享 GL 上下文
  const ctorKey = stableStringify([
    props.animation, props.renderStage, props.minZoom, props.maxZoom,
    props.referCenter, props.deckProps,
  ]);

  useLayoutEffect(() => {
    if (!map || !driver) return;
    if (!(globalThis as { deck?: { Deck?: unknown } }).deck?.Deck) { warnMissingDeck(); return; }

    const opts: Record<string, unknown> = {};
    const put = (k: string, v: unknown) => { if (v !== undefined) opts[k] = v; };
    put('animation', props.animation); put('renderStage', props.renderStage);
    put('visible', props.visible); put('opacity', props.opacity); put('zIndex', props.zIndex);
    put('minZoom', props.minZoom); put('maxZoom', props.maxZoom); put('referCenter', props.referCenter);

    opts.onInit = (deck: unknown) => { onInitRef.current?.(deck, api); };
    opts.onError = (err: unknown) => { onErrorRef.current?.(err); };
    opts.onDestroy = (deck: unknown) => { onDestroyRef.current?.(deck, api); };
    if (props.deckProps) Object.assign(opts, props.deckProps);

    const h = driver.createDeckglLayer(opts);
    if (!h) return;
    handleRef.current = h;
    driver.addLayer(map, h);

    if (props.data) {
      try { (h.raw as any)?.setProps?.(props.data); } catch (e) { debugWarn('DeckglLayer.setProps', e); }
    }
    appliedDataRef.current = props.data;

    return () => {
      try { driver.removeLayer(map, h); } catch { /* ignore */ }
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, ctorKey]);

  // data 按引用下发（deck 自己 diff；不能序列化，layer 实例含函数/内部状态）
  useEffect(() => {
    if (!handleRef.current || props.data === undefined) return;
    if (appliedDataRef.current === props.data) return;
    try { (handleRef.current.raw as any)?.setProps?.(props.data); } catch { /* noop */ }
    appliedDataRef.current = props.data;
  }, [props.data]);

  useEffect(() => {
    if (!handleRef.current || props.visible === undefined) return;
    try { rawOf()?.setVisible?.(props.visible); } catch { /* ignore */ }
  }, [props.visible]);
  useEffect(() => {
    if (!handleRef.current || props.opacity === undefined) return;
    try { rawOf()?.setOpacity?.(props.opacity); } catch { /* ignore */ }
  }, [props.opacity]);
  useEffect(() => {
    if (!handleRef.current || props.zIndex === undefined) return;
    try { rawOf()?.setZIndex?.(props.zIndex); } catch { /* ignore */ }
  }, [props.zIndex]);

  return null;
});
