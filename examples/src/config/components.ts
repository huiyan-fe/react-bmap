export interface ComponentMeta {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const COMPONENTS: ComponentMeta[] = [
  { id: 'map', name: 'Map', category: 'Map', description: '地图容器' },
  { id: 'marker', name: 'Marker', category: 'Overlay', description: '标注' },
  { id: 'markerordertip', name: 'MarkerOrderTip', category: 'Overlay', description: '序号标注' },
  { id: 'infowindow', name: 'InfoWindow', category: 'Overlay', description: '信息窗口' },
  { id: 'circle', name: 'Circle', category: 'Overlay', description: '圆形覆盖物' },
  { id: 'polyline', name: 'Polyline', category: 'Overlay', description: '折线' },
  { id: 'polygon', name: 'Polygon', category: 'Overlay', description: '多边形' },
  { id: 'pointlabel', name: 'PointLabel', category: 'Overlay', description: '点标注' },
  { id: 'navigationcontrol', name: 'NavigationControl', category: 'Control', description: '缩放控件' },
  { id: 'overviewmapcontrol', name: 'OverviewMapControl', category: 'Control', description: '缩略图控件' },
  { id: 'scalecontrol', name: 'ScaleControl', category: 'Control', description: '比例尺控件' },
  { id: 'maptypecontrol', name: 'MapTypeControl', category: 'Control', description: '地图类型控件' },
  { id: 'panoramacontrol', name: 'PanoramaControl', category: 'Control', description: '全景控件' },
  { id: 'geolocationcontrol', name: 'GeolocationControl', category: 'Control', description: '定位控件' },
  { id: 'trafficlayer', name: 'TrafficLayer', category: 'Layer', description: '交通路况图层' },
  { id: 'mapvlayer', name: 'MapvLayer', category: 'Layer', description: 'MapV 图层' },
  { id: 'mapvglayer', name: 'MapvglLayer', category: 'Layer', description: 'MapVGL 图层' },
  { id: 'mapvglview', name: 'MapvglView', category: 'Layer', description: 'MapVGL 视图' },
  { id: 'drivingroute', name: 'DrivingRoute', category: 'Services', description: '驾车路线' },
  { id: 'walkingroute', name: 'WalkingRoute', category: 'Services', description: '步行路线' },
  { id: 'autocomplete', name: 'Autocomplete', category: 'Services', description: '输入提示' },
  { id: 'road', name: 'Road', category: 'Custom', description: '道路' },
  { id: 'boundary', name: 'Boundary', category: 'Custom', description: '行政区划' },
  { id: 'markerlist', name: 'MarkerList', category: 'Custom', description: '标注列表' },
  { id: 'mapvmarkerlist', name: 'MapvMarkerList', category: 'Custom', description: 'MapV 标注列表' },
  { id: 'arc', name: 'Arc', category: 'Custom', description: '迁徙弧线' },
  { id: 'thickray', name: 'ThickRay', category: 'Custom', description: '迁徙射线' },
  { id: 'maplistener', name: 'MapListener', category: 'Custom', description: '地图事件监听' },
];

export const CATEGORIES = ['Map', 'Overlay', 'Control', 'Layer', 'Services', 'Custom'] as const;
