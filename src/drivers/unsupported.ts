import type { BMapVersion, Capability, UnsupportedBehavior } from '../types';

/**
 * 不支持能力异常。
 * 在 throw 策略下抛此异常；用户可用 try/catch 或 ErrorBoundary 捕获。
 */
export class UnsupportedCapabilityError extends Error {
  constructor(public capability: Capability, public version: BMapVersion) {
    super(`[react-bmap] ${capability} is not supported in JSAPI ${version}`);
    this.name = 'UnsupportedCapabilityError';
  }
}

/**
 * 报告不支持的能力。根据 behavior：
 * - 'throw'：抛 UnsupportedCapabilityError
 * - 'warn'：dev console.warn，正常返回（调用方返回兜底值）
 * - 'ignore'：静默，正常返回（调用方返回兜底值）
 *
 * 用于命令（返回 void）：throw 抛错；warn/ignore noop。
 */
export function reportUnsupported(
  capability: Capability,
  version: BMapVersion,
  behavior: UnsupportedBehavior,
): void {
  if (behavior === 'throw') {
    throw new UnsupportedCapabilityError(capability, version);
  }
  if (behavior === 'warn' && typeof console !== 'undefined') {
    console.warn(`[react-bmap] ${capability} not supported in JSAPI ${version} (noop)`);
  }
  // 'ignore' 或 'warn' 走到这里返回 undefined
}

/**
 * Getter 不支持时的兜底。先 reportUnsupported，然后返回类型断言的兜底值。
 * - number 类型建议返回 NaN（业务可用 Number.isNaN 检测）
 * - 对象类型字段为 undefined
 *
 * 调用方需根据语义传 fallback：
 *   return unsupportedValue('getHeading', '3.0', behavior, NaN);
 */
export function unsupportedValue<T>(
  capability: Capability,
  version: BMapVersion,
  behavior: UnsupportedBehavior,
  fallback: T,
): T {
  reportUnsupported(capability, version, behavior);
  return fallback;
}

/**
 * tryOp 工具：在 throw 模式下捕获 UnsupportedCapabilityError，转成 Result。
 * 业务想优雅处理时使用：
 *   const r = tryOp(() => mapRef.flyTo(...));
 *   if (!r.ok) { /* fallback *\/ }
 */
export type OpResult<T> = { ok: true; value: T } | { ok: false; reason: 'unsupported'; capability: Capability };
export function tryOp<T>(fn: () => T): OpResult<T> {
  try {
    return { ok: true, value: fn() };
  } catch (e) {
    if (e instanceof UnsupportedCapabilityError) {
      return { ok: false, reason: 'unsupported', capability: e.capability };
    }
    throw e;
  }
}
