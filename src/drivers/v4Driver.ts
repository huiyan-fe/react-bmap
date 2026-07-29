import type { Capability, UnsupportedBehavior } from '../types';
import type {
  Bounds,
  ControlHandle,
  LayerHandle,
  MapHandle,
  OverlayHandle,
  Pixel,
  Point,
  ServiceHandle,
  Size,
} from '../types';
import type { BMapDriver } from './types';
import { CAPABILITY_MATRIX } from './capabilityMatrix';
import { reportUnsupported, unsupportedValue } from './unsupported';
import { pointToPlain } from '../utils/pointEquals';

// ─────────────── Handle 工厂 ───────────────
const mapHandle = (raw: unknown): MapHandle => ({ __brand: 'MapHandle', raw });
const overlayHandle = (raw: unknown, type: string): OverlayHandle => ({ __brand: 'OverlayHandle', raw, type });
const controlHandle = (raw: unknown, type: string): ControlHandle => ({ __brand: 'ControlHandle', raw, type });
const layerHandle = (raw: unknown, kind: LayerHandle['kind']): LayerHandle => ({ __brand: 'LayerHandle', raw, kind });
const serviceHandle = (raw: unknown, isNull: boolean): ServiceHandle => ({ __brand: 'ServiceHandle', raw, isNull });

const rawOf = (h: { raw: unknown }) => h.raw as any;
const rawMap = (m: MapHandle) => rawOf(m);

// Point / Pixel / Bounds 转换
function toRawPoint(SDK: any, p: Point | null | undefined): any {
  if (!p) return p;
  if (p instanceof SDK.Point) return p;
  return new SDK.Point(p.lng, p.lat);
}
/** 把 plain icon 对象 {url, size, imageOffset, imageSize, anchor} 转成 SDK Icon 实例 */
function toRawIcon(SDK: any, icon: any): any {
  if (!icon) return icon;
  if (icon.raw) return icon.raw;                   // 已是 Handle 包装的 SDK 实例
  if (!icon.url) return icon;                      // 无法转换，透传
  const sz = icon.size ? new SDK.Size(icon.size.width, icon.size.height) : undefined;
  const opts: any = {};
  if (icon.imageOffset) opts.imageOffset = new SDK.Size(icon.imageOffset.width, icon.imageOffset.height);
  if (icon.imageSize) opts.imageSize = new SDK.Size(icon.imageSize.width, icon.imageSize.height);
  if (icon.anchor) opts.anchor = new SDK.Size(icon.anchor.width, icon.anchor.height);
  return new SDK.Icon(icon.url, sz, opts);
}
/** 把 plain offset {width, height} 转成 SDK Size */
function toRawSize(SDK: any, s: any): any {
  if (!s) return s;
  if (s instanceof SDK.Size) return s;
  return new SDK.Size(s.width ?? 0, s.height ?? 0);
}
function toRawPoints(SDK: any, path: Point[] | null | undefined): any[] {
  return Array.isArray(path) ? path.map(p => toRawPoint(SDK, p)) : (path as any);
}
/** BezierCurve 的控制点是二维数组：每组对应一段路径的 1~2 个控制点 */
function toRawPointGroups(SDK: any, groups: Point[][] | null | undefined): any[] {
  return Array.isArray(groups) ? groups.map(g => toRawPoints(SDK, g)) : (groups as any);
}
/** 判断是否为多坐标串（Point[][]），Prism 的 constructor 同时接受两种形式 */
function isNestedPath(path: unknown): path is Point[][] {
  return Array.isArray(path) && Array.isArray(path[0]);
}
/** Prism 路径：单坐标串走 toRawPoints，多坐标串逐串转换 */
function toRawPathOrPaths(SDK: any, path: Point[] | Point[][] | null | undefined): any {
  return isNestedPath(path) ? toRawPointGroups(SDK, path) : toRawPoints(SDK, path as Point[]);
}
function toRawPixel(SDK: any, p: Pixel | null | undefined): any {
  if (!p) return p;
  if (p instanceof SDK.Pixel) return p;
  return new SDK.Pixel(p.x, p.y);
}
function toRawBounds(SDK: any, b: Bounds | null | undefined): any {
  if (!b) return b;
  if (b instanceof SDK.Bounds) return b;
  return new SDK.Bounds(toRawPoint(SDK, b.sw), toRawPoint(SDK, b.ne));
}
function toPlainPoint(p: any): Point | null {
  return pointToPlain(p);
}
function toPlainBounds(b: any): Bounds | null {
  if (!b) return null;
  const sw = typeof b.getSouthWest === 'function' ? b.getSouthWest() : b.sw ?? b.southWest;
  const ne = typeof b.getNorthEast === 'function' ? b.getNorthEast() : b.ne ?? b.northEast;
  const swP = toPlainPoint(sw);
  const neP = toPlainPoint(ne);
  if (!swP || !neP) return null;
  return { sw: swP, ne: neP };
}
function toPlainSize(s: any): Size | null {
  if (!s) return null;
  return { width: s.width ?? 0, height: s.height ?? 0 };
}
function toPlainPixel(p: any): Pixel | null {
  if (!p) return null;
  return { x: p.x ?? 0, y: p.y ?? 0 };
}

/**
 * setOverlayOptions 里实际有 SDK setter 分支的属性名。
 * 组件的 optionProps 声明了但这里没有的属性，运行时修改不会生效（静默失效），
 * 由 warnUnhandledOverlayOptions 在 dev 下提示。新增分支时记得同步这个集合。
 */
const HANDLED_OVERLAY_OPTION_KEYS = new Set([
  'strokeColor', 'strokeWeight', 'strokeOpacity', 'strokeStyle',
  'fillColor', 'fillOpacity',
  'topFillColor', 'topFillOpacity', 'sideFillColor', 'sideFillOpacity',
  'enableEditing', 'enableDragging', 'enableMassClear',
  'radius', 'bounds', 'controlPoints', 'altitude',
  'url', 'imageURL', 'displayOnMinLevel', 'displayOnMaxLevel',
  'rotation', 'title', 'content', 'styles', 'opacity',
  'icon', 'anchor', 'zIndex', 'offset',
  'size', 'scale', 'shape', 'color',
  // visible 不走 setOverlayOptions，由 showOverlay/hideOverlay 单独处理
  'visible',
]);

const warnedOverlayOptionKeys = new Set<string>();

/**
 * dev 下提示 optionProps 声明了但 driver 未实现的属性。
 * 这类问题类型检查发现不了（optionProps 只是字符串数组），
 * 只会表现为「改了 prop 没反应」，很难排查。每个 type.key 只警告一次，避免刷屏。
 */
function warnUnhandledOverlayOptions(type: string, o: Record<string, unknown>): void {
  // 不依赖 @types/node：从 globalThis 上安全读取，浏览器里 process 不存在时按 dev 处理
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  if (env?.NODE_ENV === 'production') return;
  if (typeof console === 'undefined') return;
  for (const k of Object.keys(o)) {
    if (HANDLED_OVERLAY_OPTION_KEYS.has(k)) continue;
    const seen = `${type}.${k}`;
    if (warnedOverlayOptionKeys.has(seen)) continue;
    warnedOverlayOptionKeys.add(seen);
    console.warn(
      `[react-bmap] ${type} 的 "${k}" 声明在 optionProps 里，`
      + '但 v4Driver.setOverlayOptions 没有对应的 SDK setter 分支，运行时修改该 prop 不会生效。'
      + '要么补上分支，要么把它移到 ctorOnlyProps（改动时重建覆盖物）。',
    );
  }
}

/**
 * v4 Driver — 4.0 baseline 实现。
 * 直接 1:1 调用 window.BMap 上的类与方法；缺的能力（3.0-only）按 unsupportedBehavior 处理。
 */
export function createV4Driver(rawSDK: any, opts: { unsupportedBehavior: UnsupportedBehavior }): BMapDriver {
  const capabilities = CAPABILITY_MATRIX['4.0'];
  const behavior = opts.unsupportedBehavior;
  const version = '4.0' as const;

  // 通用工具：调原生方法，不存在则按 behavior 处理
  const callRaw = (cap: Capability, fn: () => void) => {
    try { fn(); } catch (e: any) {
      if (e?.name === 'UnsupportedCapabilityError') throw e;
      // 把原始错误透出去：这里既可能是方法不存在（真不支持），
      // 也可能是方法存在但参数非法（如 GroundOverlay 的 url 为空），二者不能混为一谈。
      reportUnsupported(cap, version, behavior, e);
    }
  };
  const getRaw = <T,>(cap: Capability, fn: () => T, fallback: T): T => {
    try { const v = fn(); return v ?? fallback; } catch {
      return unsupportedValue(cap, version, behavior, fallback);
    }
  };

  // 类工厂：capabilities 不含 → null / isNull
  const createOverlayFactory = <T>(cap: Capability, ctor: () => T, type: string): OverlayHandle | null => {
    if (!capabilities.has(cap)) { reportUnsupported(cap, version, behavior); return null; }
    try { return overlayHandle(ctor(), type); }
    catch (e) { reportUnsupported(cap, version, behavior, e); return null; }
  };
  const createControlFactory = <T>(cap: Capability, ctor: () => T, type: string): ControlHandle | null => {
    if (!capabilities.has(cap)) { reportUnsupported(cap, version, behavior); return null; }
    try { return controlHandle(ctor(), type); } catch { reportUnsupported(cap, version, behavior); return null; }
  };
  const createLayerFactory = <T>(cap: Capability, ctor: () => T, kind: LayerHandle['kind']): LayerHandle | null => {
    if (!capabilities.has(cap)) { reportUnsupported(cap, version, behavior); return null; }
    try { return layerHandle(ctor(), kind); } catch { reportUnsupported(cap, version, behavior); return null; }
  };
  const createServiceFactory = <T>(cap: Capability, ctor: () => T): ServiceHandle => {
    if (!capabilities.has(cap)) return serviceHandle(null, true);
    try { return serviceHandle(ctor(), false); } catch { return serviceHandle(null, true); }
  };

  return {
    version,
    rawSDK,
    capabilities,
    unsupportedBehavior: behavior,

    // ─────────────── 1. Map 工厂 ───────────────
    createMap(container, options) {
      // 无 options 时只传 1 个参数：new Map(container) vs new Map(container, {})
      // SDK 可能检查 arguments.length 走不同初始化路径，影响 pane 结构和 marker DOM
      const hasOpts = options && typeof options === 'object' && Object.keys(options).length > 0;
      return mapHandle(hasOpts ? new rawSDK.Map(container, options) : new rawSDK.Map(container));
    },
    destroyMap(handle) {
      const map = rawMap(handle);
      try { map.clearOverlays?.(); } catch { /* ignore */ }
      if (typeof map.destroy === 'function') {
        map.destroy();
      } else {
        const c = typeof map.getContainer === 'function' ? map.getContainer() : null;
        if (c) try { c.replaceChildren?.(); } catch { /* ignore */ }
      }
    },

    // ─────────────── 2. 交互开关 ───────────────
    enableDragging: (map) => callRaw('Map.enableDragging', () => rawMap(map).enableDragging()),
    disableDragging: (map) => callRaw('Map.disableDragging', () => rawMap(map).disableDragging()),
    enableInertialDragging: (map) => callRaw('Map.enableInertialDragging', () => rawMap(map).enableInertialDragging()),
    disableInertialDragging: (map) => callRaw('Map.disableInertialDragging', () => rawMap(map).disableInertialDragging()),
    enableScrollWheelZoom: (map) => callRaw('Map.enableScrollWheelZoom', () => rawMap(map).enableScrollWheelZoom()),
    disableScrollWheelZoom: (map) => callRaw('Map.disableScrollWheelZoom', () => rawMap(map).disableScrollWheelZoom()),
    enableContinuousZoom: (map) => callRaw('Map.enableContinuousZoom', () => rawMap(map).enableContinuousZoom()),
    disableContinuousZoom: (map) => callRaw('Map.disableContinuousZoom', () => rawMap(map).disableContinuousZoom()),
    enableResizeOnCenter: (map) => callRaw('Map.enableResizeOnCenter', () => rawMap(map).enableResizeOnCenter()),
    disableResizeOnCenter: (map) => callRaw('Map.disableResizeOnCenter', () => rawMap(map).disableResizeOnCenter()),
    enableDoubleClickZoom: (map) => callRaw('Map.enableDoubleClickZoom', () => rawMap(map).enableDoubleClickZoom()),
    disableDoubleClickZoom: (map) => callRaw('Map.disableDoubleClickZoom', () => rawMap(map).disableDoubleClickZoom()),
    enableKeyboard: (map) => callRaw('Map.enableKeyboard', () => rawMap(map).enableKeyboard()),
    disableKeyboard: (map) => callRaw('Map.disableKeyboard', () => rawMap(map).disableKeyboard()),
    enablePinchToZoom: (map) => callRaw('Map.enablePinchToZoom', () => rawMap(map).enablePinchToZoom()),
    disablePinchToZoom: (map) => callRaw('Map.disablePinchToZoom', () => rawMap(map).disablePinchToZoom()),
    enableRotate: (map) => callRaw('Map.enableRotate', () => rawMap(map).enableRotate()),
    disableRotate: (map) => callRaw('Map.disableRotate', () => rawMap(map).disableRotate()),
    enableRotateGestures: (map) => callRaw('Map.enableRotateGestures', () => rawMap(map).enableRotateGestures()),
    disableRotateGestures: (map) => callRaw('Map.disableRotateGestures', () => rawMap(map).disableRotateGestures()),
    enableTilt: (map) => callRaw('Map.enableTilt', () => rawMap(map).enableTilt()),
    disableTilt: (map) => callRaw('Map.disableTilt', () => rawMap(map).disableTilt()),
    enableTiltGestures: (map) => callRaw('Map.enableTiltGestures', () => rawMap(map).enableTiltGestures()),
    disableTiltGestures: (map) => callRaw('Map.disableTiltGestures', () => rawMap(map).disableTiltGestures()),
    enableAutoResize: (map) => callRaw('Map.enableAutoResize', () => rawMap(map).enableAutoResize()),
    disableAutoResize: (map) => callRaw('Map.disableAutoResize', () => rawMap(map).disableAutoResize()),

    // ─────────────── 3. 视角 ───────────────
    setHeading: (map, h, o) => callRaw('Map.setHeading', () => rawMap(map).setHeading(h, o)),
    getHeading: (map) => getRaw('Map.getHeading', () => rawMap(map).getHeading(), NaN),
    setTilt: (map, t, o) => callRaw('Map.setTilt', () => rawMap(map).setTilt(t, o)),
    getTilt: (map) => getRaw('Map.getTilt', () => rawMap(map).getTilt(), NaN),
    getCurrentMaxTilt: (map) => getRaw('Map.getCurrentMaxTilt', () => rawMap(map).getCurrentMaxTilt(), NaN),

    // ─────────────── 4. 缩放级别 ───────────────
    setMinZoom: (map, z) => callRaw('Map.setMinZoom', () => rawMap(map).setMinZoom(z)),
    setMaxZoom: (map, z) => callRaw('Map.setMaxZoom', () => rawMap(map).setMaxZoom(z)),
    getMinZoom: (map) => getRaw('Map.getMinZoom', () => rawMap(map).getMinZoom(), NaN),
    getMaxZoom: (map) => getRaw('Map.getMaxZoom', () => rawMap(map).getMaxZoom(), NaN),

    // ─────────────── 5. resize ───────────────
    checkResize: (map) => callRaw('Map.checkResize', () => rawMap(map).checkResize()),
    resize: (map) => callRaw('Map.resize', () => { const m = rawMap(map); m.resize ? m.resize() : m.checkResize?.(); }),

    // ─────────────── 6. 显示配置 ───────────────
    setDisplayOptions: (map, o) => callRaw('Map.setDisplayOptions', () => rawMap(map).setDisplayOptions(o)),
    setOptions: (map, o) => callRaw('Map.setOptions', () => rawMap(map).setOptions(o)),

    // ─────────────── 7. 容器信息 ───────────────
    getSize: (map) => getRaw('Map.getSize', () => toPlainSize(rawMap(map).getSize()) ?? { width: 0, height: 0 }, { width: 0, height: 0 }),
    getContainerSize: (map) => getRaw('Map.getContainerSize', () => toPlainSize(rawMap(map).getContainerSize()) ?? { width: 0, height: 0 }, { width: 0, height: 0 }),
    getZoomUnits: (map) => getRaw('Map.getZoomUnits', () => rawMap(map).getZoomUnits(), NaN),
    getContainer: (map) => getRaw('Map.getContainer', () => rawMap(map).getContainer(), document.createElement('div')),

    // ─────────────── 8. 坐标转换 ───────────────
    pixelToPoint: (map, p, o) => getRaw('Map.pixelToPoint', () => toPlainPoint(rawMap(map).pixelToPoint(toRawPixel(rawSDK, p), o)) ?? ({ lng: NaN, lat: NaN } as Point), { lng: NaN, lat: NaN } as Point),
    pointToPixel: (map, p, o) => getRaw('Map.pointToPixel', () => toPlainPixel(rawMap(map).pointToPixel(toRawPoint(rawSDK, p), o)) ?? { x: 0, y: 0 }, { x: 0, y: 0 }),
    lnglatToMercator: (map, lng, lat) => getRaw('Map.lnglatToMercator', () => rawMap(map).lnglatToMercator(lng, lat) ?? [NaN, NaN], [NaN, NaN] as [number, number]),
    mercatorToLnglat: (map, x, y) => getRaw('Map.mercatorToLnglat', () => rawMap(map).mercatorToLnglat(x, y) ?? [NaN, NaN], [NaN, NaN] as [number, number]),
    pointToOverlayPixel: (map, p, o) => getRaw('Map.pointToOverlayPixel', () => toPlainPixel(rawMap(map).pointToOverlayPixel(toRawPoint(rawSDK, p), o)) ?? { x: 0, y: 0 }, { x: 0, y: 0 }),
    overlayPixelToPoint: (map, p, o) => getRaw('Map.overlayPixelToPoint', () => toPlainPoint(rawMap(map).overlayPixelToPoint(toRawPixel(rawSDK, p), o)) ?? ({ lng: NaN, lat: NaN } as Point), { lng: NaN, lat: NaN } as Point),
    getDistance: (map, a, b) => getRaw('Map.getDistance', () => rawMap(map).getDistance(toRawPoint(rawSDK, a), toRawPoint(rawSDK, b)), NaN),

    // ─────────────── 9. 地图状态 ───────────────
    isLoaded: (map) => getRaw('Map.isLoaded', () => (typeof rawMap(map).isLoaded === 'function' ? rawMap(map).isLoaded() : true), true),
    getCoordType: (map) => getRaw('Map.getCoordType', () => rawMap(map).getCoordType(), ''),
    getMapTypeId: (map) => getRaw('Map.getMapTypeId', () => rawMap(map).getMapTypeId?.() ?? rawMap(map).getMapType?.() ?? '', ''),
    getMapCoordType: (map) => getRaw('Map.getMapCoordType', () => rawMap(map).getMapCoordType?.(), ''),
    getMapStyleId: (map) => getRaw('Map.getMapStyleId', () => rawMap(map).getMapStyleId?.(), ''),
    getAreaStyleId: (map) => getRaw('Map.getAreaStyleId', () => rawMap(map).getAreaStyleId?.(), ''),
    getRenderType: (map) => getRaw('Map.getRenderType', () => rawMap(map).getRenderType?.(), ''),
    isCanvasMap: (map) => getRaw('Map.isCanvasMap', () => rawMap(map).isCanvasMap?.() ?? false, false),
    getProjection: (map) => getRaw('Map.getProjection', () => rawMap(map).getProjection?.(), null),
    getExtendBounds: (map, b) => getRaw('Map.getExtendBounds', () => toPlainBounds(rawMap(map).getExtendBounds?.(toRawBounds(rawSDK, b))) ?? b, b),
    getSolarInfo: (map, date) => getRaw('Map.getSolarInfo', () => rawMap(map).getSolarInfo?.(date), null),
    getTileId: (map, p, level) => getRaw('Map.getTileId', () => rawMap(map).getTileId?.(toRawPoint(rawSDK, p), level), ''),
    getPoiByUid: (map, uid, cb) => callRaw('Map.getPoiByUid', () => rawMap(map).getPoiByUid?.(uid, cb)),
    getPanes: (map) => getRaw('Map.getPanes', () => rawMap(map).getPanes?.(), null),
    getInfoWindow: (map) => getRaw('Map.getInfoWindow', () => { const iw = rawMap(map).getInfoWindow?.(); return iw ? overlayHandle(iw, 'infoWindow') : null; }, null),

    // ─────────────── 10. Spots / 标注 ───────────────
    addSpots: (map, s, o) => getRaw('Map.addSpots', () => rawMap(map).addSpots(s, o) ?? '', ''),
    getSpots: (map, id) => getRaw('Map.getSpots', () => rawMap(map).getSpots(id) ?? [], []),
    removeSpots: (map, id) => callRaw('Map.removeSpots', () => rawMap(map).removeSpots(id)),
    clearSpots: (map) => callRaw('Map.clearSpots', () => rawMap(map).clearSpots()),
    resetSpotStatus: (map) => callRaw('Map.resetSpotStatus', () => rawMap(map).resetSpotStatus?.()),
    hightlightSpotByUid: (map, uid, tilePosStr) => callRaw('Map.hightlightSpotByUid', () => rawMap(map).hightlightSpotByUid(uid, tilePosStr)),
    addAreaSpot: (map, a, o) => getRaw('Map.addAreaSpot', () => rawMap(map).addAreaSpot(a, o) ?? '', ''),
    getAreaSpot: (map, id) => getRaw('Map.getAreaSpot', () => rawMap(map).getAreaSpot(id) ?? [], []),
    removeAreaSpot: (map, id) => callRaw('Map.removeAreaSpot', () => rawMap(map).removeAreaSpot(id)),
    clearAreaSpots: (map) => callRaw('Map.clearAreaSpots', () => rawMap(map).clearAreaSpots()),
    clearLabels: (map) => callRaw('Map.clearLabels', () => rawMap(map).clearLabels?.()),
    addMapLabels: (map, l) => getRaw('Map.addMapLabels', () => rawMap(map).addMapLabels(l) ?? [], []),
    removeMapLabels: (map, u) => callRaw('Map.removeMapLabels', () => rawMap(map).removeMapLabels(u)),
    getIconByClickPosition: (map, p) => getRaw('Map.getIconByClickPosition', () => rawMap(map).getIconByClickPosition?.(toRawPixel(rawSDK, p)) ?? null, null),
    setBounds: (map, b) => callRaw('Map.setBounds', () => rawMap(map).setBounds?.(toRawBounds(rawSDK, b))),

    // ─────────────── 11. 视野控制 ───────────────
    centerAndZoom: (map, c, z, o) => callRaw('Map.centerAndZoom', () => {
      const m = rawMap(map);
      if (typeof c === 'string') m.centerAndZoom(c, z, o);
      else m.centerAndZoom(toRawPoint(rawSDK, c), z, o);
    }),
    panTo: (map, c, o) => callRaw('Map.panTo', () => rawMap(map).panTo(toRawPoint(rawSDK, c as Point), o)),
    panBy: (map, x, y, o) => callRaw('Map.panBy', () => rawMap(map).panBy(x, y, o)),
    flyTo: (map, c, z, o) => callRaw('Map.flyTo', () => rawMap(map).flyTo(toRawPoint(rawSDK, c), z, o)),
    reset: (map) => callRaw('Map.reset', () => rawMap(map).reset()),
    setCenter: (map, c, o) => callRaw('Map.setCenter', () => rawMap(map).setCenter(typeof c === 'string' ? c : toRawPoint(rawSDK, c), o)),
    getCenter: (map) => getRaw('Map.getCenter', () => toPlainPoint(rawMap(map).getCenter()) ?? ({ lng: NaN, lat: NaN } as Point), { lng: NaN, lat: NaN } as Point),
    setViewport: (map, v, o) => callRaw('Map.setViewport', () => rawMap(map).setViewport(Array.isArray(v) ? toRawPoints(rawSDK, v) : v, o)),
    getViewport: (map, v, o) => getRaw('Map.getViewport', () => rawMap(map).getViewport(Array.isArray(v) ? toRawPoints(rawSDK, v) : v, o), null),
    setZoom: (map, z, o) => callRaw('Map.setZoom', () => rawMap(map).setZoom(z, o)),
    getZoom: (map) => getRaw('Map.getZoom', () => rawMap(map).getZoom(), NaN),
    zoomIn: (map, zc) => callRaw('Map.zoomIn', () => rawMap(map).zoomIn(zc && toRawPoint(rawSDK, zc))),
    zoomOut: (map, zc) => callRaw('Map.zoomOut', () => rawMap(map).zoomOut(zc && toRawPoint(rawSDK, zc))),
    getBounds: (map) => getRaw('Map.getBounds', () => toPlainBounds(rawMap(map).getBounds()) ?? ({ sw: { lng: NaN, lat: NaN }, ne: { lng: NaN, lat: NaN } }), { sw: { lng: NaN, lat: NaN }, ne: { lng: NaN, lat: NaN } }),
    restrictBounds: (map, b) => callRaw('Map.restrictBounds', () => rawMap(map).restrictBounds(b ? toRawBounds(rawSDK, b) : null)),

    // ─────────────── 12. 地图类型 ───────────────
    setMapType: (map, t) => callRaw('Map.setMapType', () => rawMap(map).setMapType(t)),
    getMapType: (map) => getRaw('Map.getMapType', () => rawMap(map).getMapType?.() ?? '', ''),

    // ─────────────── 13. 控件 / 右键菜单 ───────────────
    addControl: (map, c) => callRaw('Map.addControl', () => rawMap(map).addControl(rawOf(c))),
    removeControl: (map, c) => callRaw('Map.removeControl', () => rawMap(map).removeControl(rawOf(c))),
    addContextMenu: (target, menu) => callRaw('Map.addContextMenu', () => rawOf(target).addContextMenu(rawOf(menu))),
    removeContextMenu: (target, menu) => callRaw('Map.removeContextMenu', () => rawOf(target).removeContextMenu(rawOf(menu))),

    // ─────────────── 14. 覆盖物 ───────────────
    addOverlay: (map, o) => callRaw('Map.addOverlay', () => rawMap(map).addOverlay(rawOf(o))),
    removeOverlay: (map, o) => {
      // 在 removeOverlay 前先关闭编辑：Circle/Polyline/Polygon 的编辑句柄
      // 在 overlay 被移除时若仍激活，会触发 "Cannot read properties of null"。
      try { rawOf(o).disableEditing?.(); } catch { /* ignore */ }
      callRaw('Map.removeOverlay', () => rawMap(map).removeOverlay(rawOf(o)));
    },
    clearOverlays: (map) => callRaw('Map.clearOverlays', () => rawMap(map).clearOverlays()),
    getOverlays: (map) => getRaw('Map.getOverlays', () => (rawMap(map).getOverlays() ?? []).map((o: any) => overlayHandle(o, inferOverlayType(o))), []),

    // ─────────────── 15. 图层 ───────────────
    addLayer: (map, l) => callRaw('Map.addLayer', () => rawMap(map).addLayer(rawOf(l))),
    removeLayer: (map, l) => callRaw('Map.removeLayer', () => rawMap(map).removeLayer(rawOf(l))),
    addTileLayer: (map, l) => callRaw('Map.addTileLayer', () => rawMap(map).addTileLayer(rawOf(l))),
    removeTileLayer: (map, l) => callRaw('Map.removeTileLayer', () => rawMap(map).removeTileLayer(rawOf(l))),
    getTileLayer: (map, t) => {
      if (!capabilities.has('Map.getTileLayer')) { reportUnsupported('Map.getTileLayer', version, behavior); return null; }
      const r = rawMap(map).getTileLayer?.(t);
      return r ? layerHandle(r, 'tile') : null;
    },
    addGeoJSONLayer: (map, l) => callRaw('Map.addGeoJSONLayer', () => rawMap(map).addGeoJSONLayer(rawOf(l))),
    removeGeoJSONLayer: (map, l) => callRaw('Map.removeGeoJSONLayer', () => rawMap(map).removeGeoJSONLayer(rawOf(l))),
    addDistrictLayer: (map, l) => callRaw('Map.addDistrictLayer', () => rawMap(map).addDistrictLayer(rawOf(l))),
    removeDistrictLayer: (map, l) => callRaw('Map.removeDistrictLayer', () => rawMap(map).removeDistrictLayer(rawOf(l))),
    addNormalLayer: (map, l) => callRaw('Map.addNormalLayer', () => rawMap(map).addNormalLayer(rawOf(l))),
    removeNormalLayer: (map, l) => callRaw('Map.removeNormalLayer', () => rawMap(map).removeNormalLayer(rawOf(l))),
    setTrafficOn: (map) => callRaw('Map.setTrafficOn', () => rawMap(map).setTrafficOn()),
    setTrafficOff: (map) => callRaw('Map.setTrafficOff', () => rawMap(map).setTrafficOff()),
    showOverlayContainer: (map) => callRaw('Map.showOverlayContainer', () => rawMap(map).showOverlayContainer?.()),
    hideOverlayContainer: (map) => callRaw('Map.hideOverlayContainer', () => rawMap(map).hideOverlayContainer?.()),

    // ─────────────── 16. 信息窗口（v4 由 Marker 承载） ───────────────
    openInfoWindow: (target, iw, point) => {
      const t = rawOf(target);
      if (typeof t.openInfoWindow === 'function') {
        callRaw('Marker.openInfoWindow', () => t.openInfoWindow(rawOf(iw), point && toRawPoint(rawSDK, point)));
      } else {
        reportUnsupported('Marker.openInfoWindow', version, behavior);
      }
    },
    closeInfoWindow: (target) => callRaw('Map.closeInfoWindow', () => rawOf(target).closeInfoWindow?.()),

    // ─────────────── 17. 样式 / 主题 ───────────────
    setMapStyle: () => reportUnsupported('Map.setMapStyle', version, behavior),
    setMapStyleV2: (map, o) => callRaw('Map.setMapStyleV2', () => rawMap(map).setMapStyleV2(o)),
    setTheme: (map, t, cv) => callRaw('Map.setTheme', () => rawMap(map).setTheme(t, cv)),
    setCopyrightOffset: (map, l, c) => callRaw('Map.setCopyrightOffset', () => rawMap(map).setCopyrightOffset(l, c)),
    setDefaultCursor: (map, c) => callRaw('Map.setDefaultCursor', () => rawMap(map).setDefaultCursor(c)),
    getDefaultCursor: (map) => getRaw('Map.getDefaultCursor', () => rawMap(map).getDefaultCursor?.() ?? '', ''),
    setDraggingCursor: (map, c) => callRaw('Map.setDraggingCursor', () => rawMap(map).setDraggingCursor(c)),
    getDraggingCursor: (map) => getRaw('Map.getDraggingCursor', () => rawMap(map).getDraggingCursor?.() ?? '', ''),
    setOverlayMoveCursor: (map, c) => callRaw('Map.setOverlayMoveCursor', () => rawMap(map).setOverlayMoveCursor?.(c)),

    // ─────────────── 18. 视角动画 ───────────────
    startViewAnimation: (map, a) => getRaw('Map.startViewAnimation', () => rawMap(map).startViewAnimation(a) ?? 0, 0),
    pauseViewAnimation: (map, a) => callRaw('Map.pauseViewAnimation', () => rawMap(map).pauseViewAnimation(a)),
    continueViewAnimation: (map, a) => callRaw('Map.continueViewAnimation', () => rawMap(map).continueViewAnimation(a)),
    cancelViewAnimation: (map, a) => callRaw('Map.cancelViewAnimation', () => rawMap(map).cancelViewAnimation(a)),

    // ─────────────── 19. 截图 ───────────────
    getScreenshot: (map) => getRaw('Map.getScreenshot', () => rawMap(map).getScreenshot?.() ?? rawMap(map).getMapScreenshot?.() ?? '', ''),

    // ─────────────── 20. 地球模式 ───────────────
    isSupportEarth: (map) => getRaw('Map.isSupportEarth', () => rawMap(map).isSupportEarth?.() ?? false, false),
    getEarth: (map) => getRaw('Map.getEarth', () => rawMap(map).getEarth?.(), null),
    showEarthBoundary: (map) => callRaw('Map.showEarthBoundary', () => rawMap(map).showEarthBoundary?.()),
    hideEarthBoundary: (map) => callRaw('Map.hideEarthBoundary', () => rawMap(map).hideEarthBoundary?.()),
    setEarthMaxZoom: (map, z) => callRaw('Map.setEarthMaxZoom', () => rawMap(map).setEarthMaxZoom?.(z)),
    setEarthMinZoom: (map, z) => callRaw('Map.setEarthMinZoom', () => rawMap(map).setEarthMinZoom?.(z)),

    // ─────────────── 21. 室内 ───────────────
    showIndoor: (map, uid, floor) => callRaw('Map.showIndoor', () => rawMap(map).showIndoor?.(uid, floor)),
    setIndoor: (map, uid, floor) => callRaw('Map.setIndoor', () => rawMap(map).setIndoor?.(uid, floor)),
    getIndoorInfo: (map) => getRaw('Map.getIndoorInfo', () => rawMap(map).getIndoorInfo?.() ?? null, null),

    // ─────────────── 22. 街景图层 ───────────────
    showStreetLayer: (map, s) => callRaw('Map.showStreetLayer', () => rawMap(map).showStreetLayer?.(s)),
    hideStreetLayer: (map) => callRaw('Map.hideStreetLayer', () => rawMap(map).hideStreetLayer?.()),
    isStreetLayerShow: (map) => getRaw('Map.isStreetLayerShow', () => rawMap(map).isStreetLayerShow?.() ?? false, false),
    showVectorStreetLayer: (map) => callRaw('Map.showVectorStreetLayer', () => rawMap(map).showVectorStreetLayer?.()),
    hideVectorStreetLayer: (map) => callRaw('Map.hideVectorStreetLayer', () => rawMap(map).hideVectorStreetLayer?.()),

    // ─────────────── 23. 语言 ───────────────
    getLanguage: (map) => getRaw('Map.getLanguage', () => rawMap(map).getLanguage?.() ?? '', ''),
    changeLanguage: (map, l) => callRaw('Map.changeLanguage', () => rawMap(map).changeLanguage?.(l)),
    enablePreferredLanguage: (map, l) => callRaw('Map.enablePreferredLanguage', () => rawMap(map).enablePreferredLanguage?.(l)),
    disablePreferredLanguage: (map) => callRaw('Map.disablePreferredLanguage', () => rawMap(map).disablePreferredLanguage?.()),

    // ─────────────── 24. 私有 / 焦点遮罩 / 自定义 HTML 图层 ───────────────
    setLock: (map, l) => callRaw('Map.setLock', () => rawMap(map).setLock?.(l)),
    setPrivateRegions: (map, r) => callRaw('Map.setPrivateRegions', () => rawMap(map).setPrivateRegions?.(r)),
    getPrivateRegions: (map) => getRaw('Map.getPrivateRegions', () => rawMap(map).getPrivateRegions?.() ?? [], []),
    setPrivateStatus: (map, s) => callRaw('Map.setPrivateStatus', () => rawMap(map).setPrivateStatus?.(s)),
    getPrivateStatus: (map) => getRaw('Map.getPrivateStatus', () => rawMap(map).getPrivateStatus?.() ?? false, false),
    setCustomArea: (map, c) => callRaw('Map.setCustomArea', () => rawMap(map).setCustomArea?.(c)),
    addFocusMask: (map, m) => callRaw('Map.addFocusMask', () => rawMap(map).addFocusMask?.(m)),
    removeFocusMask: (map, m) => callRaw('Map.removeFocusMask', () => rawMap(map).removeFocusMask?.(m)),
    clearFocusMasks: (map) => callRaw('Map.clearFocusMasks', () => rawMap(map).clearFocusMasks?.()),
    addCustomHtmlLayer: (map, l) => callRaw('Map.addCustomHtmlLayer', () => rawMap(map).addCustomHtmlLayer?.(l)),
    removeCustomHtmlLayer: (map, l) => callRaw('Map.removeCustomHtmlLayer', () => rawMap(map).removeCustomHtmlLayer?.(l)),
    addParkingSpot: (map, l) => callRaw('Map.addParkingSpot', () => rawMap(map).addParkingSpot?.(l)),
    removeParkingSpot: (map, p) => callRaw('Map.removeParkingSpot', () => rawMap(map).removeParkingSpot?.(p)),

    // ─────────────── 25. 3.0-only（v4 不支持） ───────────────
    enableMapClick: () => reportUnsupported('Map.enableMapClick', version, behavior),
    disableMapClick: () => reportUnsupported('Map.disableMapClick', version, behavior),
    enable3DBuilding: () => reportUnsupported('Map.enable3DBuilding', version, behavior),
    disable3DBuilding: () => reportUnsupported('Map.disable3DBuilding', version, behavior),
    setPanorama: () => reportUnsupported('Map.setPanorama', version, behavior),
    getPanorama: () => unsupportedValue('Map.getPanorama', version, behavior, null),
    setCurrentCity: () => reportUnsupported('Map.setCurrentCity', version, behavior),
    highResolutionEnabled: () => unsupportedValue('Map.highResolutionEnabled', version, behavior, false),
    addHotspot: () => reportUnsupported('Map.addHotspot', version, behavior),
    removeHotspot: () => reportUnsupported('Map.removeHotspot', version, behavior),
    clearHotspots: () => reportUnsupported('Map.clearHotspots', version, behavior),

    // ─────────────── 26. Overlay 工厂 ───────────────
    createMarker: (p, o) => {
      // v3 SDK 可能检查 arguments.length：new Marker(point) vs new Marker(point, undefined) 走不同路径。
      // 必须确保无 opts 时只传 1 个参数。
      const raw = o as Record<string, unknown>;
      const ctorOpts: Record<string, unknown> = {};
      if (raw?.icon) ctorOpts.icon = toRawIcon(rawSDK, raw.icon);
      if (raw?.offset) ctorOpts.offset = toRawSize(rawSDK, raw.offset);
      // 以下选项 SDK 没有 setter 方法，只能在 constructor 设置
      if (typeof raw?.enableClicking === 'boolean') ctorOpts.enableClicking = raw.enableClicking;
      if (typeof raw?.raiseOnDrag === 'boolean') ctorOpts.raiseOnDrag = raw.raiseOnDrag;
      if (typeof raw?.draggingCursor === 'string') ctorOpts.draggingCursor = raw.draggingCursor;
      // shadow @removed 4.0，v3 only；icon 类型转换同样适用
      if (raw?.shadow) ctorOpts.shadow = toRawIcon(rawSDK, raw.shadow);
      const hasOpts = Object.keys(ctorOpts).length > 0;
      const point = toRawPoint(rawSDK, p);
      return createOverlayFactory('Marker', () =>
        hasOpts ? new rawSDK.Marker(point, ctorOpts) : new rawSDK.Marker(point),
      'marker');
    },
    createLabel: (c, o) => {
      const raw = o as Record<string, unknown>;
      const ctorOpts: Record<string, unknown> = {};
      if (raw?.offset) ctorOpts.offset = toRawSize(rawSDK, raw.offset);
      if (raw?.position) ctorOpts.position = toRawPoint(rawSDK, raw.position as Point);
      if (typeof raw?.anchor === 'number') ctorOpts.anchor = raw.anchor;
      if (typeof raw?.enableMassClear === 'boolean') ctorOpts.enableMassClear = raw.enableMassClear;
      if (typeof raw?.enableClicking === 'boolean') ctorOpts.enableClicking = raw.enableClicking;
      if (typeof raw?.width === 'number' && raw.width > 0) ctorOpts.width = raw.width;
      if (raw?.styles) ctorOpts.styles = raw.styles;
      const hasOpts = Object.keys(ctorOpts).length > 0;
      return createOverlayFactory('Label', () =>
        hasOpts ? new rawSDK.Label(c, ctorOpts) : new rawSDK.Label(c),
      'label');
    },
    createPolyline: (p, o) => {
      const raw = o as Record<string, unknown>;
      const ctorOpts: Record<string, unknown> = {};
      const strokeFields = ['strokeColor', 'strokeWeight', 'strokeOpacity', 'strokeStyle', 'strokeLineCap', 'strokeLineJoin'];
      for (const f of strokeFields) { if (raw?.[f] !== undefined) ctorOpts[f] = raw[f]; }
      if (typeof raw?.enableMassClear === 'boolean') ctorOpts.enableMassClear = raw.enableMassClear;
      if (typeof raw?.enableEditing === 'boolean') ctorOpts.enableEditing = raw.enableEditing;
      if (typeof raw?.enableClicking === 'boolean') ctorOpts.enableClicking = raw.enableClicking;
      if (typeof raw?.geodesic === 'boolean') ctorOpts.geodesic = raw.geodesic;
      if (typeof raw?.linkRight === 'boolean') ctorOpts.linkRight = raw.linkRight;
      if (typeof raw?.clip === 'boolean') ctorOpts.clip = raw.clip;
      if (typeof raw?.coordType === 'string') ctorOpts.coordType = raw.coordType;
      if (raw?.icons) ctorOpts.icons = raw.icons;
      if (raw?.dashArray) ctorOpts.dashArray = raw.dashArray;
      if (raw?.strokeTexture) ctorOpts.strokeTexture = raw.strokeTexture;
      if (typeof raw?.zIndex === 'number') ctorOpts.zIndex = raw.zIndex;
      const hasOpts = Object.keys(ctorOpts).length > 0;
      return createOverlayFactory('Polyline', () =>
        hasOpts ? new rawSDK.Polyline(toRawPoints(rawSDK, p), ctorOpts) : new rawSDK.Polyline(toRawPoints(rawSDK, p)),
      'polyline');
    },
    createPolygon: (p, o) => {
      const raw = o as Record<string, unknown>;
      const ctorOpts: Record<string, unknown> = {};
      const fields = ['strokeColor', 'fillColor', 'strokeWeight', 'strokeOpacity', 'fillOpacity', 'strokeStyle', 'strokeLineCap', 'strokeLineJoin'];
      for (const f of fields) { if (raw?.[f] !== undefined) ctorOpts[f] = raw[f]; }
      if (typeof raw?.enableMassClear === 'boolean') ctorOpts.enableMassClear = raw.enableMassClear;
      if (typeof raw?.enableEditing === 'boolean') ctorOpts.enableEditing = raw.enableEditing;
      if (typeof raw?.enableClicking === 'boolean') ctorOpts.enableClicking = raw.enableClicking;
      if (typeof raw?.linkRight === 'boolean') ctorOpts.linkRight = raw.linkRight;
      if (typeof raw?.coordType === 'string') ctorOpts.coordType = raw.coordType;
      if (raw?.dashArray) ctorOpts.dashArray = raw.dashArray;
      if (typeof raw?.zIndex === 'number') ctorOpts.zIndex = raw.zIndex;
      const hasOpts = Object.keys(ctorOpts).length > 0;
      return createOverlayFactory('Polygon', () =>
        hasOpts ? new rawSDK.Polygon(toRawPoints(rawSDK, p), ctorOpts) : new rawSDK.Polygon(toRawPoints(rawSDK, p)),
      'polygon');
    },
    createCircle: (c, r, o) => {
      const raw = o as Record<string, unknown>;
      // enableEditing 不传给 constructor：SDK 在 constructor 阶段初始化编辑句柄时
      // 会访问内部 path 数组（Circle 没有 path，只有 center+radius），
      // 导致 "Cannot read properties of null (reading '0')"。
      // 改为创建后用 rAF 延迟调用 enableEditing()，此时 overlay 已 addOverlay 到地图。
      const wantEditing = raw?.enableEditing === true;
      const ctorOpts: Record<string, unknown> = {};
      const fields = ['strokeColor', 'fillColor', 'strokeWeight', 'strokeOpacity', 'fillOpacity', 'strokeStyle'];
      for (const f of fields) { if (raw?.[f] !== undefined) ctorOpts[f] = raw[f]; }
      if (typeof raw?.enableMassClear === 'boolean') ctorOpts.enableMassClear = raw.enableMassClear;
      if (typeof raw?.enableClicking === 'boolean') ctorOpts.enableClicking = raw.enableClicking;
      if (typeof raw?.coordType === 'string') ctorOpts.coordType = raw.coordType;
      if (raw?.dashArray) ctorOpts.dashArray = raw.dashArray;
      if (typeof raw?.zIndex === 'number') ctorOpts.zIndex = raw.zIndex;
      const hasOpts = Object.keys(ctorOpts).length > 0;
      return createOverlayFactory('Circle', () => {
        const inst = hasOpts
          ? new rawSDK.Circle(toRawPoint(rawSDK, c), r, ctorOpts)
          : new rawSDK.Circle(toRawPoint(rawSDK, c), r);
        if (wantEditing) {
          // 延迟到下一帧：编辑系统需要 overlay 已渲染到地图上才能初始化句柄。
          requestAnimationFrame(() => {
            try { inst.enableEditing?.(); } catch { /* ignore */ }
          });
        }
        return inst;
      }, 'circle');
    },
    createRectangle: (b, o) => {
      const raw = o as Record<string, unknown>;
      // enableEditing 同 Circle：Rectangle 也是 bounds 驱动、无内部 path 数组，
      // 在 constructor 阶段初始化编辑句柄会踩同一个 SDK null 访问问题，改为创建后 rAF 延迟开启。
      const wantEditing = raw?.enableEditing === true;
      const ctorOpts: Record<string, unknown> = {};
      const fields = ['strokeColor', 'fillColor', 'strokeWeight', 'strokeOpacity', 'fillOpacity', 'strokeStyle'];
      for (const f of fields) { if (raw?.[f] !== undefined) ctorOpts[f] = raw[f]; }
      if (typeof raw?.enableMassClear === 'boolean') ctorOpts.enableMassClear = raw.enableMassClear;
      if (typeof raw?.enableClicking === 'boolean') ctorOpts.enableClicking = raw.enableClicking;
      if (typeof raw?.linkRight === 'boolean') ctorOpts.linkRight = raw.linkRight;
      if (typeof raw?.coordType === 'string') ctorOpts.coordType = raw.coordType;
      if (raw?.dashArray) ctorOpts.dashArray = raw.dashArray;
      if (typeof raw?.zIndex === 'number') ctorOpts.zIndex = raw.zIndex;
      const hasOpts = Object.keys(ctorOpts).length > 0;
      return createOverlayFactory('Rectangle', () => {
        const inst = hasOpts
          ? new rawSDK.Rectangle(toRawBounds(rawSDK, b), ctorOpts)
          : new rawSDK.Rectangle(toRawBounds(rawSDK, b));
        if (wantEditing) {
          requestAnimationFrame(() => {
            try { inst.enableEditing?.(); } catch { /* ignore */ }
          });
        }
        return inst;
      }, 'rectangle');
    },
    createBezierCurve: (p, cp, o) => {
      const raw = o as Record<string, unknown>;
      const ctorOpts: Record<string, unknown> = {};
      const fields = ['strokeColor', 'strokeWeight', 'strokeOpacity', 'strokeStyle'];
      for (const f of fields) { if (raw?.[f] !== undefined) ctorOpts[f] = raw[f]; }
      if (typeof raw?.enableMassClear === 'boolean') ctorOpts.enableMassClear = raw.enableMassClear;
      if (typeof raw?.enableClicking === 'boolean') ctorOpts.enableClicking = raw.enableClicking;
      if (raw?.dashArray) ctorOpts.dashArray = raw.dashArray;
      if (typeof raw?.zIndex === 'number') ctorOpts.zIndex = raw.zIndex;
      const hasOpts = Object.keys(ctorOpts).length > 0;
      // controlPoints 是第 2 个位置参数，opts 是第 3 个，顺序不能省
      return createOverlayFactory('BezierCurve', () =>
        hasOpts
          ? new rawSDK.BezierCurve(toRawPoints(rawSDK, p), toRawPointGroups(rawSDK, cp), ctorOpts)
          : new rawSDK.BezierCurve(toRawPoints(rawSDK, p), toRawPointGroups(rawSDK, cp)),
      'bezierCurve');
    },
    createPrism: (p, altitude, o) => {
      const raw = o as Record<string, unknown>;
      const ctorOpts: Record<string, unknown> = {};
      const fields = ['topFillColor', 'topFillOpacity', 'sideFillColor', 'sideFillOpacity'];
      for (const f of fields) { if (raw?.[f] !== undefined) ctorOpts[f] = raw[f]; }
      if (typeof raw?.enableMassClear === 'boolean') ctorOpts.enableMassClear = raw.enableMassClear;
      if (typeof raw?.enableClicking === 'boolean') ctorOpts.enableClicking = raw.enableClicking;
      if (typeof raw?.zIndex === 'number') ctorOpts.zIndex = raw.zIndex;
      const hasOpts = Object.keys(ctorOpts).length > 0;
      // altitude 是第 2 个位置参数，opts 是第 3 个，顺序不能省
      return createOverlayFactory('Prism', () =>
        hasOpts
          ? new rawSDK.Prism(toRawPathOrPaths(rawSDK, p), altitude, ctorOpts)
          : new rawSDK.Prism(toRawPathOrPaths(rawSDK, p), altitude),
      'prism');
    },
    createGroundOverlay: (b, o) => {
      const raw = o as Record<string, unknown>;
      const ctorOpts: Record<string, unknown> = {};
      if (typeof raw?.opacity === 'number') ctorOpts.opacity = raw.opacity;
      if (typeof raw?.enableMassClear === 'boolean') ctorOpts.enableMassClear = raw.enableMassClear;
      if (typeof raw?.enableClicking === 'boolean') ctorOpts.enableClicking = raw.enableClicking;
      // url 可以是图片/视频地址，也可以是 canvas 元素（type='canvas'）
      if (raw?.url !== undefined) ctorOpts.url = raw.url;
      if (typeof raw?.displayOnMinLevel === 'number') ctorOpts.displayOnMinLevel = raw.displayOnMinLevel;
      if (typeof raw?.displayOnMaxLevel === 'number') ctorOpts.displayOnMaxLevel = raw.displayOnMaxLevel;
      if (typeof raw?.imageURL === 'string') ctorOpts.imageURL = raw.imageURL;
      if (typeof raw?.stretch === 'boolean') ctorOpts.stretch = raw.stretch;
      if (typeof raw?.type === 'string') ctorOpts.type = raw.type;
      if (typeof raw?.top === 'boolean') ctorOpts.top = raw.top;
      if (typeof raw?.isReDraw === 'boolean') ctorOpts.isReDraw = raw.isReDraw;
      if (typeof raw?.drawHook === 'function') ctorOpts.drawHook = raw.drawHook;
      // zIndex 不是 SDK 的 constructor 选项，只能通过 setZIndex 设置，故不放进 ctorOpts
      const hasOpts = Object.keys(ctorOpts).length > 0;
      return createOverlayFactory('GroundOverlay', () =>
        hasOpts
          ? new rawSDK.GroundOverlay(toRawBounds(rawSDK, b), ctorOpts)
          : new rawSDK.GroundOverlay(toRawBounds(rawSDK, b)),
      'groundOverlay');
    },
    createGroundPoint: (p, o) => {
      const raw = o as Record<string, unknown>;
      const ctorOpts: Record<string, unknown> = {};
      // GroundPointOptions 自身字段
      if (typeof raw?.url === 'string') ctorOpts.url = raw.url;
      if (raw?.size) ctorOpts.size = toRawSize(rawSDK, raw.size as Size);
      if (raw?.anchor) ctorOpts.anchor = toRawSize(rawSDK, raw.anchor as Size);
      if (typeof raw?.scale === 'number') ctorOpts.scale = raw.scale;
      if (typeof raw?.rotation === 'number') ctorOpts.rotation = raw.rotation;
      if (raw?.offset) ctorOpts.offset = toRawSize(rawSDK, raw.offset as Size);
      if (typeof raw?.level === 'number') ctorOpts.level = raw.level;
      // 继承自 GroundOverlayOptions 的字段
      if (typeof raw?.opacity === 'number') ctorOpts.opacity = raw.opacity;
      if (typeof raw?.enableMassClear === 'boolean') ctorOpts.enableMassClear = raw.enableMassClear;
      if (typeof raw?.enableClicking === 'boolean') ctorOpts.enableClicking = raw.enableClicking;
      if (typeof raw?.displayOnMinLevel === 'number') ctorOpts.displayOnMinLevel = raw.displayOnMinLevel;
      if (typeof raw?.displayOnMaxLevel === 'number') ctorOpts.displayOnMaxLevel = raw.displayOnMaxLevel;
      if (typeof raw?.imageURL === 'string') ctorOpts.imageURL = raw.imageURL;
      // zIndex 不是 constructor 选项（见 GroundOverlayOptions 注释），跳过
      const hasOpts = Object.keys(ctorOpts).length > 0;
      return createOverlayFactory('GroundPoint', () =>
        hasOpts ? new rawSDK.GroundPoint(toRawPoint(rawSDK, p), ctorOpts) : new rawSDK.GroundPoint(toRawPoint(rawSDK, p)),
      'groundPoint');
    },
    createPointCollection: (p, o) => createOverlayFactory('PointCollection', () => new rawSDK.PointCollection(toRawPoints(rawSDK, p), o), 'pointCollection'),
    createInfoWindow: (c, o) => createOverlayFactory('InfoWindow', () => new rawSDK.InfoWindow(c, o), 'infoWindow'),
    createSymbol: (path, o) => createOverlayFactory('Symbol', () => new rawSDK.Symbol(path, o), 'symbol'),
    createIcon: (url, size, o) => createOverlayFactory('Icon', () => new rawSDK.Icon(url, new rawSDK.Size(size.width, size.height), o), 'icon'),
    createIconSequence: (sym, offset, repeat, fr) => createOverlayFactory('IconSequence', () => new rawSDK.IconSequence(sym ? rawOf(sym) : undefined, offset, repeat, fr), 'iconSequence'),
    createHotspot: (p, o) => createOverlayFactory('Hotspot', () => new rawSDK.Hotspot(toRawPoint(rawSDK, p), o), 'hotspot'),
    createCustomOverlay: (o) => createOverlayFactory('CustomOverlay', () => {
      const inst = new rawSDK.Overlay();
      Object.assign(inst, o);
      return inst;
    }, 'customOverlay'),

    // ─────────────── 27. Overlay 属性 setter ───────────────
    setOverlayPosition: (ov, p) => {
      try {
        const r = rawOf(ov);
        // Circle 用 setCenter，GroundPoint 用 setPoint，其余用 setPosition
        if (ov.type === 'circle') r.setCenter?.(toRawPoint(rawSDK, p));
        else if (ov.type === 'groundPoint') r.setPoint?.(toRawPoint(rawSDK, p));
        else r.setPosition?.(toRawPoint(rawSDK, p));
      } catch { /* ignore */ }
    },
    setOverlayPath: (ov, path) => {
      try {
        // SDK 的 setPath() 只接受单坐标串。Prism 支持用多坐标串（Point[][]）构造，
        // 这种形式无法通过 setPath 更新，交由 ctorOnlyProps/key 重建处理。
        if (isNestedPath(path)) return;
        rawOf(ov).setPath?.(toRawPoints(rawSDK, path));
      } catch { /* ignore */ }
    },
    setOverlayOptions: (ov, options) => {
      const r = rawOf(ov);
      const o = options as Record<string, unknown>;
      warnUnhandledOverlayOptions(ov.type, o);
      try {
        if (typeof o.strokeColor === 'string') r.setStrokeColor?.(o.strokeColor);
        if (typeof o.strokeWeight === 'number') r.setStrokeWeight?.(o.strokeWeight);
        if (typeof o.strokeOpacity === 'number') r.setStrokeOpacity?.(o.strokeOpacity);
        if (typeof o.strokeStyle === 'string') r.setStrokeStyle?.(o.strokeStyle);
        if (o.enableEditing === true) r.enableEditing?.();
        else if (o.enableEditing === false && ov.type !== 'circle' && ov.type !== 'rectangle') r.disableEditing?.();
        if (typeof o.fillColor === 'string') r.setFillColor?.(o.fillColor);
        if (typeof o.fillOpacity === 'number') r.setFillOpacity?.(o.fillOpacity);
        // Prism 专属：顶面/侧面填充分开设置，空字符串表示无填充，所以用 typeof 判断而非真值判断
        if (typeof o.topFillColor === 'string') r.setTopFillColor?.(o.topFillColor);
        if (typeof o.topFillOpacity === 'number') r.setTopFillOpacity?.(o.topFillOpacity);
        if (typeof o.sideFillColor === 'string') r.setSideFillColor?.(o.sideFillColor);
        if (typeof o.sideFillOpacity === 'number') r.setSideFillOpacity?.(o.sideFillOpacity);
        if (typeof o.radius === 'number' && ov.type === 'circle') r.setRadius?.(o.radius);
        if (o.bounds && (ov.type === 'rectangle' || ov.type === 'groundOverlay')) r.setBounds?.(toRawBounds(rawSDK, o.bounds as Bounds));
        if (o.controlPoints && ov.type === 'bezierCurve') r.setControlPoints?.(toRawPointGroups(rawSDK, o.controlPoints as Point[][]));
        if (typeof o.altitude === 'number' && ov.type === 'prism') r.setAltitude?.(o.altitude);
        // GroundOverlay / GroundPoint 共有（按 type 收窄，避免命中其他同名属性）。
        // url 为 canvas 元素时没有对应 setter（SDK 的 setImage 只接受地址），
        // canvas 场景本来就应保持同一元素、靠 isReDraw + drawHook 每帧重采集内容，所以只处理字符串。
        // setImage 是 @since 4.0；v3 上为 undefined，此时靠 imageURL → setImageURL 生效。
        if (ov.type === 'groundOverlay' || ov.type === 'groundPoint') {
          if (typeof o.url === 'string') r.setImage?.(o.url);
          if (typeof o.imageURL === 'string') r.setImageURL?.(o.imageURL);
          if (typeof o.displayOnMinLevel === 'number') r.setDisplayOnMinLevel?.(o.displayOnMinLevel);
          if (typeof o.displayOnMaxLevel === 'number') r.setDisplayOnMaxLevel?.(o.displayOnMaxLevel);
        }
        // GroundPoint 专属 setter：size/scale。anchor 是 Size（与 Marker 的 number 枚举不同）。
        if (ov.type === 'groundPoint') {
          if (o.size && typeof o.size === 'object') r.setSize?.(toRawSize(rawSDK, o.size as Size));
          if (typeof o.scale === 'number') r.setScale?.(o.scale);
        }
        // PointCollection 专属：SDK 没有 setColor/setShape/setSize，只有 setStyles(opts) 批量设置。
        // shape/color/size 任一变化时收集当前值整体传给 setStyles。
        if (ov.type === 'pointCollection') {
          const styles: Record<string, unknown> = {};
          if (o.shape !== undefined) styles.shape = o.shape;
          if (typeof o.color === 'string') styles.color = o.color;
          if (o.size !== undefined) styles.size = o.size;
          if (Object.keys(styles).length > 0) r.setStyles?.(styles);
        }
        // rotation=0 是 SDK 默认值，主动调 setRotation(0) 会让 v3.0 默认 marker 进入 rotation 模式，
        // 导致命中区域塌缩成锚点。Marker 只在非 0 时才调用；GroundPoint 的 rotation 安全可设 0。
        if (typeof o.rotation === 'number' && (ov.type === 'groundPoint' || o.rotation !== 0)) r.setRotation?.(o.rotation);
        if (typeof o.title === 'string') r.setTitle?.(o.title);
        if (typeof o.content === 'string') r.setContent?.(o.content);
        // Label 专属
        if (o.styles && typeof o.styles === 'object') r.setStyles?.(o.styles);
        if (typeof o.opacity === 'number') r.setOpacity?.(o.opacity);
        if (o.icon !== undefined) r.setIcon?.(toRawIcon(rawSDK, o.icon));
        // Marker/Label 的 anchor 是 ControlAnchor 枚举（number）；GroundPoint 的 anchor 是 Size
        if (typeof o.anchor === 'number') r.setAnchor?.(o.anchor);
        else if (o.anchor && typeof o.anchor === 'object' && ov.type === 'groundPoint') r.setAnchor?.(toRawSize(rawSDK, o.anchor as Size));
        // SDK Marker 默认不可拖拽，必须主动调 enable/disable 控制。
        // undefined 时不干预（用 SDK 默认行为，即不可拖拽）。
        if (o.enableDragging === true) r.enableDragging?.();
        else if (o.enableDragging === false) r.disableDragging?.();
        if (o.enableMassClear === true) r.enableMassClear?.();
        else if (o.enableMassClear === false) r.disableMassClear?.();
        if (typeof o.zIndex === 'number') r.setZIndex?.(o.zIndex);
        if (o.offset) r.setOffset?.(toRawSize(rawSDK, o.offset));
      } catch { /* ignore */ }
    },

    // ─────────────── 27b. Overlay 可见性 / PlaceDetail ───────────────
    showOverlay: (ov) => { try { rawOf(ov).show?.(); } catch { /* ignore */ } },
    hideOverlay: (ov) => { try { rawOf(ov).hide?.(); } catch { /* ignore */ } },
    openPlaceDetail: (marker, pd) => callRaw('Marker.openPlaceDetail', () => rawOf(marker).openPlaceDetail?.(rawOf(pd))),
    closePlaceDetail: (marker) => { try { rawOf(marker).closePlaceDetail?.(); } catch { /* ignore */ } },

    // ─────────────── 28. Control 工厂 ───────────────
    createNavigationControl: (o) => createControlFactory('NavigationControl', () => new rawSDK.NavigationControl(o), 'navigation'),
    createNavigationControl3D: (o) => createControlFactory('NavigationControl3D', () => new rawSDK.NavigationControl3D(o), 'navigation3D'),
    createScaleControl: (o) => createControlFactory('ScaleControl', () => new rawSDK.ScaleControl(o), 'scale'),
    createOverviewMapControl: (o) => createControlFactory('OverviewMapControl', () => new rawSDK.OverviewMapControl(o), 'overview'),
    createMapTypeControl: (o) => createControlFactory('MapTypeControl', () => new rawSDK.MapTypeControl(o), 'mapType'),
    createCopyrightControl: (o) => createControlFactory('CopyrightControl', () => new rawSDK.CopyrightControl(o), 'copyright'),
    createGeolocationControl: (o) => createControlFactory('GeolocationControl', () => new rawSDK.GeolocationControl(o), 'geolocation'),
    createPanoramaControl: (o) => createControlFactory('PanoramaControl', () => new rawSDK.PanoramaControl(o), 'panorama'),
    createZoomControl: (o) => createControlFactory('ZoomControl', () => new rawSDK.ZoomControl(o), 'zoom'),
    createCityListControl: (o) => createControlFactory('CityListControl', () => new rawSDK.CityListControl(o), 'cityList'),
    createLocationControl: (o) => createControlFactory('LocationControl', () => new rawSDK.LocationControl(o), 'location'),
    createLogoControl: (o) => createControlFactory('LogoControl', () => new rawSDK.LogoControl(o), 'logo'),
    createControl: (o) => createControlFactory('Control', () => { const c = new rawSDK.Control(); Object.assign(c, o); return c; }, 'custom'),

    // ─────────────── 29. Layer 工厂 ───────────────
    createTileLayer: (o) => createLayerFactory('TileLayer', () => new rawSDK.TileLayer(o), 'tile'),
    createNormalLayer: (o) => createLayerFactory('NormalLayer', () => new rawSDK.NormalLayer(o), 'normal'),
    createGeoJSONLayer: (o) => createLayerFactory('GeoJSONLayer', () => new rawSDK.GeoJSONLayer(o), 'geojson'),
    createDistrictLayer: (o) => createLayerFactory('DistrictLayer', () => new rawSDK.DistrictLayer(o), 'district'),
    createTrafficLayer: (o) => createLayerFactory('TrafficLayer', () => new rawSDK.TrafficLayer(o), 'traffic'),
    createCustomLayer: (o) => createLayerFactory('CustomLayer', () => new rawSDK.CustomLayer(o), 'custom'),
    createCanvasLayer: (o) => createLayerFactory('CanvasLayer', () => new rawSDK.CanvasLayer(o), 'canvas'),

    // 高级图层（4.0+）
    createRasterTileLayer: (o) => createLayerFactory('RasterTileLayer', () => new rawSDK.RasterTileLayer(o), 'tile'),
    createWMSLayer: (o) => createLayerFactory('WMSLayer', () => new rawSDK.WMSLayer(o), 'tile'),
    createWMTSLayer: (o) => createLayerFactory('WMTSLayer', () => new rawSDK.WMTSLayer(o), 'tile'),
    createXYZLayer: (o) => createLayerFactory('XYZLayer', () => new rawSDK.XYZLayer(o), 'tile'),
    createMVTLayer: (o) => createLayerFactory('MVTLayer', () => new rawSDK.MVTLayer(o), 'tile'),
    createFeatureLayer: (o) => createLayerFactory('FeatureLayer', () => new rawSDK.FeatureLayer(o), 'custom'),
    createFillLayer: (o) => createLayerFactory('FillLayer', () => new rawSDK.FillLayer(o), 'custom'),
    createDOMLayer: (o) => createLayerFactory('DOMLayer', () => new rawSDK.DOMLayer(o), 'custom'),
    createPointIconLayer: (o) => createLayerFactory('PointIconLayer', () => new rawSDK.PointIconLayer(o), 'custom'),
    createPointShapeLayer: (o) => createLayerFactory('PointShapeLayer', () => new rawSDK.PointShapeLayer(o), 'custom'),
    createPanoramaCoverageLayer: (o) => createLayerFactory('PanoramaCoverageLayer', () => new rawSDK.PanoramaCoverageLayer(o), 'custom'),

    // ─────────────── 30. ContextMenu ───────────────
    createContextMenu: (o) => createOverlayFactory('ContextMenu', () => new rawSDK.ContextMenu(o), 'contextMenu'),
    createMenuItem: (text, cb, o) => createOverlayFactory('MenuItem', () => new rawSDK.MenuItem(text, cb, o), 'menuItem'),
    addMenuItem: (menu, item, idx) => { try { rawOf(menu).addItem?.(rawOf(item), idx); } catch { /* ignore */ } },
    removeMenuItem: (menu, item) => { try { rawOf(menu).removeItem?.(rawOf(item)); } catch { /* ignore */ } },

    // ─────────────── 31. Panorama ───────────────
    createPanorama: (container, o) => {
      if (!capabilities.has('Panorama')) { reportUnsupported('Panorama', version, behavior); return null; }
      try { return mapHandle(new rawSDK.Panorama(container, o)); }
      catch { reportUnsupported('Panorama', version, behavior); return null; }
    },
    createPanoramaLabel: (o) => createOverlayFactory('PanoramaLabel', () => new rawSDK.PanoramaLabel(o), 'panoramaLabel'),
    destroyPanorama: (handle) => { try { rawOf(handle).destroy?.(); } catch { /* ignore */ } },

    // ─────────────── 32. 服务工厂 ───────────────
    createLocalSearch: (loc, o) => createServiceFactory('LocalSearch', () => new rawSDK.LocalSearch(loc && (loc as any).__brand ? (loc as any).raw : loc, o)),
    createGeocoder: () => createServiceFactory('Geocoder', () => new rawSDK.Geocoder()),
    createDrivingRoute: (o) => createServiceFactory('DrivingRoute', () => new rawSDK.DrivingRoute((o as any)?.location, o)),
    createWalkingRoute: (o) => createServiceFactory('WalkingRoute', () => new rawSDK.WalkingRoute((o as any)?.location, o)),
    createRidingRoute: (o) => createServiceFactory('RidingRoute', () => new rawSDK.RidingRoute((o as any)?.location, o)),
    createTransitRoute: (o) => createServiceFactory('TransitRoute', () => new rawSDK.TransitRoute((o as any)?.location, o)),
    createBusLineSearch: (o) => createServiceFactory('BusLineSearch', () => new rawSDK.BusLineSearch((o as any)?.map, o)),
    createAutocomplete: (o) => createServiceFactory('Autocomplete', () => new rawSDK.Autocomplete(o)),
    createBoundary: () => createServiceFactory('Boundary', () => new rawSDK.Boundary()),
    createGeolocation: (o) => createServiceFactory('Geolocation', () => new rawSDK.Geolocation(o)),
    createLocalCity: (o) => createServiceFactory('LocalCity', () => new rawSDK.LocalCity(o)),
    createPlaceDetail: (o) => createServiceFactory('PlaceDetail', () => new rawSDK.PlaceDetail((o as any)?.container ?? document.createElement('div'), o)),
    createConvertor: () => createServiceFactory('Convertor', () => new rawSDK.Convertor()),
    createPanoramaService: () => createServiceFactory('PanoramaService', () => new rawSDK.PanoramaService()),

    searchService(service, query, callbacks) {
      const raw = rawOf(service);
      if (!raw) return () => {};
      let cancelled = false;
      const safeCb = <T,>(fn?: (data: T) => void) => (data: T) => { if (!cancelled) fn?.(data); };
      if (typeof raw.setSearchCompleteCallback === 'function') raw.setSearchCompleteCallback(safeCb(callbacks.onSuccess));
      else if (typeof raw.setSearchComplete === 'function') raw.setSearchComplete(safeCb(callbacks.onSuccess));
      try { raw.search?.(query); } catch (err) { (safeCb(callbacks.onError as any))(err as Error); }
      return () => { cancelled = true; };
    },
    getServiceResults(service) {
      const raw = rawOf(service);
      if (!raw || typeof raw.getResults !== 'function') return null;
      return raw.getResults();
    },

    // ─────────────── 33. 事件 ───────────────
    addEventListener(target, type, handler) {
      const raw = rawOf(target);
      raw.addEventListener?.(type, handler);
      return () => raw.removeEventListener?.(type, handler);
    },
    removeEventListener(target, type, handler) {
      rawOf(target).removeEventListener?.(type, handler);
    },
  };
}

function inferOverlayType(raw: any): string {
  return (raw?.constructor?.name ?? 'unknown').toLowerCase();
}
