/** 稳定 hash，做 loader 缓存 key */
export function stableHash(value: unknown): string {
  if (value === null || typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return `[${value.map(stableHash).join(',')}]`;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return `{${keys.map(k => `${k}:${stableHash((value as Record<string, unknown>)[k])}`).join(',')}}`;
}
