/**
 * 渲染型 service hook 的 autoRender 支持工具。
 *
 * 这些 hook（LocalSearch / 各路线 / BusLineSearch）只要拿到 Map 引用（无论经构造函数
 * location 还是 renderOptions.map），SDK 就会把结果自动渲染到地图上。autoRender:false 时
 * 需要两处都避开 Map：
 * - renderOptions.map 不注入（见各 hook 内 `if (dataOnly) delete ro.map`）
 * - location 回退用地图**中心点**（Point）而非 Map 实例——即本工具。
 */
import { unwrapHandle } from '../../utils/handle';
import { getSDK } from '../../utils/sdk';
import type { BMapDriver } from '../../drivers/types';

/**
 * 缺省 location 时的回退值：
 * - 正常（会渲染）：用 renderMap（Map 实例）——与原生 `new BMap.XxxSearch(map, ...)` 一致
 * - dataOnly（autoRender:false，仅取数据）：用地图中心点 Point，避免把 Map 交给 SDK 触发自动渲染
 * renderMap 为空时返回空串（交给 SDK 用默认区域）。
 */
export function fallbackLocation(
  driver: BMapDriver,
  renderMap: { __brand: string; raw: unknown } | null | undefined,
  dataOnly: boolean,
): unknown {
  if (!renderMap) return '';
  if (!dataOnly) return unwrapHandle(renderMap);
  try {
    const c = driver.getCenter(renderMap as never);
    const SDK = getSDK();
    return (c && (SDK as { Point?: unknown })?.Point) ? new (SDK as { Point: new (lng: number, lat: number) => unknown }).Point(c.lng, c.lat) : '';
  } catch {
    return '';
  }
}
