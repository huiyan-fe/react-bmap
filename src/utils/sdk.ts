/**
 * 全局 BMap SDK 访问入口。
 *
 * SDK 脚本由 jsapi-loader 注入到全局（v3 为 `BMap`，v4 的 `BMapGL` 出于兼容
 * 也会挂 `BMap` 别名）。这里集中收敛对全局对象的类型断言，
 * 避免在各 hook / 组件里散落 `(globalThis as any).BMap`。
 *
 * 构造器签名直接取自官方类型包 `@baidumap/jsapi-v4-types` 的全局 `BMap` 命名空间，
 * 所以 `new SDK.Point(...)` 得到的是真正的 `BMap.Point`，而不是 `unknown`。
 */

/**
 * 官方类型包尚未声明、但本库运行时确实会用到的构造器。
 *
 * 这里只补「官方缺、我们用」的部分 —— 官方补齐后应当从此处删掉，
 * 而不是让手写声明和官方声明长期并存。
 */
interface BMapSDKExtras {
  /** v4 的地图遮罩层，官方类型包未声明；见 components/Overlay/MapMask.tsx */
  readonly MapMask: new (points: BMap.Point[], opts?: Record<string, unknown>) => unknown;
  /** v4 的简易信息窗，官方类型包未声明；见 components/Overlay/SimpleInfoWindow.tsx */
  readonly SimpleInfoWindow: new (
    content: string | HTMLElement,
    opts?: Record<string, unknown>,
  ) => unknown;
}

/**
 * 运行时全局 SDK 对象的类型。
 *
 * - `typeof BMap`：官方命名空间里的全部构造器与常量，带完整参数/返回值签名
 * - `BMapSDKExtras`：补齐官方尚未声明的成员
 * - 索引签名：v3/v4 之间成员存在差异，未知成员以 `unknown` 兜底，由调用方自行断言
 *
 * 交集类型下，已声明的成员优先于索引签名解析，因此 `SDK.Point` 仍是精确类型。
 */
export type BMapSDK = typeof BMap & BMapSDKExtras & { readonly [key: string]: unknown };

/** globalThis 上的 `BMap` 由官方类型声明为必选，这里统一收敛成可选形态的一次断言。 */
const globalScope = globalThis as unknown as { BMap?: BMapSDK };

/**
 * 获取全局 BMap SDK 对象；若脚本尚未注入则抛出清晰错误。
 * 适用于随后直接访问 `SDK.Point` 等构造器的调用方 —— 相比原先返回
 * undefined 后触发的 `Cannot read properties of undefined`，这里给出可读的失败原因。
 */
export function getSDK(): BMapSDK {
  const sdk = globalScope.BMap;
  if (!sdk) {
    throw new Error('[react-bmap] BMap SDK 尚未加载，请确认地图脚本已由 jsapi-loader 注入完成。');
  }
  return sdk;
}

/**
 * 获取全局 BMap SDK 对象；未注入时返回 undefined。
 * 供可优雅降级的调用方使用（如运行时常量回退、组件在 SDK 缺失时静默跳过）。
 */
export function tryGetSDK(): BMapSDK | undefined {
  return globalScope.BMap;
}
