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
