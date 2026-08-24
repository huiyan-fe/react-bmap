import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { MapContext } from '../../context/MapContext';
import type { MapHandle, Point, MapMouseEvent, MapMoveEvent, MapZoomEvent, MapEvent } from '../../types';
import { MapRefImpl } from './MapRef';
import type { MapRef } from './MapRef';
import { useLatest } from '../../utils/useLatest';
import { pointEquals } from '../../utils/pointEquals';

export interface MapProps {
  // 受控
  center?: Point;
  zoom?: number;
  heading?: number;
  tilt?: number;
  // 非受控
  defaultCenter?: Point;
  defaultZoom?: number;
  defaultHeading?: number;
  defaultTilt?: number;
  // SDK MapOptions 透传（除受控字段）
  options?: Record<string, unknown>;
  // 样式（按版本选；不存在的版本会 throw/warn）
  mapStyle?: unknown;
  mapStyleV2?: unknown;
  // 交互开关（受控；undefined 表示不主动控制，由 SDK 默认值决定）
  enableDragging?: boolean;
  enableInertialDragging?: boolean;
  enableScrollWheelZoom?: boolean;
  enableContinuousZoom?: boolean;
  enableResizeOnCenter?: boolean;
  enableDoubleClickZoom?: boolean;
  enableKeyboard?: boolean;
  enablePinchToZoom?: boolean;
  enableRotate?: boolean;
  enableRotateGestures?: boolean;
  enableTilt?: boolean;
  enableTiltGestures?: boolean;
  enableAutoResize?: boolean;
  // 缩放范围
  minZoom?: number;
  maxZoom?: number;
  // 地图类型
  mapType?: string | number;
  // 光标
  defaultCursor?: string;
  draggingCursor?: string;
  // 主题
  theme?: string;
  // 回调
  onReady?: (map: MapHandle) => void;
  onCenterChange?: (point: Point) => void;
  onZoomChange?: (zoom: number) => void;
  onHeadingChange?: (heading: number) => void;
  onTiltChange?: (tilt: number) => void;
  // 鼠标事件
  onClick?: (e: MapMouseEvent) => void;
  onDblClick?: (e: MapMouseEvent) => void;
  onRightClick?: (e: MapMouseEvent) => void;
  onMouseMove?: (e: MapMouseEvent) => void;
  onMouseDown?: (e: MapMouseEvent) => void;
  onMouseUp?: (e: MapMouseEvent) => void;
  onMouseOver?: (e: MapMouseEvent) => void;
  onMouseOut?: (e: MapMouseEvent) => void;
  // 拖拽 / 移动
  onDragStart?: (e: MapMoveEvent) => void;
  onDragging?: (e: MapMoveEvent) => void;
  onDragEnd?: (e: MapMoveEvent) => void;
  onMoveStart?: (e: MapMoveEvent) => void;
  onMoving?: (e: MapMoveEvent) => void;
  onMoveEnd?: (e: MapMoveEvent) => void;
  // 缩放
  onZoomStart?: (e: MapZoomEvent) => void;
  onZooming?: (e: MapZoomEvent) => void;
  onZoomEnd?: (e: MapZoomEvent) => void;
  // 其他
  onResize?: (e: MapEvent) => void;
  onTilesLoaded?: (e: MapEvent) => void;
  onMapTypeChange?: (e: MapEvent) => void;
  onTouchStart?: (e: MapMouseEvent) => void;
  onTouchMove?: (e: MapMouseEvent) => void;
  onTouchEnd?: (e: MapMouseEvent) => void;
  onLongPress?: (e: MapMouseEvent) => void;
  // DOM
  className?: string;
  style?: CSSProperties;
  errorFallback?: ReactNode;
  children?: ReactNode;
}

/**
 * Map 容器组件（DESIGN.md §5）。
 *
 * - useLayoutEffect 创建地图，避免首帧空白。
 * - 完整 cleanup：clearOverlays、destroy 或清空 container。
 * - StrictMode 安全。
 * - 受控循环抑制：internalUpdateRef + pointEquals(1e-7)。
 */
export const Map = forwardRef<MapRef, MapProps>(function Map(props, ref) {
  const {
    center, zoom, heading, tilt,
    defaultCenter, defaultZoom, defaultHeading, defaultTilt,
    options, mapStyle, mapStyleV2,
    enableDragging, enableInertialDragging, enableScrollWheelZoom, enableContinuousZoom,
    enableResizeOnCenter, enableDoubleClickZoom, enableKeyboard, enablePinchToZoom,
    enableRotate, enableRotateGestures, enableTilt: enableTiltProp, enableTiltGestures,
    enableAutoResize,
    minZoom, maxZoom, mapType, defaultCursor, draggingCursor, theme,
    onReady, onCenterChange, onZoomChange, onHeadingChange, onTiltChange,
    onClick, onDblClick, onRightClick, onMouseMove, onMouseDown, onMouseUp, onMouseOver, onMouseOut,
    onDragStart, onDragging, onDragEnd, onMoveStart, onMoving, onMoveEnd,
    onZoomStart, onZooming, onZoomEnd, onResize, onTilesLoaded, onMapTypeChange,
    onTouchStart, onTouchMove, onTouchEnd, onLongPress,
    className, style, errorFallback = null, children,
  } = props;

  const { driver, status } = useBMapContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapHandle | null>(null);

  const onReadyRef = useLatest(onReady);
  const onCenterChangeRef = useLatest(onCenterChange);
  const onZoomChangeRef = useLatest(onZoomChange);
  const onHeadingChangeRef = useLatest(onHeadingChange);
  const onTiltChangeRef = useLatest(onTiltChange);
  const internalUpdateRef = useRef(false);

  // 把 ref 同步为最新 MapRefImpl（支持 ref 对象与 callback ref）
  useEffect(() => {
    if (!ref) return;
    const instance = map && driver ? new MapRefImpl(map, driver) : null;
    if (typeof ref === 'function') {
      ref(instance);
    } else {
      (ref as React.MutableRefObject<MapRef | null>).current = instance;
    }
  }, [map, driver, ref]);

  // ─── 创建地图（useLayoutEffect + 完整 cleanup） ───
  useLayoutEffect(() => {
    if (status !== 'ready' || !driver || !containerRef.current) return;

    // SDK GL bug 抑制器：
    // v4 GL 渲染器在 marker 图标 image.onload 时调用 getVertexInfoForGL → _buildVertexForEachRender，
    // 此时纹理管线可能还没就绪 → "Cannot read properties of undefined (reading 'width')"。
    // marker 最终能正常渲染，此 error 不影响功能。精准抑制只此一类错误。
    //
    // 第二类：destroy 之后 SDK 内部残留的瓦片/raf/setTimeout 回调仍会跑一次，读到已经被置空的
    // 内部引用 → "Cannot read properties of null (reading 'tileInfo' / 'style' …)"。这些回调不
    // 经过我们的调用栈，callRaw 的 try/catch 抓不到，只能在 teardown 窗口内按 error 事件吞掉。
    // 第二类判定收紧（避免误伤宿主工程）：仅吞 teardown 窗口内、来源为百度地图 SDK
    // 脚本本身（event.filename 命中百度 CDN/BMapGL）、且读取的是已知 SDK 内部属性的 null
    // 错误；宿主工程抛出的同类错误（filename 非百度 CDN 或属性名不在白名单）一律放行。
    const SDK_FILENAME = /baidu\.com|mapopen\.baidu|bmapgl|BMapGL/i;
    const SDK_NULL_PROPS = /^(?:tileInfo|style|tile|tiles|layer|gl|ctx|canvas|texture|buffer|program|shader)$/i;
    const OUR_MARK = /\.tsx|\.jsx|react-bmap/;
    let tearingDown = false;
    const glErrorHandler = (event: ErrorEvent) => {
      const msg = event.message || '';
      const stack = (event.error as Error)?.stack || '';
      if (msg.includes("'width'") && (stack.includes('getVertexInfoForGL') || stack.includes('_buildVertexForEachRender'))) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const propMatch = msg.match(/Cannot read propert(?:y|ies) of null \(reading '([^']+)'\)/);
      if (
        tearingDown &&
        SDK_FILENAME.test(event.filename || '') &&
        SDK_NULL_PROPS.test(propMatch?.[1] || '') &&
        !OUR_MARK.test(stack)
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener('error', glErrorHandler, true);

    // 构造 SDK 选项时**不带** center/zoom/heading/tilt
    const initial: Record<string, unknown> = { ...options };
    Object.keys(initial).forEach(k => initial[k] === undefined && delete initial[k]);

    const handle = driver.createMap(containerRef.current, initial);

    // ★ 必须 centerAndZoom 初始化后地图才能用（dts 明确要求）
    const initCenter = defaultCenter ?? center;
    const initZoom = defaultZoom ?? zoom ?? 11;
    if (initCenter) {
      try {
        driver.centerAndZoom(handle, initCenter, initZoom);
      } catch (e) {
        console.warn('[react-bmap] centerAndZoom failed, map may be uninitialized', e);
      }
    }
    // heading/tilt 初始值（仅 4.0+ 生效，低版本 noop+warn）
    const initHeading = defaultHeading ?? heading;
    const initTilt = defaultTilt ?? tilt;
    if (initHeading != null) {
      try { driver.setHeading(handle, initHeading); } catch { /* ignore */ }
    }
    if (initTilt != null) {
      try { driver.setTilt(handle, initTilt); } catch { /* ignore */ }
    }

    // 延迟暴露 map 实例：
    // v4 GL 的 WebGL 渲染器需要完成首帧瓦片渲染后，纹理/顶点管线才就绪。
    // 如果在 tilesloaded 之前添加 overlay，marker 默认图标的 image onload 触发时，
    // GL 顶点构建器访问未初始化的纹理尺寸 → "Cannot read properties of undefined (reading 'width')"。
    // 等 tilesloaded 事件（GL 首帧渲染完成），再 setMap 让子组件挂载。
    // v3 无 GL 渲染，tilesloaded 几乎立即触发；加 500ms fallback 防止事件丢失卡死。
    const unsubs: Array<() => void> = [];
    let mapReady = false;
    const markReady = () => {
      if (mapReady) return;
      mapReady = true;
      setMap(handle);
      onReadyRef.current?.(handle);
    };
    unsubs.push(driver.addEventListener(handle, 'tilesloaded', markReady));
    const fallbackId = setTimeout(markReady, 500);
    unsubs.push(() => clearTimeout(fallbackId));

    unsubs.push(driver.addEventListener(handle, 'moveend', () => {
      if (internalUpdateRef.current) return;
      const c = driver.getCenter(handle);
      onCenterChangeRef.current?.(c);
    }));
    unsubs.push(driver.addEventListener(handle, 'zoomend', () => {
      if (internalUpdateRef.current) return;
      const z = driver.getZoom(handle);
      onZoomChangeRef.current?.(z);
    }));
    unsubs.push(driver.addEventListener(handle, 'headingchange', () => {
      if (internalUpdateRef.current) return;
      try {
        const h = driver.getHeading(handle);
        if (typeof h === 'number' && !Number.isNaN(h)) onHeadingChangeRef.current?.(h);
      } catch { /* v3 不支持 */ }
    }));
    unsubs.push(driver.addEventListener(handle, 'tiltchange', () => {
      if (internalUpdateRef.current) return;
      try {
        const t = driver.getTilt(handle);
        if (typeof t === 'number' && !Number.isNaN(t)) onTiltChangeRef.current?.(t);
      } catch { /* v3 不支持 */ }
    }));

    return () => {
      tearingDown = true;
      unsubs.forEach(u => u());
      driver.destroyMap(handle);
      setMap(null);
      // 监听器多留一拍：SDK 在 destroy 之后还可能回调一次瓦片/raf
      setTimeout(() => window.removeEventListener('error', glErrorHandler, true), 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, status]);

  // ─── 受控同步：center（独立 effect + 循环抑制） ───
  // deps 用 lng/lat 而非 center 对象：父组件传内联 center={{lng,lat}} 时对象每次渲染都是新引用，
  // 直接放 center 会让本 effect 每次渲染空跑一遍（内部 pointEquals 虽能拦住真正的 setCenter）。
  useLayoutEffect(() => {
    if (!map || !driver || !center) return;
    const current = driver.getCenter(map);
    if (!pointEquals(current, center)) {
      internalUpdateRef.current = true;
      // 用 setCenter 而非 centerAndZoom：centerAndZoom 在已初始化的地图上行为更接近「重置视野」，副作用大
      try { driver.setCenter(map, center); } catch (e) {
        console.warn('[react-bmap] setCenter failed', e);
      }
      requestAnimationFrame(() => { internalUpdateRef.current = false; });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, center?.lng, center?.lat]);

  // ─── 受控同步：zoom ───
  useLayoutEffect(() => {
    if (!map || !driver || zoom == null) return;
    let currentZoom: number | undefined;
    try { currentZoom = driver.getZoom(map); } catch { /* 地图未就绪 */ }
    if (currentZoom !== undefined && currentZoom !== zoom) {
      internalUpdateRef.current = true;
      try { driver.setZoom(map, zoom); } catch (e) {
        console.warn('[react-bmap] setZoom failed', e);
      }
      requestAnimationFrame(() => { internalUpdateRef.current = false; });
    }
  }, [map, driver, zoom]);

  // ─── 受控同步：heading（仅 4.0+ 生效；v3 走 unsupported） ───
  useLayoutEffect(() => {
    if (!map || !driver || heading == null) return;
    let currentHeading: number | undefined;
    try { currentHeading = driver.getHeading(map); } catch { return; }
    if (typeof currentHeading !== 'number' || Number.isNaN(currentHeading)) return;  // 版本不支持
    if (Math.abs(currentHeading - heading) > 0.01) {
      internalUpdateRef.current = true;
      try { driver.setHeading(map, heading); } catch (e) {
        console.warn('[react-bmap] setHeading failed', e);
      }
      requestAnimationFrame(() => { internalUpdateRef.current = false; });
    }
  }, [map, driver, heading]);

  // ─── 受控同步：tilt（仅 4.0+ 生效；v3 走 unsupported） ───
  useLayoutEffect(() => {
    if (!map || !driver || tilt == null) return;
    let currentTilt: number | undefined;
    try { currentTilt = driver.getTilt(map); } catch { return; }
    if (typeof currentTilt !== 'number' || Number.isNaN(currentTilt)) return;
    if (Math.abs(currentTilt - tilt) > 0.01) {
      internalUpdateRef.current = true;
      try { driver.setTilt(map, tilt); } catch (e) {
        console.warn('[react-bmap] setTilt failed', e);
      }
      requestAnimationFrame(() => { internalUpdateRef.current = false; });
    }
  }, [map, driver, tilt]);

  // ─── 交互开关（受控切换） ───
  const toggleEffect = (prop: boolean | undefined, enable: () => void, disable: () => void) => {
    useLayoutEffect(() => {
      if (!map || !driver || prop === undefined) return;
      try { prop ? enable() : disable(); } catch { /* ignore */ }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, driver, prop]);
  };
  toggleEffect(enableDragging, () => driver!.enableDragging(map!), () => driver!.disableDragging(map!));
  toggleEffect(enableInertialDragging, () => driver!.enableInertialDragging(map!), () => driver!.disableInertialDragging(map!));
  toggleEffect(enableScrollWheelZoom, () => driver!.enableScrollWheelZoom(map!), () => driver!.disableScrollWheelZoom(map!));
  toggleEffect(enableContinuousZoom, () => driver!.enableContinuousZoom(map!), () => driver!.disableContinuousZoom(map!));
  toggleEffect(enableResizeOnCenter, () => driver!.enableResizeOnCenter(map!), () => driver!.disableResizeOnCenter(map!));
  toggleEffect(enableDoubleClickZoom, () => driver!.enableDoubleClickZoom(map!), () => driver!.disableDoubleClickZoom(map!));
  toggleEffect(enableKeyboard, () => driver!.enableKeyboard(map!), () => driver!.disableKeyboard(map!));
  toggleEffect(enablePinchToZoom, () => driver!.enablePinchToZoom(map!), () => driver!.disablePinchToZoom(map!));
  toggleEffect(enableRotate, () => driver!.enableRotate(map!), () => driver!.disableRotate(map!));
  toggleEffect(enableRotateGestures, () => driver!.enableRotateGestures(map!), () => driver!.disableRotateGestures(map!));
  toggleEffect(enableTiltProp, () => driver!.enableTilt(map!), () => driver!.disableTilt(map!));
  toggleEffect(enableTiltGestures, () => driver!.enableTiltGestures(map!), () => driver!.disableTiltGestures(map!));
  toggleEffect(enableAutoResize, () => driver!.enableAutoResize(map!), () => driver!.disableAutoResize(map!));

  // ─── 缩放范围 ───
  useLayoutEffect(() => {
    if (!map || !driver || minZoom === undefined) return;
    try { driver.setMinZoom(map, minZoom); } catch { /* ignore */ }
  }, [map, driver, minZoom]);

  useLayoutEffect(() => {
    if (!map || !driver || maxZoom === undefined) return;
    try { driver.setMaxZoom(map, maxZoom); } catch { /* ignore */ }
  }, [map, driver, maxZoom]);

  // ─── 地图类型 ───
  useLayoutEffect(() => {
    if (!map || !driver || mapType === undefined) return;
    try { driver.setMapType(map, mapType); } catch { /* ignore */ }
  }, [map, driver, mapType]);

  // ─── 光标 ───
  useLayoutEffect(() => {
    if (!map || !driver || defaultCursor === undefined) return;
    try { driver.setDefaultCursor(map, defaultCursor); } catch { /* ignore */ }
  }, [map, driver, defaultCursor]);

  useLayoutEffect(() => {
    if (!map || !driver || draggingCursor === undefined) return;
    try { driver.setDraggingCursor(map, draggingCursor); } catch { /* ignore */ }
  }, [map, driver, draggingCursor]);

  // ─── 主题 ───
  useLayoutEffect(() => {
    if (!map || !driver || theme === undefined) return;
    try { driver.setTheme(map, theme); } catch { /* ignore */ }
  }, [map, driver, theme]);

  // ─── 样式 ───
  useEffect(() => {
    if (!map || !driver || mapStyle === undefined) return;
    driver.setMapStyle(map, mapStyle);
  }, [map, driver, mapStyle]);

  useEffect(() => {
    if (!map || !driver || mapStyleV2 === undefined) return;
    driver.setMapStyleV2(map, mapStyleV2);
  }, [map, driver, mapStyleV2]);

  // ─── 事件订阅（React 方式：onClick / onZoomEnd 等 prop） ───
  const eventProps = {
    onClick, onDblClick, onRightClick, onMouseMove, onMouseDown, onMouseUp, onMouseOver, onMouseOut,
    onDragStart, onDragging, onDragEnd, onMoveStart, onMoving, onMoveEnd,
    onZoomStart, onZooming, onZoomEnd, onResize, onTilesLoaded, onMapTypeChange,
    onTouchStart, onTouchMove, onTouchEnd, onLongPress,
  };
  // 用 ref 持有最新 handler：内联函数（每次渲染新引用）不会触发重订阅。
  // 仅当某个 handler 从「有→无」或「无→有」切换时（eventKey 变化）才重订阅。
  const eventPropsRef = useLatest(eventProps);
  const eventKey = Object.entries(eventProps).map(([k, v]) => `${k}:${v ? 1 : 0}`).join('|');
  useEffect(() => {
    if (!map || !driver) return;
    const EVENT_MAP: Record<string, string> = {
      onClick: 'click', onDblClick: 'dblclick', onRightClick: 'rightclick',
      onMouseMove: 'mousemove', onMouseDown: 'mousedown', onMouseUp: 'mouseup',
      onMouseOver: 'mouseover', onMouseOut: 'mouseout',
      onDragStart: 'dragstart', onDragging: 'dragging', onDragEnd: 'dragend',
      onMoveStart: 'movestart', onMoving: 'moving', onMoveEnd: 'moveend',
      onZoomStart: 'zoomstart', onZooming: 'zooming', onZoomEnd: 'zoomend',
      onResize: 'resize', onTilesLoaded: 'tilesloaded', onMapTypeChange: 'maptypechange',
      onTouchStart: 'touchstart', onTouchMove: 'touchmove', onTouchEnd: 'touchend',
      onLongPress: 'longpress',
    };
    const unsubs: Array<() => void> = [];
    for (const [prop, evt] of Object.entries(EVENT_MAP)) {
      const current = (eventPropsRef.current as Record<string, unknown>)[prop];
      if (!current) continue; // 未提供 handler，不订阅
      unsubs.push(driver.addEventListener(map, evt, (e: unknown) => {
        const fn = (eventPropsRef.current as Record<string, ((e: unknown) => void) | undefined>)[prop];
        if (typeof fn === 'function') fn(e);
      }));
    }
    return () => unsubs.forEach(u => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, eventKey]);

  const ctxValue = useMemo(() => (map && driver ? { map, driver } : null), [map, driver]);

  if (status === 'error') return <>{errorFallback}</>;

  return (
    <div ref={containerRef} className={className} style={style}>
      {ctxValue && (
        <MapContext.Provider value={ctxValue}>{children}</MapContext.Provider>
      )}
    </div>
  );
});
