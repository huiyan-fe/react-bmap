/**
 * SDK 常量定义 — 从 dts const/ 目录映射。
 * 这些常量在运行时由 SDK (BMapGL/BMap) 提供，这里导出静态值供类型安全和 IntelliSense 使用。
 * 注意：v3 和 v4 的常量值可能不同，运行时应优先使用 SDK 全局对象上的常量。
 */

// ─── Anchor（控件停靠位置） ───
export const BMAP_ANCHOR_TOP_LEFT = 0;
export const BMAP_ANCHOR_TOP_RIGHT = 1;
export const BMAP_ANCHOR_BOTTOM_LEFT = 2;
export const BMAP_ANCHOR_BOTTOM_RIGHT = 3;
export const BMAP_ANCHOR_TOP_CENTER = 4;
export const BMAP_ANCHOR_MIDDLE_LEFT = 5;
export const BMAP_ANCHOR_CENTER = 6;
export const BMAP_ANCHOR_MIDDLE_RIGHT = 7;
export const BMAP_ANCHOR_BOTTOM_CENTER = 8;
export type ControlAnchor = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// ─── StatusCodes（服务状态码） ───
export const BMAP_STATUS_SUCCESS = 0;
export const BMAP_STATUS_CITY_LIST = 1;
export const BMAP_STATUS_UNKNOWN_LOCATION = 2;
export const BMAP_STATUS_UNKNOWN_ROUTE = 3;
export const BMAP_STATUS_INVALID_KEY = 4;
export const BMAP_STATUS_INVALID_REQUEST = 5;
export const BMAP_STATUS_PERMISSION_DENIED = 6;
export const BMAP_STATUS_SERVICE_UNAVAILABLE = 7;
export const BMAP_STATUS_TIMEOUT = 8;
export type ServiceStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// ─── DrivingPolicy（驾车策略） ───
export const BMAP_DRIVING_POLICY_DEFAULT = 0;
export const BMAP_DRIVING_POLICY_DESTANCE = 2;
export const BMAP_DRIVING_POLICY_AVOID_HIGHWAYS = 3;
export const BMAP_DRIVING_POLICY_FIRST_HIGHWAYS = 4;
export const BMAP_DRIVING_POLICY_AVOID_CONGESTION = 5;
export const BMAP_DRIVING_POLICY_AVOID_PAY = 6;
export const BMAP_DRIVING_POLICY_HIGHWAYS_AVOID_CONGESTION = 7;
export const BMAP_DRIVING_POLICY_AVOID_HIGHWAYS_CONGESTION = 8;
export const BMAP_DRIVING_POLICY_AVOID_CONGESTION_PAY = 9;
export const BMAP_DRIVING_POLICY_AVOID_HIGHWAYS_CONGESTION_PAY = 10;
export const BMAP_DRIVING_POLICY_AVOID_HIGHWAYS_PAY = 11;
export const BMAP_DRIVING_POLICY_DISTANCE_PRIORITY = 12;
export const BMAP_DRIVING_POLICY_TIME_PRIORITY = 13;
export type DrivingPolicy = 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

// ─── TransitPolicy（公交策略） ───
export const BMAP_TRANSIT_POLICY_RECOMMEND = 0;
export const BMAP_TRANSIT_POLICY_LEAST_TRANSFER = 1;
export const BMAP_TRANSIT_POLICY_LEAST_WALKING = 2;
export const BMAP_TRANSIT_POLICY_AVOID_SUBWAYS = 3;
export const BMAP_TRANSIT_POLICY_LEAST_TIME = 4;
export const BMAP_TRANSIT_POLICY_FIRST_SUBWAYS = 5;
export type TransitPolicy = 0 | 1 | 2 | 3 | 4 | 5;

// ─── MapType（地图类型） ───
export const BMAP_NORMAL_MAP = 0;
export const BMAP_PERSPECTIVE_MAP = 1;
export const BMAP_SATELLITE_MAP = 2;
export const BMAP_HYBRID_MAP = 3;
export type MapType = 0 | 1 | 2 | 3;

// ─── Animation（动画） ───
export const BMAP_ANIMATION_BOUNCE = 0;
export const BMAP_ANIMATION_DROP = 1;
export type Animation = 0 | 1;

// ─── LengthUnit（长度单位） ───
export const BMAP_UNIT_METRIC = 0;
export const BMAP_UNIT_IMPERIAL = 1;
export type LengthUnit = 0 | 1;

// ─── Language（语言） ───
export const BMAP_LANG_CN = 0;
export const BMAP_LANG_EN = 1;
export type Language = 0 | 1;

// ─── NavigationControlType ───
export const BMAP_NAVIGATION_CONTROL_LARGE = 0;
export const BMAP_NAVIGATION_CONTROL_SMALL = 1;
export const BMAP_NAVIGATION_CONTROL_PAN = 2;
export const BMAP_NAVIGATION_CONTROL_ZOOM = 3;
export type NavigationControlType = 0 | 1 | 2 | 3;

// ─── MapTypeControlType ───
export const BMAP_MAPTYPE_CONTROL_HORIZONTAL = 0;
export const BMAP_MAPTYPE_CONTROL_DROPDOWN = 1;
export const BMAP_MAPTYPE_CONTROL_MAP = 2;
export type MapTypeControlType = 0 | 1 | 2;

// ─── SymbolShapeType ───
// 注意：SDK 实际的形状常量是 BMap_Symbol_SHAPE_*（1-14），定义在 src/constants/index.ts。
// 这里不再重复定义，使用那边的常量和 SymbolShapeType 类型。

// ─── ShapeType（PointShapeLayer 形状） ───
export const BMAP_SHAPE_CIRCLE = 1;
export const BMAP_SHAPE_RECTANGLE = 3;
export type ShapeType = 1 | 3;

/**
 * 从 SDK 全局对象获取运行时常量（v3/v4 值可能不同）。
 * 优先使用 SDK 运行时值，回退到静态值。
 */
export function getSdkConstant(name: string, fallback: number): number {
  const SDK = (globalThis as any).BMap;
  return SDK?.[name] ?? fallback;
}
