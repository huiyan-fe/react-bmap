/**
 * 把对象/数组序列化为稳定字符串，作为 effect 依赖用。
 * 处理 path 等每次 render 新引用的对象，避免覆盖物/服务无意义重建。
 * 遇到 DOM 元素 / 函数 / 哦 class 实例时返回类型标记，避免循环引用栈溢出。
 */
export function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'function') return 'fn';
  if (typeof value !== 'object') return String(value);
  // DOM 元素 / 节点 — 不递归（避免循环引用）
  if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) return '<HTMLElement>';
  if (typeof Node !== 'undefined' && value instanceof Node) return '<Node>';
  // 带品牌标记的 handle — 不递归
  if (value && typeof value === 'object' && '__brand' in (value as any)) return '<handle>';
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return `{${keys.map(k => `${k}:${stableStringify((value as Record<string, unknown>)[k])}`).join(',')}}`;
}
