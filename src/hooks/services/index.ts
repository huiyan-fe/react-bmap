/**
 * 全部 Service Hook — 13 个，统一模式：
 * - service 在 effect 中创建（render 纯净）
 * - 不支持时 supported=false，error=UnsupportedCapabilityError（dev/prod 一致）
 * - requestIdRef 防过期请求覆盖
 * - 卸载后 setState 由 React 吞掉
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';
import type { ServiceHandle } from '../../types';
import type { BMapDriver } from '../../drivers/types';

// ─── 通用 Service Hook 工厂 ───────────────

interface ServiceHookResult<T = unknown> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  run: (query: unknown) => void;
  cancel: () => void;
}

function createServiceHook(
  serviceName: string,
  factory: (driver: BMapDriver, location: unknown, opts: unknown) => ServiceHandle,
) {
  return function useService<T = unknown>(
    locationOrOpts?: unknown,
    searchOpts?: unknown,
  ): ServiceHookResult<T> {
    const { driver } = useBMapContext();
    const svcRef = useRef<ServiceHandle | null>(null);
    const requestIdRef = useRef(0);
    const cancelFnRef = useRef<(() => void) | null>(null);

    const [state, setState] = useState<{
      data: T | undefined; loading: boolean; error: Error | null; supported: boolean;
    }>({ data: undefined, loading: false, error: null, supported: true });

    // service 在 effect 中创建
    const locKey = stableStringify(locationOrOpts);
    const optKey = stableStringify(searchOpts);
    useEffect(() => {
      if (!driver) return;
      const svc = factory(driver, locationOrOpts, searchOpts);
      svcRef.current = svc;
      if (svc.isNull) {
        setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError(serviceName, driver.version), supported: false });
        return;
      }
      setState(s => ({ ...s, supported: true, error: null }));
      return () => { svcRef.current = null; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [driver, locKey, optKey]);

    const run = useCallback((query: unknown) => {
      if (!svcRef.current || svcRef.current.isNull || !driver) return;
      const requestId = ++requestIdRef.current;
      setState(s => ({ ...s, loading: true, error: null }));
      cancelFnRef.current?.();
      cancelFnRef.current = driver.searchService(svcRef.current, query, {
        onSuccess: (data) => {
          if (requestId !== requestIdRef.current) return;
          setState({ data: data as T, loading: false, error: null, supported: true });
        },
        onError: (err) => {
          if (requestId !== requestIdRef.current) return;
          setState(s => ({ ...s, loading: false, error: err }));
        },
      });
    }, [driver]);

    const cancel = useCallback(() => {
      requestIdRef.current++;
      cancelFnRef.current?.();
      cancelFnRef.current = null;
      setState(s => ({ ...s, loading: false }));
    }, []);

    return { ...state, run, cancel };
  };
}

// ─── 手写完整实现的 Service Hooks ───────────────

// useLocalSearch — 完整实现，见 useLocalSearch.ts
export { useLocalSearch } from './useLocalSearch';
export type { LocalSearchOptions, LocalSearchHookResult, LocalSearchRenderOptions } from './useLocalSearch';

// useGeocoder — 完整实现，见 useGeocoder.ts
export { useGeocoder } from './useGeocoder';
export type { GeocoderHookResult } from './useGeocoder';

// useBoundary — 完整实现，见 useBoundary.ts
export { useBoundary } from './useBoundary';
export type { BoundaryHookResult } from './useBoundary';

// useGeolocation — 完整实现，见 useGeolocation.ts
export { useGeolocation } from './useGeolocation';
export type { GeolocationHookResult } from './useGeolocation';

// useLocalCity — 完整实现，见 useLocalCity.ts
export { useLocalCity } from './useLocalCity';
export type { LocalCityHookResult } from './useLocalCity';

// useConvertor — 完整实现，见 useConvertor.ts
export { useConvertor } from './useConvertor';
export type { ConvertorHookResult } from './useConvertor';

// usePanoramaService — 完整实现，见 usePanoramaService.ts
export { usePanoramaService } from './usePanoramaService';
export type { PanoramaServiceHookResult } from './usePanoramaService';

// ─── 路线规划 Service Hooks（手写，search(start, end)） ───────────────

export { useDrivingRoute } from './useDrivingRoute';
export type { DrivingRouteOptions, DrivingRouteHookResult } from './useDrivingRoute';

export { useWalkingRoute } from './useWalkingRoute';
export type { WalkingRouteOptions, WalkingRouteHookResult } from './useWalkingRoute';

export { useRidingRoute } from './useRidingRoute';
export type { RidingRouteOptions, RidingRouteHookResult } from './useRidingRoute';

export { useTransitRoute } from './useTransitRoute';
export type { TransitRouteOptions, TransitRouteHookResult } from './useTransitRoute';

// useBusLineSearch — 手写，见 useBusLineSearch.ts
export { useBusLineSearch } from './useBusLineSearch';
export type { BusLineSearchOptions, BusLineSearchHookResult } from './useBusLineSearch';

// useAutocomplete — 手写，见 useAutocomplete.ts
export { useAutocomplete } from './useAutocomplete';
export type { AutocompleteOptions, AutocompleteHookResult } from './useAutocomplete';

// usePlaceDetail — 手写，见 usePlaceDetail.ts
export { usePlaceDetail } from './usePlaceDetail';
export type { PlaceDetailOptions, PlaceDetailHookResult } from './usePlaceDetail';

// ─── 通用 Service Hooks（使用 createServiceHook 工厂） ───────────────
// 全部 14 个 service hooks 已手写实现，不再使用 createServiceHook
