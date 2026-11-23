/**
 * ThreejsLayer —— three.js 接入图层（4.0+ Visualization）。对应 JSAPI 4.0 的 BMap.ThreejsLayer。
 *
 * ⚠️ three.js 由宿主工程自行引入并挂到全局 `window.THREE`，本组件不 import three。
 * SDK 构造第一行就 `if (!window.THREE) throw`；这里在创建前守卫并只告警一次。
 *
 * 与既有 `<ThreeLayer>` 的区别：本组件对应 SDK 的 `BMap.ThreejsLayer`（上下文式回调 +
 * add/removeObject 句柄）；`<ThreeLayer>` 对应 `BMap.ThreeLayer`（renderer/scene/camera 回调）。
 */
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';
import { useLatest } from '../../utils/useLatest';
import { stableStringify } from '../../utils/stableStringify';
import { debugWarn, devWarn } from '../../utils/debugWarn';
import { tryGetSDK } from '../../utils/sdk';
import type { LayerHandle, Point } from '../../types';

/** three.js 的对象（Scene / Camera / WebGLRenderer / Object3D 等），由宿主自行断言。 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ThreejsObject = any;

export interface ThreejsLayerContext {
  layer: unknown;
  map: unknown;
  renderer: ThreejsObject;
  scene: ThreejsObject;
  camera: ThreejsObject;
  projectToLayer: (lngLat: unknown) => unknown;
  getTime: () => number;
  getUnitsPerPixel: () => number;
}

export type ThreejsLayerHook = (ctx: ThreejsLayerContext) => void;

export interface ThreejsLayerOptions {
  /** 传给 THREE.WebGLRenderer 的 alpha，默认 true。变化会重建图层。 */
  alpha?: boolean;
  /** 传给 THREE.WebGLRenderer 的 antialias，默认 false。变化会重建图层。 */
  antialias?: boolean;
  /** 是否逐帧重绘（three 场景动画用），默认 false */
  animation?: boolean;
  /** 渲染阶段：'basemap' | 'tilelayer' | 'overlay' | 'building' | 'poi'，默认 'tilelayer' */
  renderStage?: 'basemap' | 'tilelayer' | 'overlay' | 'building' | 'poi';
  visible?: boolean;
  opacity?: number;
  zIndex?: number;
  minZoom?: number;
  maxZoom?: number;
  /**
   * 参考中心点（SDK 要求 instanceof Point）。局部/世界坐标以它为原点：
   * - 传了它，`ctx.projectToLayer([lng,lat])` 返回相对该点的墨卡托偏移（地图中心附近约 [0,0]）
   * - 不传时 projectToLayer 返回绝对墨卡托坐标（数十万量级），物体通常会被放到视野外
   * 建议传地图中心。组件在缺失时会开发期告警一次。
   */
  referCenter?: Point;
}

export interface ThreejsLayerProps extends ThreejsLayerOptions {
  /** GL 就绪、renderer/scene/camera 创建完成后调用（ctx.projectToLayer 此时可用） */
  onInit?: ThreejsLayerHook;
  /** 每帧渲染前 */
  preRender?: ThreejsLayerHook;
  /**
   * 接管渲染。SDK 里是 if/else：接了它就**不再**执行默认 renderer.render(scene,camera)。
   * 变化会重建图层。
   */
  onRender?: ThreejsLayerHook;
  /** 每帧渲染后 */
  afterRender?: ThreejsLayerHook;
  /** 图层销毁前。SDK 随后会 dispose 场景与渲染器 */
  onDestroy?: ThreejsLayerHook;
  /** 渲染 / 创建出错时回调 */
  onError?: (err: unknown) => void;
}

export interface ThreejsLayerRef {
  add: (object: ThreejsObject) => void;
  /** 从场景移除对象。注意不是移除整个图层的 remove() */
  removeObject: (object: ThreejsObject) => void;
  getScene: () => ThreejsObject | null;
  getCamera: () => ThreejsObject | null;
  getRenderer: () => ThreejsObject | null;
  /** 'pending' | 'ready' | 'error' */
  getStatus: () => string;
  getTime: () => number;
  projectToLayer: (lngLat: unknown) => unknown;
  startAnimation: () => void;
  stopAnimation: () => void;
  isAnimating: () => boolean;
}

let warnedMissingThree = false;
// referCenter 缺失只提醒一次
let warnedMissingRefCenter = false;
function warnMissingThree(): void {
  if (warnedMissingThree) return;
  warnedMissingThree = true;
  try {
    if (typeof console === 'undefined') return;
    console.warn(
      '[react-bmap] <ThreejsLayer> 需要宿主工程自行引入 three.js 并挂到 window.THREE 上，' +
        '当前未检测到，图层已跳过创建。异步加载 three.js 时，请等就绪后再渲染 <ThreejsLayer>。',
    );
  } catch { /* 日志不能反过来把调用方搞崩 */ }
}

/** referCenter：SDK 的 _getBaseMC 直接 crsLL2MC(center)，要求真实 Point */
function toSDKPoint(point: Point): unknown {
  const SDK = tryGetSDK();
  return SDK ? new SDK.Point(point.lng, point.lat) : undefined;
}

export const ThreejsLayer = forwardRef<ThreejsLayerRef, ThreejsLayerProps>(function ThreejsLayer(props, ref) {
  const { map, driver } = useMapContext();
  const handleRef = useRef<LayerHandle | null>(null);
  const onInitRef = useLatest(props.onInit);
  const onRenderRef = useLatest(props.onRender);
  const preRenderRef = useLatest(props.preRender);
  const afterRenderRef = useLatest(props.afterRender);
  const onDestroyRef = useLatest(props.onDestroy);
  const onErrorRef = useLatest(props.onError);

  const rawOf = () => (handleRef.current ? (handleRef.current.raw as any) : null);

  useImperativeHandle(ref, () => ({
    add: (o) => { try { rawOf()?.add?.(o); } catch { /* ignore */ } },
    removeObject: (o) => { try { rawOf()?.removeObject?.(o); } catch { /* ignore */ } },
    getScene: () => { try { return rawOf()?.getScene?.() ?? null; } catch { return null; } },
    getCamera: () => { try { return rawOf()?.getCamera?.() ?? null; } catch { return null; } },
    getRenderer: () => { try { return rawOf()?.getRenderer?.() ?? null; } catch { return null; } },
    getStatus: () => { try { return rawOf()?.getStatus?.() ?? 'pending'; } catch { return 'pending'; } },
    getTime: () => { try { return rawOf()?.getTime?.() ?? 0; } catch { return 0; } },
    projectToLayer: (v) => { try { return rawOf()?.projectToLayer?.(v) ?? v; } catch { return v; } },
    startAnimation: () => { try { rawOf()?.startAnimation?.(); } catch { /* ignore */ } },
    stopAnimation: () => { try { rawOf()?.stopAnimation?.(); } catch { /* ignore */ } },
    isAnimating: () => { try { return !!rawOf()?.isAnimating?.(); } catch { return false; } },
  }), []);

  const hasOnRender = !!props.onRender;
  const ctorKey = stableStringify([props.alpha, props.antialias, props.animation, props.minZoom, props.maxZoom, hasOnRender]);

  useLayoutEffect(() => {
    if (!map || !driver) return;
    if (!(globalThis as { THREE?: unknown }).THREE) { warnMissingThree(); return; }
    if (!props.referCenter && !warnedMissingRefCenter) {
      warnedMissingRefCenter = true;
      devWarn(
        '<ThreejsLayer> 未传 referCenter：projectToLayer 会返回绝对墨卡托坐标（数十万量级），' +
          '物体通常会被放到视野外而看不见。建议传地图中心点，例如 referCenter={mapCenter}。',
      );
    }

    const opts: Record<string, unknown> = {};
    const put = (k: string, v: unknown) => { if (v !== undefined) opts[k] = v; };
    put('alpha', props.alpha); put('antialias', props.antialias); put('animation', props.animation);
    put('renderStage', props.renderStage);
    put('visible', props.visible); put('opacity', props.opacity); put('zIndex', props.zIndex);
    put('minZoom', props.minZoom); put('maxZoom', props.maxZoom);
    if (props.referCenter !== undefined) opts.referCenter = toSDKPoint(props.referCenter);

    // 固定 wrapper + 现读最新回调：SDK 以 hook.call(this, ctx) 调用
    const hook = (get: () => ThreejsLayerHook | undefined) => (ctx: ThreejsLayerContext) => { get()?.(ctx); };
    opts.onInit = hook(() => onInitRef.current);
    opts.preRender = hook(() => preRenderRef.current);
    opts.afterRender = hook(() => afterRenderRef.current);
    opts.onDestroy = hook(() => onDestroyRef.current);
    opts.onError = (err: unknown) => { onErrorRef.current?.(err); };
    // 只有真的传了 onRender 才挂：SDK 用 onRender ? 自定义 : 默认渲染
    if (hasOnRender) {
      opts.onRender = (ctx: ThreejsLayerContext) => {
        const fn = onRenderRef.current;
        if (fn) fn(ctx);
        else ctx.renderer?.render?.(ctx.scene, ctx.camera);
      };
    }

    const h = driver.createThreejsLayer(opts);
    if (!h) return;
    handleRef.current = h;
    driver.addLayer(map, h);

    return () => {
      try { driver.removeLayer(map, h); } catch { /* ignore */ }
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, ctorKey]);

  // 公共项走 SDK setter（WebGLLayer 基类），不重建 three 场景
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
  useEffect(() => {
    if (!handleRef.current || props.renderStage === undefined) return;
    try { rawOf()?.setRenderStage?.(props.renderStage); } catch { /* ignore */ }
  }, [props.renderStage]);
  useEffect(() => {
    if (!handleRef.current || props.referCenter === undefined) return;
    const pt = toSDKPoint(props.referCenter);
    if (!pt) return;
    try { rawOf()?.setRefCenter?.(pt); } catch (e) { debugWarn('ThreejsLayer.setRefCenter', e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.referCenter?.lng, props.referCenter?.lat]);

  return null;
});
