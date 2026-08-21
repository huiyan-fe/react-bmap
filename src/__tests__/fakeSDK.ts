import { vi } from 'vitest';

// ── 假全局 SDK ────────────────────────────────────────────
// 部分 service hook（useGeocoder / useDrivingRoute 等）在动作里调 getSDK()，
// 再 `new SDK.Point(lng, lat)`。getSDK() 读的是 globalThis.BMap，
// 脚本未注入时会抛「SDK 尚未加载」。这里往全局挂一个最小替身：
// 只提供构造器 Point，其余成员用不到就不补。
// 每个测试用 installFakeSDK() 装、afterEach 用 uninstallFakeSDK() 卸，避免串味。

export interface FakePoint {
  lng: number;
  lat: number;
  __brand: 'point';
}

export interface FakeSDK {
  Point: new (lng: number, lat: number) => FakePoint;
  [key: string]: unknown;
}

const globalScope = globalThis as unknown as { BMap?: FakeSDK };

/** 造一个最小 SDK 替身：Point 构造器 + 索引兜底。 */
export function makeFakeSDK(): FakeSDK {
  const Point = vi.fn(function (this: FakePoint, lng: number, lat: number) {
    this.lng = lng;
    this.lat = lat;
    this.__brand = 'point';
  }) as unknown as FakeSDK['Point'];
  return { Point };
}

/** 往全局挂 SDK 替身，返回它以便断言（如 Point 被 new 了几次）。 */
export function installFakeSDK(sdk: FakeSDK = makeFakeSDK()): FakeSDK {
  globalScope.BMap = sdk;
  return sdk;
}

/** 卸掉全局 SDK，恢复「未注入」状态。 */
export function uninstallFakeSDK(): void {
  delete globalScope.BMap;
}
