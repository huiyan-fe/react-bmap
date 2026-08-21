import { describe, it, expect } from 'vitest';
import { isHandle, unwrapHandle } from '../handle';

describe('isHandle', () => {
  it('带 __brand 的对象是 handle', () => {
    expect(isHandle({ __brand: 'marker', raw: {} })).toBe(true);
  });

  it('普通对象/空值/原始值不是 handle', () => {
    expect(isHandle({ raw: {} })).toBe(false);
    expect(isHandle(null)).toBe(false);
    expect(isHandle(undefined)).toBe(false);
    expect(isHandle(42)).toBe(false);
    expect(isHandle('x')).toBe(false);
  });
});

describe('unwrapHandle', () => {
  it('是 handle → 解包出 raw', () => {
    const raw = { real: true };
    expect(unwrapHandle({ __brand: 'marker', raw })).toBe(raw);
  });

  it('非 handle → 原样返回', () => {
    const plain = { a: 1 };
    expect(unwrapHandle(plain)).toBe(plain);
    expect(unwrapHandle(null)).toBeNull();
    expect(unwrapHandle(5)).toBe(5);
  });
});
