/**
 * Overlay Options 类型 — 字段对照 bmap-jsapi-dts/src/overlay/*Options.d.ts。
 * 用 Record<string, unknown> 做基础，子接口精确声明常用字段。
 */
import type { Point, Size, Bounds } from '../../types';
import type { ControlAnchor } from '../../constants';

/**
 * 图标描述（plain object）— 等同于 IconOptions + constructor 的 url/size 参数。
 * 框架内部通过 toRawIcon 自动转成 SDK 的 BMap.Icon 实例，用户无需手动 new BMap.Icon。
 */
export interface PlainIcon extends IconOptions {
  /** 图片资源地址（URL / dataURL） */
  url: string;
  /** 图标可视区域大小 */
  size?: Size;
}

export interface MarkerOptions {
  offset?: Size;
  /** 图标 — 传 plain object，框架自动转 SDK Icon */
  icon?: PlainIcon;
  anchor?: ControlAnchor;
  enableMassClear?: boolean; enableDragging?: boolean; enableClicking?: boolean;
  raiseOnDrag?: boolean; draggingCursor?: string; rotation?: number; title?: string;
  /** 阴影图标 @removed 4.0（仅 v3） */
  shadow?: PlainIcon;
  zIndex?: number;
}
export interface LabelOptions {
  offset?: Size; position?: Point; anchor?: ControlAnchor;
  enableMassClear?: boolean; enableClicking?: boolean; width?: number;
  /** CSS 样式键值对（如 { color: '#f00', fontSize: '14px' }） */
  styles?: Record<string, string | number>;
  /** 透明度 0-1（对应 SDK setOpacity，v4+） */
  opacity?: number;
  /** 鼠标悬停标题（对应 SDK setTitle） */
  title?: string;
  /** 层叠顺序（对应 SDK setZIndex） */
  zIndex?: number;
}
export interface PolylineOptions {
  strokeColor?: string; strokeWeight?: number; strokeOpacity?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  /** 描边线端头类型 @since 4.0 */
  strokeLineCap?: 'round' | 'butt' | 'square';
  /** 描边线连接处类型 @since 4.0 */
  strokeLineJoin?: 'round' | 'miter' | 'bevel';
  enableMassClear?: boolean; enableEditing?: boolean; enableClicking?: boolean;
  /** 大地线模式 */
  geodesic?: boolean;
  /** 跨180度经线最短路径 */
  linkRight?: boolean;
  /** 跨经度180度裁剪 @since 4.0 */
  clip?: boolean;
  /** 输入坐标类型 @since 4.0 */
  coordType?: 'BMAP_COORD_BD09' | 'BMAP_COORD_GCJ02' | 'BMAP_COORD_WGS84';
  /** 配置贴合折线的图标 */
  icons?: unknown[];
  /** 虚线样式 [实线长, 间隙长] @since 4.0 */
  dashArray?: number[];
  /** 线纹理配置 @since 4.0 */
  strokeTexture?: { url: string; width?: number; height?: number };
  zIndex?: number;
}
export interface PolygonOptions {
  strokeColor?: string; fillColor?: string; strokeWeight?: number;
  strokeOpacity?: number; fillOpacity?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  /** 描边线端头类型 @since 4.0 */
  strokeLineCap?: 'round' | 'butt' | 'square';
  /** 描边线连接处类型 @since 4.0 */
  strokeLineJoin?: 'round' | 'miter' | 'bevel';
  enableMassClear?: boolean; enableEditing?: boolean; enableClicking?: boolean;
  /** 跨180度经线最短路径 */
  linkRight?: boolean;
  /** 输入坐标类型 @since 4.0 */
  coordType?: 'BMAP_COORD_BD09' | 'BMAP_COORD_GCJ02' | 'BMAP_COORD_WGS84';
  /** 虚线样式 [实线长, 间隙长] @since 4.0 */
  dashArray?: number[];
  zIndex?: number;
}
/** Circle 不支持 strokeLineCap/strokeLineJoin/linkRight */
export interface CircleOptions {
  strokeColor?: string; fillColor?: string; strokeWeight?: number;
  strokeOpacity?: number; fillOpacity?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  enableMassClear?: boolean; enableEditing?: boolean; enableClicking?: boolean;
  coordType?: 'BMAP_COORD_BD09' | 'BMAP_COORD_GCJ02' | 'BMAP_COORD_WGS84';
  dashArray?: number[];
  zIndex?: number;
}
/**
 * Rectangle 不支持 strokeLineCap/strokeLineJoin。
 * 整个 Rectangle 类 @since 4.0（v3 不存在，driver 返回 null）。
 */
export interface RectangleOptions {
  strokeColor?: string; fillColor?: string; strokeWeight?: number;
  strokeOpacity?: number; fillOpacity?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  enableMassClear?: boolean; enableEditing?: boolean; enableClicking?: boolean;
  /** 跨180度经线最短路径 */
  linkRight?: boolean;
  /** 输入坐标类型 */
  coordType?: 'BMAP_COORD_BD09' | 'BMAP_COORD_GCJ02' | 'BMAP_COORD_WGS84';
  /** 虚线样式 [实线长, 间隙长]，默认实线与空隙均为线宽的 2 倍 */
  dashArray?: number[];
  zIndex?: number;
}
/**
 * BezierCurve 只有描边、没有填充，也不支持编辑 / strokeLineCap / strokeLineJoin / coordType。
 * 整个 BezierCurve 类 @since 4.0（v3 不存在，driver 返回 null）。
 */
export interface BezierCurveOptions {
  strokeColor?: string; strokeWeight?: number; strokeOpacity?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  enableMassClear?: boolean; enableClicking?: boolean;
  /** 虚线样式 [实线长, 间隙长]，默认实线与空隙均为线宽的 2 倍 */
  dashArray?: number[];
  zIndex?: number;
}
/**
 * Prism 只有顶面/侧面填充，没有任何 stroke 系列配置，也不支持编辑。
 * 整个 Prism 类 @since 4.0（v3 不存在，driver 返回 null）。
 */
export interface PrismOptions {
  topFillColor?: string; topFillOpacity?: number;
  sideFillColor?: string; sideFillOpacity?: number;
  enableMassClear?: boolean; enableClicking?: boolean;
  zIndex?: number;
}
export interface GroundOverlayOptions {
  /** 图层透明度 0~1，默认 1 */
  opacity?: number;
  /** 是否允许被 map.clearOverlays() 清除，默认 true */
  enableMassClear?: boolean;
  /** 是否响应鼠标事件，默认 true @since 4.0 */
  enableClicking?: boolean;
  /**
   * 叠加内容来源。type='image' 传图片地址，'video' 传视频地址，'canvas' 直接传 canvas 元素。
   * @since 4.0
   */
  url?: string | HTMLCanvasElement;
  /** 最小缩放级别，v3 默认 1，v4 默认 3 */
  displayOnMinLevel?: number;
  /** 最大缩放级别，v3 默认 19，v4 默认 21 */
  displayOnMaxLevel?: number;
  /** @deprecated 4.0 请使用 url，SDK 仍兼容此配置 */
  imageURL?: string;
  /** 是否拉伸图片填满区域，默认 false @removed 4.0（仅 v3 有效） */
  stretch?: boolean;
  /** 叠加内容类型，默认 'image' @since 4.0 */
  type?: 'image' | 'video' | 'canvas';
  /** 是否绘制在普通覆盖物之上，默认 false @since 4.0 */
  top?: boolean;
  /**
   * 是否开启循环重绘，仅 type='canvas' 生效。开启后每帧调用 drawHook 并重新采集 canvas 作为贴图。
   * 默认 false @since 4.0
   */
  isReDraw?: boolean;
  /** 自定义绘制回调，type='canvas' 且 isReDraw 开启时每帧渲染前调用 @since 4.0 */
  drawHook?: () => void;
  /**
   * 层叠顺序。注意：SDK 的 GroundOverlayOptions 没有此字段（不能通过 constructor 传），
   * 但类上有 setZIndex()，所以这里作为可响应式更新的属性暴露。
   * v4 若需始终置于普通覆盖物之上请用 top。
   */
  zIndex?: number;
}
export interface GroundPointOptions {
  url?: string; size?: Size; anchor?: Size; scale?: number; rotation?: number; offset?: Size; level?: number;
}
export interface PointCollectionOptions { shape?: number; color?: string; size?: number; }
export interface InfoWindowOptions {
  width?: number; height?: number; maxWidth?: number; offset?: Size;
  title?: string; enableAutoPan?: boolean; enableCloseOnClick?: boolean;
  enableMessage?: boolean; message?: string; maxContent?: string; enableMaximize?: boolean;
}
export interface SymbolOptions {
  anchor?: Size; fillColor?: string; fillOpacity?: number; scale?: number;
  rotation?: number; strokeColor?: string; strokeOpacity?: number; strokeWeight?: number;
}
export interface IconOptions {
  anchor?: Size; imageOffset?: Size; imageSize?: Size;
  infoWindowAnchor?: Size; printImageUrl?: string; srcset?: { '2x': string };
}
export interface HotspotOptions { text?: string; offsets?: number[]; userData?: unknown; minZoom?: number; maxZoom?: number; }
export interface CustomOverlayOptions {
  point?: Point; anchors?: [number, number]; offsetX?: number; offsetY?: number;
  rotation?: number; rotationInit?: number; minZoom?: number; maxZoom?: number;
  properties?: unknown; fixBottom?: boolean; useTranslate?: boolean;
  autoFollowHeadingChanged?: boolean; visible?: boolean; zIndex?: number;
  enableMassClear?: boolean; enableDraggingMap?: boolean;
}

// Props = Options + 必需的几何参数 + children + 事件回调
/** 所有 Overlay 组件共享的 React 层 props（不属于 SDK Options） */
export interface OverlayReactProps {
  children?: React.ReactNode;
  /** 控制覆盖物显示/隐藏（对应 SDK 的 show()/hide()）。undefined 或 true = 显示，false = 隐藏 */
  visible?: boolean;
}

export interface MarkerProps extends MarkerOptions, OverlayReactProps {
  position: Point;
  onClick?: (point: Point, raw: unknown) => void;
  onDoubleClick?: (point: Point, raw: unknown) => void;
  onRightClick?: (point: Point, raw: unknown) => void;
  onDragStart?: (point: Point, raw: unknown) => void;
  onDragging?: (point: Point, raw: unknown) => void;
  onDragEnd?: (point: Point, raw: unknown) => void;
  onMouseOver?: (point: Point, raw: unknown) => void;
  onMouseOut?: (point: Point, raw: unknown) => void;
  onMouseDown?: (point: Point, raw: unknown) => void;
  onMouseUp?: (point: Point, raw: unknown) => void;
  onRemove?: (point: Point, raw: unknown) => void;
}
export interface LabelProps extends LabelOptions, OverlayReactProps {
  content: unknown;
  onClick?: (point: Point, raw: unknown) => void;
  onDoubleClick?: (point: Point, raw: unknown) => void;
  onRightClick?: (point: Point, raw: unknown) => void;
  onMouseOver?: (point: Point, raw: unknown) => void;
  onMouseOut?: (point: Point, raw: unknown) => void;
  onMouseDown?: (point: Point, raw: unknown) => void;
  onMouseUp?: (point: Point, raw: unknown) => void;
  onRemove?: (point: Point, raw: unknown) => void;
}
export interface PolylineProps extends PolylineOptions, OverlayReactProps {
  path: Point[];
  onClick?: (point: Point, raw: unknown) => void;
  onDoubleClick?: (point: Point, raw: unknown) => void;
  onRightClick?: (point: Point, raw: unknown) => void;
  /** 右键双击 @since 4.0 */
  onRightDoubleClick?: (point: Point, raw: unknown) => void;
  onMouseOver?: (point: Point, raw: unknown) => void;
  onMouseOut?: (point: Point, raw: unknown) => void;
  onMouseDown?: (point: Point, raw: unknown) => void;
  onMouseUp?: (point: Point, raw: unknown) => void;
  onMouseMove?: (point: Point, raw: unknown) => void;
  onRemove?: (point: Point, raw: unknown) => void;
  /** 线更新 */
  onLineUpdate?: (raw: unknown) => void;
  /** 开始编辑 @since 4.0 */
  onEditStart?: (raw: unknown) => void;
  /** 编辑结束 @since 4.0 */
  onEditEnd?: (raw: unknown) => void;
  /** 开始拖拽编辑节点 @since 4.0 */
  onLineVertexDragStart?: (raw: unknown) => void;
  /** 拖拽编辑节点中 @since 4.0 */
  onLineVertexDragging?: (raw: unknown) => void;
  /** 拖拽编辑节点结束 @since 4.0 */
  onLineVertexDragEnd?: (raw: unknown) => void;
  /** 删除编辑节点 @since 4.0 */
  onLineVertexDel?: (raw: unknown) => void;
}

export interface PolygonProps extends PolygonOptions, OverlayReactProps {
  path: Point[];
  onClick?: (point: Point, raw: unknown) => void;
  onDoubleClick?: (point: Point, raw: unknown) => void;
  onRightClick?: (point: Point, raw: unknown) => void;
  /** 右键双击 @since 4.0 */
  onRightDoubleClick?: (point: Point, raw: unknown) => void;
  onMouseOver?: (point: Point, raw: unknown) => void;
  onMouseOut?: (point: Point, raw: unknown) => void;
  onMouseDown?: (point: Point, raw: unknown) => void;
  onMouseUp?: (point: Point, raw: unknown) => void;
  onMouseMove?: (point: Point, raw: unknown) => void;
  onRemove?: (point: Point, raw: unknown) => void;
  /** 线更新 */
  onLineUpdate?: (raw: unknown) => void;
  /** 开始编辑 @since 4.0 */
  onEditStart?: (raw: unknown) => void;
  /** 编辑结束 @since 4.0 */
  onEditEnd?: (raw: unknown) => void;
  /** 开始拖拽编辑节点 @since 4.0 */
  onLineVertexDragStart?: (raw: unknown) => void;
  /** 拖拽编辑节点中 @since 4.0 */
  onLineVertexDragging?: (raw: unknown) => void;
  /** 拖拽编辑节点结束 @since 4.0 */
  onLineVertexDragEnd?: (raw: unknown) => void;
  /** 删除编辑节点 @since 4.0 */
  onLineVertexDel?: (raw: unknown) => void;
}
export interface CircleProps extends CircleOptions, OverlayReactProps {
  center: Point;
  radius: number;
  onClick?: (point: Point, raw: unknown) => void;
  onDoubleClick?: (point: Point, raw: unknown) => void;
  onRightClick?: (point: Point, raw: unknown) => void;
  /** 右键双击 @since 4.0 */
  onRightDoubleClick?: (point: Point, raw: unknown) => void;
  onMouseOver?: (point: Point, raw: unknown) => void;
  onMouseOut?: (point: Point, raw: unknown) => void;
  onMouseDown?: (point: Point, raw: unknown) => void;
  onMouseUp?: (point: Point, raw: unknown) => void;
  onMouseMove?: (point: Point, raw: unknown) => void;
  onRemove?: (point: Point, raw: unknown) => void;
  /** 线更新 */
  onLineUpdate?: (raw: unknown) => void;
  /** 开始编辑 @since 4.0 */
  onEditStart?: (raw: unknown) => void;
  /** 编辑结束 @since 4.0 */
  onEditEnd?: (raw: unknown) => void;
  /** 开始拖拽编辑节点 @since 4.0 */
  onLineVertexDragStart?: (raw: unknown) => void;
  /** 拖拽编辑节点中 @since 4.0 */
  onLineVertexDragging?: (raw: unknown) => void;
  /** 拖拽编辑节点结束 @since 4.0 */
  onLineVertexDragEnd?: (raw: unknown) => void;
  /** 删除编辑节点 @since 4.0 */
  onLineVertexDel?: (raw: unknown) => void;
}
/** Rectangle 事件对照 RectangleEventMap = GraphEventMap<Rectangle>（整体 @since 4.0） */
export interface RectangleProps extends RectangleOptions, OverlayReactProps {
  bounds: Bounds;
  onClick?: (point: Point, raw: unknown) => void;
  onDoubleClick?: (point: Point, raw: unknown) => void;
  onRightClick?: (point: Point, raw: unknown) => void;
  onRightDoubleClick?: (point: Point, raw: unknown) => void;
  onMouseOver?: (point: Point, raw: unknown) => void;
  onMouseOut?: (point: Point, raw: unknown) => void;
  onMouseDown?: (point: Point, raw: unknown) => void;
  onMouseUp?: (point: Point, raw: unknown) => void;
  onMouseMove?: (point: Point, raw: unknown) => void;
  onRemove?: (point: Point, raw: unknown) => void;
  /** 线更新 */
  onLineUpdate?: (raw: unknown) => void;
  /** 开始编辑 */
  onEditStart?: (raw: unknown) => void;
  /** 编辑结束 */
  onEditEnd?: (raw: unknown) => void;
  /** 开始拖拽编辑节点 */
  onLineVertexDragStart?: (raw: unknown) => void;
  /** 拖拽编辑节点中 */
  onLineVertexDragging?: (raw: unknown) => void;
  /** 拖拽编辑节点结束 */
  onLineVertexDragEnd?: (raw: unknown) => void;
  /** 删除编辑节点 */
  onLineVertexDel?: (raw: unknown) => void;
}
/**
 * BezierCurve 事件对照 BezierCurveEventMap
 * = Omit<GraphEventMap<BezierCurve>, editstart|editend|linevertex*>（整体 @since 4.0）。
 * 即：无编辑相关事件。
 */
export interface BezierCurveProps extends BezierCurveOptions, OverlayReactProps {
  /** 路径点数组，至少两个点 */
  path: Point[];
  /** 控制点数组，每两个路径点之间 1~2 个控制点，组数应为 path.length - 1，如 [[cp1, cp2], [cp3]] */
  controlPoints: Point[][];
  onClick?: (point: Point, raw: unknown) => void;
  onDoubleClick?: (point: Point, raw: unknown) => void;
  onRightClick?: (point: Point, raw: unknown) => void;
  onRightDoubleClick?: (point: Point, raw: unknown) => void;
  onMouseOver?: (point: Point, raw: unknown) => void;
  onMouseOut?: (point: Point, raw: unknown) => void;
  onMouseDown?: (point: Point, raw: unknown) => void;
  onMouseUp?: (point: Point, raw: unknown) => void;
  onMouseMove?: (point: Point, raw: unknown) => void;
  onRemove?: (point: Point, raw: unknown) => void;
  /** 节点数据变化 */
  onLineUpdate?: (raw: unknown) => void;
}
/**
 * Prism 事件对照 PrismEventMap
 * = Omit<GraphEventMap<Prism>, editstart|editend|linevertex*>（整体 @since 4.0）。
 * 即：无编辑相关事件。
 */
export interface PrismProps extends PrismOptions, OverlayReactProps {
  /**
   * 底面多边形坐标点。单坐标串 Point[]，或多坐标串 Point[][]。
   * 注意：SDK 的 setPath() 只接受单坐标串，多坐标串仅 constructor 支持，
   * 因此传 Point[][] 时后续修改需要通过 key 重新挂载组件才能生效。
   */
  path: Point[] | Point[][];
  /** 棱柱高度，单位米（SDK 必填参数） */
  altitude: number;
  onClick?: (point: Point, raw: unknown) => void;
  onDoubleClick?: (point: Point, raw: unknown) => void;
  onRightClick?: (point: Point, raw: unknown) => void;
  onRightDoubleClick?: (point: Point, raw: unknown) => void;
  onMouseOver?: (point: Point, raw: unknown) => void;
  onMouseOut?: (point: Point, raw: unknown) => void;
  onMouseDown?: (point: Point, raw: unknown) => void;
  onMouseUp?: (point: Point, raw: unknown) => void;
  onMouseMove?: (point: Point, raw: unknown) => void;
  onRemove?: (point: Point, raw: unknown) => void;
  /** 节点数据变化 */
  onLineUpdate?: (raw: unknown) => void;
}
/**
 * GroundOverlay 事件对照 GroundOverlayEventMap。
 * 只有 click / dblclick / remove 是 v3 起就有，其余均 @since 4.0。
 * 注意它不是 GraphEventMap，没有编辑相关事件。
 */
export interface GroundOverlayProps extends GroundOverlayOptions, OverlayReactProps {
  /** 叠加层显示的矩形区域 */
  bounds: Bounds;
  onClick?: (point: Point, raw: unknown) => void;
  onDoubleClick?: (point: Point, raw: unknown) => void;
  /** @since 4.0 */
  onRightClick?: (point: Point, raw: unknown) => void;
  /** @since 4.0 */
  onRightDoubleClick?: (point: Point, raw: unknown) => void;
  /** @since 4.0 */
  onMouseDown?: (point: Point, raw: unknown) => void;
  /** @since 4.0 */
  onMouseUp?: (point: Point, raw: unknown) => void;
  /** @since 4.0 */
  onMouseOver?: (point: Point, raw: unknown) => void;
  /** @since 4.0 */
  onMouseOut?: (point: Point, raw: unknown) => void;
  /** @since 4.0 */
  onMouseMove?: (point: Point, raw: unknown) => void;
  onRemove?: (point: Point, raw: unknown) => void;
  /** 渲染数据发生变化 @since 4.0 */
  onLineUpdate?: (raw: unknown) => void;
}
export interface GroundPointProps extends GroundPointOptions, OverlayReactProps { point: Point; }
export interface PointCollectionProps extends PointCollectionOptions, OverlayReactProps { points: Point[]; }
export interface InfoWindowProps extends InfoWindowOptions, OverlayReactProps {
  content: unknown;
  /** 受控：true=打开, false=关闭。不传则 mount 时自动打开。 */
  open?: boolean;
  /** 地图级打开位置（不在 Marker 内嵌时必传） */
  position?: Point;
  /** SDK InfoWindow 被 X 按钮关闭时回调 */
  onClose?: () => void;
}
export interface SymbolProps extends SymbolOptions, OverlayReactProps { path: unknown; }
export interface IconProps extends IconOptions, OverlayReactProps { url: string; size: Size; }
export interface IconSequenceProps extends OverlayReactProps { symbol?: unknown; offset?: unknown; repeat?: string; fixedRotation?: boolean; }
export interface HotspotProps extends HotspotOptions, OverlayReactProps { position: Point; }
export interface CustomOverlayProps extends CustomOverlayOptions { children?: React.ReactNode; }
