import type { UnsupportedBehavior } from '../types';
import type { OverlayHandle } from '../types';
import type { BMapDriver } from './types';
import type { Point } from '../types';
import { CAPABILITY_MATRIX } from './capabilityMatrix';
import { createV4Driver } from './v4Driver';
import { reportCallFailure, reportUnsupported, unsupportedValue } from './unsupported';
import { getSDK } from '../utils/sdk';

/**
 * v3 Driver — 3.0 适配。
 * - 复用 v4 driver 的通用骨架
 * - 3.0-only 方法真实实现
 * - 4.0-only 方法走 unsupported
 * - capabilities 用 v3 矩阵（与 v4 区分）
 */
export function createV3Driver(rawSDK: any, opts: { unsupportedBehavior: UnsupportedBehavior }): BMapDriver {
  const behavior = opts.unsupportedBehavior;
  const version = '3.0' as const;

  // version 传给 base：v4Driver 内部日志文案要说 "JSAPI 3.0"，否则 v3 会话里全打成 4.0
  const base = createV4Driver(rawSDK, { ...opts, version });

  const v3Only: Partial<BMapDriver> = {
    // 3.0-only Map 命令真实实现
    enableMapClick: (map) => { (map.raw as any).enableMapClick?.(); },
    disableMapClick: (map) => { (map.raw as any).disableMapClick?.(); },
    enable3DBuilding: (map) => { try { (map.raw as any).enable3DBuilding?.(); } catch { /* BuildingLayer may not be defined */ } },
    disable3DBuilding: (map) => { try { (map.raw as any).disable3DBuilding?.(); } catch { /* BuildingLayer may not be defined */ } },
    setPanorama: (map, pano) => { try { if (pano) (map.raw as any).setPanorama?.(pano); } catch { /* ignore */ } },
    getPanorama: (map) => (map.raw as any).getPanorama?.() ?? null,
    setCurrentCity: (map, city) => { (map.raw as any).setCurrentCity?.(city); },
    highResolutionEnabled: (map) => (map.raw as any).highResolutionEnabled?.() ?? false,
    addHotspot: (map, h) => { try { if (h?.raw) (map.raw as any).addHotspot?.(h.raw); } catch { /* ignore */ } },
    removeHotspot: (map, h) => { (map.raw as any).removeHotspot?.(h.raw); },
    clearHotspots: (map) => { (map.raw as any).clearHotspots?.(); },

    // v3 的 setMapType 直接调用原生方法。
    // 3.0 的 map.mapType 存的是 MapType 实例，内部用 === 比较（this.mapType === mapType），
    // 不是字符串比较；react-bmap 的 BMAP_NORMAL_MAP/BMAP_SATELLITE_MAP/BMAP_HYBRID_MAP
    // 常量统一导出字符串（供 4.0/GL 使用，见 v4Driver 的 normalizeMapTypeRequest 逻辑），
    // 3.0 收到字符串会跟内部 MapType 实例永远不相等，视觉上"看起来生效但内部状态错了"。
    // 这里把三个约定字符串换成 3.0 SDK 挂在全局 window 上的真实 MapType 实例（反查
    // jsapi-core-3-0/src/scripts/bmap/exports.js:147-152 的 exportSymbol(window, {...})
    // 确认挂载位置是 window 顶层，不是 window.BMap 上）。
    setMapType: (map, t) => {
      const raw = map.raw as any;
      if (typeof window !== 'undefined') {
        const w = window as any;
        if (t === 'B_NORMAL_MAP') t = w.BMAP_NORMAL_MAP ?? t;
        else if (t === 'B_SATELLITE_MAP') t = w.BMAP_SATELLITE_MAP ?? t;
        else if (t === 'B_STREET_MAP') t = w.BMAP_HYBRID_MAP ?? t;
      }
      raw.setMapType?.(t);
    },

    // 3.0 的自定义控件：不复用 v4Driver 的 ES6 class extends 实现——3.0 的 Control
    // 用 baidu.lang.inherits(subClass, superClass) 构建原型链（反查
    // jsapi-core-3-0/lib/tangram.js:1282-1299 确认，只是把 superClass.prototype 塞进
    // 一个空函数的 prototype 再 new 出来，subClass.prototype 上的自身属性逐个拷贝过去，
    // 不走标准的 constructor 调用链），跟 ES6 class 语义不完全兼容，直接 extends 容易在
    // 字段初始化时序上出问题。这里改用 Object.create 手动搭原型链，贴近 3.0 自身写法：
    // new 一个空构造函数、prototype 指向 Control.prototype，再显式调用 Control.call(inst)
    // 跑一遍构造函数体（对照 Control.js:15-42，设置 _map/_container/_type 等字段）。
    createCustomControl: (domCreate, o) => {
      try {
        // 不依赖 v4Driver 内部私有的 toRawControlOptions（其逻辑覆盖 4.0-only 字段，
        // 3.0 自定义控件只需要 anchor/offset），自己取这两个字段。
        const raw = (o ?? {}) as Record<string, unknown>;
        const anchor = raw.anchor;
        const offsetRaw = raw.offset as { width: number; height: number } | undefined;
        const ControlCtor = rawSDK.Control as new () => any;
        const SizeCtor = rawSDK.Size as new (w: number, h: number) => unknown;
        const offset = offsetRaw ? new SizeCtor(offsetRaw.width, offsetRaw.height) : undefined;

        const proto = Object.create(ControlCtor.prototype);
        proto.initialize = function (map: any) {
          const container = map?.container ?? map?.getContainer?.();
          if (!container) return undefined;
          const div = domCreate();
          container.appendChild(div);
          // 必须先赋 _container、再调用 setAnchor()/setOffset() 让 SDK 自身方法完成
          // 校验 + DOM 定位；手动摸 this._opts 内部结构会导致 anchor 值不生效
          // （_setPosition 最终读到的值不对，实测确认过）。
          this._container = div;
          this.setAnchor(anchor);
          if (offset !== undefined) this.setOffset(offset);
          return div;
        };
        // defaultAnchor/defaultOffset：3.0 的 setAnchor/setOffset 内部用
        // `this._opts.offset || this["defaultOffset"]` 兜底，不设置的话在没传
        // offset 时会读 undefined.width 报错（对照 Control.js:150/157）。
        proto.defaultAnchor = 0; // BMAP_ANCHOR_TOP_LEFT
        proto.defaultOffset = new SizeCtor(0, 0);

        const instance = Object.create(proto);
        ControlCtor.call(instance);
        return { __brand: 'ControlHandle' as const, raw: instance, type: 'custom' };
      } catch (e) {
        reportCallFailure('Control', version, behavior, e);
        return null;
      }
    },

    // Hotspot 是 v3-only，v4Driver 的 createOverlayFactory 闭包捕获了 v4 能力矩阵
    // （Hotspot 不在 v4 矩阵中），所以必须在这里直接创建，绕过能力检查
    createHotspot: (p, o) => {
      try {
        const raw = o as Record<string, unknown>;
        const ctorOpts: Record<string, unknown> = {};
        if (typeof raw?.text === 'string') ctorOpts.text = raw.text;
        if (Array.isArray(raw?.offsets)) ctorOpts.offsets = raw.offsets;
        if (raw?.userData !== undefined) ctorOpts.userData = raw.userData;
        if (typeof raw?.minZoom === 'number') ctorOpts.minZoom = raw.minZoom;
        if (typeof raw?.maxZoom === 'number') ctorOpts.maxZoom = raw.maxZoom;
        const hasOpts = Object.keys(ctorOpts).length > 0;
        const point = new rawSDK.Point((p as Point).lng, (p as Point).lat);
        const inst = hasOpts ? new rawSDK.Hotspot(point, ctorOpts) : new rawSDK.Hotspot(point);
        return { __brand: 'OverlayHandle', raw: inst, type: 'hotspot' } as OverlayHandle;
      } catch (e) { reportCallFailure('Hotspot', version, behavior, e); return null; }
    },

    // PointCollection 同理：@removed 4.0，在 v4 矩阵中不存在，闭包检查会 block
    createPointCollection: (p, o) => {
      try {
        const raw = o as Record<string, unknown>;
        const ctorOpts: Record<string, unknown> = {};
        if (raw?.shape !== undefined) ctorOpts.shape = raw.shape;
        if (typeof raw?.color === 'string') ctorOpts.color = raw.color;
        if (typeof raw?.size === 'number') ctorOpts.size = raw.size;
        const hasOpts = Object.keys(ctorOpts).length > 0;
        const points = (p as Point[]).map(pt => new rawSDK.Point(pt.lng, pt.lat));
        const inst = hasOpts ? new rawSDK.PointCollection(points, ctorOpts) : new rawSDK.PointCollection(points);
        return { __brand: 'OverlayHandle', raw: inst, type: 'pointCollection' } as OverlayHandle;
      } catch (e) { reportCallFailure('PointCollection', version, behavior, e); return null; }
    },

    // 3.0 的 setMapStyle 和 setMapStyleV2 均可用
    setMapStyle: (map, options) => { (map.raw as any).setMapStyle?.(options); },
    setMapStyleV2: (map, options) => { (map.raw as any).setMapStyleV2?.(options); },

    // 3.0 坐标转换
    lnglatToMercator: (map, lng, lat) => {
      try {
        const MP = rawSDK?.MercatorProjection;
        if (MP) {
          const proj = new MP();
          if (typeof proj.lngLatToMercator === 'function') {
            const r = proj.lngLatToMercator(new rawSDK.Point(lng, lat));
            if (r) return [r.lng ?? r.x, r.lat ?? r.y] as [number, number];
          }
        }
        const m = map.raw as any;
        if (typeof m.lnglatToMercator === 'function') {
          const r = m.lnglatToMercator(lng, lat);
          if (r) return [r.lng ?? r.x, r.lat ?? r.y] as [number, number];
        }
      } catch { /* ignore */ }
      return [NaN, NaN] as [number, number];
    },
    mercatorToLnglat: (map, x, y) => {
      try {
        const MP = rawSDK?.MercatorProjection;
        if (MP) {
          const proj = new MP();
          if (typeof proj.mercatorToLngLat === 'function') {
            const r = proj.mercatorToLngLat({ x, y });
            if (r) return [r.lng ?? r.x, r.lat ?? r.y] as [number, number];
          }
        }
        const m = map.raw as any;
        if (typeof m.mercatorToLnglat === 'function') {
          const r = m.mercatorToLnglat(x, y);
          if (r) return [r.lng ?? r.x, r.lat ?? r.y] as [number, number];
        }
      } catch { /* ignore */ }
      return [NaN, NaN] as [number, number];
    },

    // 3.0 信息窗口通过 map.openInfoWindow
    openInfoWindow: (target, iw, point) => {
      const t = (target as any).raw;
      if (typeof t.openInfoWindow === 'function') {
        const SDK = getSDK();
        const pt = point && new SDK.Point(point.lng, point.lat);
        t.openInfoWindow((iw as any).raw, pt);
      }
    },

    // 4.0+ 全部走 unsupported（命令 noop，getter 返回兜底）
    flyTo: () => reportUnsupported('Map.flyTo', version, behavior),
    setHeading: () => reportUnsupported('Map.setHeading', version, behavior),
    getHeading: () => unsupportedValue('Map.getHeading', version, behavior, NaN),
    setTilt: () => reportUnsupported('Map.setTilt', version, behavior),
    getTilt: () => unsupportedValue('Map.getTilt', version, behavior, NaN),
    getCurrentMaxTilt: () => unsupportedValue('Map.getCurrentMaxTilt', version, behavior, NaN),
    startViewAnimation: () => unsupportedValue('Map.startViewAnimation', version, behavior, 0),
    pauseViewAnimation: () => reportUnsupported('Map.pauseViewAnimation', version, behavior),
    continueViewAnimation: () => reportUnsupported('Map.continueViewAnimation', version, behavior),
    cancelViewAnimation: () => reportUnsupported('Map.cancelViewAnimation', version, behavior),
    setDisplayOptions: () => reportUnsupported('Map.setDisplayOptions', version, behavior),
    setOptions: () => reportUnsupported('Map.setOptions', version, behavior),
    restrictBounds: () => reportUnsupported('Map.restrictBounds', version, behavior),
    enableRotate: () => reportUnsupported('Map.enableRotate', version, behavior),
    disableRotate: () => reportUnsupported('Map.disableRotate', version, behavior),
    enableRotateGestures: () => reportUnsupported('Map.enableRotateGestures', version, behavior),
    disableRotateGestures: () => reportUnsupported('Map.disableRotateGestures', version, behavior),
    enableTilt: () => reportUnsupported('Map.enableTilt', version, behavior),
    disableTilt: () => reportUnsupported('Map.disableTilt', version, behavior),
    enableTiltGestures: () => reportUnsupported('Map.enableTiltGestures', version, behavior),
    disableTiltGestures: () => reportUnsupported('Map.disableTiltGestures', version, behavior),
    enableResizeOnCenter: () => reportUnsupported('Map.enableResizeOnCenter', version, behavior),
    disableResizeOnCenter: () => reportUnsupported('Map.disableResizeOnCenter', version, behavior),
    // 3.0 没有独立的 enableIconInfoWindow API，但 enableMapClick 内部会异步加载
    // mapclick 模块（对照 jsapi-core-3-0/src/scripts/bmap/services/Mapclick/
    // Mapclick_Impl.js:441-475），点击底图标注时本身就会创建 InfoWindow 并弹出，
    // 所以转发到 enableMapClick/disableMapClick 后效果与 4.0 基本等价（点击可点、
    // 自动弹窗），不是能力降级。
    enableIconInfoWindow: (map) => { (map.raw as any).enableMapClick?.(); },
    disableIconInfoWindow: (map) => { (map.raw as any).disableMapClick?.(); },
    setTheme: () => reportUnsupported('Map.setTheme', version, behavior),
    getMapTypeId: () => unsupportedValue('Map.getMapTypeId', version, behavior, ''),
    getMapCoordType: () => unsupportedValue('Map.getMapCoordType', version, behavior, ''),
    getMapStyleId: () => unsupportedValue('Map.getMapStyleId', version, behavior, ''),
    getAreaStyleId: () => unsupportedValue('Map.getAreaStyleId', version, behavior, ''),
    getRenderType: () => unsupportedValue('Map.getRenderType', version, behavior, ''),
    isCanvasMap: () => unsupportedValue('Map.isCanvasMap', version, behavior, false),
    getContainerSize: (map) => (map.raw as any).getContainerSize?.() ?? (map.raw as any).getSize(),
    getZoomUnits: () => unsupportedValue('Map.getZoomUnits', version, behavior, NaN),
    isLoaded: (map) => (typeof (map.raw as any).isLoaded === 'function' ? (map.raw as any).isLoaded() : true),
    getCoordType: (map) => (typeof (map.raw as any).getCoordType === 'function' ? (map.raw as any).getCoordType() : ''),
    getProjection: (map) => (map.raw as any).getProjection?.() ?? null,
    getSolarInfo: () => unsupportedValue('Map.getSolarInfo', version, behavior, null),
    getTileId: () => unsupportedValue('Map.getTileId', version, behavior, ''),
    getPoiByUid: () => reportUnsupported('Map.getPoiByUid', version, behavior),
    setLock: () => reportUnsupported('Map.setLock', version, behavior),
    setPrivateRegions: () => reportUnsupported('Map.setPrivateRegions', version, behavior),
    getPrivateRegions: () => unsupportedValue('Map.getPrivateRegions', version, behavior, []),
    setPrivateStatus: () => reportUnsupported('Map.setPrivateStatus', version, behavior),
    getPrivateStatus: () => unsupportedValue('Map.getPrivateStatus', version, behavior, false),
    setCustomArea: () => reportUnsupported('Map.setCustomArea', version, behavior),
    addFocusMask: () => reportUnsupported('Map.addFocusMask', version, behavior),
    removeFocusMask: () => reportUnsupported('Map.removeFocusMask', version, behavior),
    clearFocusMasks: () => reportUnsupported('Map.clearFocusMasks', version, behavior),
    addCustomHtmlLayer: () => reportUnsupported('Map.addCustomHtmlLayer', version, behavior),
    removeCustomHtmlLayer: () => reportUnsupported('Map.removeCustomHtmlLayer', version, behavior),
    addParkingSpot: () => reportUnsupported('Map.addParkingSpot', version, behavior),
    removeParkingSpot: () => reportUnsupported('Map.removeParkingSpot', version, behavior),
    isSupportEarth: () => unsupportedValue('Map.isSupportEarth', version, behavior, false),
    getEarth: () => unsupportedValue('Map.getEarth', version, behavior, null),
    showEarthBoundary: () => reportUnsupported('Map.showEarthBoundary', version, behavior),
    hideEarthBoundary: () => reportUnsupported('Map.hideEarthBoundary', version, behavior),
    setEarthMaxZoom: () => reportUnsupported('Map.setEarthMaxZoom', version, behavior),
    setEarthMinZoom: () => reportUnsupported('Map.setEarthMinZoom', version, behavior),
    showIndoor: () => reportUnsupported('Map.showIndoor', version, behavior),
    setIndoor: () => reportUnsupported('Map.setIndoor', version, behavior),
    getIndoorInfo: () => unsupportedValue('Map.getIndoorInfo', version, behavior, null),
    showStreetLayer: () => reportUnsupported('Map.showStreetLayer', version, behavior),
    hideStreetLayer: () => reportUnsupported('Map.hideStreetLayer', version, behavior),
    isStreetLayerShow: () => unsupportedValue('Map.isStreetLayerShow', version, behavior, false),
    showVectorStreetLayer: () => reportUnsupported('Map.showVectorStreetLayer', version, behavior),
    hideVectorStreetLayer: () => reportUnsupported('Map.hideVectorStreetLayer', version, behavior),
    getLanguage: () => unsupportedValue('Map.getLanguage', version, behavior, ''),
    changeLanguage: () => reportUnsupported('Map.changeLanguage', version, behavior),
    enablePreferredLanguage: () => reportUnsupported('Map.enablePreferredLanguage', version, behavior),
    disablePreferredLanguage: () => reportUnsupported('Map.disablePreferredLanguage', version, behavior),
    addSpots: () => unsupportedValue('Map.addSpots', version, behavior, ''),
    getSpots: () => unsupportedValue('Map.getSpots', version, behavior, []),
    removeSpots: () => reportUnsupported('Map.removeSpots', version, behavior),
    clearSpots: () => reportUnsupported('Map.clearSpots', version, behavior),
    resetSpotStatus: () => reportUnsupported('Map.resetSpotStatus', version, behavior),
    hightlightSpotByUid: () => reportUnsupported('Map.hightlightSpotByUid', version, behavior),
    addAreaSpot: () => unsupportedValue('Map.addAreaSpot', version, behavior, ''),
    getAreaSpot: () => unsupportedValue('Map.getAreaSpot', version, behavior, []),
    removeAreaSpot: () => reportUnsupported('Map.removeAreaSpot', version, behavior),
    clearAreaSpots: () => reportUnsupported('Map.clearAreaSpots', version, behavior),
    clearLabels: () => reportUnsupported('Map.clearLabels', version, behavior),
    addMapLabels: () => unsupportedValue('Map.addMapLabels', version, behavior, []),
    removeMapLabels: () => reportUnsupported('Map.removeMapLabels', version, behavior),
    getIconByClickPosition: () => unsupportedValue('Map.getIconByClickPosition', version, behavior, null),
    setBounds: () => reportUnsupported('Map.setBounds', version, behavior),
    getScreenshot: () => unsupportedValue('Map.getScreenshot', version, behavior, ''),
    setCopyrightOffset: () => reportUnsupported('Map.setCopyrightOffset', version, behavior),
    setOverlayMoveCursor: () => reportUnsupported('Map.setOverlayMoveCursor', version, behavior),
    addNormalLayer: () => reportUnsupported('Map.addNormalLayer', version, behavior),
    removeNormalLayer: () => reportUnsupported('Map.removeNormalLayer', version, behavior),
    addGeoJSONLayer: () => reportUnsupported('Map.addGeoJSONLayer', version, behavior),
    removeGeoJSONLayer: () => reportUnsupported('Map.removeGeoJSONLayer', version, behavior),
    addDistrictLayer: () => reportUnsupported('Map.addDistrictLayer', version, behavior),
    removeDistrictLayer: () => reportUnsupported('Map.removeDistrictLayer', version, behavior),
    setTrafficOn: () => reportUnsupported('Map.setTrafficOn', version, behavior),
    setTrafficOff: () => reportUnsupported('Map.setTrafficOff', version, behavior),
    addLayer: (map, l) => {
      const raw = (l as any).raw;
      const kind = (l as any).kind;
      // 瓦片类图层走 addTileLayer；CanvasLayer/CustomLayer 等走 addOverlay
      if (kind === 'tile' || typeof raw?.getTilesUrl === 'function') {
        (map.raw as any).addTileLayer?.(raw);
      } else {
        (map.raw as any).addOverlay?.(raw);
      }
    },
    removeLayer: (map, l) => {
      const raw = (l as any).raw;
      const kind = (l as any).kind;
      if (kind === 'tile' || typeof raw?.getTilesUrl === 'function') {
        (map.raw as any).removeTileLayer?.(raw);
      } else {
        (map.raw as any).removeOverlay?.(raw);
      }
    },
    showOverlayContainer: () => reportUnsupported('Map.showOverlayContainer', version, behavior),
    hideOverlayContainer: () => reportUnsupported('Map.hideOverlayContainer', version, behavior),

    // 4.0+ 服务在 v3 不支持（工厂返回 isNull: true）
    createPlaceDetail: () => ({ __brand: 'ServiceHandle' as const, raw: null, isNull: true }),

    // 4.0+ 类不存在 → null
    createNavigationControl3D: () => { reportUnsupported('NavigationControl3D', version, behavior); return null; },
    createZoomControl: () => { reportUnsupported('ZoomControl', version, behavior); return null; },
    createLogoControl: () => { reportUnsupported('LogoControl', version, behavior); return null; },
    createRectangle: () => { reportUnsupported('Rectangle', version, behavior); return null; },
    createBezierCurve: () => { reportUnsupported('BezierCurve', version, behavior); return null; },
    createPrism: () => { reportUnsupported('Prism', version, behavior); return null; },
    createGroundPoint: () => { reportUnsupported('GroundPoint', version, behavior); return null; },
    createCustomOverlay: () => { reportUnsupported('CustomOverlay', version, behavior); return null; },
    createMarker3D: () => { reportUnsupported('Marker3D', version, behavior); return null; },
    openSimpleInfoWindow: () => reportUnsupported('Map.openSimpleInfoWindow', version, behavior),
    closeSimpleInfoWindow: () => reportUnsupported('Map.closeSimpleInfoWindow', version, behavior),
    createNormalLayer: () => { reportUnsupported('NormalLayer', version, behavior); return null; },
    createGeoJSONLayer: () => { reportUnsupported('GeoJSONLayer', version, behavior); return null; },
    createDistrictLayer: () => { reportUnsupported('DistrictLayer', version, behavior); return null; },
    // 4.0+ 高级图层在 v3 不支持
    createRasterTileLayer: () => { reportUnsupported('RasterTileLayer', version, behavior); return null; },
    createWMSLayer: () => { reportUnsupported('WMSLayer', version, behavior); return null; },
    createWMTSLayer: () => { reportUnsupported('WMTSLayer', version, behavior); return null; },
    createXYZLayer: () => { reportUnsupported('XYZLayer', version, behavior); return null; },
    createMVTLayer: () => { reportUnsupported('MVTLayer', version, behavior); return null; },
    createFeatureLayer: () => { reportUnsupported('FeatureLayer', version, behavior); return null; },
    createFillLayer: () => { reportUnsupported('FillLayer', version, behavior); return null; },
    createDOMLayer: () => { reportUnsupported('DOMLayer', version, behavior); return null; },
    createPointIconLayer: () => { reportUnsupported('PointIconLayer', version, behavior); return null; },
    createPointShapeLayer: () => { reportUnsupported('PointShapeLayer', version, behavior); return null; },
    // PanoramaCoverageLayer：v3 SDK 也导出该类（publish.js:81），走 base 的真实实现
    // v3-only 图层在 v3 直接创建（v4 capability 闭包不包含这些类）
    createCustomLayer: (o) => {
      try { return { __brand: 'LayerHandle' as const, raw: new rawSDK.CustomLayer(o), kind: 'custom' } as any; }
      catch (e) { reportCallFailure('CustomLayer', version, behavior, e); return null; }
    },
    createCanvasLayer: (o) => {
      try { return { __brand: 'LayerHandle' as const, raw: new rawSDK.CanvasLayer(o), kind: 'canvas' } as any; }
      catch (e) { reportCallFailure('CanvasLayer', version, behavior, e); return null; }
    },
  };

  return {
    ...base,
    ...v3Only,
    version,
    capabilities: CAPABILITY_MATRIX['3.0'],
  };
}
