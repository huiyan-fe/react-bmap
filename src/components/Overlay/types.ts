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
  strokeLineCap?: 'round' | 'butt' | 'square';
  strokeLineJoin?: 'round' | 'miter' | 'bevel';
  enableMassClear?: boolean; enableEditing?: boolean; enableClicking?: boolean;
  geodesic?: boolean; linkRight?: boolean; clip?: boolean; icons?: unknown[]; dashArray?: number[]; zIndex?: number;
}
export interface PolygonOptions {
  strokeColor?: string; fillColor?: string; strokeWeight?: number;
  strokeOpacity?: number; fillOpacity?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  enableMassClear?: boolean; enableEditing?: boolean; enableClicking?: boolean;
}
export type CircleOptions = PolygonOptions;
export type RectangleOptions = PolygonOptions;
export type BezierCurveOptions = Pick<PolylineOptions, 'strokeColor' | 'strokeWeight' | 'strokeOpacity' | 'strokeStyle' | 'enableMassClear'>;
export interface PrismOptions {
  topFillColor?: string; topFillOpacity?: number;
  sideFillColor?: string; sideFillOpacity?: number; enableMassClear?: boolean;
}
export interface GroundOverlayOptions {
  opacity?: number; url?: string | HTMLCanvasElement;
  displayOnMinLevel?: number; displayOnMaxLevel?: number; imageURL?: string;
  type?: 'image' | 'video' | 'canvas'; isReDraw?: boolean; drawHook?: () => void;
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
export interface PolylineProps extends PolylineOptions, OverlayReactProps { path: Point[]; }
export interface PolygonProps extends PolygonOptions, OverlayReactProps { path: Point[]; }
export interface CircleProps extends CircleOptions, OverlayReactProps { center: Point; radius: number; }
export interface RectangleProps extends RectangleOptions, OverlayReactProps { bounds: Bounds; }
export interface BezierCurveProps extends BezierCurveOptions, OverlayReactProps { path: Point[]; }
export interface PrismProps extends PrismOptions, OverlayReactProps { path: Point[]; }
export interface GroundOverlayProps extends GroundOverlayOptions, OverlayReactProps { bounds: Bounds; }
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
