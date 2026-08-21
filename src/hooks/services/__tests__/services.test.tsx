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
