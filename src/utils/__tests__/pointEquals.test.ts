import { describe, it, expect } from 'vitest';
import { pointEquals, pointToPlain } from '../pointEquals';

describe('pointEquals', () => {
  it('两侧均空按引用相等处理', () => {
    expect(pointEquals(null, null)).toBe(true); // null === null
    expect(pointEquals(undefined, undefined)).toBe(true); // undefined === undefined
    expect(pointEquals(null, undefined)).toBe(false); // null !== undefined
    expect(pointEquals({ lng: 1, lat: 2 }, null)).toBe(false);
    expect(pointEquals(null, { lng: 1, lat: 2 })).toBe(false);
  });

  it('容忍浮点误差（默认 eps=1e-7），避免受控循环', () => {
    expect(pointEquals({ lng: 1, lat: 2 }, { lng: 1 + 1e-8, lat: 2 - 1e-8 })).toBe(true);
  });

  it('超出误差判为不等', () => {
    expect(pointEquals({ lng: 1, lat: 2 }, { lng: 1.001, lat: 2 })).toBe(false);
  });

  it('自定义 eps', () => {
    expect(pointEquals({ lng: 1, lat: 2 }, { lng: 1.0005, lat: 2 }, 1e-3)).toBe(true);
  });
});

describe('pointToPlain', () => {
  it('空值返回 null', () => {
    expect(pointToPlain(null)).toBeNull();
    expect(pointToPlain(undefined)).toBeNull();
    expect(pointToPlain(0)).toBeNull(); // falsy
  });

  it('缺少数值型 lng/lat 返回 null', () => {
    expect(pointToPlain({ lng: 1 })).toBeNull();
    expect(pointToPlain({ lng: '1', lat: '2' })).toBeNull();
  });

  it('抽取纯经纬度，丢弃多余字段', () => {
    expect(pointToPlain({ lng: 1, lat: 2, extra: 'x' })).toEqual({ lng: 1, lat: 2 });
  });
});
