/**
 * 数据可视化图层（4.0+ Visualization）—— Heatmap / Cluster / Point / Polyline / Polygon / Text / Bar。
 * 对齐 vue-bmap 1.0.6 的组件与选项语义：
 * - 构造期选项变化 → 重建图层
 * - data 变化 → raw.setData()
 * - 事件：click / mouseover / mouseout（部分图层带 mousemove / change）
 */
import { createVisualLayer } from './visualLayer';
import type { VisualLayerBaseProps } from './visualLayer';
import type { VisualPickEvent } from '../../types/events';

/** 可视化图层通用拾取事件回调 */
interface VisualLayerEvents {
  onClick?: (e: VisualPickEvent) => void;
  onMouseOver?: (e: VisualPickEvent) => void;
  onMouseOut?: (e: VisualPickEvent) => void;
  onMouseMove?: (e: VisualPickEvent) => void;
}

// ─── HeatmapLayer ───
export interface HeatmapLayerOptions {
  /** 热力核半径（px），默认 20 */
  size?: number;
  /** 'px' | 'm'，默认 'px' */
  unit?: 'px' | 'm';
  /** 权重归一化上界，默认 100 */
  max?: number;
  /** 权重归一化下界，默认 0 */
  min?: number;
  /** 整体透明度 */
  opacity?: number;
  /** 透明度范围下界，默认 0 */
  minOpacity?: number;
  /** 透明度范围上界，默认 1 */
  maxOpacity?: number;
  /** 渐变色带，如 {0.25: 'rgba(0,0,255,1)', 1: 'rgba(255,0,0,1)'} */
  gradient?: Record<number, string>;
  /** 权重字段名（取 feature.properties[weightField]），默认 'count' */
  weightField?: string;
  visible?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  enablePicked?: boolean;
  /** 数据可视化图层的中心参考点（渲染坐标基准），缺省用地图中心 */
  referCenter?: unknown;
}
export interface HeatmapLayerProps extends HeatmapLayerOptions, VisualLayerBaseProps, VisualLayerEvents {}

const HEATMAP_KEYS = [
  'size', 'unit', 'max', 'min', 'opacity', 'minOpacity', 'maxOpacity',
  'gradient', 'weightField', 'visible', 'minZoom', 'maxZoom', 'zIndex', 'enablePicked', 'referCenter',
];

export const HeatmapLayer = createVisualLayer<HeatmapLayerProps>({
  displayName: 'HeatmapLayer',
  factory: (d, opts) => d.createHeatmap(opts),
  optionKeys: HEATMAP_KEYS,
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
  ],
});

// ─── ClusterLayer ───
export interface ClusterLayerOptions {
  /** 渲染阶段（如 'poi'），透传给 SDK */
  renderStage?: string;
  /** 聚合半径（px），默认 60 */
  clusterRadius?: number;
  /** 成簇最小点数，默认 2 */
  clusterMinPoints?: number;
  /** 聚合起始层级，默认 3 */
  clusterMinZoom?: number;
  /** 聚合结束层级（大于该层级不再聚合），默认 16 */
  clusterMaxZoom?: number;
  /** 瓦片尺寸，参与半径归一化，默认 256 */
  tileSize?: number;
  /** 点击聚合点是否自动调整视野，默认 true */
  fitViewOnClick?: boolean;
  /** 调整视野边距 [上, 右, 下, 左]，默认 [12,12,12,12] */
  fitViewMargin?: number[];
  /** true：拖动/缩放过程中实时刷新；false：静止后刷新，默认 false */
  updateRealTime?: boolean;
  /** 实时刷新节流间隔（ms），默认 300 */
  waitTime?: number;
  /** 聚合点图标：function(properties) -> {canvas, id} | canvas | url */
  clusterIcon?: unknown;
  /** 聚合点图标尺寸：function(properties) -> [w, h] | number */
  clusterIconSize?: unknown;
  /** 单点样式，透传给内部 PointLayer（shape/size/fillColor/icon 等） */
  singleStyle?: Record<string, unknown>;
  opacity?: number;
  visible?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  enablePicked?: boolean;
  /** 数据可视化图层的中心参考点（渲染坐标基准），缺省用地图中心 */
  referCenter?: unknown;
}
export interface ClusterLayerProps extends ClusterLayerOptions, VisualLayerBaseProps, VisualLayerEvents {
  /** 聚合结果变化（SDK 'change' 事件） */
  onChange?: (e: unknown) => void;
}

const CLUSTER_KEYS = [
  'renderStage', 'clusterRadius', 'clusterMinPoints', 'clusterMinZoom', 'clusterMaxZoom',
  'tileSize', 'fitViewOnClick', 'fitViewMargin', 'updateRealTime', 'waitTime',
  'clusterIcon', 'clusterIconSize', 'singleStyle', 'opacity', 'visible', 'minZoom', 'maxZoom', 'zIndex',
  'enablePicked', 'referCenter',
];

export const ClusterLayer = createVisualLayer<ClusterLayerProps>({
  displayName: 'ClusterLayer',
  factory: (d, opts) => d.createClusterLayer(opts),
  optionKeys: CLUSTER_KEYS,
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'change', prop: 'onChange' },
  ],
});

// ─── PointLayer ───
export interface PointLayerOptions {
  /** 点形状，默认 'circle' */
  shape?: 'circle' | 'square' | 'triangle' | 'diamond';
  /** 点尺寸（px），默认 12 */
  size?: number;
  /** 图标（url / canvas / BMap.Icon / function(properties)），设置后优先于 shape */
  icon?: unknown;
  /** 图标尺寸：[w, h] 或 number */
  iconSize?: unknown;
  /** 填充色，默认 '#3075FE' */
  fillColor?: string;
  /** 填充透明度，默认 1 */
  fillOpacity?: number;
  /** 描边色 */
  strokeColor?: string;
  /** 描边宽度 */
  strokeWeight?: number;
  /** 整体缩放比例 */
  scale?: number;
  /** 旋转角度（度） */
  rotation?: number;
  /** 像素偏移 [x, y] */
  offset?: number[];
  /** 锚点位置，默认 'center' */
  anchor?: 'center' | 'topLeft' | 'topCenter' | 'topRight' | 'rightCenter';
  /** 是否贴合地面（随地图倾斜/旋转），默认 false */
  isFlat?: boolean;
  visible?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  opacity?: number;
  enablePicked?: boolean;
  /** 数据可视化图层的中心参考点（渲染坐标基准），缺省用地图中心 */
  referCenter?: unknown;
}
export interface PointLayerProps extends PointLayerOptions, VisualLayerBaseProps, VisualLayerEvents {}

const POINT_KEYS = [
  'shape', 'size', 'icon', 'iconSize', 'fillColor', 'fillOpacity', 'strokeColor', 'strokeWeight',
  'scale', 'rotation', 'offset', 'anchor', 'isFlat', 'visible', 'minZoom', 'maxZoom', 'zIndex', 'opacity',
  'enablePicked', 'referCenter',
];

export const PointLayer = createVisualLayer<PointLayerProps>({
  displayName: 'PointLayer',
  factory: (d, opts) => d.createPointLayer(opts),
  optionKeys: POINT_KEYS,
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousemove', prop: 'onMouseMove' },
  ],
});

// ─── PolylineLayer ───
export interface PolylineLayerOptions {
  /** 描边色，默认 '#3075FE' */
  strokeColor?: string;
  /** 描边宽度（px），默认 2 */
  strokeWeight?: number;
  /** 描边透明度，默认 1 */
  strokeOpacity?: number;
  /** 折线连接方式 */
  strokeLineJoin?: 'miter' | 'bevel' | 'round';
  /** 线帽样式 */
  strokeLineCap?: 'butt' | 'round' | 'square';
  /** 线型：实线 / 虚线 / 点线 */
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  /** 虚线线段数组，如 [10, 5]（strokeStyle = 'dashed' 时生效） */
  dashArray?: number[];
  /** 纹理贴图 url（设置后以贴图绘制折线） */
  strokeTextureUrl?: string;
  /** 纹理贴图宽度 */
  strokeTextureWidth?: number;
  /** 纹理贴图高度 */
  strokeTextureHeight?: number;
  /** 贴图是否随线段长度重复铺满（true）或按固定间距平铺（false），默认 true */
  strokeTextureSpaced?: boolean;
  /** 贴图间距（strokeTextureSpaced = false 时生效） */
  strokeTextureGap?: number;
  /** 贴图颜色 */
  strokeTextureColor?: string;
  visible?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  opacity?: number;
  enablePicked?: boolean;
  /** 数据可视化图层的中心参考点（渲染坐标基准），缺省用地图中心 */
  referCenter?: unknown;
}
export interface PolylineLayerProps extends PolylineLayerOptions, VisualLayerBaseProps, VisualLayerEvents {}

const POLYLINE_KEYS = [
  'strokeColor', 'strokeWeight', 'strokeOpacity', 'strokeLineJoin', 'strokeLineCap', 'strokeStyle',
  'dashArray', 'strokeTextureUrl', 'strokeTextureWidth', 'strokeTextureHeight', 'strokeTextureSpaced',
  'strokeTextureGap', 'strokeTextureColor', 'visible', 'minZoom', 'maxZoom', 'zIndex', 'opacity',
  'enablePicked', 'referCenter',
];

export const PolylineLayer = createVisualLayer<PolylineLayerProps>({
  displayName: 'PolylineLayer',
  factory: (d, opts) => d.createPolylineLayer(opts),
  optionKeys: POLYLINE_KEYS,
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousemove', prop: 'onMouseMove' },
  ],
});

// ─── PolygonLayer ───
export interface PolygonLayerOptions {
  /** 填充色，默认 '#3075FE' */
  fillColor?: string;
  /** 填充透明度，默认 1 */
  fillOpacity?: number;
  /** 描边色，默认 '#3075FE' */
  strokeColor?: string;
  /** 描边宽度（px），默认 2 */
  strokeWeight?: number;
  /** 描边透明度，默认 1 */
  strokeOpacity?: number;
  /** 填充纹理贴图 url */
  fillTextureUrl?: string;
  /** 填充纹理贴图尺寸（px） */
  fillTextureSize?: number;
  /** 纹理贴图是否仅保留 alpha 通道（配合 fillColor 染色），默认 false */
  fillTextureAlphaOnly?: boolean;
  visible?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  opacity?: number;
  enablePicked?: boolean;
  /** 数据可视化图层的中心参考点（渲染坐标基准），缺省用地图中心 */
  referCenter?: unknown;
}
export interface PolygonLayerProps extends PolygonLayerOptions, VisualLayerBaseProps, VisualLayerEvents {}

const POLYGON_KEYS = [
  'fillColor', 'fillOpacity', 'strokeColor', 'strokeWeight', 'strokeOpacity',
  'fillTextureUrl', 'fillTextureSize', 'fillTextureAlphaOnly',
  'visible', 'minZoom', 'maxZoom', 'zIndex', 'opacity', 'enablePicked', 'referCenter',
];

export const PolygonLayer = createVisualLayer<PolygonLayerProps>({
  displayName: 'PolygonLayer',
  factory: (d, opts) => d.createPolygonLayer(opts),
  optionKeys: POLYGON_KEYS,
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousemove', prop: 'onMouseMove' },
  ],
});

// ─── TextLayer ───
export interface TextLayerOptions {
  /** 文本内容：静态字符串，或 function(properties) -> string */
  text?: string | ((properties: unknown) => string);
  /** 字号（px），默认 12 */
  fontSize?: number;
  /** 字体族，默认 'sans-serif' */
  fontFamily?: string;
  /** 字重：'normal' | 'bold' | 数字 */
  fontWeight?: string | number;
  /** 文字颜色，默认 '#333333'；也可传 function(properties) -> color 按要素动态取色 */
  color?: string | ((properties: unknown) => string);
  /** 描边色 */
  strokeColor?: string;
  /** 描边宽度（px） */
  strokeWeight?: number;
  /** 内边距 [上, 右, 下, 左] */
  padding?: number[];
  /** 外边距 [上, 右, 下, 左] */
  margin?: number[];
  /** 是否参与碰撞避让，默认 false */
  collides?: boolean;
  /** 碰撞检测间隔（ms），默认 300 */
  waitTime?: number;
  /** 文本最大宽度（px），超出换行 */
  textMaxWidth?: number;
  /** 行高（px） */
  lineHeight?: number;
  /** 对齐方式，默认 'center' */
  textAlign?: 'center' | 'left' | 'right';
  /** 像素偏移 [x, y] */
  offset?: number[];
  /** 锚点位置 */
  anchor?: unknown;
  /** 旋转角度（度） */
  rotation?: number;
  /** 缩放比例 */
  scale?: number;
  /** 填充透明度 */
  fillOpacity?: number;
  /** 是否贴合地面（随地图倾斜/旋转），默认 false */
  isFlat?: boolean;
  visible?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  opacity?: number;
  enablePicked?: boolean;
  /** 数据可视化图层的中心参考点（渲染坐标基准），缺省用地图中心 */
  referCenter?: unknown;
}
export interface TextLayerProps extends TextLayerOptions, VisualLayerBaseProps, VisualLayerEvents {}

const TEXT_KEYS = [
  'text', 'fontSize', 'fontFamily', 'fontWeight', 'color', 'strokeColor', 'strokeWeight',
  'padding', 'margin', 'collides', 'waitTime', 'textMaxWidth', 'lineHeight', 'textAlign',
  'offset', 'anchor', 'rotation', 'scale', 'fillOpacity', 'isFlat',
  'visible', 'minZoom', 'maxZoom', 'zIndex', 'opacity', 'enablePicked', 'referCenter',
];

export const TextLayer = createVisualLayer<TextLayerProps>({
  displayName: 'TextLayer',
  factory: (d, opts) => d.createTextLayer(opts),
  optionKeys: TEXT_KEYS,
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousemove', prop: 'onMouseMove' },
  ],
});

// ─── BarLayer ───
export interface BarLayerOptions {
  /** 渲染阶段（如 'poi'），透传给 SDK */
  renderStage?: string;
  /** 柱体颜色，默认 'rgba(0, 180, 0, 1)'；支持 css | css[] | function */
  color?: unknown;
  /** 柱体半径基准，默认 50000，单位由 unit 决定 */
  size?: number;
  /** 柱体高度，默认 100000；支持 number | number[] | function */
  height?: unknown;
  /** 棱数，默认 4；调大（如 50）趋近圆柱 */
  edgeCount?: number;
  /** 'm' | 'px'，默认 'm'（m 为墨卡托米，随缩放物理尺寸不变） */
  unit?: 'm' | 'px';
  opacity?: number;
  visible?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  enablePicked?: boolean;
  /** 数据可视化图层的中心参考点（渲染坐标基准），缺省用地图中心 */
  referCenter?: unknown;
}
export interface BarLayerProps extends BarLayerOptions, VisualLayerBaseProps, VisualLayerEvents {}

const BAR_KEYS = [
  'renderStage', 'color', 'size', 'height', 'edgeCount', 'unit', 'opacity',
  'visible', 'minZoom', 'maxZoom', 'zIndex', 'enablePicked', 'referCenter',
];

export const BarLayer = createVisualLayer<BarLayerProps>({
  displayName: 'BarLayer',
  factory: (d, opts) => d.createBarLayer(opts),
  optionKeys: BAR_KEYS,
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousemove', prop: 'onMouseMove' },
  ],
});

// ─── FlyLineLayer ───
export interface FlyLineLayerOptions {
  /** 线颜色，默认 'rgba(255, 71, 26, 0.9)' */
  strokeColor?: string;
  /** 线宽（屏幕 px，全宽），默认 4 */
  strokeWeight?: number;
  /** 线透明度 [0,1]，默认 1 */
  strokeOpacity?: number;
  /** 'miter' | 'bevel' | 'round'，默认 'round' */
  strokeLineJoin?: 'miter' | 'bevel' | 'round';
  /** 'butt' | 'round' | 'square'，默认 'round' */
  strokeLineCap?: 'butt' | 'round' | 'square';
  /** 'arc' | 'path'，默认 'arc' */
  mode?: 'arc' | 'path';
  /** 弧顶高度占首末点直线距离的比例，默认 0.2；0 即贴地不抬升 */
  arcHeight?: number;
  /** 水平弯曲程度，控制点沿垂线偏移占直线距离的比例，默认 0.15；0 即不弯 */
  curvature?: number;
  /** 每条弧的采样段数，默认 32，仅 mode 'arc' 生效 */
  segments?: number;
  /** 是否流动，默认 true；false 退化成静态弧线层 */
  animation?: boolean;
  /** 一圈秒数，默认 2 */
  duration?: number;
  /** 粒子间距占全线比例，默认 0.25，粒子数 = 1 / interval */
  interval?: number;
  /** 拖尾长度占间隔的比例，默认 0.6 */
  trailLength?: number;
  /** 底线常显透明度，默认 0.25；0 则只见流动的亮点 */
  baseOpacity?: number;
  /** 每条线是否随机相位，默认 true；false 则所有线齐步走 */
  randomPhase?: boolean;
  /** 'default' | 'lighter'，默认 'default'（lighter 为加性混合） */
  blend?: 'default' | 'lighter';
  opacity?: number;
  visible?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  enablePicked?: boolean;
  /** 数据可视化图层的中心参考点（渲染坐标基准），缺省用地图中心 */
  referCenter?: unknown;
}
export interface FlyLineLayerProps extends FlyLineLayerOptions, VisualLayerBaseProps, VisualLayerEvents {}

const FLYLINE_KEYS = [
  'strokeColor', 'strokeWeight', 'strokeOpacity', 'strokeLineJoin', 'strokeLineCap',
  'mode', 'arcHeight', 'curvature', 'segments', 'animation', 'duration', 'interval',
  'trailLength', 'baseOpacity', 'randomPhase', 'blend', 'opacity', 'visible',
  'minZoom', 'maxZoom', 'zIndex', 'enablePicked', 'referCenter',
];

export const FlyLineLayer = createVisualLayer<FlyLineLayerProps>({
  displayName: 'FlyLineLayer',
  factory: (d, opts) => d.createFlyLineLayer(opts),
  optionKeys: FLYLINE_KEYS,
  events: [
    { sdk: 'click', prop: 'onClick' },
    { sdk: 'mouseover', prop: 'onMouseOver' },
    { sdk: 'mouseout', prop: 'onMouseOut' },
    { sdk: 'mousemove', prop: 'onMouseMove' },
  ],
});
