import type { BMapVersion, UnsupportedBehavior } from '../types';
import type { BMapDriver } from './types';
import { createV4Driver } from './v4Driver';
import { createV3Driver } from './v3Driver';

/**
 * 根据 version 选择 driver：
 * - '3.0'：使用 v3Driver
 * - 其它任何值（'4.0' / '4.1' / '5.0' / ...）：使用 v4Driver（按 4.0 baseline 处理）
 *
 * jsapi-loader 始终按用户传入的 version 加载真实 SDK，与 driver 选择无关。
 * 未显式支持的版本统一按 4.0 处理（DESIGN.md「框架内没定义 4.0 后的版本，按 4.0 版本处理」）。
 */
export function createDriver(
  version: BMapVersion,
  rawSDK: unknown,
  opts: { unsupportedBehavior: UnsupportedBehavior },
): BMapDriver {
  if (version === '3.0') {
    return createV3Driver(rawSDK as any, opts);
  }
  // '4.0' 及以后的所有版本统一走 v4Driver
  return createV4Driver(rawSDK as any, opts);
}

export { createV4Driver, createV3Driver };
export type { BMapDriver } from './types';
