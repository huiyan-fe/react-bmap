import { describe, it, expect } from 'vitest';
import { createV3Driver, createV4Driver } from '../createDriver';
import { makeFakeDriver } from '../../__tests__/fakeDriver';

// 防退化护栏（L3 契约层）：
// 1. v3 / v4 两个真实 driver 必须暴露同一套方法（接口对齐）——
//    新增能力时若只在一个 driver 上加，这里立刻红，逼你补齐或显式在能力矩阵降级。
// 2. fakeDriver 显式 stub 的方法必须都是真实 driver 上存在的方法。
//    fakeDriver 靠 Proxy 兜底长尾方法（漏 stub 只是返回 vi.fn()，不抛），
//    所以不强求「覆盖全部」；但显式 stub 的那批一旦写错名字、或真实接口重命名/删除后
//    stub 还留着，就成了「测了个不存在的契约」。这条护栏专抓这种反向漂移。

// driver 工厂只闭包 rawSDK，构造期不碰 SDK 成员，空对象即可拿到方法集。
const fakeSDK = {} as any;
const behavior = { unsupportedBehavior: 'warn' as const };

function methodKeys(obj: object): string[] {
  return Object.keys(obj)
    .filter((k) => typeof (obj as Record<string, unknown>)[k] === 'function')
    .sort();
}

const v3 = createV3Driver(fakeSDK, behavior);
const v4 = createV4Driver(fakeSDK, behavior);
const v3Methods = methodKeys(v3);
const v4Methods = methodKeys(v4);

describe('driver 契约', () => {
  it('v3 与 v4 driver 暴露同一套方法（接口对齐）', () => {
    expect(v3Methods).toEqual(v4Methods);
  });

  it('fakeDriver 显式 stub 的方法都是真实 driver 上真实存在的（无 stale/typo stub）', () => {
    const fake = makeFakeDriver();
    // Proxy 无 ownKeys 陷阱 → Object.keys 落到 target，拿到的是显式 stub 的键。
    // __emit/__listeners 是测试辅助，capabilities 是数据字段，都排除。
    const stubbed = methodKeys(fake).filter(
      (k) => !k.startsWith('__') && k !== 'isLoaded',
    );
    const realSet = new Set(v4Methods);
    const stale = stubbed.filter((m) => !realSet.has(m));
    expect(stale).toEqual([]);
  });
});
