/**
 * useDrivingRoute — 驾车路线规划 Hook（手写，完整实现 SDK dts）。
 *
 * SDK 方法：search(start: Point|LocalResultPoi, end: Point|LocalResultPoi, { waypoints? })
 * / getResults / clearResults / enableAutoViewport / disableAutoViewport
 * / setPolicy / setLocation / getStatus / setSearchCompleteCallback
 * / setMarkersSetCallback / setInfoHtmlSetCallback / setPolylinesSetCallback / setResultsHtmlSetCallback
 *
 * 注意：search 不接受字符串地址，只接受 Point 或 LocalResultPoi。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';

export interface DrivingRouteRenderOptions {
  map?: unknown;
  panel?: string | HTMLElement;
  selectFirstResult?: boolean;
  autoViewport?: boolean;
  viewportOptions?: { noAnimation?: boolean; margins?: number[]; zoomFactor?: number };
}

export interface DrivingRouteOptions {
  location?: unknown;
  policy?: number;
  renderOptions?: DrivingRouteRenderOptions;
  onSearchComplete?: (results: unknown) => void;
  onMarkersSet?: (pois: unknown[]) => void;
  onInfoHtmlSet?: (poi: unknown, html: HTMLElement) => void;
  onPolylinesSet?: (polylines: unknown[]) => void;
  onResultsHtmlSet?: (container: HTMLElement) => void;
}

export interface DrivingRouteHookResult {
  data: unknown;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  /** 搜索（start/end 必须是 Point 或 LocalResultPoi，不支持字符串地址） */
  search: (start: unknown, end: unknown, options?: { waypoints?: unknown[] }) => void;
  clearResults: () => void;
  enableAutoViewport: () => void;
  disableAutoViewport: () => void;
  setPolicy: (policy: number) => void;
  setLocation: (location: unknown) => void;
  getStatus: () => number | undefined;
  cancel: () => void;
}

export function useDrivingRoute<T = unknown>(opts: DrivingRouteOptions = {}): DrivingRouteHookResult {
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

    const handle = driver.createDrivingRoute(searchOpts);
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('DrivingRoute', driver.version), supported: false });
      return;
    }
    rawRef.current = (handle as any).raw;
    // 也通过 setSearchCompleteCallback 注册（SDK 可能用其中之一）
    const raw = rawRef.current;
    if (typeof raw.setSearchCompleteCallback === 'function') {
      raw.setSearchCompleteCallback((results: unknown) => { searchCbRef.current?.(results); });
    }
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current?.clearResults?.(); rawRef.current = null; searchCbRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, locKey, optKey]);

  const search = useCallback((start: unknown, end: unknown, options?: { waypoints?: unknown[] }) => {
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

    // 解包 start/end（可能是 MapHandle 或 plain {lng,lat}）
    const SDK = (globalThis as any).BMap;
    const toPoint = (v: unknown): unknown => {
      if (!v) return v;
      if ((v as any).__brand) return (v as any).raw;
      if (typeof v === 'object' && 'lng' in (v as any)) return new SDK.Point((v as any).lng, (v as any).lat);
      return v; // LocalResultPoi 或已转换的对象
    };
    const s = toPoint(start);
    const e = toPoint(end);
    const opts = options?.waypoints ? { waypoints: options.waypoints.map(toPoint) } : undefined;
    try { raw.search?.(s, e, opts); }
    catch (e) { if (requestId === requestIdRef.current) setState(s => ({ ...s, loading: false, error: e as Error })); }
  }, []);

  const clearResults = useCallback(() => {
    rawRef.current?.clearResults?.();
    setState(s => ({ ...s, data: undefined, loading: false }));
  }, []);

  const enableAutoViewport = useCallback(() => { rawRef.current?.enableAutoViewport?.(); }, []);
  const disableAutoViewport = useCallback(() => { rawRef.current?.disableAutoViewport?.(); }, []);
  const setPolicy = useCallback((policy: number) => { rawRef.current?.setPolicy?.(policy); }, []);
  const setLocation = useCallback((location: unknown) => {
    let loc = location;
    if (loc && (loc as any).__brand) loc = (loc as any).raw;
    rawRef.current?.setLocation?.(loc);
  }, []);
  const getStatus = useCallback(() => rawRef.current?.getStatus?.(), []);
  const cancel = useCallback(() => { requestIdRef.current++; setState(s => ({ ...s, loading: false })); }, []);

  return { ...state, search, clearResults, enableAutoViewport, disableAutoViewport, setPolicy, setLocation, getStatus, cancel };
}
