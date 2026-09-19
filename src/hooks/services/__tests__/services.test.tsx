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
import { useBusLineSearch } from '../useBusLineSearch';
import { useAutocomplete } from '../useAutocomplete';

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

  it('批量 getPoints：并发多地址、各自回调，按序返回、失败位 null', async () => {
    // 每个地址各自回调：能查到的回坐标，"未知" 回 null
    const raw = {
      getPoint: vi.fn((address: string, cb: (r: unknown) => void) => {
        cb(address === '未知' ? null : { lng: 116 + address.length, lat: 39 });
      }),
    };
    const driver = makeFakeDriver({ loaded: true });
    driver.createGeocoder = vi.fn(() => ({ isNull: false, raw }));
    const { result } = renderHook(() => useGeocoder(), { wrapper: bmapWrapper(driver) });

    let out: (unknown | null)[] = [];
    await act(async () => { out = await result.current.getPoints(['甲', '未知', '丙丁']); });
    expect(raw.getPoint).toHaveBeenCalledTimes(3);
    // 保序：第 2 个是 null（未找到），其余是坐标
    expect(out[0]).toEqual({ lng: 117, lat: 39 });
    expect(out[1]).toBeNull();
    expect(out[2]).toEqual({ lng: 118, lat: 39 });
    // 批量不写单值 data
    expect(result.current.data).toBeUndefined();
  });

  it('批量 getLocations：经 getSDK 造 Point、并发逆编码，按序返回', async () => {
    const sdk = installFakeSDK();
    const raw = {
      getLocation: vi.fn((pt: any, cb: (r: unknown) => void) => { cb({ address: `addr@${pt.lng}` }); }),
    };
    const driver = makeFakeDriver({ loaded: true });
    driver.createGeocoder = vi.fn(() => ({ isNull: false, raw }));
    const { result } = renderHook(() => useGeocoder(), { wrapper: bmapWrapper(driver) });

    let out: any[] = [];
    await act(async () => {
      out = await result.current.getLocations([{ lng: 116, lat: 39 }, { lng: 117, lat: 40 }]);
    });
    expect(sdk.Point).toHaveBeenCalledWith(116, 39);
    expect(sdk.Point).toHaveBeenCalledWith(117, 40);
    expect(out[0]).toEqual({ address: 'addr@116' });
    expect(out[1]).toEqual({ address: 'addr@117' });
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

  it('首搜渲染兜底：自动渲染实例首次完成后同参补搜一次', () => {
    installFakeSDK();
    let capturedOpts: any;
    const raw = { search: vi.fn(), getResults: vi.fn(() => ({ routes: ['r'] })), setSearchCompleteCallback: vi.fn() };
    const driver = makeFakeDriver({ loaded: true });
    driver.createDrivingRoute = vi.fn((o: any) => { capturedOpts = o; return { isNull: false, raw }; });
    const mapHandle = { __brand: 'map', raw: { MOCK: true } };
    const { result } = renderHook(() => useDrivingRoute({ renderOptions: { map: mapHandle as any } }), { wrapper: bmapWrapper(driver) });
    act(() => result.current.search({ lng: 1, lat: 1 }, { lng: 2, lat: 2 }));
    // 首搜只发一次；渲染尚未完成，暂不补发
    expect(raw.search).toHaveBeenCalledTimes(1);
    // SDK 首次完成 → 补发一次
    act(() => capturedOpts.onSearchComplete({ routes: ['r'] }));
    expect(raw.search).toHaveBeenCalledTimes(2);
    // 补发完成再回调 → 不再补发（每实例只补一次）
    act(() => capturedOpts.onSearchComplete({ routes: ['r'] }));
    expect(raw.search).toHaveBeenCalledTimes(2);
  });

  it('autoRender:false：不补发（纯取数据无渲染步骤）', () => {
    installFakeSDK();
    let capturedOpts: any;
    const raw = { search: vi.fn(), getResults: vi.fn(() => ({ routes: ['r'] })), setSearchCompleteCallback: vi.fn() };
    const driver = makeFakeDriver({ loaded: true });
    driver.createDrivingRoute = vi.fn((o: any) => { capturedOpts = o; return { isNull: false, raw }; });
    const mapHandle = { __brand: 'map', raw: { MOCK: true } };
    const { result } = renderHook(() => useDrivingRoute({ renderOptions: { map: mapHandle as any }, autoRender: false }), { wrapper: bmapWrapper(driver) });
    act(() => result.current.search({ lng: 1, lat: 1 }, { lng: 2, lat: 2 }));
    act(() => capturedOpts.onSearchComplete({ routes: ['r'] }));
    expect(raw.search).toHaveBeenCalledTimes(1);
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

  it('补齐的透传方法：clearSelected/select/setLocation/enableAutoViewport/setPageCapacity/getStatus 调到原生实例', () => {
    installFakeSDK();
    const raw = {
      setSearchCompleteCallback: vi.fn(),
      clearSelected: vi.fn(), select: vi.fn(), setLocation: vi.fn(),
      enableAutoViewport: vi.fn(), disableAutoViewport: vi.fn(),
      enableFirstResultSelection: vi.fn(), disableFirstResultSelection: vi.fn(),
      setPageCapacity: vi.fn(), getStatus: vi.fn(() => 0),
    };
    const driver = makeFakeDriver({ loaded: true });
    driver.createLocalSearch = vi.fn(() => ({ isNull: false, raw }));
    const { result } = renderHook(() => useLocalSearch(), { wrapper: bmapWrapper(driver) });

    act(() => result.current.clearSelected());
    act(() => result.current.select(2));
    act(() => result.current.setLocation('上海'));
    act(() => result.current.enableAutoViewport());
    act(() => result.current.setPageCapacity(20));
    let status: number | undefined;
    act(() => { status = result.current.getStatus(); });

    expect(raw.clearSelected).toHaveBeenCalled();
    expect(raw.select).toHaveBeenCalledWith(2);
    expect(raw.setLocation).toHaveBeenCalledWith('上海');
    expect(raw.enableAutoViewport).toHaveBeenCalled();
    expect(raw.setPageCapacity).toHaveBeenCalledWith(20);
    expect(status).toBe(0);
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

describe('service hook 补齐方法（2.0.4）', () => {
  it('useDrivingRoute.setPolylineStyle 透传到原生实例', () => {
    installFakeSDK();
    const raw = { search: vi.fn(), getResults: vi.fn(() => ({})), setPolylineStyle: vi.fn() };
    const driver = makeFakeDriver({ loaded: true });
    driver.createDrivingRoute = vi.fn(() => ({ isNull: false, raw }));
    const { result } = renderHook(() => useDrivingRoute(), { wrapper: bmapWrapper(driver) });
    act(() => result.current.setPolylineStyle({ strokeColor: '#f00', strokeWeight: 8 }));
    expect(raw.setPolylineStyle).toHaveBeenCalledWith({ strokeColor: '#f00', strokeWeight: 8 });
  });

  it('useBusLineSearch 补齐 enableAutoViewport/setLocation/getStatus 透传', () => {
    const raw = {
      setGetBusListCompleteCallback: vi.fn(), setGetBusLineCompleteCallback: vi.fn(),
      enableAutoViewport: vi.fn(), disableAutoViewport: vi.fn(),
      setLocation: vi.fn(), getStatus: vi.fn(() => 0),
    };
    const driver = makeFakeDriver({ loaded: true });
    driver.createBusLineSearch = vi.fn(() => ({ isNull: false, raw }));
    const { result } = renderHook(() => useBusLineSearch(), { wrapper: bmapWrapper(driver) });
    act(() => result.current.enableAutoViewport());
    act(() => result.current.setLocation('上海'));
    let st: number | undefined;
    act(() => { st = result.current.getStatus(); });
    expect(raw.enableAutoViewport).toHaveBeenCalled();
    expect(raw.setLocation).toHaveBeenCalledWith('上海');
    expect(st).toBe(0);
  });

  it('useAutocomplete 补齐 setInputValue/setTypes/setLocation 透传', () => {
    const raw = { setInputValue: vi.fn(), setTypes: vi.fn(), setLocation: vi.fn(), getStatus: vi.fn(() => 0) };
    const driver = makeFakeDriver({ loaded: true });
    driver.createAutocomplete = vi.fn(() => ({ isNull: false, raw }));
    const { result } = renderHook(() => useAutocomplete(), { wrapper: bmapWrapper(driver) });
    act(() => result.current.setInputValue('天安'));
    act(() => result.current.setTypes(['city']));
    act(() => result.current.setLocation('北京'));
    expect(raw.setInputValue).toHaveBeenCalledWith('天安');
    expect(raw.setTypes).toHaveBeenCalledWith(['city']);
    expect(raw.setLocation).toHaveBeenCalledWith('北京');
  });
});
