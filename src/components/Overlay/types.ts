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
/**
 * GroundPoint 构造函数的可选参数。
 * SDK dts 注释标明"继承 GroundOverlayOptions"，类本身继承 GroundOverlay，
 * 因此除自身 7 个字段外还继承了 GroundOverlayOptions 的全部字段（opacity、enableMassClear 等）。
 * @since 4.0
 */
export interface GroundPointOptions extends GroundOverlayOptions {
  /** 图标地址（GroundPoint 只接受图片地址，不接受 canvas 元素） */
  url?: string;
  /** 坐标点尺寸，单位像素 */
  size?: Size;
  /** 锚点，以图标左上角为原点 @default new BMap.Size(0, 0) */
  anchor?: Size;
  /** 缩放比例 @default 1 */
  scale?: number;
  /** 旋转角度，单位度 @default 0 */
  rotation?: number;
  /** 偏移量 @default new BMap.Size(0, 0) */
  offset?: Size;
  /** 尺寸参考的缩放级别 @default 18 */
  level?: number;
}
/**
 * PointCollection 构造函数的可选参数。
 * @removed 4.0 — PointCollection 整体在 v4 移除，仅 v3 可用。
 */
export interface PointCollectionOptions {
  /** 海量点的预设形状（ShapeType 枚举，见 BMAP_POINT_SHAPE_* 常量） */
  shape?: number;
  /**
   * 海量点的颜色，支持颜色字符串、十六进制、RGB、RGBA、HSL、HSLA 格式
   * @default '#fa937e'
   */
  color?: string;
  /** 海量点的预设尺寸（SizeType 枚举，见 BMAP_POINT_SIZE_* 常量） */
  size?: number;
}
/**
 * InfoWindow 构造函数的可选参数。
 * enableMessage / message 在 v4 已移除（仅 v3 有效）。
 */
export interface InfoWindowOptions {
  /** 信息窗宽度（px），范围 220-730，0 = 自适应 @default 0 */
  width?: number;
  /** 信息窗高度（px），范围 60-650，0 = 自适应 @default 0 */
  height?: number;
  /** 最大化时宽度（px），范围 220-730 @default 730 */
  maxWidth?: number;
  /** 位置偏移值，底端尖角相对于地理坐标的偏移量 */
  offset?: Size;
  /** 标题文字，支持 HTML */
  title?: string;
  /** 打开时地图自动平移 @default true */
  enableAutoPan?: boolean;
  /** 点击地图时关闭信息窗口 @default true */
  enableCloseOnClick?: boolean;
  /** 显示短信发送按钮 @removed 4.0 */
  enableMessage?: boolean;
  /** 自定义短信内容（完整短信 = 自定义内容 + 位置链接，最长 140 字） @removed 4.0 */
  message?: string;
  /** 最大化时显示的内容，支持 HTML */
  maxContent?: string;
  /** 开启最大化功能 @default false */
  enableMaximize?: boolean;
}
/**
 * Symbol 构造函数的可选参数。
 * Symbol 是矢量图标值对象（非 Overlay），用作 Marker 的 icon 参数。
 */
export interface SymbolOptions {
  /** 锚点位置，相对于图标自身坐标系 */
  anchor?: Size;
  /** 填充颜色，支持十六进制、RGB、RGBA 等 */
  fillColor?: string;
  /** 填充透明度，取值范围 0-1 */
  fillOpacity?: number;
  /** 缩放比例 @default 1 */
  scale?: number;
  /** 旋转角度，单位度 */
  rotation?: number;
  /** 描边颜色 */
  strokeColor?: string;
  /** 描边透明度，取值范围 0-1 */
  strokeOpacity?: number;
  /** 描边线宽，未指定时与 scale 值相同 */
  strokeWeight?: number;
}
/**
 * Icon 构造函数的可选参数。Icon 是值对象（非 Overlay），用作 Marker 的 icon。
 */
export interface IconOptions {
  /**
   * 定位锚点，相对于图标左上角的偏移值。
   * @deprecated 4.0 起不建议使用，请用 MarkerOptions#anchor 替代
   */
  anchor?: Size;
  /** 图片相对于可视区域的偏移值（等同 CSS background-position），用于 Sprites 切图 */
  imageOffset?: Size;
  /** 图片实际大小（等同 CSS background-size），用于 Sprites 逻辑大小 / 高清屏适配 */
  imageSize?: Size;
  /** 信息窗口定位锚点 @removed 4.0 */
  infoWindowAnchor?: Size;
  /** 打印图片 URL，仅对 IE6 有效 @removed 4.0 */
  printImageUrl?: string;
  /** 高分辨率屏幕图片资源集 @since 4.0 @hide */
  srcset?: { '2x': string };
}
/**
 * Hotspot 构造函数的可选参数。
 * @removed 4.0 — Hotspot 整体在 v4 移除，仅 v3 可用。
 */
export interface HotspotOptions {
  /** 提示文本 */
  text?: string;
  /** 扩展偏移 [top, right, bottom, left]，默认 [5, 5, 5, 5] */
  offsets?: number[];
  /** 自定义数据 */
  userData?: unknown;
  /** 最小缩放级别 */
  minZoom?: number;
  /** 最大缩放级别 */
  maxZoom?: number;
}
/**
 * CustomOverlay 构造函数的可选参数。@since 4.0。
 * React 组件通过 children 渲染 DOM 内容，内部转换为 SDK 需要的 domCreate。
 */
export interface CustomOverlayOptions {
  /** 地理坐标点 */
  point?: Point;
  /** 锚点 [x, y]，左上角 [0,0]，取值 [0,1] @default [0.5, 1] */
  anchors?: [number, number];
  /** X 轴偏移（px） @default 0 */
  offsetX?: number;
  /** Y 轴偏移（px） @default 0 */
  offsetY?: number;
  /** 旋转角度（度） @default 0 */
  rotation?: number;
  /** 初始旋转基准角度，最终角度 = rotationOrigin + 地图朝向 @default 0 */
  rotationInit?: number;
  /** 最小缩放级别 */
  minZoom?: number;
  /** 最大缩放级别 */
  maxZoom?: number;
  /** 自定义业务属性 */
  properties?: unknown;
  /** DOM 固定在底部 @default false */
  fixBottom?: boolean;
  /** 使用 translate3d 性能优化 @default false */
  useTranslate?: boolean;
  /** 随地图旋转 @default false */
  autoFollowHeadingChanged?: boolean;
  /** 层叠顺序 @default 0 */
  zIndex?: number;
  /** 是否在 map.clearOverlays() 时清除 @since 4.0 @default true */
  enableMassClear?: boolean;
  /** 覆盖物上是否允许拖拽地图 @since 4.0 @default false */
  enableDraggingMap?: boolean;
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
/**
 * GroundPoint 事件对照 GroundOverlayEventMap（SDK 未定义 GroundPointEventMap，
 * 类继承 GroundOverlay，事件沿用了同一套）。
 * GroundPoint 整体 @since 4.0，故全部事件均为 v4+。
 */
export interface GroundPointProps extends GroundPointOptions, OverlayReactProps {
  /** 地理坐标点 */
  point: Point;
  onClick?: (point: Point, raw: unknown) => void;
  onDoubleClick?: (point: Point, raw: unknown) => void;
  onRightClick?: (point: Point, raw: unknown) => void;
  onRightDoubleClick?: (point: Point, raw: unknown) => void;
  onMouseDown?: (point: Point, raw: unknown) => void;
  onMouseUp?: (point: Point, raw: unknown) => void;
  onMouseOver?: (point: Point, raw: unknown) => void;
  onMouseOut?: (point: Point, raw: unknown) => void;
  onMouseMove?: (point: Point, raw: unknown) => void;
  onRemove?: (point: Point, raw: unknown) => void;
  /** 渲染数据发生变化 */
  onLineUpdate?: (raw: unknown) => void;
}
/**
 * PointCollection 事件对照 PointCollectionEventMap。
 * 整体 @removed 4.0，仅 v3 可用；事件对象只有 { type, target, point }。
 */
export interface PointCollectionProps extends PointCollectionOptions, OverlayReactProps {
  /** 点的坐标集合 */
  points: Point[];
  /** 继承自 Overlay 类（SDK 的 PointCollectionOptions 未列出，但类上有 enable/disableMassClear） */
  enableMassClear?: boolean;
  onClick?: (point: Point, raw: unknown) => void;
  onMouseOver?: (point: Point, raw: unknown) => void;
  onMouseOut?: (point: Point, raw: unknown) => void;
}
/**
 * InfoWindow 事件对照 InfoWindowEventMap。
 * 全部 6 个事件都是 OverlayBaseEvent（仅含 type/target/currentTarget，无 point/pixel）。
 */
export interface InfoWindowProps extends InfoWindowOptions, OverlayReactProps {
  /** 窗口内容，支持 HTML 字符串或 DOM 节点 */
  content: unknown;
  /** 受控：true=打开, false=关闭。不传则 mount 时自动打开。 */
  open?: boolean;
  /** 地图级打开位置（不在 Marker 内嵌时必传） */
  position?: Point;
  /** 信息窗口打开时触发 */
  onOpen?: (raw: unknown) => void;
  /** 信息窗口关闭时触发（含 X 按钮关闭） */
  onClose?: (raw: unknown) => void;
  /** 点击信息窗口关闭按钮时触发 */
  onClickClose?: (raw: unknown) => void;
  /** 信息窗口最大化时触发，需开启 enableMaximize */
  onMaximize?: (raw: unknown) => void;
  /** 信息窗口从最大化恢复时触发 */
  onRestore?: (raw: unknown) => void;
  /** 信息窗口尺寸变化时触发 */
  onResize?: (raw: unknown) => void;
}
/**
 * Symbol 是值对象（非 Overlay），无事件。
 * path 为 SVG path 字符串或预定义符号常量（BMap_Symbol_SHAPE_*）。
 */
export interface SymbolProps extends SymbolOptions, OverlayReactProps { path: unknown; }
/**
 * Icon 是值对象（非 Overlay），无事件。
 * url 和 size 是 constructor 的前两个位置参数，但也有 setter（setImageUrl/setSize）可响应式更新。
 */
export interface IconProps extends IconOptions, OverlayReactProps { url: string; size: Size; }
/**
 * IconSequence 用于在 Polyline 上重复显示符号（如箭头）。
 * @deprecated 4.0 已废弃，请使用 PolylineOptions#strokeTexture 替代。
 * constructor: new BMap.IconSequence(symbol, offset, repeat, fixedRotation)。
 * 全部参数都是 constructor 位置参数，无 setter — 变化时重建。
 * 无事件（值对象，非 Overlay）。
 */
export interface IconSequenceProps extends OverlayReactProps {
  /** 符号样式（Symbol Handle 或 SDK Symbol 实例） */
  symbol?: unknown;
  /** 符号相对于线起点的位置，百分比（如 '50%'）或像素值 */
  offset?: string;
  /** 符号在线上重复显示的间距，百分比或像素值；与 offset 同时设置时以 repeat 为准 */
  repeat?: string;
  /** 图标旋转角度是否与线走向一致 */
  fixedRotation?: boolean;
}
/**
 * Hotspot 是值对象（非 Overlay），@removed 4.0，仅 v3 可用。
 * 通过 map.addHotspot/removeHotspot 管理，不走 addOverlay。
 * 无事件（SDK 未定义 HotspotEventMap）。
 */
export interface HotspotProps extends HotspotOptions, OverlayReactProps { position: Point; }
/**
 * CustomOverlay 事件对照 CustomOverlayEventMap。@since 4.0。
 * children 会被渲染到 SDK 自定义覆盖物的 DOM 容器内。
 */
export interface CustomOverlayProps extends CustomOverlayOptions, OverlayReactProps {
  onClick?: (point: Point, raw: unknown) => void;
  onMouseOver?: (point: Point, raw: unknown) => void;
  onMouseOut?: (point: Point, raw: unknown) => void;
}
