import type { BMapVersion, Capability, UnsupportedBehavior } from '../types';
import { debugWarn } from '../utils/debugWarn';

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
 * 只用于「确实不支持」：能力矩阵里没有，或原生成员不存在。
 * 「成员存在但执行时抛错」请走 reportCallFailure，不要塞到这里 ——
 * 那会把真实的运行时错误说成版本问题，排障时反而被误导。
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
 * 判断一个错误是不是「成员根本不存在」。
 *
 * 依据的是 JS 引擎自己产出的 TypeError 文案（`x is not a function` /
 * `x is not a constructor`），V8/JSC/SpiderMonkey 都是这套措辞；不是匹配 SDK
 * 的字符串，所以 SDK 压缩混淆换版本也不会失效。判错的最坏后果只是日志分类不准，
 * 不会引入新的失败路径。
 */
export function isMissingMember(e: unknown): boolean {
  return e instanceof TypeError && /is not a (function|constructor)/.test(e.message);
}

/**
 * 调用原生 API 失败时的统一出口，按错误性质分流：
 * - 成员不存在 → reportUnsupported，语义是「这个版本没这能力」
 * - 成员存在但抛错（参数非法、SDK 内部空指针、销毁竞态……）→ debugWarn 带上原始错误
 *
 * 后者刻意不抛：behavior='throw' 的语义是「能力不支持时抛」，而且这些 catch 大多在
 * React effect / cleanup 里，抛出会连带整棵树。
 */
export function reportCallFailure(
  capability: Capability,
  version: BMapVersion,
  behavior: UnsupportedBehavior,
  error: unknown,
): void {
  if (isMissingMember(error)) {
    reportUnsupported(capability, version, behavior);
    return;
  }
  debugWarn(capability, error);
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
