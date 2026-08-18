/**
 * 全局 BMap SDK 访问入口。
 *
 * SDK 脚本由 jsapi-loader 注入到全局（v3 为 `BMap`，v4 的 `BMapGL` 出于兼容
 * 也会挂 `BMap` 别名）。这里集中收敛对全局对象的类型断言，
 * 避免在各 hook / 组件里散落 `(globalThis as any).BMap`。
 *
 * 仅声明库内部实际会用到的构造器；其余成员通过索引签名以 `unknown` 暴露，
 * 需要时由调用方自行断言。
 */

export interface BMapSDK {
  readonly Point: new (lng: number, lat: number) => unknown;
  readonly Bounds: new (sw: unknown, ne: unknown) => unknown;
  readonly Size: new (width: number, height: number) => unknown;
  readonly MapMask: new (points: unknown[], opts?: unknown) => unknown;
  readonly SimpleInfoWindow: new (content: unknown, opts?: unknown) => unknown;
  readonly [key: string]: unknown;
}

/**
 * 获取全局 BMap SDK 对象；若脚本尚未注入则抛出清晰错误。
 * 适用于随后直接访问 `SDK.Point` 等构造器的调用方 —— 相比原先返回
 * undefined 后触发的 `Cannot read properties of undefined`，这里给出可读的失败原因。
 */
export function getSDK(): BMapSDK {
  const sdk = (globalThis as { BMap?: BMapSDK }).BMap;
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
  return (globalThis as { BMap?: BMapSDK }).BMap;
}
