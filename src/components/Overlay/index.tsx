/**
 * 全部 Overlay 组件 — 使用 createOverlayComponent 工厂批量生成。
 * 每个组件约 5 行，统一处理 create/add/remove/update 生命周期。
 */
import { createOverlayComponent } from '../../utils/createComponent';
export type {
  MarkerProps, LabelProps, PolylineProps, PolygonProps, CircleProps,
  RectangleProps, BezierCurveProps, PrismProps, GroundOverlayProps,
  GroundPointProps, PointCollectionProps, InfoWindowProps, SymbolProps,
  IconProps, IconSequenceProps, HotspotProps, CustomOverlayProps,
} from './types';
import type {
  MarkerProps, LabelProps, PolylineProps, PolygonProps, CircleProps,
  RectangleProps, BezierCurveProps, PrismProps, GroundOverlayProps,
  GroundPointProps, PointCollectionProps, InfoWindowProps, SymbolProps,
  IconProps, IconSequenceProps, HotspotProps, CustomOverlayProps,
} from './types';

// ─── 点标注 ───
export const Marker = createOverlayComponent<MarkerProps>({
  displayName: 'Marker',
  factory: (d, p) => d.createMarker(p.position, p),
  positionProp: 'position',
  optionProps: ['offset', 'icon', 'anchor', 'enableMassClear', 'enableDragging', 'rotation', 'title', 'zIndex'],
  // SDK 无 setter，只能 constructor 设置；变化时框架自动重建。
  ctorOnlyProps: ['enableClicking', 'raiseOnDrag', 'draggingCursor', 'shadow'],
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'dblclick', prop: 'onDoubleClick' },
    { sdk: 'rightclick', prop: 'onRightClick' },
    { sdk: 'dragstart', prop: 'onDragStart' },
    { sdk: 'dragging', prop: 'onDragging' },
    { sdk: 'dragend', prop: 'onDragEnd' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousedown', prop: 'onMouseDown' },
    { sdk: 'mouseup', prop: 'onMouseUp' },
    { sdk: 'remove', prop: 'onRemove' },
  ],
  supportsChildren: true,
});

// ─── 文本标注 ───
export const Label = createOverlayComponent<LabelProps>({
  displayName: 'Label',
  factory: (d, p) => d.createLabel(p.content, p),
  positionProp: 'position',
  optionProps: ['content', 'offset', 'anchor', 'enableMassClear', 'styles', 'opacity', 'title', 'zIndex'],
  ctorOnlyProps: ['enableClicking', 'width'],
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'dblclick', prop: 'onDoubleClick' },
    { sdk: 'rightclick', prop: 'onRightClick' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousedown', prop: 'onMouseDown' },
    { sdk: 'mouseup', prop: 'onMouseUp' },
    { sdk: 'remove', prop: 'onRemove' },
  ],
});

// ─── 折线 ───
export const Polyline = createOverlayComponent<PolylineProps>({
  displayName: 'Polyline',
  factory: (d, p) => d.createPolyline(p.path, p),
  pathProp: 'path',
  // 有 setter 的字段
  optionProps: ['strokeColor', 'strokeWeight', 'strokeOpacity', 'strokeStyle', 'enableEditing', 'enableMassClear', 'zIndex'],
  // SDK 无 setter，只能 constructor 设置；变化时框架自动重建
  ctorOnlyProps: ['enableClicking', 'strokeLineCap', 'strokeLineJoin', 'geodesic', 'linkRight', 'clip', 'coordType', 'icons', 'dashArray', 'strokeTexture'],
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'dblclick', prop: 'onDoubleClick' },
    { sdk: 'rightclick', prop: 'onRightClick' },
    { sdk: 'rightdblclick', prop: 'onRightDoubleClick' },
    { sdk: 'mousedown', prop: 'onMouseDown' },
    { sdk: 'mouseup', prop: 'onMouseUp' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousemove', prop: 'onMouseMove' },
    { sdk: 'remove', prop: 'onRemove' },
    { sdk: 'lineupdate', prop: 'onLineUpdate' },
    { sdk: 'editstart', prop: 'onEditStart' },
    { sdk: 'editend', prop: 'onEditEnd' },
    { sdk: 'linevertexdragstart', prop: 'onLineVertexDragStart' },
    { sdk: 'linevertexdragging', prop: 'onLineVertexDragging' },
    { sdk: 'linevertexdragend', prop: 'onLineVertexDragEnd' },
    { sdk: 'linevertexdel', prop: 'onLineVertexDel' },
  ],
});

// ─── 多边形 ───
export const Polygon = createOverlayComponent<PolygonProps>({
  displayName: 'Polygon',
  factory: (d, p) => d.createPolygon(p.path, p),
  pathProp: 'path',
  optionProps: [
    'strokeColor', 'fillColor', 'strokeWeight',
    'strokeOpacity', 'fillOpacity', 'strokeStyle',
    'enableEditing', 'enableMassClear', 'zIndex',
  ],
  ctorOnlyProps: [
    'enableClicking', 'strokeLineCap', 'strokeLineJoin',
    'linkRight', 'coordType', 'dashArray',
  ],
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'dblclick', prop: 'onDoubleClick' },
    { sdk: 'rightclick', prop: 'onRightClick' },
    { sdk: 'rightdblclick', prop: 'onRightDoubleClick' },
    { sdk: 'mousedown', prop: 'onMouseDown' },
    { sdk: 'mouseup', prop: 'onMouseUp' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousemove', prop: 'onMouseMove' },
    { sdk: 'remove', prop: 'onRemove' },
    { sdk: 'lineupdate', prop: 'onLineUpdate' },
    { sdk: 'editstart', prop: 'onEditStart' },
    { sdk: 'editend', prop: 'onEditEnd' },
    { sdk: 'linevertexdragstart', prop: 'onLineVertexDragStart' },
    { sdk: 'linevertexdragging', prop: 'onLineVertexDragging' },
    { sdk: 'linevertexdragend', prop: 'onLineVertexDragEnd' },
    { sdk: 'linevertexdel', prop: 'onLineVertexDel' },
  ],
});

// ─── 圆形 ───
export const Circle = createOverlayComponent<CircleProps>({
  displayName: 'Circle',
  factory: (d, p) => d.createCircle(p.center, p.radius, p),
  positionProp: 'center',
  optionProps: ['radius', 'strokeColor', 'fillColor', 'strokeWeight', 'strokeOpacity', 'fillOpacity', 'strokeStyle', 'enableMassClear'],
  // SDK 无 setter，只能 constructor 设置；变化时框架自动重建
  // enableEditing 也放这里：Circle 的 enableEditing() 有 SDK bug（内部 path 为 null），
  // 用重建替代运行时 enable/disable 调用，由 driver 的 rAF 延迟逻辑处理。
  ctorOnlyProps: ['enableEditing', 'enableClicking', 'coordType', 'dashArray'],
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'dblclick', prop: 'onDoubleClick' },
    { sdk: 'rightclick', prop: 'onRightClick' },
    { sdk: 'rightdblclick', prop: 'onRightDoubleClick' },
    { sdk: 'mousedown', prop: 'onMouseDown' },
    { sdk: 'mouseup', prop: 'onMouseUp' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousemove', prop: 'onMouseMove' },
    { sdk: 'remove', prop: 'onRemove' },
    { sdk: 'lineupdate', prop: 'onLineUpdate' },
    { sdk: 'editstart', prop: 'onEditStart' },
    { sdk: 'editend', prop: 'onEditEnd' },
    { sdk: 'linevertexdragstart', prop: 'onLineVertexDragStart' },
    { sdk: 'linevertexdragging', prop: 'onLineVertexDragging' },
    { sdk: 'linevertexdragend', prop: 'onLineVertexDragEnd' },
    { sdk: 'linevertexdel', prop: 'onLineVertexDel' },
  ],
});

// ─── 矩形 ───
export const Rectangle = createOverlayComponent<RectangleProps>({
  displayName: 'Rectangle',
  factory: (d, p) => d.createRectangle(p.bounds, p),
  optionProps: ['strokeColor', 'fillColor', 'strokeWeight', 'strokeOpacity', 'fillOpacity', 'strokeStyle', 'enableMassClear', 'enableEditing', 'enableClicking'],
});

// ─── 贝塞尔曲线 ───
export const BezierCurve = createOverlayComponent<BezierCurveProps>({
  displayName: 'BezierCurve',
  factory: (d, p) => d.createBezierCurve(p.path, p),
  pathProp: 'path',
  optionProps: ['strokeColor', 'strokeWeight', 'strokeOpacity', 'strokeStyle', 'enableMassClear'],
});

// ─── 3D 棱柱 ───
export const Prism = createOverlayComponent<PrismProps>({
  displayName: 'Prism',
  factory: (d, p) => d.createPrism(p.path, p),
  pathProp: 'path',
  optionProps: ['topFillColor', 'topFillOpacity', 'sideFillColor', 'sideFillOpacity', 'enableMassClear'],
});

// ─── 地面叠加图 ───
export const GroundOverlay = createOverlayComponent<GroundOverlayProps>({
  displayName: 'GroundOverlay',
  factory: (d, p) => d.createGroundOverlay(p.bounds, p),
  optionProps: ['opacity', 'url', 'displayOnMinLevel', 'displayOnMaxLevel', 'imageURL', 'type', 'isReDraw', 'drawHook'],
});

// ─── 地面点 ───
export const GroundPoint = createOverlayComponent<GroundPointProps>({
  displayName: 'GroundPoint',
  factory: (d, p) => d.createGroundPoint(p.point, p),
  positionProp: 'point',
  optionProps: ['url', 'size', 'anchor', 'scale', 'rotation', 'offset', 'level'],
});

// ─── 海量点 ───
export const PointCollection = createOverlayComponent<PointCollectionProps>({
  displayName: 'PointCollection',
  factory: (d, p) => d.createPointCollection(p.points, p),
  optionProps: ['shape', 'color', 'size'],
});

// ─── 信息窗口（独立组件，见 InfoWindow.tsx） ───
export { InfoWindow } from './InfoWindow';

// ─── 矢量符号 ───
export const Symbol = createOverlayComponent<SymbolProps>({
  displayName: 'Symbol',
  factory: (d, p) => d.createSymbol(p.path, p),
  optionProps: ['anchor', 'fillColor', 'fillOpacity', 'scale', 'rotation', 'strokeColor', 'strokeOpacity', 'strokeWeight'],
});

// ─── 图标 ───
export const Icon = createOverlayComponent<IconProps>({
  displayName: 'Icon',
  factory: (d, p) => d.createIcon(p.url, p.size, p),
  optionProps: ['anchor', 'imageOffset', 'imageSize', 'infoWindowAnchor', 'printImageUrl', 'srcset'],
});

// ─── 图标序列（折线循环图标） ───
export const IconSequence = createOverlayComponent<IconSequenceProps>({
  displayName: 'IconSequence',
  factory: (d, p) => d.createIconSequence(p.symbol as any, p.offset, p.repeat, p.fixedRotation),
});

// ─── 热区 ───
export const Hotspot = createOverlayComponent<HotspotProps>({
  displayName: 'Hotspot',
  factory: (d, p) => d.createHotspot(p.position, p),
  positionProp: 'position',
  optionProps: ['text', 'offsets', 'userData', 'minZoom', 'maxZoom'],
});

// ─── 自定义覆盖物 ───
export const CustomOverlay = createOverlayComponent<CustomOverlayProps>({
  displayName: 'CustomOverlay',
  factory: (d, p) => d.createCustomOverlay(p),
  optionProps: ['point', 'anchors', 'offsetX', 'offsetY', 'rotation', 'rotationInit', 'minZoom', 'maxZoom', 'properties', 'fixBottom', 'useTranslate', 'autoFollowHeadingChanged', 'visible', 'zIndex', 'enableMassClear', 'enableDraggingMap'],
  supportsChildren: true,
});

// ─── PlaceDetail（v4+ 地点详情，类似 InfoWindow 的声明式组件） ───
export { PlaceDetail } from './PlaceDetail';
export type { PlaceDetailProps, PlaceDetailOptions, PlaceDetailRenderOptions } from './PlaceDetail';
