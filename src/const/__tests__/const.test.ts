import { describe, it, expect, afterEach } from 'vitest';
import { getSdkConstant, BMAP_ANCHOR_CENTER, BMAP_STATUS_SUCCESS } from '../index';

const g = globalThis as unknown as { BMap?: Record<string, unknown> };

afterEach(() => {
  delete g.BMap;
});

describe('const/index 静态常量', () => {
  it('导出映射自 dts 的静态值', () => {
    expect(BMAP_ANCHOR_CENTER).toBe(6);
    expect(BMAP_STATUS_SUCCESS).toBe(0);
  });
});

describe('getSdkConstant', () => {
  it('SDK 未注入 → 返回 fallback', () => {
    delete g.BMap;
    expect(getSdkConstant('BMAP_ANCHOR_TOP_LEFT', 99)).toBe(99);
  });

  it('SDK 提供该常量 → 优先取运行时值（v3/v4 可能不同）', () => {
    g.BMap = { BMAP_ANCHOR_TOP_LEFT: 7 };
    expect(getSdkConstant('BMAP_ANCHOR_TOP_LEFT', 0)).toBe(7);
  });

  it('SDK 存在但缺该常量 → 回落 fallback', () => {
    g.BMap = {};
    expect(getSdkConstant('MISSING_CONST', 42)).toBe(42);
  });
});
