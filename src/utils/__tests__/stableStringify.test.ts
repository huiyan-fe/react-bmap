import { describe, it, expect } from 'vitest';
import { stableStringify } from '../stableStringify';

describe('stableStringify', () => {
  it('区分 undefined 与 null（走不同 SDK 路径，依赖比较必须能分辨）', () => {
    expect(stableStringify(undefined)).toBe('undefined');
    expect(stableStringify(null)).toBe('null');
    expect(stableStringify(undefined)).not.toBe(stableStringify(null));
  });

  it('函数返回类型标记，不序列化实现', () => {
    expect(stableStringify(() => 1)).toBe('fn');
    expect(stableStringify(function named() {})).toBe('fn');
  });

  it('原始值直接 String 化', () => {
    expect(stableStringify(42)).toBe('42');
    expect(stableStringify('a')).toBe('a');
    expect(stableStringify(true)).toBe('true');
    expect(stableStringify(NaN)).toBe('NaN');
  });

  it('对象键排序稳定：键序不同但内容相同 → 同一字符串', () => {
    expect(stableStringify({ a: 1, b: 2 })).toBe(stableStringify({ b: 2, a: 1 }));
    expect(stableStringify({ a: 1, b: 2 })).toBe('{a:1,b:2}');
  });

  it('数组保序', () => {
    expect(stableStringify([1, 2, 3])).toBe('[1,2,3]');
    expect(stableStringify([1, 2])).not.toBe(stableStringify([2, 1]));
  });

  it('brand handle 不递归，返回 <handle>', () => {
    expect(stableStringify({ __brand: 'marker', raw: {} })).toBe('<handle>');
  });

  it('DOM 元素不递归，返回 <HTMLElement>', () => {
    const el = document.createElement('div');
    expect(stableStringify(el)).toBe('<HTMLElement>');
  });

  it('同一对象作为兄弟节点出现两次是合法的，不误判为循环', () => {
    const p = { lng: 1, lat: 2 };
    // [p, p] 里 p 出栈后从 seen 移除，第二次出现应正常序列化而非 <circular>
    expect(stableStringify([p, p])).toBe('[{lat:2,lng:1},{lat:2,lng:1}]');
  });

  it('真正的循环引用兜底为 <circular>', () => {
    const a: Record<string, unknown> = {};
    a.self = a;
    expect(stableStringify(a)).toBe('{self:<circular>}');
  });

  it('嵌套对象递归序列化', () => {
    expect(stableStringify({ p: { lng: 1, lat: 2 }, arr: [1] })).toBe(
      '{arr:[1],p:{lat:2,lng:1}}',
    );
  });
});
