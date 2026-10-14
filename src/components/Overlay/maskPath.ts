/**
 * MapMask 路径/选项构建 —— 供 <Map mask> 首帧应用与 <MapMask> 子组件共用，保证两处行为一致。
 * SDK 的 MapMask 构造签名：new SDK.MapMask(path: Point[], options)，path 为闭合经纬度路径。
 */
import type { Bounds, Point } from '../../types';

export interface MapMaskOptions {
  showRegion?: 'inside' | 'outside';
  isBuildingMask?: boolean;
  isPoiMask?: boolean;
  isMapMask?: boolean;
}

export interface MapMaskSpec extends MapMaskOptions {
  /** 任意多边形遮罩路径（Point[]）；与 bounds 二选一，同时传以 points 为准。未闭合会自动补首点。 */
  points?: Point[];
  /** 矩形遮罩区简写 { sw, ne }，内部转成矩形路径；与 points 二选一。 */
  bounds?: Bounds;
}

/** SDK 里构建 path 只需要 Point 构造器 */
interface SDKPointNS {
  Point: new (lng: number, lat: number) => unknown;
}

/**
 * 由 spec 构建闭合的原生 Point 路径；points 优先，其次 bounds。两者都没有返回 null。
 */
export function buildMaskPath(SDK: SDKPointNS, spec: MapMaskSpec): unknown[] | null {
  const { points, bounds } = spec;
  if (points && points.length > 0) {
    const raw = points.map((p) => new SDK.Point(p.lng, p.lat));
    // 未闭合则补上首点
    const first = points[0];
    const last = points[points.length - 1];
    if (first.lng !== last.lng || first.lat !== last.lat) {
      raw.push(new SDK.Point(first.lng, first.lat));
    }
    return raw;
  }
  if (bounds) {
    const { sw, ne } = bounds;
    return [
      new SDK.Point(sw.lng, sw.lat),
      new SDK.Point(ne.lng, sw.lat),
      new SDK.Point(ne.lng, ne.lat),
      new SDK.Point(sw.lng, ne.lat),
      new SDK.Point(sw.lng, sw.lat), // 闭合
    ];
  }
  return null;
}

/** 从 spec 里剥掉 points/bounds，剩下的就是传给 SDK MapMask 的 options。 */
export function maskOptionsOf(spec: MapMaskSpec): MapMaskOptions {
  const { points: _p, bounds: _b, ...opts } = spec;
  void _p; void _b;
  return opts;
}
