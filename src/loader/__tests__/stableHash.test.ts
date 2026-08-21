import { describe, it, expect } from 'vitest';
import { stableHash } from '../stableHash';

describe('stableHash', () => {
  it('原始值/空值直接 String 化', () => {
    expect(stableHash(null)).toBe('null');
    expect(stableHash(undefined)).toBe('undefined');
    expect(stableHash(1)).toBe('1');
    expect(stableHash('x')).toBe('x');
  });

  it('对象键排序稳定：键序无关', () => {
    expect(stableHash({ a: 1, b: 2 })).toBe(stableHash({ b: 2, a: 1 }));
    expect(stableHash({ a: 1, b: 2 })).toBe('{a:1,b:2}');
  });

  it('数组保序递归', () => {
    expect(stableHash([1, { a: 2 }])).toBe('[1,{a:2}]');
  });

  it('嵌套结构', () => {
    expect(stableHash({ v: '4.0', plugins: ['a', 'b'] })).toBe('{plugins:[a,b],v:4.0}');
  });
});
