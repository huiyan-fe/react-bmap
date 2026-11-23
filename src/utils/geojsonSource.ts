/**
 * GeoJSONSource —— GeoJSON / feature 数组归一化工具（4.0+ Visualization 静态工具类包装）。
 *
 * 对应 JSAPI 4.0 的 BMap.GeoJSONSource。SDK 源码（Visualization/GeoJSONSource.js）确认它是
 * **静态类**（`function GeoJSONSource() {}` + `Fe.extend(GeoJSONSource, {...})`），没有实例：
 *   - normalize(input, idKey)          归一化为 [{type, coordinates, properties, id, rawIndex}]
 *   - replaceGeometry(input, idx, geom) 替换第 rawIndex 个要素的几何，返回同形态的新对象
 *   - extractPoints(features, weightField) 提取点集与权重 → {points, weights}
 *   - toLineStrings(feature)           统一为多条线 [[[lng,lat],...],...]
 *   - toPolygons(feature)              统一为多个多边形 [[outer, hole1, ...], ...]
 * 纯数据转换（不含渲染/坐标系逻辑），Heatmap / PointLayer / PolylineLayer / PolygonLayer /
 * FlyLineLayer / TrackLine 等图层内部都在复用它。
 *
 * 注意：GeoJSONSource 未挂在 BMapGL 命名空间（publicListForMap.js 未导出），SDK 以裸全局
 * 形式提供。这里在每次调用时依次尝试 SDK 命名空间与 globalThis，取不到时告警一次并返回
 * 安全兜底（空数组 / 原样输入），避免静态调用点炸掉。
 */
import { tryGetSDK } from './sdk';
import { debugWarn } from './debugWarn';

/** normalize 输出的统一内部要素形态 */
export interface GeoJSONSourceFeature {
  type: string;
  coordinates: unknown;
  properties: Record<string, unknown>;
  id: unknown;
  /** 在输入数组里的下标（无效要素被跳过，与 out 的下标不一定相同），编辑写回时用 */
  rawIndex?: number;
}

/** extractPoints 输出 */
export interface GeoJSONSourcePoints {
  points: Array<[number, number]>;
  weights: number[];
}

/** 缺失提醒只打一次 */
let warnedMissing = false;
function warnMissing(): void {
  if (warnedMissing) return;
  warnedMissing = true;
  try {
    if (typeof console === 'undefined') return;
    console.warn(
      '[react-bmap] 未找到全局 GeoJSONSource（BMap.GeoJSONSource 或 window.GeoJSONSource），' +
        'GeoJSONSource 工具方法返回空兜底。它由 JSAPI 4.0+ 的 Visualization 模块提供，' +
        '请确认加载的是 GL 版 SDK 且 visual 模块可用。',
    );
  } catch { /* 日志不能反过来把调用方搞崩 */ }
}

/** 运行时解析静态类：SDK 命名空间 → globalThis，逐次尝试 */
function resolveSource(): any {
  const SDK = tryGetSDK();
  const fromSDK = SDK ? (SDK as { GeoJSONSource?: unknown }).GeoJSONSource : undefined;
  const fromGlobal = (globalThis as { GeoJSONSource?: unknown }).GeoJSONSource;
  return fromSDK || fromGlobal || null;
}

/** 调用静态方法，缺失 / 抛错时告警并返回兜底值 */
function call<T>(method: string, fallback: T, fn: (g: any) => T): T {
  const g = resolveSource();
  if (!g) {
    warnMissing();
    return fallback;
  }
  try {
    return fn(g);
  } catch (e) {
    // 方法存在但执行失败（参数非法等），不是能力缺失
    debugWarn(`GeoJSONSource.${method}`, e);
    return fallback;
  }
}

/**
 * 归一化入口。支持 FeatureCollection / Feature / Feature[] / 裸 Geometry。
 * @param input 各种输入形态
 * @param idKey 取 id 的 properties 字段名，默认 'id'
 */
export function normalize(input: unknown, idKey?: string): GeoJSONSourceFeature[] {
  return call('normalize', [], (g) => g.normalize(input, idKey) as GeoJSONSourceFeature[]);
}

/**
 * 替换输入里第 rawIndex 个要素的几何，返回新的输入对象，原对象不动。
 * 输出与输入同形态（FeatureCollection / Feature / 数组 / 裸几何）。
 */
export function replaceGeometry(input: unknown, rawIndex: number, geometry: unknown): unknown {
  return call('replaceGeometry', input, (g) => g.replaceGeometry(input, rawIndex, geometry));
}

/**
 * 提取点集合（供 Heatmap / 点类图层使用）。
 * @param features normalize 输出
 * @param weightField 权重字段名，默认 'count'；缺失/NaN 时权重取 1
 */
export function extractPoints(features: GeoJSONSourceFeature[], weightField?: string): GeoJSONSourcePoints {
  return call('extractPoints', { points: [], weights: [] }, (g) => {
    const r = g.extractPoints(features, weightField);
    return { points: r.points ?? [], weights: r.weights ?? [] };
  });
}

/**
 * 提取线串集合（供 PolylineLayer 使用），统一为 [[[lng,lat],...], ...]。
 * Polygon 的面环与 MultiPolygon 的每个环也会被展开成线。
 */
export function toLineStrings(feature: GeoJSONSourceFeature): unknown {
  return call('toLineStrings', [], (g) => g.toLineStrings(feature));
}

/**
 * 提取多边形集合（供 PolygonLayer 使用），统一为 [ [outer, hole1, ...], ... ]。
 */
export function toPolygons(feature: GeoJSONSourceFeature): unknown {
  return call('toPolygons', [], (g) => g.toPolygons(feature));
}

/**
 * 静态工具类形态的 plain object 包装（对齐 SDK `GeoJSONSource.normalize(...)` 的调用方式）：
 * ```ts
 * import { GeoJSONSource } from '@baidumap/react-bmap';
 * const features = GeoJSONSource.normalize(geojson);
 * ```
 */
export const GeoJSONSource = {
  normalize,
  replaceGeometry,
  extractPoints,
  toLineStrings,
  toPolygons,
};
