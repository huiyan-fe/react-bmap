export interface TestPage { id: string; name: string; category: string; ready?: boolean; }

export const CATEGORIES = ['框架', '基础', '覆盖物', '控件', '图层', '服务', '其他'] as const;

const O = '覆盖物';
const C = '控件';
const L = '图层';
const S = '服务';

export const PAGES: TestPage[] = [
  // 框架
  { id: 'capabilities', name: 'Capabilities', category: '框架', ready: true },
  // 基础
  { id: 'map', name: 'Map（全量）', category: '基础', ready: true },
  // 覆盖物（18 个独立页）
  { id: 'marker', name: 'Marker', category: O, ready: true },
  { id: 'place-detail-overlay', name: 'PlaceDetail（Overlay）', category: O, ready: true },
  { id: 'label', name: 'Label', category: O, ready: true },
  { id: 'polyline', name: 'Polyline', category: O, ready: true },
  { id: 'polygon', name: 'Polygon', category: O, ready: true },
  { id: 'circle', name: 'Circle', category: O, ready: true },
  { id: 'rectangle', name: 'Rectangle', category: O, ready: true },
  { id: 'bezier-curve', name: 'BezierCurve', category: O, ready: true },
  { id: 'prism', name: 'Prism', category: O, ready: true },
  { id: 'ground-overlay', name: 'GroundOverlay', category: O, ready: true },
  { id: 'ground-point', name: 'GroundPoint', category: O, ready: true },
  { id: 'point-collection', name: 'PointCollection', category: O, ready: true },
  { id: 'info-window', name: 'InfoWindow', category: O, ready: true },
  { id: 'symbol', name: 'Symbol', category: O, ready: true },
  { id: 'icon', name: 'Icon', category: O, ready: true },
  { id: 'icon-sequence', name: 'IconSequence', category: O, ready: true },
  { id: 'hotspot', name: 'Hotspot', category: O, ready: true },
  { id: 'custom-overlay', name: 'CustomOverlay', category: O, ready: true },
  { id: 'marker-3d', name: 'Marker3D', category: O, ready: true },
  { id: 'map-mask', name: 'MapMask', category: O, ready: true },
  { id: 'simple-info-window', name: 'SimpleInfoWindow', category: O, ready: true },
  // 控件（11 个，LocationControl 是 GeolocationControl 的兼容别名）
  { id: 'navigation-control', name: 'NavigationControl', category: C, ready: true },
  { id: 'navigation-control-3d', name: 'NavigationControl3D', category: C, ready: true },
  { id: 'scale-control', name: 'ScaleControl', category: C, ready: true },
  { id: 'overview-map-control', name: 'OverviewMapControl', category: C, ready: true },
  { id: 'map-type-control', name: 'MapTypeControl', category: C, ready: true },
  { id: 'copyright-control', name: 'CopyrightControl', category: C, ready: true },
  { id: 'geolocation-control', name: 'GeolocationControl / LocationControl', category: C, ready: true },
  { id: 'panorama-control', name: 'PanoramaControl', category: C, ready: true },
  { id: 'zoom-control', name: 'ZoomControl', category: C, ready: true },
  { id: 'city-list-control', name: 'CityListControl', category: C, ready: true },
  { id: 'logo-control', name: 'LogoControl', category: C, ready: true },
  // 图层（18 个）
  { id: 'tile-layer', name: 'TileLayer', category: L, ready: true },
  { id: 'geojson-layer', name: 'GeoJSONLayer', category: L, ready: true },
  { id: 'district-layer', name: 'DistrictLayer', category: L, ready: true },
  { id: 'traffic-layer', name: 'TrafficLayer', category: L, ready: true },
  { id: 'custom-layer', name: 'CustomLayer', category: L, ready: true },
  { id: 'canvas-layer', name: 'CanvasLayer', category: L, ready: true },
  { id: 'raster-tile-layer', name: 'RasterTileLayer', category: L, ready: true },
  { id: 'wms-layer', name: 'WMSLayer', category: L, ready: true },
  { id: 'wmts-layer', name: 'WMTSLayer', category: L, ready: true },
  { id: 'xyz-layer', name: 'XYZLayer', category: L, ready: true },
  { id: 'mvt-layer', name: 'MVTLayer', category: L, ready: true },
  { id: 'fill-layer', name: 'FillLayer', category: L, ready: true },
  { id: 'dom-layer', name: 'DOMLayer', category: L, ready: true },
  { id: 'point-icon-layer', name: 'PointIconLayer', category: L, ready: true },
  { id: 'point-shape-layer', name: 'PointShapeLayer', category: L, ready: true },
  { id: 'panorama-coverage-layer', name: 'PanoramaCoverageLayer', category: L, ready: true },
  { id: 'line-layer', name: 'LineLayer', category: L, ready: true },
  { id: 'pixel-layer', name: 'PixelLayer', category: L, ready: true },
  { id: 'baidu-layer', name: 'BaiduLayer', category: L, ready: true },
  { id: 'three-layer', name: 'ThreeLayer', category: L, ready: true },
  // 服务（15 个）
  { id: 'local-search', name: 'useLocalSearch', category: S, ready: true },
  { id: 'geocoder', name: 'useGeocoder', category: S, ready: true },
  { id: 'driving-route', name: 'useDrivingRoute', category: S, ready: true },
  { id: 'walking-route', name: 'useWalkingRoute', category: S, ready: true },
  { id: 'riding-route', name: 'useRidingRoute', category: S, ready: true },
  { id: 'transit-route', name: 'useTransitRoute', category: S, ready: true },
  { id: 'bus-line-search', name: 'useBusLineSearch', category: S, ready: true },
  { id: 'autocomplete', name: 'useAutocomplete', category: S, ready: true },
  { id: 'boundary', name: 'useBoundary', category: S, ready: true },
  { id: 'geolocation', name: 'useGeolocation', category: S, ready: true },
  { id: 'local-city', name: 'useLocalCity', category: S, ready: true },
  { id: 'place-detail', name: 'usePlaceDetail', category: S, ready: true },
  { id: 'convertor', name: 'useConvertor', category: S, ready: true },
  { id: 'panorama-service', name: 'usePanoramaService', category: S, ready: true },
  { id: 'truck-route', name: 'useTruckRoute', category: S, ready: true },
  // 其他
  { id: 'context-menu', name: 'ContextMenu', category: '其他', ready: true },
  { id: 'panorama', name: 'Panorama', category: '其他', ready: true },
  { id: 'place-detail-panel', name: 'PlaceDetailPanel', category: '其他', ready: true },
];

export const DEFAULT_VERSION = '4.0' as const;
export const VERSIONS = ['3.0', '4.0'] as const;
