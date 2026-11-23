/**
 * TrackLine —— 轨迹线图层（4.0+ Visualization）。对应 JSAPI 4.0 的 BMap.TrackLine。
 *
 * 用法：
 * ```tsx
 * const trackRef = useRef<TrackLineRef>(null);
 * <TrackLine ref={trackRef} data={line} autoStart duration={60} onProgress={onProgress} />
 * // trackRef.current?.start() / pause() / stop() / setSpeed(2) / setAutoFollow(true)
 * ```
 *
 * - `data`：GeoJSON（LineString feature），播放时间线默认按 `properties.time` 数组
 *   （与 coordinates 等长）；可用 timestampKey 指定字段，speedMode 控制匀速/按时间戳变速。
 * - 播放控制走命令式 ref：start / resume / pause / stop / setSpeed / getSpeed /
 *   setOptions / setAutoFollow / setFollowOptions。
 * - 事件：onProgress、onStatusChange，以及 click / mouseover / mouseout / mousemove。
 */
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';
import { useLatest } from '../../utils/useLatest';
import { stableStringify } from '../../utils/stableStringify';
import { debugWarn } from '../../utils/debugWarn';
import type { LayerHandle } from '../../types';
import type { VisualPickEvent, TrackLineProgressValue, TrackLineStatusValue } from '../../types/events';

export interface TrackLineOptions {
  strokeColor?: string;
  strokeWeight?: number;
  strokeLineJoin?: 'miter' | 'bevel' | 'round';
  strokeLineCap?: 'butt' | 'round' | 'square';
  /** 已走过路段的颜色（走过变灰） */
  passedColor?: string;
  /** 未走过（车前方）路段的颜色，默认跟随主线色 */
  upcomingColor?: string;
  /** 整条线是否可见，false 时只留车辆图标 */
  lineVisible?: boolean;
  /** 纹理贴线（竖图，沿线自动横向铺开） */
  strokeTextureUrl?: string;
  strokeTextureWidth?: number;
  strokeTextureHeight?: number;
  /** true 按 strokeTextureGap 间隔平铺（箭头串）；false 沿线连续拉伸 */
  strokeTextureSpaced?: boolean;
  strokeTextureGap?: number;
  strokeTextureColor?: string;
  /** 播放总时长（秒），默认 60 */
  duration?: number;
  /** 1 按 properties 时间戳变速；0 匀速，默认 1 */
  speedMode?: number;
  /** 时间戳字段名，properties[timestampKey] 为与 coordinates 等长的数组，默认 'time' */
  timestampKey?: string;
  /**
   * 车辆图标：false 不创建；对象如 { type:'ground'|'marker', url, size:[w,h], anchor:[x,y],
   * offset, scale, level, adjustSize, tiltCorrect, rotationOffset }；也可传已构造好的实例。
   */
  movePoint?: Record<string, unknown> | false;
  /** setData 后是否自动开始播放，默认 false */
  autoStart?: boolean;
  /** true 时地图视野自动跟随车辆，默认 false */
  autoFollow?: boolean;
  /** 跟随细节：{ tilt, heading, rotationDuration, rotationOffset, ... } */
  followOptions?: Record<string, unknown>;
  /** 渲染阶段（'basemap' | 'tilelayer' | 'overlay' | 'building' | 'poi'），默认 'tilelayer' */
  renderStage?: string;
  /** true 时线色沿轨迹按 linearTexture 色标渐变（覆盖 strokeColor） */
  isLinear?: boolean;
  /** 渐变色标 [[位置0~1, css颜色], ...]，仅 isLinear 生效 */
  linearTexture?: Array<[number, string]>;
  opacity?: number;
  visible?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  /** 数据可视化图层的中心参考点（渲染坐标基准），缺省用地图中心 */
  referCenter?: unknown;
}

export interface TrackLineProps extends TrackLineOptions {
  /** GeoJSON 数据（FeatureCollection / LineString feature），变化时调用 raw.setData() */
  data?: object;
  /** setData 第二参 */
  setDataParams?: object;
  onClick?: (e: VisualPickEvent) => void;
  onMouseOver?: (e: VisualPickEvent) => void;
  onMouseOut?: (e: VisualPickEvent) => void;
  onMouseMove?: (e: VisualPickEvent) => void;
  /** 播放进度：value = { process, elapsed, trace, distance, point, angle } */
  onProgress?: (e: VisualPickEvent<TrackLineProgressValue>) => void;
  /** 播放状态变化 */
  onStatusChange?: (e: VisualPickEvent<TrackLineStatusValue>) => void;
}

/** 命令式句柄：播放控制（ref 取用），方法名对齐 JSAPI TrackLine。 */
export interface TrackLineRef {
  /** 开始播放（JSAPI start） */
  start: () => void;
  /** 从暂停处继续播放（JSAPI resume；从头播放用 start） */
  resume: () => void;
  pause: () => void;
  stop: () => void;
  /** 设置倍速（1 为原速） */
  setSpeed: (speed: number) => void;
  /** 读取当前倍速 */
  getSpeed: () => number;
  /** 运行时修改样式/选项（isLinear / linearTexture / passedColor / strokeWeight 等） */
  setOptions: (opts: Record<string, unknown>) => void;
  /** 开启/关闭地图视野跟随车辆（setAutoFollow）；跟随细节用 setFollowOptions 调整 */
  setAutoFollow: (enable: boolean) => void;
  setFollowOptions: (opts: Record<string, unknown>) => void;
}

const TRACK_EVENTS: Array<{ sdk: string; prop: string }> = [
  { sdk: 'click', prop: 'onClick' },
  { sdk: 'mouseover', prop: 'onMouseOver' },
  { sdk: 'mouseout', prop: 'onMouseOut' },
  { sdk: 'mousemove', prop: 'onMouseMove' },
  { sdk: 'progress', prop: 'onProgress' },
  { sdk: 'statuschange', prop: 'onStatusChange' },
];

const TRACK_KEYS = [
  'strokeColor', 'strokeWeight', 'strokeLineJoin', 'strokeLineCap',
  'passedColor', 'upcomingColor', 'lineVisible',
  'strokeTextureUrl', 'strokeTextureWidth', 'strokeTextureHeight',
  'strokeTextureSpaced', 'strokeTextureGap', 'strokeTextureColor',
  'duration', 'speedMode', 'timestampKey', 'movePoint',
  'autoStart', 'autoFollow', 'followOptions',
  'renderStage', 'isLinear', 'linearTexture',
  'opacity', 'visible', 'minZoom', 'maxZoom', 'zIndex', 'referCenter',
];

export const TrackLine = forwardRef<TrackLineRef, TrackLineProps>(function TrackLine(props, ref) {
  const { map, driver } = useMapContext();
  const handleRef = useRef<LayerHandle | null>(null);
  const handlersRef = useLatest(props);
  const appliedDataKeyRef = useRef<string | null>(null);

  const ctorKey = stableStringify(TRACK_KEYS.map((k) => (props as Record<string, unknown>)[k]));
  const dataKey = props.data !== undefined ? stableStringify(props.data) : '';

  useLayoutEffect(() => {
    if (!map || !driver) return;
    const opts: Record<string, unknown> = {};
    for (const k of TRACK_KEYS) {
      const v = (props as Record<string, unknown>)[k];
      if (v !== undefined) opts[k] = v;
    }
    const h = driver.createTrackLine(opts);
    if (!h) return;
    handleRef.current = h;
    driver.addLayer(map, h);

    const unsubs: Array<() => void> = [];
    for (const { sdk, prop } of TRACK_EVENTS) {
      try {
        unsubs.push(driver.addEventListener(h, sdk, (e: unknown) => {
          const fn = (handlersRef.current as Record<string, unknown>)[prop];
          if (typeof fn === 'function') (fn as (e: unknown) => void)(e);
        }));
      } catch { /* ignore */ }
    }

    if (props.data !== undefined) {
      try { (h.raw as any)?.setData?.(props.data, props.setDataParams); }
      catch (e) { debugWarn('TrackLine.setData', e); }
    }
    appliedDataKeyRef.current = dataKey;

    return () => {
      unsubs.forEach((u) => { try { u(); } catch { /* ignore */ } });
      try { driver.removeLayer(map, h); } catch { /* ignore */ }
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, ctorKey]);

  // data 变化 → setData（首帧已由创建 effect 应用）
  useEffect(() => {
    if (!handleRef.current || props.data === undefined) return;
    if (appliedDataKeyRef.current === dataKey) return;
    try { (handleRef.current.raw as any)?.setData?.(props.data, props.setDataParams); }
    catch { /* noop */ }
    appliedDataKeyRef.current = dataKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  // 播放控制命令式句柄；方法在调用时读 handleRef，始终指向当前图层
  useImperativeHandle(ref, () => {
    const rawOf = () => (handleRef.current ? (handleRef.current.raw as any) : null);
    return {
      start: () => { try { rawOf()?.start?.(); } catch { /* ignore */ } },
      resume: () => { try { rawOf()?.resume?.(); } catch { /* ignore */ } },
      pause: () => { try { rawOf()?.pause?.(); } catch { /* ignore */ } },
      stop: () => { try { rawOf()?.stop?.(); } catch { /* ignore */ } },
      setSpeed: (speed: number) => { try { rawOf()?.setSpeed?.(speed); } catch { /* ignore */ } },
      getSpeed: () => { try { return Number(rawOf()?.getSpeed?.() ?? 1); } catch { return 1; } },
      setOptions: (o: Record<string, unknown>) => { try { rawOf()?.setOptions?.(o); } catch { /* ignore */ } },
      setAutoFollow: (enable: boolean) => { try { rawOf()?.setAutoFollow?.(enable); } catch { /* ignore */ } },
      setFollowOptions: (o: Record<string, unknown>) => { try { rawOf()?.setFollowOptions?.(o); } catch { /* ignore */ } },
    };
  }, []);

  return null;
});
