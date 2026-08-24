import type { ApiProp } from '../components/ApiTable';

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
// 覆盖物鼠标事件统一是两个参数：(point, raw)，point 为事件发生的坐标，raw 为 SDK 原始事件对象
const onClick: ApiProp = { name: 'onClick', type: '(point: Point, raw: unknown) => void', required: false, description: '点击事件' };
const onMouseOver: ApiProp = { name: 'onMouseOver', type: '(point: Point, raw: unknown) => void', required: false, description: '鼠标移入' };
const onMouseOut: ApiProp = { name: 'onMouseOut', type: '(point: Point, raw: unknown) => void', required: false, description: '鼠标移出' };
const onDoubleClick: ApiProp = { name: 'onDoubleClick', type: '(point: Point, raw: unknown) => void', required: false, description: '双击事件' };
const anchor: ApiProp = { name: 'anchor', type: 'ControlAnchor', required: false, description: '控件停靠位置' };
const offset: ApiProp = { name: 'offset', type: '{ width: number; height: number }', required: false, description: '偏移量' };
const overlayEvents: ApiProp[] = [onClick, onMouseOver, onMouseOut, onDoubleClick, enableMassClear, enableClicking, visible];
const strokeProps: ApiProp[] = [strokeColor, strokeWeight, strokeOpacity, strokeStyle];
const fillProps: ApiProp[] = [fillColor, fillOpacity];

// ─── 线/面覆盖物扩展 ───
const onRightClick: ApiProp = { name: 'onRightClick', type: '(point: Point, raw: unknown) => void', required: false, description: '右键点击' };
const onRightDoubleClick: ApiProp = { name: 'onRightDoubleClick', type: '(point: Point, raw: unknown) => void', required: false, description: '右键双击' };
const onMouseDown: ApiProp = { name: 'onMouseDown', type: '(point: Point, raw: unknown) => void', required: false, description: '鼠标按下' };
const onMouseUp: ApiProp = { name: 'onMouseUp', type: '(point: Point, raw: unknown) => void', required: false, description: '鼠标抬起' };
const onMouseMove: ApiProp = { name: 'onMouseMove', type: '(point: Point, raw: unknown) => void', required: false, description: '鼠标移动' };
const onRemove: ApiProp = { name: 'onRemove', type: '(point: Point, raw: unknown) => void', required: false, description: '覆盖物被移除' };
// 编辑类事件只有一个参数 raw（没有坐标）
const onLineUpdate: ApiProp = { name: 'onLineUpdate', type: '(raw: unknown) => void', required: false, description: '线/面几何更新' };
const lineEditEvents: ApiProp[] = [
  { name: 'onEditStart', type: '(raw: unknown) => void', required: false, description: '开始编辑' },
  { name: 'onEditEnd', type: '(raw: unknown) => void', required: false, description: '结束编辑' },
  { name: 'onLineVertexDragStart', type: '(raw: unknown) => void', required: false, description: '顶点开始拖拽' },
  { name: 'onLineVertexDragging', type: '(raw: unknown) => void', required: false, description: '顶点拖拽中' },
  { name: 'onLineVertexDragEnd', type: '(raw: unknown) => void', required: false, description: '顶点结束拖拽' },
  { name: 'onLineVertexDel', type: '(raw: unknown) => void', required: false, description: '顶点被删除' },
];
const strokeLineCap: ApiProp = { name: 'strokeLineCap', type: '"butt" | "round" | "square"', required: false, description: '线端点样式' };
const strokeLineJoin: ApiProp = { name: 'strokeLineJoin', type: '"miter" | "round" | "bevel"', required: false, description: '线拐角样式' };
const dashArray: ApiProp = { name: 'dashArray', type: 'number[]', required: false, description: '虚线段样式（交替的线段/间隔长度）' };
const coordTypeProp: ApiProp = { name: 'coordType', type: 'string', required: false, description: '坐标系类型' };
const linkRight: ApiProp = { name: 'linkRight', type: 'boolean', required: false, description: '跨 180 度经线时取最短路径' };
const zIndexProp: ApiProp = { name: 'zIndex', type: 'number', required: false, description: '覆盖物层级' };
const strokeExtras: ApiProp[] = [strokeLineCap, strokeLineJoin, dashArray, coordTypeProp, zIndexProp];

// ─── 图层公共 prop 片段 ───
// visible / opacity / minZoom / maxZoom / zIndex：NormalLayer 系图层通用
const layerCommon: ApiProp[] = [
  visible,
  { name: 'opacity', type: 'number', required: false, description: '图层透明度 (0-1)' },
  { name: 'minZoom', type: 'number', required: false, description: '最小显示级别' },
  { name: 'maxZoom', type: 'number', required: false, description: '最大显示级别' },
  { name: 'zIndex', type: 'number', required: false, description: '图层层级' },
];
// 拾取相关（enablePicked 为 true 时才会派发点击/选中）
const layerPick: ApiProp[] = [
  { name: 'enablePicked', type: 'boolean', required: false, description: '是否可拾取（响应鼠标事件）' },
  { name: 'autoSelect', type: 'boolean', required: false, description: '拾取后是否自动高亮选中' },
  { name: 'popEvent', type: 'boolean', required: false, description: '是否向下层图层继续冒泡事件' },
  { name: 'pickWidth', type: 'number', required: false, description: '拾取宽度（像素）' },
  { name: 'pickHeight', type: 'number', required: false, description: '拾取高度（像素）' },
];
// GeoJSON 数据类图层（FeatureLayer / FillLayer / PointIconLayer / PointShapeLayer）通用
const layerData: ApiProp[] = [
  { name: 'data', type: 'object', required: false, description: 'GeoJSON 数据源，变化时调用 setData()' },
  { name: 'idKey', type: 'string', required: false, description: '数据项唯一标识的属性 key' },
  { name: 'crs', type: 'string', required: false, description: '来源坐标系：BD09LL / BD09MC / GCJ02' },
  { name: 'selectedIndex', type: 'number', required: false, description: '选中数据的索引' },
  { name: 'selectedColor', type: 'string', required: false, description: '选中高亮颜色' },
];

// ─── 路线检索 Hook 公共 option 片段（DrivingRouteOptions） ───
// 注意：这些是传给 hook 的入参，不是组件 props
const routeCommon: ApiProp[] = [
  { name: 'location', type: 'string | MapHandle', required: false, description: '检索城市名或地图实例' },
  { name: 'renderOptions', type: 'DrivingRouteRenderOptions', required: false, description: '渲染选项：map / panel / selectFirstResult / autoViewport / viewportOptions' },
  { name: 'onSearchComplete', type: '(results: unknown) => void', required: false, description: '检索完成回调' },
  { name: 'onMarkersSet', type: '(pois: unknown[]) => void', required: false, description: '标注添加完成回调' },
  { name: 'onInfoHtmlSet', type: '(poi: unknown, html: HTMLElement) => void', required: false, description: '信息窗内容设置回调' },
  { name: 'onPolylinesSet', type: '(polylines: unknown[]) => void', required: false, description: '路线折线添加完成回调' },
  { name: 'onResultsHtmlSet', type: '(container: HTMLElement) => void', required: false, description: '结果面板渲染回调' },
];

// ─── 无入参 Service Hook 的公共返回值片段（data 的类型各不相同，逐个单独写） ───
const serviceState: ApiProp[] = [
  { name: '返回值.loading', type: 'boolean', required: false, description: '请求进行中' },
  { name: '返回值.error', type: 'Error | null', required: false, description: '出错时的错误对象；当前版本不支持该服务时为 UnsupportedCapabilityError' },
  { name: '返回值.supported', type: 'boolean', required: false, description: '当前 JSAPI 版本是否支持该服务' },
  { name: '返回值.cancel()', type: '() => void', required: false, description: '丢弃进行中请求的回调结果，并把 loading 置回 false' },
];


export const API_DATA: Record<string, ApiProp[]> = {
  // ─── Provider ───
  'bmap-provider': [
    { name: 'ak', type: 'string', required: true, description: '百度地图开放平台的 JSAPI 密钥（需配置域名白名单）' },
    { name: 'version', type: 'BMapVersion', required: false, description: 'JSAPI 版本，默认 "4.0"；传 "3.0" 走 v3 driver' },
    { name: 'protocol', type: '"http" | "https"', required: false, description: '脚本加载协议，默认跟随页面' },
    { name: 'serviceHost', type: 'string', required: false, description: '自定义服务域名（私有化部署场景）' },
    { name: 'language', type: 'string', required: false, description: '地图语言' },
    { name: 'plugins', type: 'string[]', required: false, description: '需要一并加载的 JSAPI 插件' },
    { name: 'timeout', type: 'number', required: false, description: '脚本加载超时（毫秒）' },
    { name: 'globalConfig', type: 'Record<string, unknown>', required: false, description: 'JSAPI 全局配置；按值比较，内联对象不会导致 driver 重建' },
    { name: 'unsupportedBehavior', type: '"silent" | "warn" | "throw"', required: false, description: '当前版本不支持的能力如何处理，默认 "warn"；"throw" 只对能力缺失生效' },
    { name: 'fallback', type: 'ReactNode', required: false, description: '加载中渲染的内容，默认 null' },
    { name: 'errorFallback', type: 'ReactNode', required: false, description: '加载失败渲染的内容，默认 null（子树整体不渲染）' },
    { name: 'onError', type: '(err: Error) => void', required: false, description: '脚本加载失败回调；不传则 console.error 兜底' },
    { name: 'onLoadConflict', type: '(current, requested) => void', required: false, description: '已加载的 SDK 与本次请求的 loadKey 不一致时回调（复用已加载版本）' },
    { name: 'children', type: 'ReactNode', required: false, description: '子树；只有 status 为 ready 时才渲染' },
  ],

  // ─── Map ───
  map: [
    { name: 'center', type: 'Point', required: false, description: '地图中心点' },
    { name: 'zoom', type: 'number', required: false, description: '缩放级别 (3-19)' },
    { name: 'heading', type: 'number', required: false, description: '地图朝向角度 (0-360)，4.0+' },
    { name: 'tilt', type: 'number', required: false, description: '地图倾斜角度 (0-73)，4.0+' },
    { name: 'defaultCenter', type: 'Point', required: false, description: '初始中心点（非受控）' },
    { name: 'defaultZoom', type: 'number', required: false, description: '初始缩放级别（非受控）' },
    { name: 'defaultHeading', type: 'number', required: false, description: '初始朝向角度（非受控），4.0+' },
    { name: 'defaultTilt', type: 'number', required: false, description: '初始倾斜角度（非受控），4.0+' },
    { name: 'minZoom', type: 'number', required: false, description: '最小缩放级别' },
    { name: 'maxZoom', type: 'number', required: false, description: '最大缩放级别' },
    { name: 'mapType', type: 'string | number', required: false, description: '地图类型' },
    { name: 'options', type: 'Record<string, unknown>', required: false, description: 'SDK MapOptions 透传' },
    { name: 'mapStyle', type: 'unknown', required: false, description: '个性化样式 V1（v3）' },
    { name: 'mapStyleV2', type: 'unknown', required: false, description: '个性化样式 V2，4.0+' },
    { name: 'theme', type: 'string', required: false, description: '地图主题 ID' },
    { name: 'defaultCursor', type: 'string', required: false, description: '默认光标' },
    { name: 'draggingCursor', type: 'string', required: false, description: '拖拽时光标' },
    { name: 'enableDragging', type: 'boolean', required: false, description: '启用拖拽' },
    { name: 'enableInertialDragging', type: 'boolean', required: false, description: '启用惯性拖拽' },
    { name: 'enableScrollWheelZoom', type: 'boolean', required: false, description: '启用滚轮缩放' },
    { name: 'enableContinuousZoom', type: 'boolean', required: false, description: '启用连续缩放' },
    { name: 'enableResizeOnCenter', type: 'boolean', required: false, description: '启用中心点不变缩放' },
    { name: 'enableDoubleClickZoom', type: 'boolean', required: false, description: '启用双击缩放' },
    { name: 'enableKeyboard', type: 'boolean', required: false, description: '启用键盘操作' },
    { name: 'enablePinchToZoom', type: 'boolean', required: false, description: '启用双指缩放' },
    { name: 'enableRotate', type: 'boolean', required: false, description: '启用旋转（4.0+）' },
    { name: 'enableRotateGestures', type: 'boolean', required: false, description: '启用旋转手势（4.0+）' },
    { name: 'enableTilt', type: 'boolean', required: false, description: '启用倾斜（4.0+）' },
    { name: 'enableTiltGestures', type: 'boolean', required: false, description: '启用倾斜手势（4.0+）' },
    { name: 'enableAutoResize', type: 'boolean', required: false, description: '启用容器尺寸变化自适应' },
    { name: 'className', type: 'string', required: false, description: '容器 class' },
    { name: 'style', type: 'CSSProperties', required: false, description: '容器样式' },
    { name: 'errorFallback', type: 'ReactNode', required: false, description: '加载失败时的替代内容' },
    { name: 'children', type: 'ReactNode', required: false, description: '覆盖物/控件/图层子节点，地图就绪后才挂载' },
    { name: 'onReady', type: '(map: MapHandle) => void', required: false, description: '地图就绪回调' },
    { name: 'onCenterChange', type: '(point: Point) => void', required: false, description: '中心点变化' },
    { name: 'onZoomChange', type: '(zoom: number) => void', required: false, description: '缩放级别变化' },
    { name: 'onHeadingChange', type: '(heading: number) => void', required: false, description: '朝向变化（4.0+）' },
    { name: 'onTiltChange', type: '(tilt: number) => void', required: false, description: '倾斜变化（4.0+）' },
    { name: 'onClick', type: '(e: MapMouseEvent) => void', required: false, description: '点击地图' },
    { name: 'onDblClick', type: '(e: MapMouseEvent) => void', required: false, description: '双击地图' },
    { name: 'onRightClick', type: '(e: MapMouseEvent) => void', required: false, description: '右键点击地图' },
    { name: 'onMouseMove', type: '(e: MapMouseEvent) => void', required: false, description: '鼠标移动' },
    { name: 'onMouseDown', type: '(e: MapMouseEvent) => void', required: false, description: '鼠标按下' },
    { name: 'onMouseUp', type: '(e: MapMouseEvent) => void', required: false, description: '鼠标抬起' },
    { name: 'onMouseOver', type: '(e: MapMouseEvent) => void', required: false, description: '鼠标移入' },
    { name: 'onMouseOut', type: '(e: MapMouseEvent) => void', required: false, description: '鼠标移出' },
    { name: 'onDragStart', type: '(e: MapMoveEvent) => void', required: false, description: '拖拽开始' },
    { name: 'onDragging', type: '(e: MapMoveEvent) => void', required: false, description: '拖拽中' },
    { name: 'onDragEnd', type: '(e: MapMoveEvent) => void', required: false, description: '拖拽结束' },
    { name: 'onMoveStart', type: '(e: MapMoveEvent) => void', required: false, description: '移动开始' },
    { name: 'onMoving', type: '(e: MapMoveEvent) => void', required: false, description: '移动中' },
    { name: 'onMoveEnd', type: '(e: MapMoveEvent) => void', required: false, description: '移动结束' },
    { name: 'onZoomStart', type: '(e: MapZoomEvent) => void', required: false, description: '缩放开始' },
    { name: 'onZooming', type: '(e: MapZoomEvent) => void', required: false, description: '缩放中' },
    { name: 'onZoomEnd', type: '(e: MapZoomEvent) => void', required: false, description: '缩放结束' },
    { name: 'onResize', type: '(e: MapEvent) => void', required: false, description: '容器尺寸变化' },
    { name: 'onTilesLoaded', type: '(e: MapEvent) => void', required: false, description: '瓦片加载完成' },
    { name: 'onMapTypeChange', type: '(e: MapEvent) => void', required: false, description: '地图类型改变' },
    { name: 'onTouchStart', type: '(e: MapMouseEvent) => void', required: false, description: '触摸开始' },
    { name: 'onTouchMove', type: '(e: MapMouseEvent) => void', required: false, description: '触摸移动' },
    { name: 'onTouchEnd', type: '(e: MapMouseEvent) => void', required: false, description: '触摸结束' },
    { name: 'onLongPress', type: '(e: MapMouseEvent) => void', required: false, description: '长按' },
  ],

  // ─── Overlay ───
  marker: [
    position,
    { name: 'icon', type: 'string | IconOptions | SymbolOptions', required: false, description: '标注图标，可传字符串预设名或自定义配置' },
    { name: 'offset', type: '{ width: number; height: number }', required: false, description: '标注偏移' },
    { name: 'anchor', type: 'ControlAnchor', required: false, description: '锚点位置' },
    { name: 'title', type: 'string', required: false, description: '鼠标 hover 标题' },
    { name: 'rotation', type: 'number', required: false, description: '旋转角度 (0-360)' },
    { name: 'opacity', type: 'number', required: false, description: '透明度 (0-1)，4.0+' },
    { name: 'color', type: 'string', required: false, description: '标注颜色，4.0+' },
    { name: 'rank', type: 'number', required: false, description: '碰撞检测优先级，4.0+' },
    { name: 'rotationOrigin', type: 'number', required: false, description: '旋转中心，4.0+' },
    { name: 'shadow', type: 'PlainIcon', required: false, description: '阴影图标（仅 v3）' },
    zIndexProp,
    { name: 'baseZIndex', type: 'number', required: false, description: '基础 zIndex（构造函数）' },
    { name: 'enableDragging', type: 'boolean', required: false, description: '是否可拖拽' },
    { name: 'raiseOnDrag', type: 'boolean', required: false, description: '拖拽时抬起效果' },
    { name: 'draggingCursor', type: 'string', required: false, description: '拖拽时光标' },
    { name: 'restrictDraggingArea', type: 'boolean', required: false, description: '限制拖拽区域（构造函数）' },
    { name: 'enableCollisionDetection', type: 'boolean', required: false, description: '碰撞检测，4.0+（构造函数）' },
    { name: 'enableDraggingMap', type: 'boolean', required: false, description: '拖拽时移动地图，4.0+（构造函数）' },
    ...overlayEvents,
    onRightClick, onMouseDown, onMouseUp, onRemove,
    { name: 'onDragStart', type: '(point: Point, raw: unknown) => void', required: false, description: '拖拽开始' },
    { name: 'onDragging', type: '(point: Point, raw: unknown) => void', required: false, description: '拖拽中' },
    { name: 'onDragEnd', type: '(point: Point, raw: unknown) => void', required: false, description: '拖拽结束' },
  ],
  label: [
    position,
    { name: 'content', type: 'string', required: true, description: '标签文本' },
    { name: 'width', type: 'number', required: false, description: '标签宽度（像素），仅在大于 0 时生效' },
    { name: 'styles', type: 'Record<string, string | number>', required: false, description: 'CSS 样式键值对（如 { color: \'#f00\', fontSize: \'14px\' }）' },
    { name: 'offset', type: '{ width: number; height: number }', required: false, description: '标签偏移' },
    { name: 'anchor', type: 'ControlAnchor', required: false, description: '锚点位置' },
    { name: 'title', type: 'string', required: false, description: '鼠标 hover 标题' },
    { name: 'opacity', type: 'number', required: false, description: '透明度 (0-1)，4.0+' },
    zIndexProp,
    enableMassClear, enableClicking, visible,
    onClick, onMouseOver, onMouseOut, onDoubleClick, onRightClick, onMouseDown, onMouseUp, onRemove,
  ],
  polyline: [
    path, ...strokeProps, ...strokeExtras, linkRight, enableMassClear, enableEditing, enableClicking, visible,
    { name: 'geodesic', type: 'boolean', required: false, description: '是否大地线' },
    { name: 'clip', type: 'boolean', required: false, description: '是否裁剪' },
    { name: 'strokeTexture', type: '{ url: string; width?: number; height?: number }', required: false, description: '纹理贴线' },
    { name: 'icons', type: 'IconSequenceOptions[]', required: false, description: '图标序列' },
    onClick, onMouseOver, onMouseOut, onDoubleClick, onRightClick, onRightDoubleClick,
    onMouseDown, onMouseUp, onMouseMove, onRemove, onLineUpdate, ...lineEditEvents,
  ],
  polygon: [
    path, ...strokeProps, ...strokeExtras, linkRight, ...fillProps, enableMassClear, enableEditing, enableClicking, visible,
    onClick, onMouseOver, onMouseOut, onDoubleClick, onRightClick, onRightDoubleClick,
    onMouseDown, onMouseUp, onMouseMove, onRemove, onLineUpdate, ...lineEditEvents,
  ],
  circle: [
    { name: 'center', type: 'Point', required: true, description: '圆心坐标 { lng, lat }' },
    { name: 'radius', type: 'number', required: true, description: '半径（米）' },
    // Circle 不支持 strokeLineCap / strokeLineJoin / linkRight
    ...strokeProps, dashArray, coordTypeProp, zIndexProp, ...fillProps, enableMassClear, enableEditing, enableClicking, visible,
    onClick, onMouseOver, onMouseOut, onDoubleClick, onRightClick, onRightDoubleClick,
    onMouseDown, onMouseUp, onMouseMove, onRemove, onLineUpdate, ...lineEditEvents,
  ],
  rectangle: [
    { name: 'bounds', type: 'Bounds', required: true, description: '矩形边界 { sw, ne }' },
    // Rectangle 不支持 strokeLineCap / strokeLineJoin
    ...strokeProps, dashArray, coordTypeProp, zIndexProp, linkRight, ...fillProps, enableMassClear, enableEditing, enableClicking, visible,
    onClick, onMouseOver, onMouseOut, onDoubleClick, onRightClick, onRightDoubleClick,
    onMouseDown, onMouseUp, onMouseMove, onRemove, onLineUpdate, ...lineEditEvents,
  ],
  'bezier-curve': [
    path,
    { name: 'controlPoints', type: 'Point[][]', required: true, description: '控制点数组，二阶贝塞尔每段一个控制点，组数 = path.length - 1' },
    ...strokeProps, dashArray, enableMassClear, enableClicking, visible, zIndexProp,
    onClick, onMouseOver, onMouseOut, onDoubleClick, onRightClick, onRightDoubleClick,
    onMouseDown, onMouseUp, onMouseMove, onRemove, onLineUpdate,
  ],
  prism: [
    path,
    { name: 'altitude', type: 'number', required: true, description: '棱柱高度（米）' },
    { name: 'topFillColor', type: 'string', required: false, description: '顶面填充颜色' },
    { name: 'topFillOpacity', type: 'number', required: false, description: '顶面填充透明度 (0-1)' },
    { name: 'sideFillColor', type: 'string', required: false, description: '侧面填充颜色' },
    { name: 'sideFillOpacity', type: 'number', required: false, description: '侧面填充透明度 (0-1)' },
    enableMassClear, enableClicking, visible, zIndexProp,
    onClick, onMouseOver, onMouseOut, onDoubleClick, onRightClick, onRightDoubleClick,
    onMouseDown, onMouseUp, onMouseMove, onRemove, onLineUpdate,
  ],
  'ground-overlay': [
    { name: 'bounds', type: 'Bounds', required: true, description: '地面边界 { sw, ne }' },
    { name: 'url', type: 'string | HTMLCanvasElement', required: false, description: '图片/视频地址，或 canvas 元素（type=canvas 时），4.0+' },
    { name: 'opacity', type: 'number', required: false, description: '透明度 (0-1)' },
    { name: 'type', type: '"image" | "video" | "canvas"', required: false, description: '叠加类型' },
    { name: 'imageURL', type: 'string', required: false, description: '图片地址（仅 v3）' },
    { name: 'stretch', type: 'boolean', required: false, description: '是否拉伸（仅 v3）' },
    { name: 'top', type: 'boolean', required: false, description: '是否置顶' },
    { name: 'isReDraw', type: 'boolean', required: false, description: '是否重绘' },
    { name: 'drawHook', type: '() => void', required: false, description: '绘制钩子' },
    { name: 'displayOnMinLevel', type: 'number', required: false, description: '最小显示层级' },
    { name: 'displayOnMaxLevel', type: 'number', required: false, description: '最大显示层级' },
    enableMassClear, enableClicking, visible, zIndexProp,
    onClick, onMouseOver, onMouseOut, onDoubleClick, onRightClick, onRightDoubleClick,
    onMouseDown, onMouseUp, onMouseMove, onRemove, onLineUpdate,
  ],
  'ground-point': [
    { name: 'point', type: 'Point', required: true, description: '坐标位置 { lng, lat }' },
    { name: 'url', type: 'string', required: false, description: '图标地址（只接受图片地址，不接受 canvas）' },
    { name: 'size', type: '{ width: number; height: number }', required: false, description: '坐标点尺寸（像素）' },
    { name: 'anchor', type: '{ width: number; height: number }', required: false, description: '锚点位置' },
    { name: 'scale', type: 'number', required: false, description: '缩放比例' },
    { name: 'rotation', type: 'number', required: false, description: '旋转角度' },
    { name: 'offset', type: '{ width: number; height: number }', required: false, description: '偏移量' },
    { name: 'level', type: 'number', required: false, description: '尺寸参考的缩放级别（默认 18）' },
    { name: 'opacity', type: 'number', required: false, description: '透明度 (0-1)' },
    { name: 'imageURL', type: 'string', required: false, description: '图片地址（仅 v3）' },
    { name: 'displayOnMinLevel', type: 'number', required: false, description: '最小显示层级' },
    { name: 'displayOnMaxLevel', type: 'number', required: false, description: '最大显示层级' },
    enableMassClear, enableClicking, visible, zIndexProp,
    onClick, onMouseOver, onMouseOut, onDoubleClick, onRightClick, onRightDoubleClick,
    onMouseDown, onMouseUp, onMouseMove, onRemove, onLineUpdate,
  ],
  'point-collection': [
    { name: 'points', type: 'Point[]', required: true, description: '点坐标数组' },
    { name: 'shape', type: 'number', required: false, description: '点形状常量 (BMAP_POINT_SHAPE_*)' },
    { name: 'color', type: 'string', required: false, description: '点颜色' },
    { name: 'size', type: 'number', required: false, description: '点大小 (1-5)' },
    enableMassClear, visible,
    onClick, onMouseOver, onMouseOut,
  ],
  'info-window': [
    { name: 'position', type: 'Point', required: false, description: '打开位置（不在 Marker 内嵌时必传）' },
    { name: 'content', type: 'string | HTMLElement', required: true, description: '信息窗内容（支持 HTML）' },
    { name: 'open', type: 'boolean', required: false, description: '受控打开/关闭' },
    { name: 'width', type: 'number', required: false, description: '信息窗宽度' },
    { name: 'height', type: 'number', required: false, description: '信息窗高度' },
    { name: 'maxWidth', type: 'number', required: false, description: '最大宽度' },
    { name: 'offset', type: '{ width: number; height: number }', required: false, description: '偏移量' },
    { name: 'title', type: 'string', required: false, description: '信息窗标题' },
    { name: 'enableAutoPan', type: 'boolean', required: false, description: '打开时自动平移地图' },
    { name: 'enableCloseOnClick', type: 'boolean', required: false, description: '点击地图关闭' },
    { name: 'enableMessage', type: 'boolean', required: false, description: '是否在信息窗里显示短信（仅 v3）' },
    { name: 'message', type: 'string', required: false, description: '短信内容（仅 v3）' },
    { name: 'maxContent', type: 'string', required: false, description: '最大化时的内容' },
    { name: 'enableMaximize', type: 'boolean', required: false, description: '是否启用最大化' },
    visible,
    { name: 'onOpen', type: '(raw: unknown) => void', required: false, description: '打开回调' },
    { name: 'onClose', type: '(raw: unknown) => void', required: false, description: '关闭回调（含 X 按钮关闭）' },
    { name: 'onClickClose', type: '(raw: unknown) => void', required: false, description: '点击关闭按钮回调' },
    { name: 'onMaximize', type: '(raw: unknown) => void', required: false, description: '最大化回调（需开启 enableMaximize）' },
    { name: 'onRestore', type: '(raw: unknown) => void', required: false, description: '还原回调' },
    { name: 'onResize', type: '(raw: unknown) => void', required: false, description: '尺寸变化回调' },
  ],
  symbol: [
    { name: 'path', type: 'string | number', required: true, description: 'SVG path 字符串或 BMap_Symbol_SHAPE_* 常量' },
    { name: 'anchor', type: '{ width: number; height: number }', required: false, description: '锚点位置（相对图标自身坐标系）' },
    { name: 'fillColor', type: 'string', required: false, description: '填充颜色' },
    { name: 'fillOpacity', type: 'number', required: false, description: '填充透明度' },
    { name: 'strokeColor', type: 'string', required: false, description: '描边颜色' },
    { name: 'strokeOpacity', type: 'number', required: false, description: '描边透明度' },
    { name: 'strokeWeight', type: 'number', required: false, description: '描边宽度' },
    { name: 'scale', type: 'number', required: false, description: '缩放比例' },
    { name: 'rotation', type: 'number', required: false, description: '旋转角度' },
  ],
  icon: [
    { name: 'url', type: 'string', required: true, description: '图片 URL' },
    { name: 'size', type: '{ width: number; height: number }', required: true, description: '图标尺寸' },
    { name: 'imageOffset', type: '{ width: number; height: number }', required: false, description: '图片裁切偏移' },
    { name: 'imageSize', type: '{ width: number; height: number }', required: false, description: '图片裁切尺寸' },
    { name: 'anchor', type: '{ width: number; height: number }', required: false, description: '锚点位置' },
    { name: 'infoWindowAnchor', type: '{ width: number; height: number }', required: false, description: '信息窗锚点（仅 v3）' },
    { name: 'printImageUrl', type: 'string', required: false, description: '打印图 URL（仅 v3）' },
    { name: 'srcset', type: "{ '2x': string }", required: false, description: '高清屏图片' },
  ],
  'icon-sequence': [
    { name: 'symbol', type: 'unknown', required: false, description: '符号样式（useSymbol 返回值或 SDK Symbol 实例）' },
    { name: 'offset', type: 'string', required: false, description: '符号相对线起点的位置，百分比（如 "50%"）或像素值' },
    { name: 'repeat', type: 'string', required: false, description: '符号重复间距，百分比或像素值；与 offset 同时设置时以 repeat 为准' },
    { name: 'fixedRotation', type: 'boolean', required: false, description: '图标旋转角度是否与线走向一致' },
  ],
  'custom-overlay': [
    { name: 'point', type: 'Point', required: false, description: '坐标位置 { lng, lat }' },
    { name: 'anchors', type: '[number, number]', required: false, description: '锚点比例（x, y 各 0-1）' },
    { name: 'offsetX', type: 'number', required: false, description: 'X 轴偏移' },
    { name: 'offsetY', type: 'number', required: false, description: 'Y 轴偏移' },
    { name: 'rotation', type: 'number', required: false, description: '旋转角度' },
    { name: 'rotationInit', type: 'number', required: false, description: '初始旋转基准角度（度）' },
    { name: 'minZoom', type: 'number', required: false, description: '最小显示层级' },
    { name: 'maxZoom', type: 'number', required: false, description: '最大显示层级' },
    { name: 'properties', type: 'Record<string, unknown>', required: false, description: '自定义属性' },
    { name: 'fixBottom', type: 'boolean', required: false, description: '是否贴底' },
    { name: 'useTranslate', type: 'boolean', required: false, description: '是否用 transform 定位（性能更好）' },
    { name: 'autoFollowHeadingChanged', type: 'boolean', required: false, description: '是否跟随地图旋转' },
    { name: 'enableMassClear', type: 'boolean', required: false, description: '是否在 clearOverlays 时清除' },
    { name: 'enableDraggingMap', type: 'boolean', required: false, description: '是否可拖动地图' },
    { name: 'children', type: 'ReactNode', required: true, description: '自定义 HTML 内容' },
    visible,
    onClick, onMouseOver, onMouseOut,
  ],
  'marker-3d': [
    position,
    { name: 'height', type: 'number', required: true, description: '3D 高度（米）' },
    { name: 'shape', type: 'number', required: false, description: '形状 (1=圆形, 2=方形)' },
    { name: 'size', type: 'number', required: false, description: '尺寸 (像素)' },
    fillColor, fillOpacity, enableMassClear, visible,
    onClick, onDoubleClick, onRightClick, onMouseOver, onMouseOut, onMouseDown, onMouseUp,
  ],
  'map-mask': [
    { name: 'bounds', type: 'Bounds', required: true, description: '遮罩边界 { sw, ne }' },
    { name: 'showRegion', type: '"inside" | "outside"', required: false, description: '显示区域：inside=遮罩内, outside=遮罩外' },
    { name: 'isBuildingMask', type: 'boolean', required: false, description: '是否遮罩建筑物' },
    { name: 'isPoiMask', type: 'boolean', required: false, description: '是否遮罩 POI' },
    { name: 'isMapMask', type: 'boolean', required: false, description: '是否遮罩底图' },
  ],
  'simple-info-window': [
    position,
    { name: 'content', type: 'string', required: true, description: '信息窗内容' },
    { name: 'open', type: 'boolean', required: false, description: '受控打开/关闭' },
    { name: 'width', type: 'number', required: false, description: '信息窗宽度' },
    { name: 'height', type: 'number', required: false, description: '信息窗高度' },
    { name: 'maxWidth', type: 'number', required: false, description: '最大宽度' },
    { name: 'offset', type: '{ width: number; height: number }', required: false, description: '偏移量' },
    { name: 'title', type: 'string', required: false, description: '标题' },
    { name: 'maxContent', type: 'string', required: false, description: '最大化时的内容' },
    { name: 'enableMaximize', type: 'boolean', required: false, description: '是否启用最大化' },
    { name: 'enableAutoPan', type: 'boolean', required: false, description: '打开时自动平移地图' },
    { name: 'enableCloseOnClick', type: 'boolean', required: false, description: '点击地图关闭' },
    { name: 'onOpen', type: '() => void', required: false, description: '打开回调' },
    { name: 'onClose', type: '() => void', required: false, description: '关闭回调' },
    { name: 'onResize', type: '() => void', required: false, description: '尺寸变化回调' },
  ],
  'place-detail-overlay': [
    { name: 'uid', type: 'string', required: true, description: 'POI 唯一标识' },
    { name: 'open', type: 'boolean', required: false, description: '是否打开（需挂在 Marker 内）' },
    { name: 'options', type: 'PlaceDetailOptions', required: false, description: '详情选项' },
    { name: 'children', type: 'ReactNode', required: false, description: '自定义内容' },
  ],

  // ─── Control ───
  'navigation-control': [
    anchor, offset,
    { name: 'type', type: 'NavigationControlType', required: false, description: '控件类型' },
    { name: 'showZoomInfo', type: 'boolean', required: false, description: '是否显示缩放级别（仅创建时生效）' },
    { name: 'enableGeolocation', type: 'boolean', required: false, description: '是否显示定位按钮（仅创建时生效）' },
    visible,
  ],
  'navigation-control-3d': [anchor, offset, visible],
  'scale-control': [
    anchor, offset,
    { name: 'unit', type: 'LengthUnit', required: false, description: '比例尺单位制（metric / imperial）' },
    visible,
  ],
  'overview-map-control': [
    anchor, offset,
    { name: 'size', type: 'Size', required: false, description: '缩略地图尺寸' },
    { name: 'isOpen', type: 'boolean', required: false, description: '是否展开（仅创建时生效）' },
    { name: 'zoomInterval', type: 'number', required: false, description: '与主图的级别差（仅创建时生效）' },
    { name: 'padding', type: 'number', required: false, description: '内边距（仅创建时生效）' },
    { name: 'onViewChanged', type: '(raw: unknown) => void', required: false, description: '视野变化完成回调' },
    { name: 'onViewChanging', type: '(raw: unknown) => void', required: false, description: '视野变化中回调' },
    { name: 'onResize', type: '(raw: unknown) => void', required: false, description: '尺寸变化回调' },
    visible,
  ],
  'map-type-control': [
    anchor, offset,
    { name: 'type', type: 'MapTypeControlType', required: false, description: '控件类型（仅创建时生效）' },
    { name: 'mapTypes', type: 'unknown[]', required: false, description: '可切换的地图类型（仅创建时生效）' },
    { name: 'enableSwitch', type: 'boolean', required: false, description: '是否允许切换（仅创建时生效）' },
    { name: 'showStreetLayer', type: 'boolean', required: false, description: '是否显示路网层' },
    visible,
  ],
  'copyright-control': [
    anchor, offset,
    { name: 'copyrights', type: 'CopyrightItem[]', required: false, description: '版权信息数组 [{ id, content, bounds }]' },
    visible,
  ],
  'geolocation-control': [
    anchor, offset,
    { name: 'showAddressBar', type: 'boolean', required: false, description: '是否显示地址栏（仅创建时生效）' },
    { name: 'enableAutoLocation', type: 'boolean', required: false, description: '是否自动定位' },
    { name: 'locationIcon', type: 'PlainIcon', required: false, description: '定位点图标' },
    { name: 'watchPosition', type: 'boolean', required: false, description: '是否持续跟踪定位' },
    { name: 'useCompass', type: 'boolean', required: false, description: '是否使用指南针' },
    { name: 'autoZoom', type: 'boolean', required: false, description: '定位后是否自动缩放' },
    { name: 'autoViewport', type: 'boolean', required: false, description: '定位后是否自动调整视野' },
    { name: 'onLocationStart', type: '(onSuccess: Function, onFail: Function) => boolean | void', required: false, description: '定位前回调，返回 false 可阻止默认定位（4.0+）' },
    { name: 'onLocationSuccess', type: '(raw: unknown) => void', required: false, description: '定位成功回调' },
    { name: 'onLocationError', type: '(raw: unknown) => void', required: false, description: '定位失败回调' },
    visible,
  ],
  'panorama-control': [anchor, offset, visible],
  'zoom-control': [anchor, offset, visible],
  'city-list-control': [
    anchor, offset,
    { name: 'expand', type: 'boolean', required: false, description: '是否默认展开（仅创建时生效）' },
    { name: 'trigger', type: 'HTMLElement', required: false, description: '自定义触发元素（4.0+，仅创建时生效）' },
    { name: 'canCheckSize', type: 'boolean', required: false, description: '是否检测尺寸（仅创建时生效）' },
    { name: 'onChangeBefore', type: '() => void', required: false, description: '切换城市前回调' },
    { name: 'onChangeAfter', type: '() => void', required: false, description: '切换城市后回调' },
    { name: 'onChangeSuccess', type: '(poi: { city: string; code: string | number }) => void', required: false, description: '切换城市成功回调' },
    { name: 'onOpen', type: '() => void', required: false, description: '城市列表展开回调（4.0+）' },
    { name: 'onClose', type: '() => void', required: false, description: '城市列表收起回调（4.0+）' },
    visible,
  ],

  // ─── Layer ───
  'tile-layer': [
    { name: 'tileUrlTemplate', type: 'string', required: false, description: '瓦片 URL 模板，如 http://.../{Z}/{X}/{Y}.png' },
    { name: 'transparentPng', type: 'boolean', required: false, description: '瓦片是否为透明 PNG' },
    { name: 'opacity', type: 'number', required: false, description: '透明度 (0-1)' },
    { name: 'zIndex', type: 'number', required: false, description: '图层层级' },
    { name: 'copyright', type: 'unknown', required: false, description: '版权信息' },
    { name: 'boundary', type: 'string | string[]', required: false, description: '行政区裁剪边界' },
    { name: 'showRegion', type: 'string', required: false, description: '裁剪显示区域（边界内/边界外）' },
    { name: 'retry', type: 'boolean', required: false, description: '瓦片加载失败是否重试' },
    { name: 'retryTime', type: 'number', required: false, description: '重试次数' },
    { name: 'cacheSize', type: 'number', required: false, description: '瓦片缓存数量' },
    { name: 'tileLoadFunction', type: '(tile: HTMLImageElement, url: string) => void', required: false, description: '自定义瓦片加载逻辑' },
  ],
  'normal-layer': [
    ...layerCommon,
    ...layerPick,
    { name: 'isTop', type: 'boolean', required: false, description: '是否置顶显示' },
    { name: 'isLowText', type: 'boolean', required: false, description: '是否压低文字优先级' },
    { name: 'referCenter', type: 'Point', required: false, description: '参考中心点' },
  ],
  'geojson-layer': [
    { name: 'dataSource', type: 'unknown', required: false, description: 'GeoJSON 数据源' },
    { name: 'reference', type: 'string', required: false, description: '数据坐标系' },
    { name: 'markerStyle', type: 'unknown', required: false, description: '点样式' },
    { name: 'polylineStyle', type: 'unknown', required: false, description: '线样式' },
    { name: 'polygonStyle', type: 'unknown', required: false, description: '面样式' },
    { name: 'level', type: 'number', required: false, description: '图层层级' },
    { name: 'minZoom', type: 'number', required: false, description: '最小显示级别' },
    { name: 'maxZoom', type: 'number', required: false, description: '最大显示级别' },
    visible,
  ],
  'district-layer': [
    { name: 'name', type: 'string', required: false, description: '行政区名称，如 "北京市"' },
    { name: 'adcode', type: 'string', required: false, description: '行政区划编码，与 name 二选一' },
    { name: 'kind', type: 'number', required: false, description: '边界类型 (0-4)' },
    { name: 'autoViewport', type: 'boolean', required: false, description: '是否自动调整视野到该行政区' },
    strokeColor, strokeWeight, strokeOpacity, fillColor, fillOpacity,
  ],
  'traffic-layer': [
    { name: 'predictDate', type: '{ weekday: number; hour: number }', required: false, description: '预测日期（3.0）' },
    { name: 'autoRefresh', type: 'boolean', required: false, description: '是否自动刷新路况（4.0+）' },
    { name: 'refreshInterval', type: 'number', required: false, description: '自动刷新间隔，单位毫秒（4.0+）' },
    { name: 'colors', type: 'string[]', required: false, description: '路况颜色 [畅通, 缓行, 拥堵, 严重拥堵]（4.0+）' },
    { name: 'edge', type: 'boolean', required: false, description: '是否显示白边（4.0+）' },
  ],
  'custom-layer': [
    { name: 'geotableId', type: 'string', required: false, description: 'LBS 云检索的表 ID' },
    { name: 'databoxId', type: 'string', required: false, description: 'LBS 云 databox ID' },
    { name: 'q', type: 'string', required: false, description: '检索关键词' },
    { name: 'tags', type: 'string', required: false, description: '检索标签' },
    { name: 'filter', type: 'string', required: false, description: '检索过滤条件' },
    { name: 'pointDensity', type: 'number', required: false, description: '点密度' },
  ],
  'canvas-layer': [
    { name: 'update', type: 'Function', required: false, description: '绘制回调，this 指向图层实例' },
    { name: 'paneName', type: 'string', required: false, description: '所属容器层名称' },
    { name: 'zIndex', type: 'number', required: false, description: '图层层级' },
  ],
  'raster-tile-layer': [
    { name: 'url', type: 'string | ((x, y, z) => string)', required: true, description: '瓦片 URL 模板或生成函数' },
    { name: 'subdomains', type: 'string[]', required: false, description: '子域名列表，替换 URL 中的 {S}' },
    { name: 'projection', type: 'string', required: false, description: '瓦片投影' },
    { name: 'bounds', type: 'number[]', required: false, description: '瓦片有效范围' },
    { name: 'boundsInWGS84', type: 'boolean', required: false, description: 'bounds 是否为 WGS84 坐标' },
    { name: 'minZoom', type: 'number', required: false, description: '最小显示级别' },
    { name: 'maxZoom', type: 'number', required: false, description: '最大显示级别' },
    { name: 'spanLevel', type: 'number', required: false, description: '跨级取图层数' },
    { name: 'opacity', type: 'number', required: false, description: '透明度 (0-1)' },
    { name: 'zIndex', type: 'number', required: false, description: '图层层级' },
    { name: 'useThumbData', type: 'boolean', required: false, description: '是否使用缩略图数据过渡' },
    { name: 'boundary', type: 'string | string[]', required: false, description: '行政区裁剪边界' },
    { name: 'showRegion', type: '"inside" | "outside"', required: false, description: '裁剪显示边界内还是边界外' },
    { name: 'height', type: 'number', required: false, description: '瓦片抬升高度' },
    { name: 'retry', type: 'boolean', required: false, description: '加载失败是否重试' },
    { name: 'retryTime', type: 'number', required: false, description: '重试次数' },
    { name: 'cacheSize', type: 'number', required: false, description: '瓦片缓存数量' },
    { name: 'tileLoadFunction', type: '(tile: HTMLImageElement, url: string) => void', required: false, description: '自定义瓦片加载逻辑' },
  ],
  'feature-layer': [
    ...layerData,
    ...layerCommon,
    { name: 'enablePicked', type: 'boolean', required: false, description: '是否可拾取（响应鼠标事件）' },
    { name: 'autoSelect', type: 'boolean', required: false, description: '拾取后是否自动高亮选中' },
  ],
  'fill-layer': [
    { name: 'style', type: 'FillLayerStyle', required: false, description: '填充/描边样式，见下方 FillLayerStyle' },
    { name: 'border', type: 'boolean', required: false, description: '是否绘制边线' },
    ...layerData,
    ...layerCommon,
    ...layerPick,
  ],
  'dom-layer': [
    { name: 'createDOM', type: '(properties: object, point: Point) => HTMLElement', required: true, description: '为每个数据点创建 DOM 元素的回调' },
    { name: 'data', type: 'object', required: false, description: 'GeoJSON 数据源，变化时调用 setData()' },
    { name: 'offsetX', type: 'number', required: false, description: '横向偏移（像素）' },
    { name: 'offsetY', type: 'number', required: false, description: '纵向偏移（像素）' },
    { name: 'anchors', type: '[number, number]', required: false, description: '锚点比例 [x, y]' },
    { name: 'coordinate', type: 'string', required: false, description: '数据坐标系' },
    { name: 'enableDraggingMap', type: 'boolean', required: false, description: '在元素上拖拽时是否仍可拖动地图' },
    { name: 'nextTick', type: 'boolean', required: false, description: '是否延迟一拍定位以消除首帧抖动，默认 true' },
    { name: 'minZoom', type: 'number', required: false, description: '最小显示级别' },
    { name: 'maxZoom', type: 'number', required: false, description: '最大显示级别' },
    { name: 'zIndex', type: 'number', required: false, description: '图层层级' },
    visible,
  ],
  'point-icon-layer': [
    { name: 'style', type: 'PointIconStyle', required: false, description: '图标样式，见下方 PointIconStyle' },
    { name: 'isFlat', type: 'boolean', required: false, description: '图标是否贴地（随倾斜角变形）' },
    { name: 'isFixed', type: 'boolean', required: false, description: '图标大小是否固定（不随级别缩放）' },
    ...layerData,
    ...layerCommon,
    ...layerPick,
  ],
  'point-shape-layer': [
    { name: 'style', type: 'PointShapeStyle', required: false, description: '图形样式，见下方 PointShapeStyle' },
    { name: 'isFlat', type: 'boolean', required: false, description: '图形是否贴地（随倾斜角变形）' },
    ...layerData,
    ...layerCommon,
    ...layerPick,
  ],
  // PanoramaCoverageLayer 不接受任何 props（Record<string, never>）
  'panorama-coverage-layer': [],
  'line-layer': [
    { name: 'style', type: 'unknown', required: false, description: '线样式' },
    { name: 'idKey', type: 'string', required: false, description: '数据项唯一标识的属性 key' },
    { name: 'crs', type: 'string', required: false, description: '来源坐标系' },
    ...layerCommon,
    { name: 'enablePicked', type: 'boolean', required: false, description: '是否可拾取（响应鼠标事件）' },
  ],
  'pixel-layer': layerCommon,
  'baidu-layer': layerCommon,
  'three-layer': [
    { name: 'alpha', type: 'boolean', required: false, description: '传给 THREE.WebGLRenderer 的 alpha，默认 false。构造期参数，变化会重建图层' },
    { name: 'antialias', type: 'boolean', required: false, description: '传给 THREE.WebGLRenderer 的 antialias，默认 false。构造期参数，变化会重建图层' },
    visible,
    { name: 'minZoom', type: 'number', required: false, description: '最小显示级别，默认 3' },
    { name: 'maxZoom', type: 'number', required: false, description: '最大显示级别，默认 21' },
    { name: 'zIndex', type: 'number', required: false, description: '图层层级，默认 1' },
    { name: 'referCenter', type: 'Point', required: false, description: '参考中心点。对 ThreeLayer 实际无效：render 取的 _updatePolyLayerMatrix() 不带 center，传了世界坐标反而对不上' },
    { name: 'opacity', type: 'number', required: false, description: '已废弃。ThreeLayer.render 从不读它，透明度只能设在 three.js 材质上（material.transparent + material.opacity）；传了会在开发环境提醒一次' },
    { name: 'onInit', type: 'ThreeLayerHook', required: false, description: 'GL 就绪、场景/相机/渲染器创建完成后调用，在这里往场景里加物体' },
    { name: 'onRender', type: 'ThreeLayerHook', required: false, description: '接管渲染。接了它 SDK 就不再调默认的 renderer.render(scene, camera)，必须自己渲染；「有没有传」本身是构造期参数，从无到有会重建图层' },
    { name: 'preRender', type: 'ThreeLayerHook', required: false, description: '每帧渲染前' },
    { name: 'afterRender', type: 'ThreeLayerHook', required: false, description: '每帧渲染后' },
    { name: 'onDestroy', type: 'ThreeLayerHook', required: false, description: '图层销毁前。SDK 随后会 dispose 场景与渲染器，场景里的物体不用自己清' },
    { name: 'onHide', type: 'ThreeLayerHook', required: false, description: '因 visible 或缩放级别超出 [minZoom, maxZoom] 而隐藏时' },
    { name: 'onShow', type: 'ThreeLayerHook', required: false, description: '从隐藏恢复显示时' },
    // 回调签名与 ref 句柄：ThreeLayer 是手写组件，场景操作全靠句柄，不写出来没法用
    { name: 'ThreeLayerHook', type: '(this: ThreeLayerInstance, renderer, scene, camera, layer: ThreeLayerRef) => void', required: false, description: 'SDK 以 hook.bind(this) 调用，普通函数里的 this 是 SDK 图层实例；第 4 个参数 layer 是组件句柄，箭头函数用它' },
    { name: 'ref.raw / scene / camera / renderer', type: 'ThreeLayerInstance | ThreeObject | null', required: false, description: 'SDK 实例与 three.js 对象；GL 就绪（onInit 触发）前为 null' },
    { name: 'ref.add() / remove()', type: '(object: ThreeObject) => void', required: false, description: '往场景加/移除物体；改完记得 triggerRepaint()' },
    { name: 'ref.triggerRepaint() / triggerStop()', type: '() => void', required: false, description: '请求重绘 / 停止重绘循环。animate() 在 needsUpdate 为假时直接 return，场景变了必须自己触发一次' },
    { name: 'ref.refreshMap()', type: '() => void', required: false, description: '重新同步地图状态（尺寸、视野变化后）' },
    { name: 'ref.pick()', type: '(x: number, y: number) => ThreeObject[] | null', required: false, description: '按容器像素坐标拾取，内部走 THREE.Raycaster' },
    { name: 'ref.toWorld()', type: '(point: Point) => [number, number] | null', required: false, description: '经纬度 → three.js 世界坐标（相对默认墨卡托基准点的偏移，单位约等于米）。走 map.toFormatCoords，绕开 v4 里坏掉的实例方法 convertLngLat' },
  ],

  // ─── Service（下表均为 hook 的入参 options，不是组件 props） ───
  'local-search': [
    { name: 'location', type: 'string | Point | MapHandle', required: false, description: '检索城市/区域，可为城市名、坐标或地图实例' },
    { name: 'pageCapacity', type: 'number', required: false, description: '每页结果数 (1-100)' },
    { name: 'pageNum', type: 'number', required: false, description: '页码（v4+ 支持）' },
    { name: 'renderOptions', type: 'LocalSearchRenderOptions', required: false, description: '渲染选项：map / panel / selectFirstResult / autoViewport / viewportOptions' },
    { name: 'onSearchComplete', type: '(results: unknown) => void', required: false, description: '检索完成回调' },
    { name: 'onMarkersSet', type: '(pois: unknown[]) => void', required: false, description: '标注添加完成回调' },
    { name: 'onInfoHtmlSet', type: '(poi: unknown, html: HTMLElement) => void', required: false, description: '信息窗内容设置回调' },
    { name: 'onResultsHtmlSet', type: '(container: HTMLElement) => void', required: false, description: '结果面板渲染回调' },
  ],
  // useGeocoder() 不接受任何参数，下表是返回值上的方法与状态
  geocoder: [
    { name: '（无入参）', type: '—', required: false, description: 'useGeocoder() 不接受参数，需在 <BMapProvider> 内调用' },
    { name: '返回值.getPoint()', type: '(address: string, city?: string) => void', required: false, description: '地址转坐标；city 用来把检索限定在某个城市' },
    { name: '返回值.getLocation()', type: '(point: Point, options?: unknown) => void', required: false, description: '坐标转地址（逆地理编码）' },
    { name: '返回值.data', type: 'GeocoderResult | Point | undefined', required: false, description: 'getLocation() 得到 GeocoderResult（point / address / addressComponents / surroundingPoi / business）；getPoint() 得到的是 Point' },
    ...serviceState,
  ],
  'driving-route': [
    { name: 'policy', type: 'number', required: false, description: '驾车策略（BMAP_DRIVING_POLICY_*）' },
    ...routeCommon,
  ],
  'walking-route': routeCommon,
  'riding-route': routeCommon,
  'transit-route': [
    { name: 'policy', type: 'number', required: false, description: '公交策略（BMAP_TRANSIT_POLICY_*）' },
    ...routeCommon,
  ],

  'bus-line-search': [
    { name: 'location', type: 'string | MapHandle', required: false, description: '检索城市名或地图实例' },
    { name: 'renderOptions', type: '{ map?, panel?, autoViewport? }', required: false, description: '渲染选项' },
    { name: 'onGetBusListComplete', type: '(results: unknown) => void', required: false, description: '线路列表检索完成回调' },
    { name: 'onGetBusLineComplete', type: '(results: unknown) => void', required: false, description: '线路详情检索完成回调' },
  ],
  autocomplete: [
    { name: 'location', type: 'unknown', required: false, description: '检索城市（城市名或坐标）' },
    { name: 'types', type: 'string[]', required: false, description: '返回结果类型限定' },
    { name: 'input', type: 'string | HTMLElement', required: false, description: '绑定的 input 元素或其 id' },
    { name: 'renderOptions', type: '{ map?, panel? }', required: false, description: '渲染选项' },
    { name: 'onSearchComplete', type: '(results: unknown) => void', required: false, description: '检索完成回调' },
    { name: 'onConfirm', type: '(item: unknown) => void', required: false, description: '选中某条建议时回调' },
    { name: 'onHighlight', type: '(item: unknown) => void', required: false, description: '高亮某条建议时回调' },
  ],
  // useBoundary() 不接受任何参数，下表是返回值上的方法与状态
  boundary: [
    { name: '（无入参）', type: '—', required: false, description: 'useBoundary() 不接受参数，需在 <BMapProvider> 内调用' },
    { name: '返回值.get()', type: '(name: string) => void', required: false, description: '按行政区名称检索边界，如 "北京市"、"北京市海淀区"' },
    { name: '返回值.data', type: 'BoundaryResult | undefined', required: false, description: '{ boundaries: string[] }；每项是一圈边界的 "lng,lat;lng,lat;…" 字符串，要自己拆成 Point[] 再交给 Polygon' },
    ...serviceState,
  ],
  geolocation: [
    { name: 'enableSDKLocation', type: 'boolean', required: false, description: '创建时启用 SDK 定位（对应 SDKLocation: true），仅创建时生效' },
  ],
  // useLocalCity() 不接受任何参数，下表是返回值上的方法与状态
  'local-city': [
    { name: '（无入参）', type: '—', required: false, description: 'useLocalCity() 不接受参数，需在 <BMapProvider> 内调用' },
    { name: '返回值.get()', type: '() => void', required: false, description: '按访问者 IP 定位所在城市' },
    { name: '返回值.data', type: 'LocalCityResult | undefined', required: false, description: '{ center, level, name, code? }：center 是城市中心点，level 是该城市建议的地图级别' },
    ...serviceState,
  ],
  'place-detail': [
    { name: 'container', type: 'HTMLElement', required: false, description: '详情面板挂载容器' },
    { name: 'compact', type: 'boolean', required: false, description: '是否使用紧凑样式' },
    { name: 'renderOptions', type: 'unknown', required: false, description: '渲染选项' },
    { name: 'map', type: 'unknown', required: false, description: '关联的地图实例' },
  ],
  // useConvertor() 不接受任何参数，下表是返回值上的方法与状态
  convertor: [
    { name: '（无入参）', type: '—', required: false, description: 'useConvertor() 不接受参数，需在 <BMapProvider> 内调用' },
    { name: '返回值.translate()', type: '(points: Point[], from?: number, to?: number) => void', required: false, description: '批量转换坐标；from / to 是坐标系编号，常用 1 = GPS(WGS84)、3 = 火星坐标(GCJ02)、5 = 百度(BD09)' },
    { name: '返回值.data', type: 'TranslateResults | undefined', required: false, description: '{ status?, points? }：status 为 0 表示成功，points 是转换后的坐标数组' },
    ...serviceState,
  ],
  // usePanoramaService() 不接受任何参数，下表是返回值上的方法与状态
  'panorama-service': [
    { name: '（无入参）', type: '—', required: false, description: 'usePanoramaService() 不接受参数，需在 <BMapProvider> 内调用' },
    { name: '返回值.getPanoramaById()', type: '(id: string) => void', required: false, description: '按全景 id 查询全景数据' },
    { name: '返回值.getPanoramaByLocation()', type: '(point: Point, radius: number) => void', required: false, description: '按坐标查询附近全景，radius 为搜索半径（米）' },
    { name: '返回值.data', type: 'unknown', required: false, description: 'SDK 原始全景数据，大致形如 { id, links, pov }；该点附近没有全景时为 null' },
    ...serviceState,
  ],
  'truck-route': [
    { name: 'policy', type: 'number', required: false, description: '货车路线策略' },
    ...routeCommon,
  ],


  // ─── Other ───
  // 上半是 <ContextMenu> 自己的 props，MenuItem.* 是子组件 <MenuItem> 的 props
  'context-menu': [
    { name: 'children', type: 'ReactNode', required: true, description: 'MenuItem 子节点；没有 children 时不渲染菜单' },
    { name: 'MenuItem.text', type: 'string', required: true, description: '菜单项显示的文字' },
    { name: 'MenuItem.callback', type: '(point?: Point) => void', required: false, description: '点击菜单项时触发，参数是右键点击处的经纬度' },
    { name: 'MenuItem.iconWidth', type: 'number', required: false, description: '菜单项左侧图标区域的宽度（像素），原样透传给 SDK 的 MenuItem 选项' },
  ],
  panorama: [
    { name: 'point', type: 'Point', required: false, description: '全景初始位置（注意这里叫 point，不是 position）' },
    { name: 'style', type: 'CSSProperties', required: false, description: '容器样式' },
    { name: 'className', type: 'string', required: false, description: '自定义类名' },
    { name: 'onPositionChange', type: '(point: Point) => void', required: false, description: '位置变化回调，回调参数是新的位置点' },
    { name: 'onPovChange', type: '() => void', required: false, description: '视角变化回调，无回调参数' },
  ],
  'place-detail-panel': [
    { name: 'uid', type: 'string', required: false, description: 'POI 唯一标识；变化时自动 render(uid)' },
    { name: 'compact', type: 'boolean', required: false, description: '紧凑模式' },
    { name: 'renderOptions', type: 'PlaceDetailRenderOptions', required: false, description: '渲染选项' },
    { name: 'onRender', type: '() => void', required: false, description: '渲染完成回调（SDK 异步请求后触发）' },
    { name: 'className', type: 'string', required: false, description: '自定义类名' },
    { name: 'style', type: 'CSSProperties', required: false, description: '自定义样式' },
  ],

  // ─── Hook（上表为 hook 的入参与返回值，下方「方法」表为返回值上的属性/方法） ───
  // useMapRef / useDriver / useMap 三者分工：操作地图用 useMapRef；版本与能力判断用 useDriver；
  // useMap 只在需要原生地图实例（map.raw）时才用得上。
  'use-map': [
    { name: '（无入参）', type: '—', required: false, description: 'useMap() 不接受参数，需在 <Map> 子树内调用' },
    { name: '返回值', type: 'MapHandle | null', required: false, description: '地图句柄；地图未就绪时为 null。它只是 { __brand, raw } 包装，本身没有方法——想操作地图请用 useMapRef，这个 hook 的价值在于 raw 是取原生地图实例的唯一入口' },
  ],
  'use-driver': [
    { name: '（无入参）', type: '—', required: false, description: 'useDriver() 不接受参数，只需在 <BMapProvider> 内调用（不要求有 <Map>）' },
    { name: '返回值', type: 'BMapDriver | null', required: false, description: '当前版本的 driver；SDK 未加载完成时为 null。driver 的方法都要把 map 当第一个参数传进去，日常不必这么写——useMapRef 已经全量转发过一遍了' },
  ],
  'use-map-ref': [
    { name: '（无入参）', type: '—', required: false, description: 'useMapRef() 不接受参数，需在 <Map> 子树内调用' },
    { name: '返回值', type: 'MapRef | null', required: false, description: '命令式句柄；map / driver 变化时重新生成，地图未就绪时为 null。与 <Map ref={...}> 拿到的是同一个类型，命令式操作地图的首选' },
  ],
  'use-capabilities': [
    { name: '（无入参）', type: '—', required: false, description: 'useCapabilities() 不接受参数，只需在 <BMapProvider> 内调用' },
    { name: '返回值', type: 'ReadonlySet<Capability>', required: false, description: '当前版本支持的能力名集合；driver 未就绪时返回空 Set（不是 null）' },
  ],
  'use-map-event': [
    { name: 'type', type: 'string', required: true, description: 'SDK 原生事件名，如 "click" / "rightclick" / "zoomend"' },
    { name: 'handler', type: '(raw: unknown) => void', required: true, description: '事件回调；handler 用 ref 存最新引用，无需 useCallback' },
    { name: '返回值', type: 'void', required: false, description: '无返回值；卸载或 type 变化时自动解绑' },
  ],
  'use-map-status': [
    { name: '（无入参）', type: '—', required: false, description: 'useMapStatus() 不接受参数，需在 <Map> 子树内调用' },
    { name: '返回值', type: 'MapSnapshot | null', required: false, description: '状态快照；地图未就绪时整体为 null，就绪后各字段仍可能单独为 null' },
  ],
  'use-symbol': [
    { name: 'path', type: 'string | number', required: true, description: 'SVG path 字符串或内置形状常量（BMap_Symbol_SHAPE_*）；变化时重建 Symbol' },
    { name: 'anchor', type: 'Size', required: false, description: '锚点位置，相对于图标自身坐标系' },
    { name: 'fillColor', type: 'string', required: false, description: '填充颜色' },
    { name: 'fillOpacity', type: 'number', required: false, description: '填充透明度 (0-1)' },
    { name: 'scale', type: 'number', required: false, description: '缩放比例，默认 1' },
    { name: 'rotation', type: 'number', required: false, description: '旋转角度（度）' },
    { name: 'strokeColor', type: 'string', required: false, description: '描边颜色' },
    { name: 'strokeOpacity', type: 'number', required: false, description: '描边透明度 (0-1)' },
    { name: 'strokeWeight', type: 'number', required: false, description: '描边线宽，未指定时与 scale 相同' },
    { name: '返回值', type: 'OverlayHandle | null', required: false, description: '可直接传给 Marker 的 icon；句柄存在 ref 里，首帧为 null 且不会自动触发重渲染' },
  ],
  'use-icon': [
    { name: 'url', type: 'string', required: true, description: '图标图片地址；变化时重建 Icon' },
    { name: 'size', type: 'Size', required: true, description: '图标显示尺寸 { width, height }' },
    { name: 'anchor', type: 'Size', required: false, description: '定位锚点（相对图片左上角）；4.0 起建议改用 Marker 的 anchor' },
    { name: 'imageOffset', type: 'Size', required: false, description: '图片偏移（等同 background-position），用于雪碧图切图' },
    { name: 'imageSize', type: 'Size', required: false, description: '图片实际大小（等同 background-size），用于雪碧图 / 高清屏适配' },
    { name: 'infoWindowAnchor', type: 'Size', required: false, description: '信息窗口定位锚点；4.0 已移除' },
    { name: 'printImageUrl', type: 'string', required: false, description: '打印图片地址，仅 IE6 有效；4.0 已移除' },
    { name: 'srcset', type: "{ '2x': string }", required: false, description: '高分屏图片资源集，4.0+' },
    { name: '返回值', type: 'OverlayHandle | null', required: false, description: '可直接传给 Marker 的 icon；句柄存在 ref 里，首帧为 null 且不会自动触发重渲染' },
  ],
};
