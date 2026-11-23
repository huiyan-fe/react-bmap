/**
 * 核心类型 — MapOptions 相关结构、Viewport、ViewAnimation 等。
 * 对照 bmap-jsapi-dts/src/core/ 和 src/view-animation/。
 */
import type { Point, Bounds, Size } from '../index';

// ─── DisplayOptions (src/core/displayOptions.d.ts) ───
export interface DisplayOptions {
  indoor?: boolean;
  sky?: boolean;
  water?: boolean;
  land?: boolean;
  building?: boolean;
  label?: boolean;
  road?: boolean;
  boundary?: boolean;
  regionText?: boolean;
  street?: boolean;
  poi?: boolean;
  poiText?: boolean;
  poiIcon?: boolean;
  overlayIcon?: boolean;
  overlayText?: boolean;
}

// ─── Viewport (src/core/Viewport.d.ts) ───
export interface Viewport {
  center: Point;
  zoom: number;
  bounds?: Bounds;
}

// ─── ViewportOptions ───
export interface ViewportOptions {
  margins?: [number, number, number, number];
  zoomFactor?: number;
  icon?: unknown;
}

// ─── MapStyleConfig (src/core/MapStyleConfig.d.ts) ───
export interface MapStyleConfig {
  features?: Array<{ featureType: string; stylers?: Record<string, unknown> }>;
  style?: string;
}

// ─── MapStyleV2 (4.0+) ───
export interface MapStyleV2Options {
  styleJson?: unknown[];
  styleId?: string;
}

// ─── MapLabel (src/core/MapLabel.d.ts) ───
export interface MapLabel {
  text?: string;
  point?: Point;
  fontColor?: string;
  fontSize?: number;
  bgColor?: string;
  bdColor?: string;
  bdWidth?: number;
}

/** MapLabel 样式（JSAPI MapLabelStyle：文字与描边样式）。 */
export interface MapLabelStyle {
  color?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  /** 文字描边色 */
  strokeColor?: string;
  /** 文字描边宽度 */
  strokeWeight?: number;
  /** 背景色 */
  bgColor?: string;
  /** 背景边框色 */
  borderColor?: string;
  /** 背景边框宽度 */
  borderWidth?: number;
  /** 内边距 [x, y] */
  padding?: [number, number];
  /** 文本对齐 'center' | 'left' | 'right' */
  textAlign?: 'center' | 'left' | 'right';
}

/** 图层样式表达式（JSAPI StyleExpress）：值 | 按属性取值的 map 映射 | 回调函数。 */
export type StyleExpress<T> = T | Record<string, T> | ((properties: Record<string, unknown>, feature: unknown, index: number) => T);

/** 停车位配置（JSAPI ParkingSpotOptions，Map.addParkingSpot）。 */
export interface ParkingSpotOptions {
  /** 车位中心点 */
  point: Point;
  /** 车位朝向（度，相对正北） */
  heading?: number;
  /** 车位颜色 */
  color?: string;
  /** 车位大小（米） */
  size?: number;
  /** 是否仅显示图标（无编号文字） */
  iconOnly?: boolean;
  /** 自定义图标 */
  icon?: unknown;
  /** 文字偏移 */
  offset?: Size;
  /** 最小/最大显示层级 */
  minZoom?: number;
  maxZoom?: number;
}

// ─── MapPanes (src/overlay/MapPanes.d.ts) ───
export interface MapPanes {
  floatPane?: HTMLElement;
  markerMouseTarget?: HTMLElement;
  markerPane?: HTMLElement;
  markerShadow?: HTMLElement;
  mapPane?: HTMLElement;
}

// ─── ViewAnimation (src/view-animation/ViewAnimation.d.ts) ───
export interface ViewAnimationOptions {
  duration?: number;
  transition?: number;
  delay?: number;
  iterationCount?: number;
  direction?: string;
  easing?: string;
}

export interface ViewAnimationKeyFrames {
  center?: Point;
  zoom?: number;
  heading?: number;
  tilt?: number;
}

export interface ViewAnimation {
  keyFrames?: Array<ViewAnimationKeyFrames>;
  options?: ViewAnimationOptions;
}

// ─── Projection (src/map-type/Projection.d.ts) ───
export interface Projection {
  lngLatToPoint?(point: Point): Point;
  pointToLngLat?(point: Point): Point;
}

// ─── PredictDate (src/layer/PredictDate.d.ts) ───
export interface PredictDate {
  weekday: number;
  hour: number;
}
