/**
 * 把对象/数组序列化为稳定字符串，作为 effect 依赖用。
 * 处理 path 等每次 render 新引用的对象，避免覆盖物/服务无意义重建。
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return String(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return `{${keys.map(k => `${k}:${stableStringify((value as Record<string, unknown>)[k])}`).join(',')}}`;
}
