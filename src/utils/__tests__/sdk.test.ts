import { describe, it, expect, afterEach, vi } from 'vitest';
import { getSDK, tryGetSDK } from '../sdk';

const g = globalThis as unknown as { BMap?: unknown };

afterEach(() => {
  delete g.BMap;
  vi.unstubAllGlobals();
});

describe('getSDK', () => {
  it('SDK 未注入时抛出可读错误', () => {
    delete g.BMap;
    expect(() => getSDK()).toThrowError(/BMap SDK 尚未加载/);
  });

  it('SDK 已注入时返回全局对象', () => {
    const fake = { Point: function () {} };
    g.BMap = fake;
    expect(getSDK()).toBe(fake);
  });
});

describe('tryGetSDK', () => {
  it('未注入返回 undefined', () => {
    delete g.BMap;
    expect(tryGetSDK()).toBeUndefined();
  });

  it('已注入返回对象', () => {
    const fake = {};
    g.BMap = fake;
    expect(tryGetSDK()).toBe(fake);
  });
});
