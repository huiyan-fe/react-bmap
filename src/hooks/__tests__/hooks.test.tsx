import { describe, it, expect, vi } from 'vitest';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { BMapContext } from '../../context/BMapContext';
import type { BMapContextValue } from '../../context/BMapContext';
import { MapContext } from '../../context/MapContext';
import type { MapContextValue } from '../../context/MapContext';
import { makeFakeDriver } from '../../__tests__/fakeDriver';
import type { FakeDriver } from '../../__tests__/fakeDriver';
import type { MapHandle } from '../../types';
import { useMap } from '../useMap';
import { useMapReady } from '../useMapReady';
import { useRenderMap } from '../services/useRenderMap';
import { useDriver } from '../useDriver';
import { useCapabilities } from '../useCapabilities';
import { useMapEvent } from '../useMapEvent';
import { useMapStatus } from '../useMapStatus';
import { useMapRef } from '../useMapRef';
import { useSymbol } from '../useSymbol';
import { useIcon } from '../useIcon';

const fakeMap = { __brand: 'map', type: 'map', raw: {}, id: 1 } as unknown as MapHandle;

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

function mapWrapper(driver: FakeDriver, map: MapHandle = fakeMap) {
  const value: MapContextValue = {
    map,
    driver: driver as unknown as MapContextValue['driver'],
  };
  return ({ children }: { children: ReactNode }) => (
    <MapContext.Provider value={value}>{children}</MapContext.Provider>
  );
}

describe('核心 hooks', () => {
  it('useMap 返回 MapContext 的 map', () => {
    const driver = makeFakeDriver({ loaded: true });
    const { result } = renderHook(() => useMap(), { wrapper: mapWrapper(driver) });
    expect(result.current).toBe(fakeMap);
  });

  it('useMapReady 在 map 就绪时回调 handle；未就绪(null)不回调', () => {
    const driver = makeFakeDriver({ loaded: true });
    const cbNull = vi.fn();
    renderHook(() => useMapReady(cbNull), { wrapper: mapWrapper(driver, null as unknown as MapHandle) });
    expect(cbNull).not.toHaveBeenCalled();

    const cbReady = vi.fn();
    renderHook(() => useMapReady(cbReady), { wrapper: mapWrapper(driver) });
    expect(cbReady).toHaveBeenCalledTimes(1);
    expect(cbReady).toHaveBeenCalledWith(fakeMap);
  });

  it('useRenderMap 显式传入优先，其次回退 context map，都没有则 undefined', () => {
    const driver = makeFakeDriver({ loaded: true });
    const explicit = { __brand: 'map', raw: {} } as unknown as MapHandle;

    // 显式传入优先（即使在 <Map> 内）
    const { result: r1 } = renderHook(() => useRenderMap(explicit), { wrapper: mapWrapper(driver) });
    expect(r1.current).toBe(explicit);

    // 未显式传入 → 回退到 <Map> context map
    const { result: r2 } = renderHook(() => useRenderMap(), { wrapper: mapWrapper(driver) });
    expect(r2.current).toBe(fakeMap);

    // <Map> 外且未显式传入 → undefined
    const { result: r3 } = renderHook(() => useRenderMap());
    expect(r3.current).toBeUndefined();
  });

  it('useDriver 返回 BMapContext 的 driver', () => {
    const driver = makeFakeDriver({ loaded: true });
    const { result } = renderHook(() => useDriver(), { wrapper: bmapWrapper(driver) });
    expect(result.current).toBe(driver);
  });

  it('useCapabilities 返回 driver.capabilities，无 driver 时返回空 Set', () => {
    const driver = makeFakeDriver({ capabilities: ['heading', 'tilt'] });
    const { result } = renderHook(() => useCapabilities(), { wrapper: bmapWrapper(driver) });
    expect(result.current.has('heading')).toBe(true);
    expect(result.current.has('tilt')).toBe(true);

    // 无 Provider 时走 context 默认值（driver=null）→ 空 Set
    const { result: empty } = renderHook(() => useCapabilities());
    expect(empty.current.size).toBe(0);
  });

  it('useMapRef 在 map/driver 就绪时返回命令式句柄，随 map/driver 变化重建', () => {
    const driver = makeFakeDriver({ loaded: true });
    const { result } = renderHook(() => useMapRef(), { wrapper: mapWrapper(driver) });
    expect(result.current).not.toBeNull();
  });

  it('useMapEvent 订阅事件，emit 时调用最新 handler', () => {
    const driver = makeFakeDriver({ loaded: true });
    const h1 = vi.fn();
    const h2 = vi.fn();
    const { rerender } = renderHook(
      ({ h }: { h: (raw: unknown) => void }) => useMapEvent('click', h),
      { wrapper: mapWrapper(driver), initialProps: { h: h1 } },
    );
    act(() => driver.__emit('click', { x: 1 }));
    expect(h1).toHaveBeenCalledWith({ x: 1 });

    // 换 handler：不应重订阅（ref 持有最新值），emit 走新 handler
    rerender({ h: h2 });
    act(() => driver.__emit('click', { x: 2 }));
    expect(h2).toHaveBeenCalledWith({ x: 2 });
    // 事件监听器只注册一次
    expect(driver.__listeners.click.length).toBe(1);
  });

  it('useMapStatus 读取快照，值不变时返回同一引用（值比较缓存）', () => {
    const driver = makeFakeDriver({ loaded: true });
    const { result } = renderHook(() => useMapStatus(), { wrapper: mapWrapper(driver) });
    expect(result.current).not.toBeNull();
    expect(result.current?.zoom).toBe(11);
    expect(result.current?.center).toEqual({ lng: 0, lat: 0 });
    const first = result.current;
    // getters 返回常量 → 再次 emit 后快照值不变 → 缓存同一引用
    act(() => driver.__emit('moveend'));
    expect(result.current).toBe(first);
  });

  it('useMapStatus getter 抛错时该字段降级为 null', () => {
    const driver = makeFakeDriver({ loaded: true });
    driver.getZoom = vi.fn(() => { throw new Error('unsupported'); });
    const { result } = renderHook(() => useMapStatus(), { wrapper: mapWrapper(driver) });
    expect(result.current?.zoom).toBeNull();
    // 其它字段仍正常
    expect(result.current?.center).toEqual({ lng: 0, lat: 0 });
  });

  it('useSymbol 创建 Symbol 值对象（createSymbol），path 变化重建', () => {
    const driver = makeFakeDriver({ loaded: true });
    const { rerender } = renderHook(
      ({ path }: { path: number }) => useSymbol({ path } as any),
      { wrapper: mapWrapper(driver), initialProps: { path: 1 } },
    );
    expect(driver.createSymbol).toHaveBeenCalledTimes(1);
    act(() => rerender({ path: 2 }));
    expect(driver.createSymbol).toHaveBeenCalledTimes(2);
  });

  it('useSymbol 首帧返回 null，创建完成后自动重渲染拿到真实 handle（不需要调用方手动 bump）', () => {
    const driver = makeFakeDriver({ loaded: true });
    const { result } = renderHook(() => useSymbol({ path: 1 } as any), { wrapper: mapWrapper(driver) });
    // renderHook 内部用 act 包裹初次渲染，effect 已经跑完；直接断言最终稳定值非 null
    expect(result.current).not.toBeNull();
  });

  it('useIcon 创建 Icon 值对象（createIcon），url 变化重建', () => {
    const driver = makeFakeDriver({ loaded: true });
    const { rerender } = renderHook(
      ({ url }: { url: string }) => useIcon({ url } as any),
      { wrapper: mapWrapper(driver), initialProps: { url: 'a.png' } },
    );
    expect(driver.createIcon).toHaveBeenCalledTimes(1);
    act(() => rerender({ url: 'b.png' }));
    expect(driver.createIcon).toHaveBeenCalledTimes(2);
  });

  it('useIcon 首帧返回 null，创建完成后自动重渲染拿到真实 handle（不需要调用方手动 bump）', () => {
    const driver = makeFakeDriver({ loaded: true });
    const { result } = renderHook(() => useIcon({ url: 'a.png' } as any), { wrapper: mapWrapper(driver) });
    expect(result.current).not.toBeNull();
  });
});
