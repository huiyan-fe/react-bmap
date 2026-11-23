/**
 * WebGLCustomLayer —— 自写 WebGL 图层（4.0+ Visualization）。对应 JSAPI 4.0 的 BMap.WebGLCustomLayer。
 *
 * 支持两种用法：
 * - 声明式：vertexShader / fragmentShader + attributes / vertices / indices / uniforms / textures / draw
 * - 命令式：onRender(ctx) 接管绘制，或通过 ref 在运行时 setUniforms / setDraw / ...
 *
 * 注意：只有真的传了 onRender 才挂进 options——SDK 用 `onRender ? 自定义 : 声明式 draw`，
 * 无条件挂 wrapper 会让声明式 draw 永不执行。
 */
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';
import { useLatest } from '../../utils/useLatest';
import { stableStringify } from '../../utils/stableStringify';
import { debugWarn } from '../../utils/debugWarn';
import { tryGetSDK } from '../../utils/sdk';
import type { LayerHandle, Point } from '../../types';

export interface WebGLCustomLayerOptions {
  /** 顶点着色器源码（必填） */
  vertexShader?: string;
  /** 片元着色器源码（必填） */
  fragmentShader?: string;
  /** 声明式顶点属性：{name: {data, type, stride, members}}，type 'lnglat' 按 referCenter 自动投影 */
  attributes?: Record<string, unknown>;
  /** 顶点缓冲：{data, stride, members} */
  vertices?: unknown;
  /** 索引（Array | Uint16Array | Uint32Array） */
  indices?: unknown;
  /** 声明式 uniform：{name: value} */
  uniforms?: Record<string, unknown>;
  /** 声明式纹理：{name: url 或 {source, wrap, filter, flipY, mipmap}} */
  textures?: Record<string, unknown>;
  /** 绘制指令：{mode, count, first, offset} */
  draw?: Record<string, unknown>;
  /** 渲染状态：{depthTest, depthWrite, depthFunc, blend, cullFace, frontFace} */
  renderState?: Record<string, unknown>;
  /** 是否逐帧重绘（u_time 持续推进），默认 false */
  animation?: boolean;
  /** true 时 ctx.gl 是完整原生上下文，默认 false */
  unsafeGL?: boolean;
  visible?: boolean;
  opacity?: number;
  zIndex?: number;
  minZoom?: number;
  maxZoom?: number;
  /** 渲染阶段：'basemap' | 'tilelayer' | 'overlay' | 'building' | 'poi'，默认 'tilelayer' */
  renderStage?: 'basemap' | 'tilelayer' | 'overlay' | 'building' | 'poi';
  /** 参考中心点（SDK 要求 instanceof Point） */
  referCenter?: Point;
}

/** 绘制上下文（SDK CustomRenderContext） */
export interface WebGLCustomLayerContext {
  gl: unknown;
  setUniform: (name: string, value: unknown) => void;
  setUniforms: (obj: Record<string, unknown>) => void;
  setAttribute: (name: string, spec: unknown) => void;
  setAttributes: (obj: Record<string, unknown>) => void;
  setVertices: (spec: unknown) => void;
  setIndices: (data: unknown) => void;
  setTexture: (name: string, source: unknown, opts?: unknown) => void;
  setTextures: (obj: Record<string, unknown>) => void;
  setDraw: (spec: Record<string, unknown>) => void;
  draw: () => void;
  [key: string]: unknown;
}

export type WebGLCustomLayerHook = (ctx: WebGLCustomLayerContext) => void;

export interface WebGLCustomLayerProps extends WebGLCustomLayerOptions {
  /** 着色器编译完成、声明式数据重放完毕后调用 */
  onReady?: WebGLCustomLayerHook;
  /** 每帧绘制；提供即接管绘制（声明式 draw 不再自动执行） */
  onRender?: WebGLCustomLayerHook;
  /** 图层销毁前回调 */
  onDestroy?: WebGLCustomLayerHook;
  /** 出错回调：err = {type, message, source} */
  onError?: (err: unknown) => void;
}

export interface WebGLCustomLayerRef {
  setUniforms: (obj: Record<string, unknown>) => void;
  setUniform: (name: string, value: unknown) => void;
  setAttributes: (obj: Record<string, unknown>) => void;
  setAttribute: (name: string, spec: unknown) => void;
  setVertices: (spec: unknown) => void;
  setIndices: (data: unknown) => void;
  setTextures: (obj: Record<string, unknown>) => void;
  setTexture: (name: string, source: unknown, opts?: unknown) => void;
  setDraw: (spec: Record<string, unknown>) => void;
  setRenderState: (state: Record<string, unknown>) => void;
  getRenderState: () => Record<string, unknown>;
  setShaders: (vertexShader: string, fragmentShader: string) => void;
  /** 'pending' | 'ready' | 'error' */
  getStatus: () => string;
  getTime: () => number;
  getContext: () => WebGLCustomLayerContext | null;
  projectToLayer: (lngLat: unknown) => unknown;
  unprojectFromLayer: (xy: unknown) => unknown;
  startAnimation: () => void;
  stopAnimation: () => void;
  isAnimating: () => boolean;
}

/** referCenter：SDK 的 _getBaseMC 直接 crsLL2MC(center)，要求真实 Point */
function toSDKPoint(point: Point): unknown {
  const SDK = tryGetSDK();
  return SDK ? new SDK.Point(point.lng, point.lat) : undefined;
}

const WEBGL_KEYS = [
  'vertexShader', 'fragmentShader', 'attributes', 'vertices', 'indices',
  'uniforms', 'textures', 'draw', 'renderState', 'animation', 'unsafeGL',
  'visible', 'opacity', 'zIndex', 'minZoom', 'maxZoom', 'renderStage',
];

export const WebGLCustomLayer = forwardRef<WebGLCustomLayerRef, WebGLCustomLayerProps>(function WebGLCustomLayer(props, ref) {
  const { map, driver } = useMapContext();
  const handleRef = useRef<LayerHandle | null>(null);
  const onReadyRef = useLatest(props.onReady);
  const onRenderRef = useLatest(props.onRender);
  const onDestroyRef = useLatest(props.onDestroy);
  const onErrorRef = useLatest(props.onError);

  const rawOf = () => (handleRef.current ? (handleRef.current.raw as any) : null);

  const api = useMemo<WebGLCustomLayerRef>(() => ({
    setUniforms: (o) => { try { rawOf()?.setUniforms?.(o); } catch { /* ignore */ } },
    setUniform: (n, v) => { try { rawOf()?.setUniform?.(n, v); } catch { /* ignore */ } },
    setAttributes: (o) => { try { rawOf()?.setAttributes?.(o); } catch { /* ignore */ } },
    setAttribute: (n, s) => { try { rawOf()?.setAttribute?.(n, s); } catch { /* ignore */ } },
    setVertices: (s) => { try { rawOf()?.setVertices?.(s); } catch { /* ignore */ } },
    setIndices: (d) => { try { rawOf()?.setIndices?.(d); } catch { /* ignore */ } },
    setTextures: (o) => { try { rawOf()?.setTextures?.(o); } catch { /* ignore */ } },
    setTexture: (n, s, o) => { try { rawOf()?.setTexture?.(n, s, o); } catch { /* ignore */ } },
    setDraw: (s) => { try { rawOf()?.setDraw?.(s); } catch { /* ignore */ } },
    setRenderState: (s) => { try { rawOf()?.setRenderState?.(s); } catch { /* ignore */ } },
    getRenderState: () => { try { return rawOf()?.getRenderState?.() ?? {}; } catch { return {}; } },
    setShaders: (vs, fs) => { try { rawOf()?.setShaders?.(vs, fs); } catch { /* ignore */ } },
    getStatus: () => { try { return rawOf()?.getStatus?.() ?? 'pending'; } catch { return 'pending'; } },
    getTime: () => { try { return rawOf()?.getTime?.() ?? 0; } catch { return 0; } },
    getContext: () => { try { return rawOf()?.getContext?.() ?? null; } catch { return null; } },
    projectToLayer: (v) => { try { return rawOf()?.projectToLayer?.(v) ?? v; } catch { return v; } },
    unprojectFromLayer: (v) => { try { return rawOf()?.unprojectFromLayer?.(v) ?? v; } catch { return v; } },
    startAnimation: () => { try { rawOf()?.startAnimation?.(); } catch { /* ignore */ } },
    stopAnimation: () => { try { rawOf()?.stopAnimation?.(); } catch { /* ignore */ } },
    isAnimating: () => { try { return !!rawOf()?.isAnimating?.(); } catch { return false; } },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  useImperativeHandle(ref, () => api, [api]);

  const hasOnRender = !!props.onRender;
  const ctorKey = stableStringify([
    ...WEBGL_KEYS.map((k) => (props as Record<string, unknown>)[k]),
    hasOnRender, props.referCenter,
  ]);

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const opts: Record<string, unknown> = {};
    for (const k of WEBGL_KEYS) {
      const v = (props as Record<string, unknown>)[k];
      if (v !== undefined) opts[k] = v;
    }
    if (props.referCenter !== undefined) opts.referCenter = toSDKPoint(props.referCenter);

    // 固定 wrapper + 现读最新回调
    opts.onReady = (ctx: WebGLCustomLayerContext) => { onReadyRef.current?.(ctx); };
    opts.onDestroy = (ctx: WebGLCustomLayerContext) => { onDestroyRef.current?.(ctx); };
    opts.onError = (err: unknown) => { onErrorRef.current?.(err); };
    if (hasOnRender) {
      opts.onRender = (ctx: WebGLCustomLayerContext) => {
        const fn = onRenderRef.current;
        if (fn) fn(ctx);
        else ctx.draw?.();
      };
    }

    const h = driver.createWebGLCustomLayer(opts);
    if (!h) return;
    handleRef.current = h;
    driver.addLayer(map, h);

    return () => {
      try { driver.removeLayer(map, h); } catch { /* ignore */ }
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, ctorKey]);

  // 显示器 / 透明度 / 层级走 setter（若 SDK 提供），不重建
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
    try { rawOf()?.setZIndex?.(props.zIndex); } catch (e) { debugWarn('WebGLCustomLayer.setZIndex', e); }
  }, [props.zIndex]);

  return null;
});
