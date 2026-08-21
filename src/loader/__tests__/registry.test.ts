import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { LoadKeyComponents } from '../../types';

// registry.ts 用模块级 globalRegistry 单例且未导出 clear。
// 每个用例前 resetModules + 动态 import，拿到全新的 registry 状态，避免跨用例污染。
async function freshRegistry() {
  vi.resetModules();
  return import('../registry');
}

const base: LoadKeyComponents = {
  version: '4.0',
  ak: 'AK1',
} as LoadKeyComponents;

describe('buildLoadKey', () => {
  it('相同组件 → 相同 key；plugins 顺序无关（内部 sort）', async () => {
    const { buildLoadKey } = await freshRegistry();
    const k1 = buildLoadKey({ ...base, plugins: ['a', 'b'] } as LoadKeyComponents);
    const k2 = buildLoadKey({ ...base, plugins: ['b', 'a'] } as LoadKeyComponents);
    expect(k1).toBe(k2);
  });

  it('ak / version 不同 → key 不同', async () => {
    const { buildLoadKey } = await freshRegistry();
    expect(buildLoadKey(base)).not.toBe(
      buildLoadKey({ ...base, ak: 'AK2' } as LoadKeyComponents),
    );
    expect(buildLoadKey(base)).not.toBe(
      buildLoadKey({ ...base, version: '3.0' } as LoadKeyComponents),
    );
  });
});

describe('register / getExisting / getAllEntries', () => {
  beforeEach(() => vi.resetModules());

  it('注册后可按 loadKey 取回同一 entry', async () => {
    const { buildLoadKey, register, getExisting } = await freshRegistry();
    const key = buildLoadKey(base);
    const promise = Promise.resolve('sdk');
    register(key, base, promise);
    const entry = getExisting(key);
    expect(entry?.loadKey).toBe(key);
    expect(entry?.promise).toBe(promise);
    expect(getExisting('missing')).toBeUndefined();
  });

  it('getAllEntries 返回所有已注册项', async () => {
    const { buildLoadKey, register, getAllEntries } = await freshRegistry();
    register(buildLoadKey(base), base, Promise.resolve(1));
    const other = { ...base, ak: 'AK2' } as LoadKeyComponents;
    register(buildLoadKey(other), other, Promise.resolve(2));
    expect(getAllEntries()).toHaveLength(2);
  });

  it('promise 失败时自动从 registry 删除该项', async () => {
    const { buildLoadKey, register, getExisting } = await freshRegistry();
    const key = buildLoadKey(base);
    const rejected = Promise.reject(new Error('load failed'));
    register(key, base, rejected);
    await rejected.catch(() => {}); // 等 catch 回调跑完
    expect(getExisting(key)).toBeUndefined();
  });
});

describe('detectConflict', () => {
  beforeEach(() => vi.resetModules());

  it('无其它已加载组合 → 无冲突', async () => {
    const { buildLoadKey, detectConflict } = await freshRegistry();
    expect(detectConflict(buildLoadKey(base), base)).toBeNull();
  });

  it('已存在不同 loadKey → 返回冲突的既有组件', async () => {
    const { buildLoadKey, register, detectConflict } = await freshRegistry();
    register(buildLoadKey(base), base, Promise.resolve(1));
    const requested = { ...base, ak: 'AK2' } as LoadKeyComponents;
    const conflict = detectConflict(buildLoadKey(requested), requested);
    expect(conflict).toEqual(base);
  });

  it('相同 loadKey 已存在 → 不算冲突', async () => {
    const { buildLoadKey, register, detectConflict } = await freshRegistry();
    const key = buildLoadKey(base);
    register(key, base, Promise.resolve(1));
    expect(detectConflict(key, base)).toBeNull();
  });
});
