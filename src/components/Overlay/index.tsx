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
  Marker3DProps, Marker3DOptions,
} from './types';
import type {
  MarkerProps, LabelProps, PolylineProps, PolygonProps, CircleProps,
  RectangleProps, BezierCurveProps, PrismProps, GroundOverlayProps,
  GroundPointProps, PointCollectionProps, InfoWindowProps, SymbolProps,
  IconProps, IconSequenceProps, HotspotProps, Marker3DProps,
} from './types';

// ─── 点标注 ───
export const Marker = createOverlayComponent<MarkerProps>({
  displayName: 'Marker',
  factory: (d, p) => d.createMarker(p.position, p),
  positionProp: 'position',
  optionProps: ['offset', 'icon', 'enableMassClear', 'enableDragging', 'rotation', 'title', 'zIndex', 'opacity', 'color', 'rank', 'rotationOrigin'],
  // SDK 无 setter，只能 constructor 设置；变化时框架自动重建。
  ctorOnlyProps: ['enableClicking', 'raiseOnDrag', 'draggingCursor', 'shadow', 'baseZIndex', 'restrictDraggingArea', 'enableCollisionDetection', 'enableDraggingMap', 'anchor'],
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
  optionProps: ['content', 'offset', 'enableMassClear', 'styles', 'opacity', 'title', 'zIndex'],
  ctorOnlyProps: ['enableClicking', 'width', 'anchor'],
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
  optionProps: ['radius', 'strokeColor', 'fillColor', 'strokeWeight', 'strokeOpacity', 'fillOpacity', 'strokeStyle', 'enableMassClear', 'zIndex'],
  // SDK 无 setter，只能 constructor 设置；变化时框架自动重建
  // enableEditing: SDK 的 enableEditing() 对 Circle 有 null 访问 bug，用 ctorOnlyProps + rAF 延迟处理
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

// ─── 矩形（v4+） ───
export const Rectangle = createOverlayComponent<RectangleProps>({
  displayName: 'Rectangle',
  factory: (d, p) => d.createRectangle(p.bounds, p),
  // bounds 走 setBounds（在 setOverlayOptions 内按 type 分发），没有 positionProp/pathProp
  optionProps: ['bounds', 'strokeColor', 'fillColor', 'strokeWeight', 'strokeOpacity', 'fillOpacity', 'strokeStyle', 'enableEditing', 'enableMassClear', 'zIndex'],
  // SDK 无 setter，只能 constructor 设置；变化时框架自动重建。
  ctorOnlyProps: ['enableClicking', 'linkRight', 'coordType', 'dashArray'],
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

// ─── 贝塞尔曲线（v4+） ───
export const BezierCurve = createOverlayComponent<BezierCurveProps>({
  displayName: 'BezierCurve',
  factory: (d, p) => d.createBezierCurve(p.path, p.controlPoints, p),
  pathProp: 'path',
  // controlPoints 走 setControlPoints（在 setOverlayOptions 内按 type 分发）
  optionProps: ['controlPoints', 'strokeColor', 'strokeWeight', 'strokeOpacity', 'strokeStyle', 'enableMassClear', 'zIndex'],
  // SDK 无 setter，只能 constructor 设置；变化时框架自动重建
  ctorOnlyProps: ['enableClicking', 'dashArray'],
  // BezierCurveEventMap 不含编辑相关事件（SDK 无 enableEditing）
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
  ],
});

// ─── 3D 棱柱（v4+） ───
export const Prism = createOverlayComponent<PrismProps>({
  displayName: 'Prism',
  factory: (d, p) => d.createPrism(p.path, p.altitude, p),
  pathProp: 'path',
  // altitude 走 setAltitude（在 setOverlayOptions 内按 type 分发）
  optionProps: ['altitude', 'topFillColor', 'topFillOpacity', 'sideFillColor', 'sideFillOpacity', 'enableMassClear', 'zIndex'],
  // SDK 无 setter，只能 constructor 设置；变化时框架自动重建
  ctorOnlyProps: ['enableClicking'],
  // PrismEventMap 不含编辑相关事件（SDK 无 enableEditing）
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
  ],
});

// ─── 地面叠加图 ───
export const GroundOverlay = createOverlayComponent<GroundOverlayProps>({
  displayName: 'GroundOverlay',
  factory: (d, p) => d.createGroundOverlay(p.bounds, p),
  // bounds 走 setBounds（在 setOverlayOptions 内按 type 分发），没有 positionProp/pathProp
  optionProps: [
    'bounds', 'opacity', 'url', 'imageURL',
    'displayOnMinLevel', 'displayOnMaxLevel',
    'enableMassClear', 'zIndex',
  ],
  // SDK 无 setter，只能 constructor 设置；变化时框架自动重建。
  // type/top/isReDraw/drawHook 都只在构造时读取；stretch 仅 v3 有效（v4 已移除）。
  ctorOnlyProps: ['enableClicking', 'type', 'top', 'isReDraw', 'drawHook', 'stretch'],
  // GroundOverlayEventMap：click/dblclick/remove 为 v3+，其余 v4+；无编辑相关事件
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
  ],
});

// ─── 地面点 ───
export const GroundPoint = createOverlayComponent<GroundPointProps>({
  displayName: 'GroundPoint',
  factory: (d, p) => d.createGroundPoint(p.point, p),
  positionProp: 'point',
  optionProps: [
    'url', 'size', 'anchor', 'scale', 'rotation', 'offset',
    'opacity', 'imageURL', 'displayOnMinLevel', 'displayOnMaxLevel',
    'enableMassClear', 'zIndex',
  ],
  // SDK 无 setter：level（仅构造时读取）、enableClicking（GroundOverlay 继承，无 disable 方法）
  // type/top/isReDraw/drawHook 继承自 GroundOverlayOptions，仅构造时读取
  ctorOnlyProps: ['level', 'enableClicking', 'type', 'top', 'isReDraw', 'drawHook'],
  // GroundOverlayEventMap：无 GroundPointEventMap，事件沿用 GroundOverlay 的一套；整体 @since 4.0
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
  ],
});

// ─── 海量点 ───
export const PointCollection = createOverlayComponent<PointCollectionProps>({
  displayName: 'PointCollection',
  factory: (d, p) => d.createPointCollection(p.points, p),
  pathProp: 'points',
  optionProps: ['shape', 'color', 'size', 'enableMassClear'],
  // PointCollectionEventMap：整体 @removed 4.0（仅 v3）
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
  ],
});

// ─── 信息窗口（独立组件，见 InfoWindow.tsx） ───
export { InfoWindow } from './InfoWindow';

// ─── 矢量符号 ───
// Symbol 是值对象（非 Overlay），用作 Marker 的 icon；无事件。
// skipMount: 不调 addOverlay；推荐用 useSymbol hook 获取实例传给 Marker。
export const Symbol = createOverlayComponent<SymbolProps>({
  displayName: 'Symbol',
  factory: (d, p) => d.createSymbol(p.path, p),
  optionProps: ['path', 'anchor', 'fillColor', 'fillOpacity', 'scale', 'rotation', 'strokeColor', 'strokeOpacity', 'strokeWeight'],
  skipMount: true,
});

// ─── 图标 ───
// Icon 是值对象（非 Overlay），用作 Marker 的 icon；无事件。
// skipMount: 不调 addOverlay；推荐用 useIcon hook 获取实例传给 Marker。
export const Icon = createOverlayComponent<IconProps>({
  displayName: 'Icon',
  factory: (d, p) => d.createIcon(p.url, p.size, p),
  optionProps: ['url', 'size', 'anchor', 'imageOffset', 'imageSize', 'infoWindowAnchor', 'printImageUrl', 'srcset'],
  skipMount: true,
});

// ─── 图标序列（折线循环图标） ───
// IconSequence 是值对象（非 Overlay），@deprecated 4.0。无 setter/无事件，
// skipMount: 不调 addOverlay；推荐用 driver API 创建后传给 Polyline icons。
export const IconSequence = createOverlayComponent<IconSequenceProps>({
  displayName: 'IconSequence',
  factory: (d, p) => d.createIconSequence(p.symbol as any, p.offset, p.repeat, p.fixedRotation),
  ctorOnlyProps: ['symbol', 'offset', 'repeat', 'fixedRotation'],
  skipMount: true,
});

// ─── 热区 ───
// ─── 热区 ───
// Hotspot 是值对象（非 Overlay），@removed 4.0（仅 v3）。
// 通过 map.addHotspot/removeHotspot 管理，不走 addOverlay。无事件。
export const Hotspot = createOverlayComponent<HotspotProps>({
  displayName: 'Hotspot',
  factory: (d, p) => d.createHotspot(p.position, p),
  positionProp: 'position',
  optionProps: ['text', 'userData'],
  // 无 setter：offsets / minZoom / maxZoom
  ctorOnlyProps: ['offsets', 'minZoom', 'maxZoom'],
});

// ─── 自定义覆盖物（独立组件，见 CustomOverlay.tsx） ───
export { CustomOverlay } from './CustomOverlay';

// ─── 4.0+ 覆盖物 ───
// Marker3D — 3D 标注（v4+ WebGL only）
// SDK: setPosition/setHeight/setFillColor/setFillOpacity 有 setter；shape/size 无 setter，只能构造时设置
// （走 ctorOnlyProps 重建）。且首帧 addOverlay 后 shape/size 不渲染，需等 GL 就绪后重建实例，见 createComponent.tsx
export const Marker3D = createOverlayComponent<Marker3DProps>({
  displayName: 'Marker3D',
  factory: (d, p) => d.createMarker3D(p.position, p.height, p),
  positionProp: 'position',
  optionProps: ['height', 'fillColor', 'fillOpacity'],
  ctorOnlyProps: ['shape', 'size', 'enableMassClear'],
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'dblclick', prop: 'onDoubleClick' },
    { sdk: 'rightclick', prop: 'onRightClick' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousedown', prop: 'onMouseDown' },
    { sdk: 'mouseup', prop: 'onMouseUp' },
  ],
  supportsChildren: true,
});

export { MapMask } from './MapMask';
export type { MapMaskProps, MapMaskOptions } from './MapMask';
export { SimpleInfoWindow } from './SimpleInfoWindow';
export type { SimpleInfoWindowProps, SimpleInfoWindowOptions } from './SimpleInfoWindow';

// ─── PlaceDetail（v4+ 地点详情，类似 InfoWindow 的声明式组件） ───
export { PlaceDetail } from './PlaceDetail';
export type { PlaceDetailProps, PlaceDetailOptions, PlaceDetailRenderOptions } from './PlaceDetail';
