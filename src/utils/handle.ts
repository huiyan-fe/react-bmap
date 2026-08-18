/**
 * Brand handle 工具。
 *
 * 框架对外暴露的 Map/Overlay/... 都是 brand handle（`{ __brand, raw }`），
 * 传给 SDK 前需要解包出内部的 raw 实例。集中在此处理，
 * 避免在各 hook / 组件里散落 `(x as any).__brand` / `(x as any).raw`。
 */

interface BrandHandle {
  readonly __brand: string;
  readonly raw: unknown;
}

/** 判断值是否为 brand handle。 */
export function isHandle(value: unknown): value is BrandHandle {
  return typeof value === 'object' && value !== null && '__brand' in value;
}

/** 若是 brand handle 则解包出内部 raw SDK 实例，否则原样返回。 */
export function unwrapHandle(value: unknown): unknown {
  return isHandle(value) ? value.raw : value;
}
