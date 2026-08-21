import { describe, it, expect } from 'vitest';
import { shallowEqual } from '../shallowEqual';

describe('shallowEqual', () => {
  it('同引用/同原始值相等', () => {
    const o = { a: 1 };
    expect(shallowEqual(o, o)).toBe(true);
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual('x', 'x')).toBe(true);
  });

  it('任一为 null/undefined（且不同引用）→ false', () => {
    expect(shallowEqual(null, { a: 1 } as unknown as null)).toBe(false);
    expect(shallowEqual({ a: 1 } as unknown as null, null)).toBe(false);
    expect(shallowEqual(null, null)).toBe(true); // a === b 提前返回
  });

  it('非对象且不等 → false', () => {
    expect(shallowEqual(1, 2)).toBe(false);
    expect(shallowEqual('a', 'b')).toBe(false);
  });

  it('键数量不同 → false', () => {
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('同键同值（一层）→ true', () => {
    expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it('嵌套对象按引用比较：不同引用 → false', () => {
    expect(shallowEqual({ a: { x: 1 } }, { a: { x: 1 } })).toBe(false);
  });
});
