import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { MapContext } from '../../context/MapContext';
import type { MapHandle, Point, Bounds, MapMouseEvent, MapMoveEvent, MapZoomEvent, MapEvent } from '../../types';
import { MapRefImpl } from './MapRef';
import type { MapRef } from './MapRef';
import { useLatest } from '../../utils/useLatest';
import { pointEquals } from '../../utils/pointEquals';
import type { DisplayOptions } from '../../types/core';

/** 个性化生效区域配置（setCustomArea，4.0+，2.0.3 新增）。 */
export interface MapCustomArea {
  /** 生效区域边界点（普通经纬度 { lng, lat }，组件内部转成原生 Point） */
  area: Point[];
  /** 区域内个性化样式，形如 { styleJson: [...] } */
  style: unknown;
  /** 生效前的全局个性化调用参数，默认 { styleJson: [] }（setCustomArea 依赖全局个性化管线已初始化） */
  globalStyle?: unknown;
}

export interface MapProps {
  // 受控
  // 仅支持坐标 { lng, lat }；按地名/城市名定位请用 ref.centerAndZoom(cityName) 或
  // ref.setCenter(cityName)（原生 SDK 支持字符串，但字符串无法与受控状态做等值比较，
  // 故此处不接受 string）。
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
  // 显示元素配置（仅 4.0+ 生效，低版本 noop+warn）
  displayOptions?: DisplayOptions;
  // 样式（按版本选；不存在的版本会 throw/warn）。
  // 首帧样式随地图构造参数传给 SDK，避免「先默认样式再切自定义」的配色闪烁（见下方创建逻辑）。
  // 注意：React StrictMode 开发期会双重挂载（mount→unmount→mount），受百度 SDK 异步销毁 +
  // 版权控件创建时序影响，自定义样式下 logo/版权文字可能短暂闪现一下；这是开发期现象，
  // 生产构建（无双挂载）不受影响。
  mapStyle?: unknown;
  mapStyleV2?: unknown;
  /**
   * 个性化生效区域（setCustomArea，4.0+，3.0 不支持，2.0.3 新增）。传 false/undefined 不设置。
   * 只在指定多边形区域内应用一套个性化样式，区域外维持全局样式。
   * setCustomArea 依赖全局个性化管线，应用前组件会先调用一次 setMapStyle（默认空样式，可用 globalStyle 覆盖）。
   * 首帧随地图创建同步下发（在 tilesloaded 暴露 map 之前），避免「先默认建筑样式再切区域个性化」的闪烁。
   * 从对象切到 false：SDK 无官方清除 API，组件会对上一次区域重新下发空样式（styleJson: []）使其恢复默认渲染。
   */
  customArea?: MapCustomArea | false;
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
  /**
   * 开启点击底图标注后自动展示信息窗口，同时会开启底图标注点击。
   * 3.0 下等价转发到 enableMapClick/disableMapClick，其内部会自动弹出信息窗，
   * 效果与 4.0 基本一致。
   */
  enableIconInfoWindow?: boolean;
  /**
   * 启用首选语言（4.0+，3.0 不支持）。传 BMAP_LANGUAGE_* 常量；
   * false 或 undefined 均表示不主动启用/不控制，false 时会调用 disablePreferredLanguage。
   */
  enablePreferredLanguage?: string | false;
  // 缩放范围
  minZoom?: number;
  maxZoom?: number;
  // 拖拽范围限制（受控；undefined 不主动控制）。
  // 注意：原生 SDK 的 restrictBounds 一旦设置过就没有官方 API 能撤销，
  // 因此这里不接受 null（避免误导用户以为能借此清除限制）。
  bounds?: Bounds;
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
    options, displayOptions, mapStyle, mapStyleV2, customArea,
    enableDragging, enableInertialDragging, enableScrollWheelZoom, enableContinuousZoom,
    enableResizeOnCenter, enableDoubleClickZoom, enableKeyboard, enablePinchToZoom,
    enableRotate, enableRotateGestures, enableTilt: enableTiltProp, enableTiltGestures,
    enableAutoResize, enableIconInfoWindow, enablePreferredLanguage,
    minZoom, maxZoom, bounds, mapType, defaultCursor, draggingCursor, theme,
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
    // 把首帧样式随构造选项一起传给 SDK（对应原生 new BMap.Map(id, {style: ...})）：
    // 若等 createMap 完成后再调用 setMapStyle/setMapStyleV2，SDK 已经用默认样式渲染过
    // 一帧甚至发出了默认样式的瓦片请求，肉眼会看到「先出现默认地图，再切换成自定义样式」
    // 的闪烁。mapStyleV2 优先于 mapStyle（与下面运行时切换 effect 的优先级一致）。
    const initialStyle = mapStyleV2 ?? mapStyle;
    if (initialStyle !== undefined) initial.style = initialStyle;

    const handle = driver.createMap(containerRef.current, initial);

    // ★ 必须 centerAndZoom 初始化后地图才能用（dts 明确要求）
    // 首次渲染的视角设置属于「初始化」而非「用户交互引起的移动」，原生 new BMap.Map(id, options)
    // 传 center/zoom/heading/tilt 时是没有动画的；这里改用 API 补设，需显式传 noAnimation:true
    // 才能还原原生构造函数的无动画效果，否则首帧会出现一次不必要的飞入动画。
    const initCenter = defaultCenter ?? center;
    const initZoom = defaultZoom ?? zoom ?? 11;
    if (initCenter) {
      try {
        driver.centerAndZoom(handle, initCenter, initZoom, { noAnimation: true });
      } catch (e) {
        console.warn('[react-bmap] centerAndZoom failed, map may be uninitialized', e);
      }
    }
    // heading/tilt 初始值（仅 4.0+ 生效，低版本 noop+warn）
    const initHeading = defaultHeading ?? heading;
    const initTilt = defaultTilt ?? tilt;
    if (initHeading != null) {
      try { driver.setHeading(handle, initHeading, { noAnimation: true }); } catch { /* ignore */ }
    }
    if (initTilt != null) {
      try { driver.setTilt(handle, initTilt, { noAnimation: true }); } catch { /* ignore */ }
    }

    // 地图类型：首帧同步应用（centerAndZoom 之后、tilesloaded 暴露 map 之前），避免
    // 「先默认普通图、再切卫星/混合/地球」的闪烁。此刻瓦片刚随 centerAndZoom 开始加载、
    // 尚未真正绘制，先把类型定好，首批瓦片即为目标类型。复用 driver.setMapType 的版本归一化
    // （v3 把 B_* 字符串换成 SDK 实例；GL 内部 normalizeMapTypeRequest 处理 B_STREET_MAP 等）。
    if (mapType !== undefined) {
      try { driver.setMapType(handle, mapType); } catch { /* ignore */ }
    }

    // 个性化生效区域（customArea）：首帧同步应用，避免「先默认建筑样式、再切区域个性化」的闪烁。
    // 与 initial.style 同理——但 setCustomArea/setMapStyle 只能在 createMap 之后以方法调用，
    // 所以放在这里（centerAndZoom 初始化之后、tilesloaded 暴露 map 之前）尽早下发。
    // customArea 取创建时的闭包值即可（首帧初值）；后续变化由下方运行时 effect 处理。
    if (customArea) {
      try {
        driver.setMapStyle(handle, customArea.globalStyle ?? { styleJson: [] });
        driver.setCustomArea(handle, { area: customArea.area, style: customArea.style });
      } catch { /* v3 不支持 */ }
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
  toggleEffect(enableIconInfoWindow, () => driver!.enableIconInfoWindow(map!), () => driver!.disableIconInfoWindow(map!));

  // ─── 首选语言（非 boolean，单独处理：undefined 不控制，false 关闭，字符串启用） ───
  useLayoutEffect(() => {
    if (!map || !driver || enablePreferredLanguage === undefined) return;
    try {
      if (enablePreferredLanguage === false) driver.disablePreferredLanguage(map);
      else driver.enablePreferredLanguage(map, enablePreferredLanguage);
    } catch { /* ignore */ }
  }, [map, driver, enablePreferredLanguage]);

  // ─── 缩放范围 ───
  useLayoutEffect(() => {
    if (!map || !driver || minZoom === undefined) return;
    try { driver.setMinZoom(map, minZoom); } catch { /* ignore */ }
  }, [map, driver, minZoom]);

  useLayoutEffect(() => {
    if (!map || !driver || maxZoom === undefined) return;
    try { driver.setMaxZoom(map, maxZoom); } catch { /* ignore */ }
  }, [map, driver, maxZoom]);

  // ─── 拖拽范围限制 ───
  useLayoutEffect(() => {
    if (!map || !driver || bounds === undefined) return;
    try { driver.restrictBounds(map, bounds); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, bounds?.sw.lng, bounds?.sw.lat, bounds?.ne.lng, bounds?.ne.lat]);

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

  // ─── 显示元素配置 ───
  useLayoutEffect(() => {
    if (!map || !driver || displayOptions === undefined) return;
    try { driver.setDisplayOptions(map, displayOptions); } catch { /* v3 不支持 */ }
  }, [map, driver, displayOptions]);

  // ─── 样式 ───
  useEffect(() => {
    if (!map || !driver || mapStyle === undefined) return;
    driver.setMapStyle(map, mapStyle);
  }, [map, driver, mapStyle]);

  useEffect(() => {
    if (!map || !driver || mapStyleV2 === undefined) return;
    driver.setMapStyleV2(map, mapStyleV2);
  }, [map, driver, mapStyleV2]);

  // ─── 个性化生效区域（setCustomArea，4.0+；2.0.3 新增） ───
  // setCustomArea 依赖全局个性化管线，需先 setMapStyle 一次（默认空样式，可用 globalStyle 覆盖）再设区域。
  // SDK 没有官方「清除」API：customArea 从对象切到 false 时，对上一次的区域重新下发**空样式**
  // （styleJson: []），让区域内建筑恢复默认渲染，达到"取消个性化"的效果。
  const lastCustomAreaRef = useRef<Point[] | null>(null);
  const customAreaKey = useMemo(
    () => (customArea ? JSON.stringify(customArea) : customArea === false ? 'false' : ''),
    [customArea],
  );
  useEffect(() => {
    if (!map || !driver) return;
    if (customArea) {
      try {
        driver.setMapStyle(map, customArea.globalStyle ?? { styleJson: [] });
        driver.setCustomArea(map, { area: customArea.area, style: customArea.style });
        lastCustomAreaRef.current = customArea.area;
      } catch { /* v3 不支持 */ }
    } else if (customArea === false && lastCustomAreaRef.current) {
      try {
        driver.setCustomArea(map, { area: lastCustomAreaRef.current, style: { styleJson: [] } });
      } catch { /* v3 不支持 */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, customAreaKey]);

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
