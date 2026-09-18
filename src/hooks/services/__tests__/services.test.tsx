import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { BMapContext } from '../../../context/BMapContext';
import type { BMapContextValue } from '../../../context/BMapContext';
import { makeFakeDriver } from '../../../__tests__/fakeDriver';
import type { FakeDriver } from '../../../__tests__/fakeDriver';
import { installFakeSDK, uninstallFakeSDK } from '../../../__tests__/fakeSDK';
import { UnsupportedCapabilityError } from '../../../drivers/unsupported';
import { useGeocoder } from '../useGeocoder';
import { useDrivingRoute } from '../useDrivingRoute';
import { useTruckRoute } from '../useTruckRoute';
import { useLocalSearch } from '../useLocalSearch';
import { useConvertor } from '../useConvertor';

// L4：service hook 契约层。
// 组件从 useBMapContext() 拿 driver，driver.createXxx() 返回 { isNull, raw } 句柄。
// supported 路径走 raw 上的原生方法；unsupported 路径 isNull=true → UnsupportedCapabilityError。
// requestIdRef 防过期回调覆盖新结果；cancel 通过 bump requestId 让在途回调作废。

function bmapWrapper(driver: FakeDriver) {
  const value: BMapContextValue = {
    status: 'ready',
    driver: driver as unknown as BMapContextValue['driver'],
    version: '4.0' as BMapContextValue['version'],
    error: null,
  };
  return ({ children }: { children: ReactNode }) => (
    <BMapContext.Provider value={value}>{children}</BMapContext.Provider>
  );
}

afterEach(() => {
  uninstallFakeSDK();
  vi.restoreAllMocks();
});

describe('useGeocoder', () => {
  it('supported：getPoint 调 raw.getPoint(address, cb)，回调更新 data', () => {
    let captured: ((r: unknown) => void) | undefined;
    const raw = { getPoint: vi.fn((_addr: string, cb: (r: unknown) => void) => { captured = cb; }) };
    const driver = makeFakeDriver({ loaded: true });
    driver.createGeocoder = vi.fn(() => ({ isNull: false, raw }));

    const { result } = renderHook(() => useGeocoder(), { wrapper: bmapWrapper(driver) });
    expect(result.current.supported).toBe(true);

    act(() => result.current.getPoint('北京'));
    expect(raw.getPoint).toHaveBeenCalledWith('北京', expect.any(Function));
    expect(result.current.loading).toBe(true);

    act(() => captured?.({ lng: 116, lat: 39 }));
    expect(result.current.data).toEqual({ lng: 116, lat: 39 });
    expect(result.current.loading).toBe(false);
  });

  it('supported：带 city 时透传第三参', () => {
    const raw = { getPoint: vi.fn() };
    const driver = makeFakeDriver({ loaded: true });
    driver.createGeocoder = vi.fn(() => ({ isNull: false, raw }));
    const { result } = renderHook(() => useGeocoder(), { wrapper: bmapWrapper(driver) });
    act(() => result.current.getPoint('天安门', '北京市'));
    expect(raw.getPoint).toHaveBeenCalledWith('天安门', expect.any(Function), '北京市');
  });

  it('supported：getLocation 经 getSDK() 造 Point 再调 raw.getLocation', () => {
    const sdk = installFakeSDK();
    const raw = { getLocation: vi.fn() };
    const driver = makeFakeDriver({ loaded: true });
    driver.createGeocoder = vi.fn(() => ({ isNull: false, raw }));
    const { result } = renderHook(() => useGeocoder(), { wrapper: bmapWrapper(driver) });
    act(() => result.current.getLocation({ lng: 116, lat: 39 }));
    expect(sdk.Point).toHaveBeenCalledWith(116, 39);
    expect(raw.getLocation).toHaveBeenCalledWith(expect.objectContaining({ lng: 116, lat: 39 }), expect.any(Function));
  });

  it('unsupported：createGeocoder.isNull → UnsupportedCapabilityError, supported=false', () => {
    const driver = makeFakeDriver({ loaded: true, version: '3.0' });
    driver.createGeocoder = vi.fn(() => ({ isNull: true }));
    const { result } = renderHook(() => useGeocoder(), { wrapper: bmapWrapper(driver) });
    expect(result.current.supported).toBe(false);
    expect(result.current.error).toBeInstanceOf(UnsupportedCapabilityError);
  });

  it('requestId：cancel 后在途回调被丢弃', () => {
    let captured: ((r: unknown) => void) | undefined;
    const raw = { getPoint: vi.fn((_a: string, cb: (r: unknown) => void) => { captured = cb; }) };
    const driver = makeFakeDriver({ loaded: true });
    driver.createGeocoder = vi.fn(() => ({ isNull: false, raw }));
    const { result } = renderHook(() => useGeocoder(), { wrapper: bmapWrapper(driver) });

    act(() => result.current.getPoint('北京'));
    act(() => result.current.cancel());
    // cancel 后回调到来 → requestId 不匹配 → 丢弃，data 仍为 undefined
    act(() => captured?.({ lng: 1, lat: 1 }));
    expect(result.current.data).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });
});

describe('useDrivingRoute', () => {
  it('supported：search 经 getSDK() 造起终点 Point 再调 raw.search，完成回调更新 data', () => {
    const sdk = installFakeSDK();
    let capturedOpts: any;
    const raw = { search: vi.fn(), getResults: vi.fn(() => ({ routes: ['r'] })) };
    const driver = makeFakeDriver({ loaded: true });
    driver.createDrivingRoute = vi.fn((o: any) => { capturedOpts = o; return { isNull: false, raw }; });

    const onSearchComplete = vi.fn();
    const { result } = renderHook(() => useDrivingRoute({ onSearchComplete }), { wrapper: bmapWrapper(driver) });
    expect(result.current.supported).toBe(true);

    act(() => result.current.search({ lng: 116, lat: 39 }, { lng: 117, lat: 40 }));
    expect(sdk.Point).toHaveBeenCalledWith(116, 39);
    expect(sdk.Point).toHaveBeenCalledWith(117, 40);
    expect(raw.search).toHaveBeenCalled();
    expect(result.current.loading).toBe(true);

    // SDK 完成 → 经 onSearchComplete 回调 searchCbRef；空结果走 getResults 兜底
    act(() => capturedOpts.onSearchComplete({}));
    expect(raw.getResults).toHaveBeenCalled();
    expect(onSearchComplete).toHaveBeenCalledWith({ routes: ['r'] });
    expect(result.current.data).toEqual({ routes: ['r'] });
    expect(result.current.loading).toBe(false);
  });

  it('unsupported：createDrivingRoute.isNull → UnsupportedCapabilityError, supported=false', () => {
    const driver = makeFakeDriver({ loaded: true, version: '3.0' });
    driver.createDrivingRoute = vi.fn(() => ({ isNull: true }));
    const { result } = renderHook(() => useDrivingRoute(), { wrapper: bmapWrapper(driver) });
    expect(result.current.supported).toBe(false);
    expect(result.current.error).toBeInstanceOf(UnsupportedCapabilityError);
  });

  it('requestId：cancel 后在途完成回调被丢弃', () => {
    installFakeSDK();
    let capturedOpts: any;
    const raw = { search: vi.fn(), getResults: vi.fn(() => ({ routes: ['x'] })) };
    const driver = makeFakeDriver({ loaded: true });
    driver.createDrivingRoute = vi.fn((o: any) => { capturedOpts = o; return { isNull: false, raw }; });
    const { result } = renderHook(() => useDrivingRoute(), { wrapper: bmapWrapper(driver) });

    act(() => result.current.search({ lng: 1, lat: 1 }, { lng: 2, lat: 2 }));
    act(() => result.current.cancel());
    act(() => capturedOpts.onSearchComplete({ routes: ['stale'] }));
    expect(result.current.data).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });
});

describe('useTruckRoute', () => {
  it('waypoints 透传：search 第三参 { waypoints } 转 Point 后作为第 3 个实参传给 raw.search', () => {
    const sdk = installFakeSDK();
    const raw = { search: vi.fn(), getResults: vi.fn(() => ({ routes: ['r'] })), setSearchCompleteCallback: vi.fn() };
    const driver = makeFakeDriver({ loaded: true });
    driver.createTruckRoute = vi.fn(() => ({ isNull: false, raw }));
    const { result } = renderHook(() => useTruckRoute(), { wrapper: bmapWrapper(driver) });
    expect(result.current.supported).toBe(true);

    act(() => result.current.search(
      { lng: 116, lat: 39 },
      { lng: 117, lat: 40 },
      { waypoints: [{ lng: 116.5, lat: 39.5 }] },
    ));
    // 途经点也被转成 Point
    expect(sdk.Point).toHaveBeenCalledWith(116.5, 39.5);
    const call = raw.search.mock.calls[0];
    expect(call).toHaveLength(3);
    expect(call[2]).toEqual({ waypoints: [expect.anything()] });
  });
});

describe('useLocalSearch', () => {
  const mapHandle = { __brand: 'map', raw: { MOCK_MAP: true } };

  it('autoRender:false → 不注入 renderOptions.map，location 用中心点而非 Map（仅取数据）', () => {
    installFakeSDK();
    let loc: any; let sopts: any;
    const raw = { setSearchCompleteCallback: vi.fn(), search: vi.fn(), clearResults: vi.fn() };
    const driver = makeFakeDriver({ loaded: true });
    driver.createLocalSearch = vi.fn((l: any, o: any) => { loc = l; sopts = o; return { isNull: false, raw }; });
    renderHook(() => useLocalSearch({ renderOptions: { map: mapHandle as any }, autoRender: false }), { wrapper: bmapWrapper(driver) });
    // 没把地图注入 renderOptions.map
    expect(sopts?.renderOptions?.map).toBeUndefined();
    // location 不是原生 map（改用了地图中心点 Point）
    expect(loc).not.toBe(mapHandle.raw);
  });

  it('默认（未传 autoRender）→ 注入 map 到 renderOptions.map（自动渲染）', () => {
    installFakeSDK();
    let sopts: any;
    const raw = { setSearchCompleteCallback: vi.fn() };
    const driver = makeFakeDriver({ loaded: true });
    driver.createLocalSearch = vi.fn((_l: any, o: any) => { sopts = o; return { isNull: false, raw }; });
    renderHook(() => useLocalSearch({ renderOptions: { map: mapHandle as any } }), { wrapper: bmapWrapper(driver) });
    expect(sopts?.renderOptions?.map).toBe(mapHandle.raw);
  });
});

describe('useConvertor', () => {
  it('分批：>100 点按 100 串行分批请求，结果按顺序合并', () => {
    installFakeSDK();
    // 假 translate：同步回调，回显本批点，模拟 SDK 成功返回
    const raw = {
      translate: vi.fn((pts: any[], _from: number, _to: number, cb: (r: unknown) => void) => {
        cb({ status: 0, points: pts });
      }),
    };
    const driver = makeFakeDriver({ loaded: true });
    driver.createConvertor = vi.fn(() => ({ isNull: false, raw }));

    const points = Array.from({ length: 250 }, (_v, i) => ({ lng: 116 + i * 0.001, lat: 39 }));
    const { result } = renderHook(() => useConvertor(), { wrapper: bmapWrapper(driver) });
    expect(result.current.supported).toBe(true);

    act(() => result.current.translate(points, 1, 5));
    // 250 → 100 + 100 + 50 = 3 批
    expect(raw.translate).toHaveBeenCalledTimes(3);
    expect(raw.translate.mock.calls[0][0]).toHaveLength(100);
    expect(raw.translate.mock.calls[1][0]).toHaveLength(100);
    expect(raw.translate.mock.calls[2][0]).toHaveLength(50);
    // from/to 透传
    expect(raw.translate.mock.calls[0][1]).toBe(1);
    expect(raw.translate.mock.calls[0][2]).toBe(5);
    // 合并后共 250 点
    expect(result.current.data?.points).toHaveLength(250);
    expect(result.current.loading).toBe(false);
  });

  it('单批：≤100 点原样透传 SDK 结果（保留 size 等）', () => {
    installFakeSDK();
    const sdkResult = { status: 0, points: [{ lng: 1, lat: 2 }], size: () => 1 };
    const raw = {
      translate: vi.fn((_pts: any[], _from: number, _to: number, cb: (r: unknown) => void) => { cb(sdkResult); }),
    };
    const driver = makeFakeDriver({ loaded: true });
    driver.createConvertor = vi.fn(() => ({ isNull: false, raw }));
    const { result } = renderHook(() => useConvertor(), { wrapper: bmapWrapper(driver) });
    act(() => result.current.translate([{ lng: 1, lat: 2 }]));
    expect(raw.translate).toHaveBeenCalledTimes(1);
    // 原样透传，data 就是 SDK 结果对象本身
    expect(result.current.data).toBe(sdkResult);
  });

  it('unsupported：createConvertor.isNull → UnsupportedCapabilityError, supported=false', () => {
    const driver = makeFakeDriver({ loaded: true, version: '3.0' });
    driver.createConvertor = vi.fn(() => ({ isNull: true }));
    const { result } = renderHook(() => useConvertor(), { wrapper: bmapWrapper(driver) });
    expect(result.current.supported).toBe(false);
    expect(result.current.error).toBeInstanceOf(UnsupportedCapabilityError);
  });
});
