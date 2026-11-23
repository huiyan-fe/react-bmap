/**
 * 事件映射类型 — 对照 @baidumap/jsapi-v4-types 的 VisualPickEvent / GraphEventMap /
 * ViewAnimationEventMap 等，供使用方给事件回调标注类型。
 */
import type { Pixel, Point } from './index';

// ─── 可视化图层拾取事件（VisualPicker 派发） ───
/** 可视化图层拾取事件：命中要素时带 value（数据集里的要素），以及像素 / 经纬度坐标。 */
export interface VisualPickEvent<T = unknown> {
  type?: string;
  target?: unknown;
  /** 画面像素坐标 */
  pixel?: Pixel;
  /** 经纬度坐标（SDK 事件对象里 point 与 latLng 同义） */
  point?: Point;
  latLng?: Point;
  /** 原始 DOM 事件 */
  domEvent?: Event;
  /** 命中的要素（未命中时为 null/undefined） */
  value?: T;
}

/** 普通图层（NormalLayer）要素拾取事件。 */
export type NormalLayerPickEvent<T = unknown> = VisualPickEvent<T>;

/** MVT 图层要素拾取事件；value 为命中的实体数组。 */
export interface MVTLayerPickEvent<T = unknown> extends VisualPickEvent<T[]> {
  /** 图层正在执行上一次拾取时可能为空 */
  value?: T[];
}

// ─── 矢量图形编辑事件 ───
/** 图形编辑过程事件（editstart / editend）。 */
export interface GraphEditEvent<T = unknown> {
  type?: string;
  target?: T;
  /** 编辑位置的画面像素坐标 */
  pixel?: Pixel;
  /** 编辑位置的经纬度坐标 */
  point?: Point;
  latLng?: Point;
  /** 编辑位置的墨卡托坐标 */
  pointMC?: Point;
  /** 被编辑的图形覆盖物实例 */
  overlay: T;
}

/** 图形编辑顶点事件（linevertexdrag* / linevertexdel）。 */
export interface GraphVertexEvent<T = unknown> {
  type?: string;
  target?: T;
  /** 触发事件的顶点标注实例 */
  overlay: unknown;
  /** 顶点标注派发的原始事件对象 */
  from: unknown;
}

/** 图形节点数据变化事件（lineupdate）。 */
export interface GraphLineUpdateEvent<T = unknown> {
  type?: string;
  target?: T;
  /** 变化来源动作，图形被移除时为 'remove' */
  action?: string;
}

/** 鼠标移出图形事件（mouseout 额外带移出到的目标）。 */
export interface GraphMouseOutEvent<T = unknown> extends VisualPickEvent<T> {
  /** 移出时进入的目标（可能为 null） */
  to?: unknown;
}

/**
 * 矢量图形类覆盖物共享的事件名与事件对象类型映射。
 * 各图形事件（Polyline/Polygon/Circle/Rectangle/Prism/BezierCurve）均由此派生。
 */
export interface GraphEventMap<T = unknown> {
  click: VisualPickEvent<T>;
  dblclick: VisualPickEvent<T>;
  mousedown: VisualPickEvent<T>;
  mouseup: VisualPickEvent<T>;
  mouseover: VisualPickEvent<T>;
  mouseout: GraphMouseOutEvent<T>;
  mousemove: VisualPickEvent<T>;
  rightclick: VisualPickEvent<T>;
  rightdblclick: VisualPickEvent<T>;
  remove: VisualPickEvent<T>;
  lineupdate: GraphLineUpdateEvent<T>;
  editstart: GraphEditEvent<T>;
  editend: GraphEditEvent<T>;
  linevertexdragstart: GraphVertexEvent<T>;
  linevertexdragging: GraphVertexEvent<T>;
  linevertexdragend: GraphVertexEvent<T>;
  linevertexdel: GraphVertexEvent<T>;
}

// ─── 视角动画事件 ───
/** ViewAnimation 事件名与事件对象类型映射。 */
export interface ViewAnimationEventMap {
  /** 动画开始时触发 */
  animationstart: { type: string; target: unknown };
  /** 每一轮动画迭代结束时触发 */
  animationiterations: { type: string; target: unknown };
  /** 动画被取消时触发 */
  animationcancel: { type: string; target: unknown };
  /** 动画正常结束时触发 */
  animationend: { type: string; target: unknown };
}

// ─── TrackLine 事件 ───
/** TrackLine 播放进度事件载荷。 */
export interface TrackLineProgressValue {
  /** 播放进度 [0, 1] */
  process: number;
  /** 已播放秒数 */
  elapsed: number;
  /** 已走过的轨迹点 */
  trace: Point[];
  /** 已行驶距离（米） */
  distance: number;
  /** 当前车辆位置 */
  point: Point;
  /** 当前车头角度 */
  angle: number;
}

/** TrackLine 播放状态事件载荷。 */
export interface TrackLineStatusValue {
  /** 状态码 */
  status: number;
  /** 状态名（如 PLAY / PAUSE / STOP / FINISH） */
  statusName: string;
}

/** TrackLine 事件名与事件对象类型映射。 */
export interface TrackLineEventMap {
  progress: VisualPickEvent<TrackLineProgressValue>;
  statuschange: VisualPickEvent<TrackLineStatusValue>;
  click: VisualPickEvent;
  mouseover: VisualPickEvent;
  mouseout: VisualPickEvent;
  mousemove: VisualPickEvent;
}
