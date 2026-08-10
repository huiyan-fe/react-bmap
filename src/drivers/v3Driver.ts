import type { UnsupportedBehavior } from '../types';
import type { OverlayHandle } from '../types';
import type { BMapDriver } from './types';
import type { Point } from '../types';
import { CAPABILITY_MATRIX } from './capabilityMatrix';
import { createV4Driver } from './v4Driver';
import { reportUnsupported, unsupportedValue } from './unsupported';

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

  const base = createV4Driver(rawSDK, opts);

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

    // v3 的 setMapType 直接调用原生方法
    setMapType: (map, t) => { (map.raw as any).setMapType?.(t); },

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
      } catch (e) { reportUnsupported('Hotspot', version, behavior, e); return null; }
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
      } catch (e) { reportUnsupported('PointCollection', version, behavior, e); return null; }
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
        const SDK = (globalThis as any).BMap;
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
    createPanoramaCoverageLayer: () => { reportUnsupported('PanoramaCoverageLayer', version, behavior); return null; },
    // v3-only 图层在 v3 直接创建（v4 capability 闭包不包含这些类）
    createCustomLayer: (o) => {
      try { return { __brand: 'LayerHandle' as const, raw: new rawSDK.CustomLayer(o), kind: 'custom' } as any; }
      catch (e) { reportUnsupported('CustomLayer', version, behavior, e); return null; }
    },
    createCanvasLayer: (o) => {
      try { return { __brand: 'LayerHandle' as const, raw: new rawSDK.CanvasLayer(o), kind: 'canvas' } as any; }
      catch (e) { reportUnsupported('CanvasLayer', version, behavior, e); return null; }
    },
  };

  return {
    ...base,
    ...v3Only,
    version,
    capabilities: CAPABILITY_MATRIX['3.0'],
  };
}
