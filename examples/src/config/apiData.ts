import type { ApiProp } from '../components/ApiTable';
import type { ApiMethod } from '../components/ApiTable';

// ─── 公共 prop 片段 ───
const position: ApiProp = { name: 'position', type: 'Point', required: true, description: '坐标位置 { lng, lat }' };
const path: ApiProp = { name: 'path', type: 'Point[]', required: true, description: '坐标点数组' };
const strokeColor: ApiProp = { name: 'strokeColor', type: 'string', required: false, description: '边线颜色' };
const strokeWeight: ApiProp = { name: 'strokeWeight', type: 'number', required: false, description: '边线宽度（像素）' };
const strokeOpacity: ApiProp = { name: 'strokeOpacity', type: 'number', required: false, description: '边线透明度 (0-1)' };
const strokeStyle: ApiProp = { name: 'strokeStyle', type: '"solid" | "dashed"', required: false, description: '边线样式' };
const fillColor: ApiProp = { name: 'fillColor', type: 'string', required: false, description: '填充颜色' };
const fillOpacity: ApiProp = { name: 'fillOpacity', type: 'number', required: false, description: '填充透明度 (0-1)' };
const enableMassClear: ApiProp = { name: 'enableMassClear', type: 'boolean', required: false, description: '是否在 clearOverlays 时清除' };
const enableEditing: ApiProp = { name: 'enableEditing', type: 'boolean', required: false, description: '是否启用编辑' };
const enableClicking: ApiProp = { name: 'enableClicking', type: 'boolean', required: false, description: '是否响应点击事件' };
const visible: ApiProp = { name: 'visible', type: 'boolean', required: false, description: '是否可见' };
const onClick: ApiProp = { name: 'onClick', type: '(e: BMapEvent) => void', required: false, description: '点击事件' };
const onMouseOver: ApiProp = { name: 'onMouseover', type: '(e: BMapEvent) => void', required: false, description: '鼠标移入' };
const onMouseOut: ApiProp = { name: 'onMouseout', type: '(e: BMapEvent) => void', required: false, description: '鼠标移出' };
const onDoubleClick: ApiProp = { name: 'onDblClick', type: '(e: BMapEvent) => void', required: false, description: '双击事件' };
const anchor: ApiProp = { name: 'anchor', type: 'ControlAnchor', required: false, description: '控件停靠位置' };
const offset: ApiProp = { name: 'offset', type: '{ width: number; height: number }', required: false, description: '偏移量' };
const overlayEvents: ApiProp[] = [onClick, onMouseOver, onMouseOut, onDoubleClick, enableMassClear, enableClicking, visible];
const strokeProps: ApiProp[] = [strokeColor, strokeWeight, strokeOpacity, strokeStyle];
const fillProps: ApiProp[] = [fillColor, fillOpacity];

export const API_DATA: Record<string, ApiProp[]> = {
  // ─── Map ───
  map: [
    { name: 'center', type: 'Point', required: false, description: '地图中心点' },
    { name: 'zoom', type: 'number', required: false, description: '缩放级别 (3-19)' },
    { name: 'defaultCenter', type: 'Point', required: false, description: '初始中心点（非受控）' },
    { name: 'defaultZoom', type: 'number', required: false, description: '初始缩放级别（非受控）' },
    { name: 'heading', type: 'number', required: false, description: '地图朝向角度 (0-360)，4.0+' },
    { name: 'tilt', type: 'number', required: false, description: '地图倾斜角度 (0-73)，4.0+' },
    { name: 'mapType', type: 'string | number', required: false, description: '地图类型' },
    { name: 'style', type: 'CSSProperties', required: false, description: '容器样式' },
    { name: 'enableDragging', type: 'boolean', required: false, description: '启用拖拽' },
    { name: 'enableScrollWheelZoom', type: 'boolean', required: false, description: '启用滚轮缩放' },
    { name: 'enableDoubleClickZoom', type: 'boolean', required: false, description: '启用双击缩放' },
    { name: 'enableKeyboard', type: 'boolean', required: false, description: '启用键盘操作' },
    { name: 'enablePinchToZoom', type: 'boolean', required: false, description: '启用双指缩放' },
    { name: 'enableRotate', type: 'boolean', required: false, description: '启用旋转（4.0+）' },
    { name: 'enableTilt', type: 'boolean', required: false, description: '启用倾斜（4.0+）' },
    { name: 'theme', type: 'string', required: false, description: '地图主题 ID' },
    { name: 'mapStyleV2', type: 'MapStyleV2Options', required: false, description: '自定义地图样式' },
    { name: 'onClick', type: '(e: BMapEvent) => void', required: false, description: '点击地图' },
    { name: 'onDblClick', type: '(e: BMapEvent) => void', required: false, description: '双击地图' },
    { name: 'onZoomEnd', type: '(e: BMapEvent) => void', required: false, description: '缩放结束' },
    { name: 'onMoveEnd', type: '(e: BMapEvent) => void', required: false, description: '移动结束' },
    { name: 'onTilesLoaded', type: '() => void', required: false, description: '瓦片加载完成' },
    { name: 'onMapTypeChange', type: '(e: BMapEvent) => void', required: false, description: '地图类型改变' },
  ],

  // ─── Overlay ───
  marker: [
    position,
    { name: 'icon', type: 'string | IconOptions | SymbolOptions', required: false, description: '标注图标，可传字符串预设名或自定义配置' },
    { name: 'label', type: 'string | LabelOptions', required: false, description: '标注文本标签' },
    { name: 'offset', type: '{ width: number; height: number }', required: false, description: '标注偏移' },
    { name: 'title', type: 'string', required: false, description: '鼠标 hover 标题' },
    { name: 'rotation', type: 'number', required: false, description: '旋转角度 (0-360)' },
    { name: 'opacity', type: 'number', required: false, description: '透明度 (0-1)，4.0+' },
    ...overlayEvents,
  ],
  label: [
    position,
    { name: 'content', type: 'string', required: true, description: '标签文本' },
    { name: 'width', type: 'number', required: false, description: '标签宽度（不设则竖排显示）' },
    { name: 'styles', type: 'CSSProperties', required: false, description: '标签样式' },
    { name: 'offset', type: '{ width: number; height: number }', required: false, description: '标签偏移' },
    { name: 'title', type: 'string', required: false, description: '鼠标 hover 标题' },
    enableMassClear, visible, onClick, onMouseOver, onMouseOut,
  ],
  polyline: [
    path, ...strokeProps, ...fillProps, enableMassClear, enableEditing, visible, onClick, onMouseOver, onMouseOut, onDoubleClick,
    { name: 'icons', type: 'IconSequenceOptions[]', required: false, description: '图标序列' },
  ],
  polygon: [
    path, ...strokeProps, ...fillProps, enableMassClear, enableEditing, visible, onClick, onMouseOver, onMouseOut, onDoubleClick,
  ],
  circle: [
    position,
    { name: 'radius', type: 'number', required: true, description: '半径（米）' },
    ...strokeProps, ...fillProps, enableMassClear, enableEditing, visible, onClick, onMouseOver, onMouseOut, onDoubleClick,
  ],
  rectangle: [
    { name: 'bounds', type: 'Bounds', required: true, description: '矩形边界 { sw, ne }' },
    ...strokeProps, ...fillProps, enableMassClear, enableEditing, visible, onClick, onMouseOver, onMouseOut, onDoubleClick,
  ],
  'bezier-curve': [
    path,
    { name: 'controlPoints', type: 'Point[][]', required: true, description: '控制点数组（每段两个控制点）' },
    ...strokeProps, enableMassClear, visible, onClick,
  ],
  prism: [
    path,
    { name: 'altitude', type: 'number', required: true, description: '棱柱高度（米）' },
    ...strokeProps, ...fillProps, enableMassClear, visible, onClick,
  ],
  'ground-overlay': [
    { name: 'bounds', type: 'Bounds', required: true, description: '地面边界 { sw, ne }' },
    { name: 'url', type: 'string', required: true, description: '图片 URL' },
    { name: 'opacity', type: 'number', required: false, description: '透明度 (0-1)' },
    visible, onClick,
  ],
  'ground-point': [
    { name: 'point', type: 'Point', required: true, description: '坐标位置 { lng, lat }' },
    { name: 'height', type: 'number', required: false, description: '高度（米）' },
    { name: 'url', type: 'string', required: true, description: '图片 URL' },
    { name: 'size', type: '{ width: number; height: number }', required: true, description: '图片尺寸' },
    fillColor, fillOpacity, visible, onClick,
  ],
  'point-collection': [
    { name: 'points', type: 'Point[]', required: true, description: '点坐标数组' },
    { name: 'shape', type: 'number', required: false, description: '点形状常量 (BMAP_POINT_SHAPE_*)' },
    { name: 'color', type: 'string', required: false, description: '点颜色' },
    { name: 'size', type: 'number', required: false, description: '点大小 (1-5)' },
    visible, onClick,
  ],
  'info-window': [
    position,
    { name: 'content', type: 'string', required: true, description: '信息窗内容（支持 HTML）' },
    { name: 'visible', type: 'boolean', required: false, description: '是否显示' },
    { name: 'width', type: 'number', required: false, description: '信息窗宽度' },
    { name: 'height', type: 'number', required: false, description: '信息窗高度' },
    { name: 'title', type: 'string', required: false, description: '信息窗标题' },
    { name: 'onOpen', type: '() => void', required: false, description: '打开回调' },
    { name: 'onClose', type: '() => void', required: false, description: '关闭回调' },
  ],
  symbol: [
    { name: 'shapeType', type: 'number', required: true, description: '符号形状 (1-14)' },
    { name: 'fillColor', type: 'string', required: false, description: '填充颜色' },
    { name: 'fillOpacity', type: 'number', required: false, description: '填充透明度' },
    { name: 'strokeColor', type: 'string', required: false, description: '描边颜色' },
    { name: 'strokeWeight', type: 'number', required: false, description: '描边宽度' },
    { name: 'scale', type: 'number', required: false, description: '缩放比例' },
    { name: 'rotation', type: 'number', required: false, description: '旋转角度' },
  ],
  icon: [
    { name: 'url', type: 'string', required: true, description: '图片 URL' },
    { name: 'size', type: '{ width: number; height: number }', required: true, description: '图标尺寸' },
    { name: 'imageSize', type: '{ width: number; height: number }', required: false, description: '图片裁切尺寸' },
    { name: 'anchor', type: '{ width: number; height: number }', required: false, description: '锚点位置' },
  ],
  'icon-sequence': [
    { name: 'icon', type: 'IconOptions', required: true, description: '图标配置' },
    { name: 'step', type: 'number', required: false, description: '步长（像素）' },
    { name: 'repeat', type: 'string', required: false, description: '重复间隔（如 "50px"）' },
    { name: 'fixed', type: 'boolean', required: false, description: '是否固定位置' },
  ],
  hotspot: [
    position,
    { name: 'title', type: 'string', required: false, description: '热点标题' },
    visible,
  ],
  'custom-overlay': [
    { name: 'point', type: 'Point', required: true, description: '坐标位置 { lng, lat }' },
    { name: 'offsetY', type: 'number', required: false, description: 'Y 轴偏移' },
    { name: 'offsetX', type: 'number', required: false, description: 'X 轴偏移' },
    { name: 'children', type: 'ReactNode', required: true, description: '自定义 HTML 内容' },
    visible,
  ],
  'marker-3d': [
    position,
    { name: 'height', type: 'number', required: false, description: '3D 高度（米）' },
    { name: 'shape', type: 'number', required: true, description: '形状 (1=圆形, 2=方形)' },
    { name: 'size', type: 'number', required: true, description: '尺寸 (像素)' },
    fillColor, fillOpacity, enableMassClear, visible, onClick,
  ],
  'map-mask': [
    { name: 'bounds', type: 'Bounds', required: true, description: '遮罩边界 { sw, ne }' },
    { name: 'showRegion', type: '"inside" | "outside"', required: false, description: '显示区域：inside=遮罩内, outside=遮罩外' },
    { name: 'isBuildingMask', type: 'boolean', required: false, description: '是否遮罩建筑物' },
    { name: 'isPoiMask', type: 'boolean', required: false, description: '是否遮罩 POI' },
    { name: 'isMapMask', type: 'boolean', required: false, description: '是否遮罩底图' },
    visible,
  ],
  'simple-info-window': [
    position,
    { name: 'content', type: 'string', required: true, description: '信息窗内容' },
    { name: 'visible', type: 'boolean', required: false, description: '是否显示' },
    { name: 'onOpen', type: '() => void', required: false, description: '打开回调' },
    { name: 'onClose', type: '() => void', required: false, description: '关闭回调' },
  ],
  'place-detail-overlay': [
    { name: 'uid', type: 'string', required: true, description: 'POI 唯一标识' },
    { name: 'open', type: 'boolean', required: false, description: '是否打开（需挂在 Marker 内）' },
    { name: 'options', type: 'PlaceDetailOptions', required: false, description: '详情选项' },
    visible,
  ],

  // ─── Control ───
  'navigation-control': [
    anchor, offset,
    { name: 'type', type: 'NavigationControlType', required: false, description: '控件类型' },
    { name: 'showZoomInfo', type: 'boolean', required: false, description: '是否显示缩放级别' },
  ],
  'navigation-control-3d': [
    anchor, offset,
    { name: 'type', type: 'NavigationControlType', required: false, description: '控件类型' },
  ],
  'scale-control': [anchor, offset],
  'overview-map-control': [
    anchor, offset,
    { name: 'isOpen', type: 'boolean', required: false, description: '是否展开' },
  ],
  'map-type-control': [
    anchor, offset,
    { name: 'type', type: 'MapTypeControlType', required: false, description: '控件类型' },
  ],
  'copyright-control': [
    anchor, offset,
    { name: 'copyrights', type: 'CopyrightItem[]', required: false, description: '版权信息数组 [{ id, content }]' },
  ],
  'geolocation-control': [
    anchor, offset,
    { name: 'showAddressBar', type: 'boolean', required: false, description: '是否显示地址栏' },
    { name: 'onLocationSuccess', type: '(e: BMapEvent) => void', required: false, description: '定位成功回调' },
    { name: 'onLocationError', type: '(e: BMapEvent) => void', required: false, description: '定位失败回调' },
  ],
  'panorama-control': [anchor, offset],
  'zoom-control': [anchor, offset],
  'city-list-control': [
    anchor, offset,
    { name: 'onChange', type: '(e: BMapEvent) => void', required: false, description: '切换城市回调' },
    { name: 'onBeforeChange', type: '(e: BMapEvent) => void', required: false, description: '切换前回调' },
  ],
  'logo-control': [anchor, offset],

  // ─── Layer ───
  'tile-layer': [
    { name: 'transparentImgSrc', type: 'string', required: false, description: '透明瓦片 URL 模板' },
    { name: 'opacity', type: 'number', required: false, description: '透明度 (0-1)' },
    visible,
  ],
  'normal-layer': [visible],
  'geojson-layer': [
    { name: 'layerName', type: 'string', required: true, description: '图层名称' },
    { name: 'dataType', type: 'number', required: false, description: '数据类型' },
    visible,
  ],
  'district-layer': [
    { name: 'name', type: 'string', required: true, description: '行政区名称' },
    { name: 'kind', type: 'number', required: false, description: '边界类型 (0-4)' },
    visible,
  ],
  'traffic-layer': [visible],
  'custom-layer': [
    { name: 'pointDensity', type: 'number', required: false, description: '点密度' },
    visible,
  ],
  'canvas-layer': [visible],
  'raster-tile-layer': [
    { name: 'url', type: 'string', required: true, description: '瓦片 URL 模板' },
    { name: 'tileSize', type: 'number', required: false, description: '瓦片大小' },
    { name: 'opacity', type: 'number', required: false, description: '透明度' },
    visible,
  ],
  'wms-layer': [
    { name: 'url', type: 'string', required: true, description: 'WMS 服务地址' },
    { name: 'layers', type: 'string', required: false, description: '图层名' },
    visible,
  ],
  'wmts-layer': [
    { name: 'url', type: 'string', required: true, description: 'WMTS 服务地址' },
    visible,
  ],
  'xyz-layer': [
    { name: 'url', type: 'string', required: true, description: 'XYZ 瓦片 URL 模板' },
    { name: 'tileSize', type: 'number', required: false, description: '瓦片大小' },
    visible,
  ],
  'mvt-layer': [
    { name: 'url', type: 'string', required: true, description: 'MVT 瓦片 URL 模板' },
    visible,
  ],
  'feature-layer': [visible],
  'fill-layer': [
    { name: 'style', type: 'FillLayerStyle', required: false, description: '填充样式' },
    visible,
  ],
  'dom-layer': [visible],
  'point-icon-layer': [
    { name: 'style', type: 'PointIconStyle', required: false, description: '图标样式' },
    visible,
  ],
  'point-shape-layer': [
    { name: 'style', type: 'PointShapeStyle', required: false, description: '图形样式' },
    visible,
  ],
  'panorama-coverage-layer': [visible],
  'line-layer': [
    { name: 'style', type: 'object', required: false, description: '线样式 { strokeColor, strokeWeight }' },
    visible,
  ],
  'pixel-layer': [visible],
  'baidu-layer': [visible],
  'three-layer': [visible],

  // ─── Service ───
  'local-search': [
    { name: 'location', type: 'string | Point | MapHandle', required: false, description: '搜索城市/区域' },
    { name: 'pageCapacity', type: 'number', required: false, description: '每页结果数' },
    { name: 'renderOptions', type: 'LocalSearchRenderOptions', required: false, description: '渲染选项（含 map）' },
    { name: 'onSearchComplete', type: '(results: unknown) => void', required: false, description: '搜索完成回调' },
  ],
  geocoder: [
    { name: 'onGetLocation', type: '(result: unknown) => void', required: false, description: '地址→坐标回调' },
    { name: 'onGetAddress', type: '(result: unknown) => void', required: false, description: '坐标→地址回调' },
  ],
  'driving-route': [
    { name: 'policy', type: 'number', required: false, description: '驾车策略' },
    { name: 'renderOptions', type: 'DrivingRouteRenderOptions', required: false, description: '渲染选项（含 map）' },
    { name: 'onSearchComplete', type: '(results: unknown) => void', required: false, description: '搜索完成回调' },
  ],
  'walking-route': [
    { name: 'renderOptions', type: 'object', required: false, description: '渲染选项（含 map）' },
    { name: 'onSearchComplete', type: '(results: unknown) => void', required: false, description: '搜索完成回调' },
  ],
  'riding-route': [
    { name: 'renderOptions', type: 'object', required: false, description: '渲染选项（含 map）' },
    { name: 'onSearchComplete', type: '(results: unknown) => void', required: false, description: '搜索完成回调' },
  ],
  'transit-route': [
    { name: 'policy', type: 'number', required: false, description: '公交策略' },
    { name: 'renderOptions', type: 'object', required: false, description: '渲染选项（含 map）' },
    { name: 'onSearchComplete', type: '(results: unknown) => void', required: false, description: '搜索完成回调' },
  ],
  'bus-line-search': [
    { name: 'onGetBusList', type: '(result: unknown) => void', required: false, description: '线路列表回调' },
    { name: 'onGetBusLine', type: '(result: unknown) => void', required: false, description: '线路详情回调' },
  ],
  autocomplete: [
    { name: 'location', type: 'string', required: false, description: '搜索城市' },
    { name: 'input', type: 'HTMLElement', required: false, description: '绑定的 input 元素' },
    { name: 'onSearchComplete', type: '(results: unknown) => void', required: false, description: '搜索完成回调' },
  ],
  boundary: [
    { name: 'onGetBoundary', type: '(result: unknown) => void', required: false, description: '边界获取回调' },
  ],
  geolocation: [
    { name: 'onSuccess', type: '(result: unknown) => void', required: false, description: '定位成功' },
    { name: 'onError', type: '(e: BMapEvent) => void', required: false, description: '定位失败' },
  ],
  'local-city': [
    { name: 'onGetCity', type: '(result: unknown) => void', required: false, description: '城市获取回调' },
  ],
  'place-detail': [
    { name: 'onLoaded', type: '(result: unknown) => void', required: false, description: '详情加载回调' },
  ],
  convertor: [
    { name: 'onTranslate', type: '(results: unknown) => void', required: false, description: '转换完成回调' },
  ],
  'panorama-service': [
    { name: 'onGetPanorama', type: '(data: unknown) => void', required: false, description: '全景数据回调' },
  ],
  'truck-route': [
    { name: 'policy', type: 'number', required: false, description: '货车策略' },
    { name: 'renderOptions', type: 'object', required: false, description: '渲染选项（含 map）' },
    { name: 'onSearchComplete', type: '(results: unknown) => void', required: false, description: '搜索完成回调' },
  ],

  // ─── Other ───
  'context-menu': [
    { name: 'children', type: 'ReactNode', required: true, description: 'MenuItem 子节点' },
  ],
  panorama: [
    position,
    { name: 'style', type: 'CSSProperties', required: false, description: '容器样式' },
    { name: 'onPositionChange', type: '(e: BMapEvent) => void', required: false, description: '位置变化回调' },
    { name: 'onPovChange', type: '(e: BMapEvent) => void', required: false, description: '视角变化回调' },
  ],
  'place-detail-panel': [
    { name: 'uid', type: 'string', required: true, description: 'POI 唯一标识' },
    { name: 'className', type: 'string', required: false, description: '自定义类名' },
    { name: 'style', type: 'CSSProperties', required: false, description: '自定义样式' },
  ],
};

// ─── 公共 Overlay 方法 ───
const overlayMethods: ApiMethod[] = [
  { name: 'show()', params: '', description: '显示覆盖物' },
  { name: 'hide()', params: '', description: '隐藏覆盖物' },
  { name: 'setPosition(point)', params: 'Point', description: '设置位置' },
  { name: 'getPosition()', params: '', description: '获取位置' },
  { name: 'setZIndex(z)', params: 'number', description: '设置层级' },
  { name: 'enableMassClear()', params: '', description: '允许 clearOverlays 清除' },
  { name: 'disableMassClear()', params: '', description: '禁止 clearOverlays 清除' },
  { name: 'addEventListener(type, handler)', params: 'string, Function', description: '添加事件监听' },
  { name: 'removeEventListener(type, handler)', params: 'string, Function', description: '移除事件监听' },
];

const strokeMethods: ApiMethod[] = [
  ...overlayMethods,
  { name: 'setStrokeColor(color)', params: 'string', description: '设置边线颜色' },
  { name: 'getStrokeColor()', params: '', description: '获取边线颜色' },
  { name: 'setStrokeWeight(w)', params: 'number', description: '设置边线宽度' },
  { name: 'getStrokeWeight()', params: '', description: '获取边线宽度' },
  { name: 'setStrokeOpacity(o)', params: 'number', description: '设置边线透明度 (0-1)' },
  { name: 'getStrokeOpacity()', params: '', description: '获取边线透明度' },
  { name: 'setStrokeStyle(s)', params: '"solid"|"dashed"', description: '设置边线样式' },
  { name: 'setFillColor(color)', params: 'string', description: '设置填充颜色' },
  { name: 'setFillOpacity(o)', params: 'number', description: '设置填充透明度 (0-1)' },
  { name: 'enableEditing()', params: '', description: '开启编辑' },
  { name: 'disableEditing()', params: '', description: '关闭编辑' },
];

export const API_METHODS: Record<string, ApiMethod[]> = {
  map: [
    { name: 'setCenter(point)', params: 'Point', description: '设置中心点' },
    { name: 'getCenter()', params: '', description: '获取中心点' },
    { name: 'setZoom(zoom)', params: 'number', description: '设置缩放级别' },
    { name: 'getZoom()', params: '', description: '获取缩放级别' },
    { name: 'centerAndZoom(point, zoom)', params: 'Point, number', description: '设置中心和缩放' },
    { name: 'panTo(point)', params: 'Point', description: '平移到指定位置' },
    { name: 'panBy(x, y)', params: 'number, number', description: '偏移像素' },
    { name: 'setMapType(type)', params: 'MapType', description: '设置地图类型' },
    { name: 'getMapType()', params: '', description: '获取地图类型' },
    { name: 'setHeading(deg)', params: 'number', description: '设置朝向角度 (v4+)' },
    { name: 'getHeading()', params: '', description: '获取朝向角度 (v4+)' },
    { name: 'setTilt(deg)', params: 'number', description: '设置倾斜角度 (v4+)' },
    { name: 'getTilt()', params: '', description: '获取倾斜角度 (v4+)' },
    { name: 'flyTo(opts)', params: 'ViewAnimationOptions', description: '视角动画 (v4+)' },
    { name: 'enableDragging()', params: '', description: '启用拖拽' },
    { name: 'disableDragging()', params: '', description: '禁用拖拽' },
    { name: 'enableScrollWheelZoom()', params: '', description: '启用滚轮缩放' },
    { name: 'disableScrollWheelZoom()', params: '', description: '禁用滚轮缩放' },
    { name: 'enableDoubleClickZoom()', params: '', description: '启用双击缩放' },
    { name: 'disableDoubleClickZoom()', params: '', description: '禁用双击缩放' },
    { name: 'enableKeyboard()', params: '', description: '启用键盘操作' },
    { name: 'disableKeyboard()', params: '', description: '禁用键盘操作' },
    { name: 'enablePinchToZoom()', params: '', description: '启用双指缩放' },
    { name: 'disablePinchToZoom()', params: '', description: '禁用双指缩放' },
    { name: 'enableRotate()', params: '', description: '启用旋转 (v4+)' },
    { name: 'disableRotate()', params: '', description: '禁用旋转 (v4+)' },
    { name: 'enableTilt()', params: '', description: '启用倾斜 (v4+)' },
    { name: 'disableTilt()', params: '', description: '禁用倾斜 (v4+)' },
    { name: 'addOverlay(overlay)', params: 'Overlay', description: '添加覆盖物' },
    { name: 'removeOverlay(overlay)', params: 'Overlay', description: '移除覆盖物' },
    { name: 'clearOverlays()', params: '', description: '清除所有覆盖物' },
    { name: 'addControl(control)', params: 'Control', description: '添加控件' },
    { name: 'removeControl(control)', params: 'Control', description: '移除控件' },
    { name: 'getBounds()', params: '', description: '获取可视范围' },
    { name: 'getSize()', params: '', description: '获取地图尺寸' },
    { name: 'getDistance(p1, p2)', params: 'Point, Point', description: '计算两点距离' },
    { name: 'pointToPixel(point)', params: 'Point', description: '坐标转像素' },
    { name: 'pixelToPoint(pixel)', params: 'Pixel', description: '像素转坐标' },
    { name: 'setMapStyleV2(style)', params: 'MapStyleV2Options', description: '自定义底图样式 (v4+)' },
    { name: 'setViewport(viewport)', params: 'Viewport', description: '设置可视范围' },
    { name: 'getViewport(points)', params: 'Point[]', description: '获取最佳可视范围' },
    { name: 'setCity(city)', params: 'string', description: '切换城市' },
    { name: 'reset()', params: '', description: '重置地图' },
  ],
  marker: [
    ...overlayMethods,
    { name: 'setIcon(icon)', params: 'Icon | string', description: '设置图标' },
    { name: 'getIcon()', params: '', description: '获取图标' },
    { name: 'setLabel(label)', params: 'Label', description: '设置文本标签' },
    { name: 'getLabel()', params: '', description: '获取文本标签' },
    { name: 'setRotation(deg)', params: 'number', description: '设置旋转角度' },
    { name: 'getRotation()', params: '', description: '获取旋转角度' },
    { name: 'setTop(top)', params: 'boolean', description: '置顶显示' },
    { name: 'setAnimation(anim)', params: 'Animation', description: '设置动画 (v3)' },
    { name: 'enableDragging()', params: '', description: '启用拖拽' },
    { name: 'disableDragging()', params: '', description: '禁用拖拽' },
    { name: 'openInfoWindow(iw)', params: 'InfoWindow', description: '打开信息窗口' },
    { name: 'closeInfoWindow()', params: '', description: '关闭信息窗口' },
  ],
  label: [
    ...overlayMethods,
    { name: 'setContent(content)', params: 'string', description: '设置内容' },
    { name: 'getContent()', params: '', description: '获取内容' },
    { name: 'setStyles(styles)', params: 'CSSProperties', description: '设置样式' },
  ],
  polyline: strokeMethods,
  polygon: strokeMethods,
  circle: [
    ...strokeMethods,
    { name: 'setCenter(point)', params: 'Point', description: '设置圆心' },
    { name: 'getCenter()', params: '', description: '获取圆心' },
    { name: 'setRadius(r)', params: 'number', description: '设置半径（米）' },
    { name: 'getRadius()', params: '', description: '获取半径' },
    { name: 'getBounds()', params: '', description: '获取圆的边界' },
  ],
  rectangle: [
    ...strokeMethods,
    { name: 'setBounds(bounds)', params: 'Bounds', description: '设置边界' },
    { name: 'getBounds()', params: '', description: '获取边界' },
  ],
  'bezier-curve': strokeMethods,
  prism: strokeMethods,
  'info-window': [
    { name: 'setWidth(w)', params: 'number', description: '设置宽度' },
    { name: 'setHeight(h)', params: 'number', description: '设置高度' },
    { name: 'setTitle(title)', params: 'string', description: '设置标题' },
    { name: 'setContent(content)', params: 'string', description: '设置内容' },
    { name: 'getContent()', params: '', description: '获取内容' },
    { name: 'setPosition(point)', params: 'Point', description: '设置位置' },
    { name: 'getPosition()', params: '', description: '获取位置' },
    { name: 'setOffset(offset)', params: 'Size', description: '设置偏移' },
    { name: 'show()', params: '', description: '显示' },
    { name: 'hide()', params: '', description: '隐藏' },
  ],
  'navigation-control': [
    { name: 'setAnchor(anchor)', params: 'ControlAnchor', description: '设置停靠位置' },
    { name: 'getAnchor()', params: '', description: '获取停靠位置' },
    { name: 'setOffset(offset)', params: 'Size', description: '设置偏移' },
    { name: 'getOffset()', params: '', description: '获取偏移' },
    { name: 'setType(type)', params: 'NavigationControlType', description: '设置控件类型' },
    { name: 'show()', params: '', description: '显示控件' },
    { name: 'hide()', params: '', description: '隐藏控件' },
  ],
  'scale-control': [
    { name: 'setAnchor(anchor)', params: 'ControlAnchor', description: '设置停靠位置' },
    { name: 'setOffset(offset)', params: 'Size', description: '设置偏移' },
    { name: 'setUnit(unit)', params: 'LengthUnit', description: '设置单位制' },
    { name: 'show()', params: '', description: '显示控件' },
    { name: 'hide()', params: '', description: '隐藏控件' },
  ],
  'overview-map-control': [
    { name: 'setAnchor(anchor)', params: 'ControlAnchor', description: '设置停靠位置' },
    { name: 'setOffset(offset)', params: 'Size', description: '设置偏移' },
    { name: 'setSize(size)', params: 'Size', description: '设置缩略图大小' },
    { name: 'changeView()', params: '', description: '展开/收起' },
    { name: 'show()', params: '', description: '显示控件' },
    { name: 'hide()', params: '', description: '隐藏控件' },
  ],
  'map-type-control': [
    { name: 'setAnchor(anchor)', params: 'ControlAnchor', description: '设置停靠位置' },
    { name: 'setOffset(offset)', params: 'Size', description: '设置偏移' },
    { name: 'setType(type)', params: 'MapTypeControlType', description: '设置控件类型' },
    { name: 'showStreetLayer()', params: '', description: '显示路网层' },
    { name: 'show()', params: '', description: '显示控件' },
    { name: 'hide()', params: '', description: '隐藏控件' },
  ],
  'copyright-control': [
    { name: 'setAnchor(anchor)', params: 'ControlAnchor', description: '设置停靠位置' },
    { name: 'setOffset(offset)', params: 'Size', description: '设置偏移' },
    { name: 'addCopyright(item)', params: 'CopyrightItem', description: '添加版权信息' },
    { name: 'removeCopyright(id)', params: 'number', description: '移除版权信息' },
    { name: 'show()', params: '', description: '显示控件' },
    { name: 'hide()', params: '', description: '隐藏控件' },
  ],
  'geolocation-control': [
    { name: 'setAnchor(anchor)', params: 'ControlAnchor', description: '设置停靠位置' },
    { name: 'setOffset(offset)', params: 'Size', description: '设置偏移' },
    { name: 'location()', params: '', description: '触发定位' },
    { name: 'setLocationIcon(icon)', params: 'Icon', description: '设置定位图标' },
    { name: 'show()', params: '', description: '显示控件' },
    { name: 'hide()', params: '', description: '隐藏控件' },
  ],
  'panorama-control': [
    { name: 'setAnchor(anchor)', params: 'ControlAnchor', description: '设置停靠位置' },
    { name: 'setOffset(offset)', params: 'Size', description: '设置偏移' },
    { name: 'show()', params: '', description: '显示控件' },
    { name: 'hide()', params: '', description: '隐藏控件' },
  ],
  'zoom-control': [
    { name: 'setAnchor(anchor)', params: 'ControlAnchor', description: '设置停靠位置' },
    { name: 'setOffset(offset)', params: 'Size', description: '设置偏移' },
    { name: 'show()', params: '', description: '显示控件' },
    { name: 'hide()', params: '', description: '隐藏控件' },
  ],
  'city-list-control': [
    { name: 'setAnchor(anchor)', params: 'ControlAnchor', description: '设置停靠位置' },
    { name: 'setOffset(offset)', params: 'Size', description: '设置偏移' },
    { name: 'show()', params: '', description: '显示控件' },
    { name: 'hide()', params: '', description: '隐藏控件' },
  ],
  'logo-control': [
    { name: 'setAnchor(anchor)', params: 'ControlAnchor', description: '设置停靠位置' },
    { name: 'setOffset(offset)', params: 'Size', description: '设置偏移' },
    { name: 'show()', params: '', description: '显示控件' },
    { name: 'hide()', params: '', description: '隐藏控件' },
  ],
  'local-search': [
    { name: 'search(keyword)', params: 'string | string[]', description: '关键词搜索' },
    { name: 'searchNearby(keyword, center, radius)', params: 'string, Point, number', description: '周边搜索' },
    { name: 'searchInBounds(keyword, bounds)', params: 'string, Bounds', description: '范围搜索' },
    { name: 'gotoPage(page)', params: 'number', description: '翻页（从 0 开始）' },
    { name: 'clearResults()', params: '', description: '清除结果' },
    { name: 'cancel()', params: '', description: '取消搜索' },
  ],
  geocoder: [
    { name: 'getPoint(address, city?)', params: 'string, string?', description: '地址→坐标' },
    { name: 'getLocation(point)', params: 'Point', description: '坐标→地址' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  'driving-route': [
    { name: 'search(start, end, opts?)', params: 'Point, Point, {waypoints?}', description: '驾车路线搜索' },
    { name: 'clearResults()', params: '', description: '清除结果' },
    { name: 'setPolicy(policy)', params: 'number', description: '设置策略' },
    { name: 'enableAutoViewport()', params: '', description: '启用自动视野' },
    { name: 'disableAutoViewport()', params: '', description: '禁用自动视野' },
    { name: 'getStatus()', params: '', description: '获取状态' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  'walking-route': [
    { name: 'search(start, end)', params: 'Point, Point', description: '步行路线搜索' },
    { name: 'clearResults()', params: '', description: '清除结果' },
    { name: 'enableAutoViewport()', params: '', description: '启用自动视野' },
    { name: 'disableAutoViewport()', params: '', description: '禁用自动视野' },
    { name: 'getStatus()', params: '', description: '获取状态' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  'riding-route': [
    { name: 'search(start, end)', params: 'Point, Point', description: '骑行路线搜索' },
    { name: 'clearResults()', params: '', description: '清除结果' },
    { name: 'enableAutoViewport()', params: '', description: '启用自动视野' },
    { name: 'disableAutoViewport()', params: '', description: '禁用自动视野' },
    { name: 'getStatus()', params: '', description: '获取状态' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  'transit-route': [
    { name: 'search(start, end)', params: 'Point, Point', description: '公交路线搜索' },
    { name: 'clearResults()', params: '', description: '清除结果' },
    { name: 'setPolicy(policy)', params: 'number', description: '设置策略' },
    { name: 'setPageCapacity(n)', params: 'number', description: '设置每页方案数' },
    { name: 'enableAutoViewport()', params: '', description: '启用自动视野' },
    { name: 'disableAutoViewport()', params: '', description: '禁用自动视野' },
    { name: 'getStatus()', params: '', description: '获取状态' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  'bus-line-search': [
    { name: 'getBusList(keyword)', params: 'string', description: '搜索公交线路列表' },
    { name: 'getBusLine(item)', params: 'unknown', description: '获取线路详情' },
    { name: 'clearResults()', params: '', description: '清除结果' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  autocomplete: [
    { name: 'show()', params: '', description: '显示建议列表' },
    { name: 'hide()', params: '', description: '隐藏建议列表' },
    { name: 'getResults()', params: '', description: '获取结果' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  boundary: [
    { name: 'get(name)', params: 'string', description: '获取行政区边界' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  geolocation: [
    { name: 'getCurrentPosition(opts?)', params: 'object?', description: '获取当前位置' },
    { name: 'getStatus()', params: '', description: '获取状态' },
    { name: 'enableSDKLocation()', params: '', description: '启用 SDK 定位' },
    { name: 'disableSDKLocation()', params: '', description: '禁用 SDK 定位' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  'local-city': [
    { name: 'get()', params: '', description: '获取当前城市' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  'place-detail': [
    { name: 'render(uid)', params: 'string', description: '渲染地点详情' },
    { name: 'rerender()', params: '', description: '重新渲染' },
    { name: 'dispose()', params: '', description: '销毁实例' },
  ],
  convertor: [
    { name: 'translate(points, from, to)', params: 'Point[], number, number', description: '坐标转换' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  'panorama-service': [
    { name: 'getPanoramaById(id)', params: 'string', description: '按 ID 获取全景' },
    { name: 'getPanoramaByLocation(point, radius)', params: 'Point, number', description: '按位置获取全景' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
  'truck-route': [
    { name: 'search(start, end, opts?)', params: 'Point, Point, object?', description: '货车路线搜索' },
    { name: 'clearResults()', params: '', description: '清除结果' },
    { name: 'enableAutoViewport()', params: '', description: '启用自动视野' },
    { name: 'disableAutoViewport()', params: '', description: '禁用自动视野' },
    { name: 'getStatus()', params: '', description: '获取状态' },
    { name: 'cancel()', params: '', description: '取消' },
  ],
};
