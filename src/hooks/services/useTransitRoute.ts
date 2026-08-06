/**
 * useTransitRoute — 公交路线规划 Hook（手写，完整实现）。
 * SDK：search(Point, Point) / clearResults / enableAutoViewport / disableAutoViewport
 * / setPolicy / setPageCapacity / setIntercityPolicy / setTransitTypePolicy / setLocation / getStatus
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';
import type { DrivingRouteOptions, DrivingRouteHookResult } from './useDrivingRoute';

export type TransitRouteOptions = DrivingRouteOptions;
export type TransitRouteHookResult = DrivingRouteHookResult & { setPageCapacity: (n: number) => void };

export function useTransitRoute<T = unknown>(opts: TransitRouteOptions = {}): TransitRouteHookResult {
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
  const optKey = stableStringify({ policy: opts.policy, ro: opts.renderOptions });

  useEffect(() => {
    if (!driver) return;
    const ro: Record<string, unknown> = {};
    if (opts.renderOptions) {
      Object.assign(ro, opts.renderOptions);
      if (opts.renderOptions.map && (opts.renderOptions.map as any).__brand) ro.map = (opts.renderOptions.map as any).raw;
    }
    const searchOpts: Record<string, unknown> = {};
    if (opts.location !== undefined) {
      let loc: unknown = opts.location;
      if (loc && (loc as any).__brand) loc = (loc as any).raw;
      searchOpts.location = loc;
    }
    if (opts.policy !== undefined) searchOpts.policy = opts.policy;
    if (Object.keys(ro).length > 0) searchOpts.renderOptions = ro;
    searchOpts.onSearchComplete = (results: unknown) => { searchCbRef.current?.(results); };
    if (callbacksRef.current.onMarkersSet) searchOpts.onMarkersSet = (pois: unknown[]) => callbacksRef.current.onMarkersSet?.(pois);
    if (callbacksRef.current.onInfoHtmlSet) searchOpts.onInfoHtmlSet = (poi: unknown, html: HTMLElement) => callbacksRef.current.onInfoHtmlSet?.(poi, html);
    if (callbacksRef.current.onPolylinesSet) searchOpts.onPolylinesSet = (pls: unknown[]) => callbacksRef.current.onPolylinesSet?.(pls);
    if (callbacksRef.current.onResultsHtmlSet) searchOpts.onResultsHtmlSet = (c: HTMLElement) => callbacksRef.current.onResultsHtmlSet?.(c);

    const handle = driver.createTransitRoute(Object.keys(searchOpts).length > 0 ? searchOpts : undefined);
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('TransitRoute', driver.version), supported: false });
      return;
    }
    rawRef.current = (handle as any).raw;
    const raw = rawRef.current;
    if (typeof raw.setSearchCompleteCallback === 'function') {
      raw.setSearchCompleteCallback((results: unknown) => { searchCbRef.current?.(results); });
    }
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; searchCbRef.current = null; };
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
      callbacksRef.current.onSearchComplete?.(actual);
      setState({ data: actual ?? results, loading: false, error: null, supported: true });
    };
    searchCbRef.current = cb;
    if (typeof raw.setSearchCompleteCallback === 'function') raw.setSearchCompleteCallback(cb);
    const SDK = (globalThis as any).BMap;
    const toPoint = (v: unknown) => {
      if (!v) return v;
      if ((v as any).__brand) return (v as any).raw;
      if (typeof v === 'object' && 'lng' in (v as any)) return new SDK.Point((v as any).lng, (v as any).lat);
      return v;
    };
    try { raw.search?.(toPoint(start), toPoint(end)); }
    catch (e) { if (requestId === requestIdRef.current) setState(s => ({ ...s, loading: false, error: e as Error })); }
  }, []);

  const clearResults = useCallback(() => { rawRef.current?.clearResults?.(); setState(s => ({ ...s, data: undefined, loading: false })); }, []);
  const enableAutoViewport = useCallback(() => { rawRef.current?.enableAutoViewport?.(); }, []);
  const disableAutoViewport = useCallback(() => { rawRef.current?.disableAutoViewport?.(); }, []);
  const setPolicy = useCallback((p: number) => { rawRef.current?.setPolicy?.(p); }, []);
  const setPageCapacity = useCallback((n: number) => { rawRef.current?.setPageCapacity?.(n); }, []);
  const setLocation = useCallback((location: unknown) => {
    let loc = location; if (loc && (loc as any).__brand) loc = (loc as any).raw;
    rawRef.current?.setLocation?.(loc);
  }, []);
  const getStatus = useCallback(() => rawRef.current?.getStatus?.(), []);
  const cancel = useCallback(() => { requestIdRef.current++; setState(s => ({ ...s, loading: false })); }, []);

  return { ...state, search, clearResults, enableAutoViewport, disableAutoViewport, setPolicy, setPageCapacity, setLocation, getStatus, cancel };
}
