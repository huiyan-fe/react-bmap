/**
 * useWalkingRoute — 步行路线规划 Hook（手写，完整实现）。
 * SDK：search(Point, Point) / clearResults / enableAutoViewport / disableAutoViewport / setLocation / getStatus
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';
import { isHandle, unwrapHandle } from '../../utils/handle';
import { getSDK } from '../../utils/sdk';
import type { DrivingRouteOptions, DrivingRouteHookResult } from './useDrivingRoute';
import type { DrivingRouteResult } from '../../types/results';

export type WalkingRouteOptions = Omit<DrivingRouteOptions, 'policy'>;
export type WalkingRouteHookResult = Omit<DrivingRouteHookResult, 'setPolicy'> & { setPolicy?: never };

export function useWalkingRoute<T = unknown>(opts: WalkingRouteOptions = {}): WalkingRouteHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);
  const callbacksRef = useRef(opts);
  callbacksRef.current = opts;
  const searchCbRef = useRef<((results: unknown) => void) | null>(null);

  const [state, setState] = useState<{ data: unknown; loading: boolean; error: Error | null; supported: boolean }>({
    data: undefined, loading: false, error: null, supported: true,
  });

  const locKey = stableStringify(opts.location);
  const optKey = stableStringify({ ro: opts.renderOptions });

  useEffect(() => {
    if (!driver) return;
    const ro: Record<string, unknown> = {};
    if (opts.renderOptions) {
      Object.assign(ro, opts.renderOptions);
      if (opts.renderOptions.map) ro.map = unwrapHandle(opts.renderOptions.map);
    }
    const searchOpts: Record<string, unknown> = {};
    if (opts.location !== undefined) {
      searchOpts.location = unwrapHandle(opts.location);
    }
    if (Object.keys(ro).length > 0) searchOpts.renderOptions = ro;
    searchOpts.onSearchComplete = (results: unknown) => { searchCbRef.current?.(results); };
    if (callbacksRef.current.onMarkersSet) searchOpts.onMarkersSet = (pois: unknown[]) => callbacksRef.current.onMarkersSet?.(pois);
    if (callbacksRef.current.onInfoHtmlSet) searchOpts.onInfoHtmlSet = (poi: unknown, html: HTMLElement) => callbacksRef.current.onInfoHtmlSet?.(poi, html);
    if (callbacksRef.current.onPolylinesSet) searchOpts.onPolylinesSet = (pls: unknown[]) => callbacksRef.current.onPolylinesSet?.(pls);
    if (callbacksRef.current.onResultsHtmlSet) searchOpts.onResultsHtmlSet = (c: HTMLElement) => callbacksRef.current.onResultsHtmlSet?.(c);

    const handle = driver.createWalkingRoute(Object.keys(searchOpts).length > 0 ? searchOpts : undefined);
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('WalkingRoute', driver.version), supported: false });
      return;
    }
    rawRef.current = handle.raw;
    const raw = rawRef.current;
    if (typeof raw.setSearchCompleteCallback === 'function') {
      raw.setSearchCompleteCallback((results: unknown) => { searchCbRef.current?.(results); });
    }
    setState(s => ({ ...s, supported: true, error: null }));
    return () => {
      // SDK 的 clearResults 在 renderer 的 map 未就绪/已卸载时会抛，effect cleanup 里抛出会把组件树带崩。
      try { rawRef.current?.clearResults?.(); } catch { /* noop */ }
      rawRef.current = null;
      searchCbRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, locKey, optKey]);

  const search = useCallback((start: unknown, end: unknown, _options?: { waypoints?: unknown[] }) => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    const raw = rawRef.current;
    const cb = (results: unknown) => {
      if (requestId !== requestIdRef.current) return;
      let actual = results;
      if (!actual || (typeof actual === 'object' && Object.keys(actual as object).length === 0)) {
        try { actual = raw.getResults?.(); } catch { /* noop */ }
      }
      callbacksRef.current.onSearchComplete?.(actual as DrivingRouteResult);
      setState({ data: actual ?? results, loading: false, error: null, supported: true });
    };
    searchCbRef.current = cb;
    if (typeof raw.setSearchCompleteCallback === 'function') raw.setSearchCompleteCallback(cb);
    const SDK = getSDK();
    const toPoint = (v: unknown) => {
      if (!v) return v;
      if (isHandle(v)) return v.raw;
      if (typeof v === 'object' && 'lng' in v) {
        const p = v as { lng: number; lat: number };
        return new SDK.Point(p.lng, p.lat);
      }
      return v;
    };
    try { raw.search?.(toPoint(start), toPoint(end)); }
    catch (e) { if (requestId === requestIdRef.current) setState(s => ({ ...s, loading: false, error: e as Error })); }
  }, []);

  const clearResults = useCallback(() => { try { rawRef.current?.clearResults?.(); } catch { /* noop */ } setState(s => ({ ...s, data: undefined, loading: false })); }, []);
  const enableAutoViewport = useCallback(() => { rawRef.current?.enableAutoViewport?.(); }, []);
  const disableAutoViewport = useCallback(() => { rawRef.current?.disableAutoViewport?.(); }, []);
  const setLocation = useCallback((location: unknown) => {
    rawRef.current?.setLocation?.(unwrapHandle(location));
  }, []);
  const getStatus = useCallback(() => rawRef.current?.getStatus?.(), []);
  const cancel = useCallback(() => { requestIdRef.current++; setState(s => ({ ...s, loading: false })); }, []);

  // setPolicy 不适用于 WalkingRoute
  const setPolicy = useCallback((_p: number) => {}, []);
  return { ...state, search, clearResults, enableAutoViewport, disableAutoViewport, setPolicy, setLocation, getStatus, cancel } as unknown as WalkingRouteHookResult;
}
