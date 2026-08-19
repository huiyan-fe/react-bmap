export interface ComponentMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  /** 传 false 表示不受版本能力矩阵约束（如 Provider 这类非 SDK 能力的组件） */
  capability?: false;
}

export const COMPONENTS: ComponentMeta[] = [
  // Map
  { id: 'bmap-provider', name: 'BMapProvider', category: 'Map', description: 'JSAPI 加载与 driver 注入', capability: false },
  { id: 'map', name: 'Map', category: 'Map', description: '地图容器' },

  // Overlay (21)
  { id: 'marker', name: 'Marker', category: 'Overlay', description: '点标注' },
  { id: 'label', name: 'Label', category: 'Overlay', description: '文本标注' },
  { id: 'polyline', name: 'Polyline', category: 'Overlay', description: '折线' },
  { id: 'polygon', name: 'Polygon', category: 'Overlay', description: '多边形' },
  { id: 'circle', name: 'Circle', category: 'Overlay', description: '圆形' },
  { id: 'rectangle', name: 'Rectangle', category: 'Overlay', description: '矩形' },
  { id: 'bezier-curve', name: 'BezierCurve', category: 'Overlay', description: '贝塞尔曲线' },
  { id: 'prism', name: 'Prism', category: 'Overlay', description: '棱柱（3D）' },
  { id: 'ground-overlay', name: 'GroundOverlay', category: 'Overlay', description: '地面叠加层' },
  { id: 'ground-point', name: 'GroundPoint', category: 'Overlay', description: '地面点（3D）' },
  { id: 'point-collection', name: 'PointCollection', category: 'Overlay', description: '点集合' },
  { id: 'info-window', name: 'InfoWindow', category: 'Overlay', description: '信息窗口' },
  { id: 'symbol', name: 'Symbol', category: 'Overlay', description: '符号' },
  { id: 'icon', name: 'Icon', category: 'Overlay', description: '图标' },
  { id: 'icon-sequence', name: 'IconSequence', category: 'Overlay', description: '图标序列' },
  { id: 'custom-overlay', name: 'CustomOverlay', category: 'Overlay', description: '自定义覆盖物' },
  { id: 'marker-3d', name: 'Marker3D', category: 'Overlay', description: '3D 标注' },
  { id: 'map-mask', name: 'MapMask', category: 'Overlay', description: '地图遮罩' },
  { id: 'simple-info-window', name: 'SimpleInfoWindow', category: 'Overlay', description: '简单信息窗口' },
  { id: 'place-detail-overlay', name: 'PlaceDetail', category: 'Overlay', description: '地点详情' },

  // Control (11)
  { id: 'navigation-control', name: 'NavigationControl', category: 'Control', description: '缩放平移控件' },
  { id: 'navigation-control-3d', name: 'NavigationControl3D', category: 'Control', description: '3D 缩放控件' },
  { id: 'scale-control', name: 'ScaleControl', category: 'Control', description: '比例尺控件' },
  { id: 'overview-map-control', name: 'OverviewMapControl', category: 'Control', description: '缩略图控件' },
  { id: 'map-type-control', name: 'MapTypeControl', category: 'Control', description: '地图类型控件' },
  { id: 'copyright-control', name: 'CopyrightControl', category: 'Control', description: '版权控件' },
  { id: 'geolocation-control', name: 'GeolocationControl', category: 'Control', description: '定位控件' },
  { id: 'panorama-control', name: 'PanoramaControl', category: 'Control', description: '全景控件' },
  { id: 'zoom-control', name: 'ZoomControl', category: 'Control', description: '缩放控件（4.0+）' },
  { id: 'city-list-control', name: 'CityListControl', category: 'Control', description: '城市列表控件' },

  // Layer (14)
  { id: 'geojson-layer', name: 'GeoJSONLayer', category: 'Layer', description: 'GeoJSON 图层' },
  { id: 'district-layer', name: 'DistrictLayer', category: 'Layer', description: '行政区图层' },
  { id: 'traffic-layer', name: 'TrafficLayer', category: 'Layer', description: '交通路况图层' },
  { id: 'fill-layer', name: 'FillLayer', category: 'Layer', description: '填充图层' },
  { id: 'dom-layer', name: 'DOMLayer', category: 'Layer', description: 'DOM 图层' },
  { id: 'point-icon-layer', name: 'PointIconLayer', category: 'Layer', description: '图标点图层' },
  { id: 'point-shape-layer', name: 'PointShapeLayer', category: 'Layer', description: '图形点图层' },
  { id: 'panorama-coverage-layer', name: 'PanoramaCoverageLayer', category: 'Layer', description: '全景覆盖图层' },

  // Service (15)
  { id: 'local-search', name: 'useLocalSearch', category: 'Service', description: '本地搜索' },
  { id: 'geocoder', name: 'useGeocoder', category: 'Service', description: '地理编码' },
  { id: 'driving-route', name: 'useDrivingRoute', category: 'Service', description: '驾车路线' },
  { id: 'walking-route', name: 'useWalkingRoute', category: 'Service', description: '步行路线' },
  { id: 'riding-route', name: 'useRidingRoute', category: 'Service', description: '骑行路线' },
  { id: 'transit-route', name: 'useTransitRoute', category: 'Service', description: '公交路线' },
  { id: 'bus-line-search', name: 'useBusLineSearch', category: 'Service', description: '公交线路查询' },
  { id: 'autocomplete', name: 'useAutocomplete', category: 'Service', description: '输入提示' },
  { id: 'boundary', name: 'useBoundary', category: 'Service', description: '行政区划' },
  { id: 'geolocation', name: 'useGeolocation', category: 'Service', description: '定位' },
  { id: 'local-city', name: 'useLocalCity', category: 'Service', description: '城市查询' },
  { id: 'place-detail', name: 'usePlaceDetail', category: 'Service', description: '地点详情' },
  { id: 'convertor', name: 'useConvertor', category: 'Service', description: '坐标转换' },
  { id: 'panorama-service', name: 'usePanoramaService', category: 'Service', description: '全景服务' },
  { id: 'truck-route', name: 'useTruckRoute', category: 'Service', description: '货车路线' },

  // Other (2)
  { id: 'context-menu', name: 'ContextMenu', category: 'Other', description: '右键菜单' },
  { id: 'panorama', name: 'Panorama', category: 'Other', description: '全景地图' },
  // { id: 'place-detail-panel', name: 'PlaceDetailPanel', category: 'Other', description: '地点详情面板' },

  // Hook (8) —— 均为 React Hook，不受版本能力矩阵约束，故统一 capability: false
  // useMapRef / useDriver / useMap 三者分工见各自页面说明，日常操作地图只需要 useMapRef
  { id: 'use-map', name: 'useMap', category: 'Hook', description: '拿地图句柄；唯一能取到原生地图实例（map.raw）的逃生口，日常操作请用 useMapRef', capability: false },
  { id: 'use-driver', name: 'useDriver', category: 'Hook', description: '拿当前版本的 driver：做版本/能力分支，或用 rawSDK 取原生命名空间', capability: false },
  { id: 'use-map-ref', name: 'useMapRef', category: 'Hook', description: '命令式操作地图；已转发 driver 的全量方法，是日常首选', capability: false },
  { id: 'use-capabilities', name: 'useCapabilities', category: 'Hook', description: '读取能力集合', capability: false },
  { id: 'use-map-event', name: 'useMapEvent', category: 'Hook', description: '订阅地图原生事件', capability: false },
  { id: 'use-map-status', name: 'useMapStatus', category: 'Hook', description: '订阅地图状态快照', capability: false },
  { id: 'use-symbol', name: 'useSymbol', category: 'Hook', description: '创建 Symbol 值对象', capability: false },
  { id: 'use-icon', name: 'useIcon', category: 'Hook', description: '创建 Icon 值对象', capability: false },
];

export const CATEGORIES = ['Map', 'Overlay', 'Control', 'Layer', 'Service', 'Other', 'Hook'] as const;
