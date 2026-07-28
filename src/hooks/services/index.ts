/**
 * 全部 Service Hook — 13 个，统一模式：
 * - service 在 effect 中创建（render 纯净）
 * - 不支持时 supported=false，error=UnsupportedCapabilityError（dev/prod 一致）
 * - requestIdRef 防过期请求覆盖
 * - 卸载后 setState 由 React 吞掉
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMapContext } from '../../context/MapContext';
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
    const { driver } = useMapContext();
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

// ─── 13 个 Service Hook ───────────────

export const useLocalSearch = createServiceHook('LocalSearch', (d, loc, opts) => d.createLocalSearch(loc, opts));
export const useGeocoder = createServiceHook('Geocoder', (d) => d.createGeocoder());
export const useDrivingRoute = createServiceHook('DrivingRoute', (d, _loc, opts) => d.createDrivingRoute(opts));
export const useWalkingRoute = createServiceHook('WalkingRoute', (d, _loc, opts) => d.createWalkingRoute(opts));
export const useRidingRoute = createServiceHook('RidingRoute', (d, _loc, opts) => d.createRidingRoute(opts));
export const useTransitRoute = createServiceHook('TransitRoute', (d, _loc, opts) => d.createTransitRoute(opts));
export const useBusLineSearch = createServiceHook('BusLineSearch', (d, _loc, opts) => d.createBusLineSearch(opts));
export const useAutocomplete = createServiceHook('Autocomplete', (d, _loc, opts) => d.createAutocomplete(opts));
export const useBoundary = createServiceHook('Boundary', (d) => d.createBoundary());
export const useGeolocation = createServiceHook('Geolocation', (d, _loc, opts) => d.createGeolocation(opts));
export const useLocalCity = createServiceHook('LocalCity', (d, _loc, opts) => d.createLocalCity(opts));
export const usePlaceDetail = createServiceHook('PlaceDetail', (d, _loc, opts) => d.createPlaceDetail(opts));
export const useConvertor = createServiceHook('Convertor', (d) => d.createConvertor());

// ─── 全景服务 Hook ───────────────
export const usePanoramaService = createServiceHook('PanoramaService', (d) => d.createPanoramaService());
