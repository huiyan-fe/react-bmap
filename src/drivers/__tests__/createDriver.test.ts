import { describe, it, expect } from 'vitest';
import { createDriver } from '../createDriver';
import { CAPABILITY_MATRIX } from '../capabilityMatrix';

// driver 构造期不触碰 rawSDK（仅在方法调用时惰性访问），所以路由测试传空壳即可。
const rawSDK = {} as unknown;
const opts = { unsupportedBehavior: 'ignore' as const };

describe('createDriver 版本路由', () => {
  it("'3.0' → v3 driver（version=3.0，使用 v3 能力矩阵）", () => {
    const d = createDriver('3.0', rawSDK, opts);
    expect(d.version).toBe('3.0');
    expect(d.capabilities).toBe(CAPABILITY_MATRIX['3.0']);
  });

  it("'4.0' → v4 driver（使用 v4 能力矩阵）", () => {
    const d = createDriver('4.0', rawSDK, opts);
    expect(d.version).toBe('4.0');
    expect(d.capabilities).toBe(CAPABILITY_MATRIX['4.0']);
  });

  it('未知的更高版本（如 5.0）按 4.0 baseline 处理', () => {
    const d = createDriver('5.0', rawSDK, opts);
    // createDriver 非 3.0 分支不透传 version，v4Driver 默认回落 4.0
    expect(d.capabilities).toBe(CAPABILITY_MATRIX['4.0']);
  });

  it('driver 暴露 rawSDK 与 unsupportedBehavior', () => {
    const d = createDriver('4.0', rawSDK, opts);
    expect(d.rawSDK).toBe(rawSDK);
    expect(d.unsupportedBehavior).toBe('ignore');
  });
});
