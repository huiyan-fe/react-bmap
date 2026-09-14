import { describe, it, expect, afterEach } from 'vitest';
import { createDriver } from '../createDriver';
import type { MapHandle } from '../../types';

const w = globalThis as unknown as {
  BMAP_NORMAL_MAP?: unknown;
  BMAP_SATELLITE_MAP?: unknown;
  BMAP_HYBRID_MAP?: unknown;
};

afterEach(() => {
  delete w.BMAP_NORMAL_MAP;
  delete w.BMAP_SATELLITE_MAP;
  delete w.BMAP_HYBRID_MAP;
});

function setup() {
  const setMapTypeCalls: unknown[] = [];
  const rawMap = { setMapType: (t: unknown) => setMapTypeCalls.push(t) };
  const map = { raw: rawMap } as unknown as MapHandle;
  const d = createDriver('3.0', {}, { unsupportedBehavior: 'ignore' });
  return { d, map, setMapTypeCalls };
}

describe('v3Driver.setMapType 字符串常量→SDK MapType 实例转换', () => {
  it("'B_NORMAL_MAP' → 读取 window.BMAP_NORMAL_MAP 真实实例并转发", () => {
    const normalInstance = { __brand: 'MapType(normal)' };
    w.BMAP_NORMAL_MAP = normalInstance;
    const { d, map, setMapTypeCalls } = setup();

    d.setMapType(map, 'B_NORMAL_MAP');

    expect(setMapTypeCalls).toEqual([normalInstance]);
  });

  it("'B_SATELLITE_MAP' → 读取 window.BMAP_SATELLITE_MAP 真实实例并转发", () => {
    const satelliteInstance = { __brand: 'MapType(satellite)' };
    w.BMAP_SATELLITE_MAP = satelliteInstance;
    const { d, map, setMapTypeCalls } = setup();

    d.setMapType(map, 'B_SATELLITE_MAP');

    expect(setMapTypeCalls).toEqual([satelliteInstance]);
  });

  it("'B_STREET_MAP'（混合图约定值）→ 读取 window.BMAP_HYBRID_MAP 真实实例并转发", () => {
    const hybridInstance = { __brand: 'MapType(hybrid)' };
    w.BMAP_HYBRID_MAP = hybridInstance;
    const { d, map, setMapTypeCalls } = setup();

    d.setMapType(map, 'B_STREET_MAP');

    expect(setMapTypeCalls).toEqual([hybridInstance]);
  });

  it('window 上对应常量缺失时，原样传递约定字符串（不崩溃，行为退化但可诊断）', () => {
    const { d, map, setMapTypeCalls } = setup();

    d.setMapType(map, 'B_NORMAL_MAP');

    expect(setMapTypeCalls).toEqual(['B_NORMAL_MAP']);
  });

  it('非地图类型约定值原样转发，不做任何转换', () => {
    const { d, map, setMapTypeCalls } = setup();

    d.setMapType(map, 'B_EARTH_MAP');

    expect(setMapTypeCalls).toEqual(['B_EARTH_MAP']);
  });
});
