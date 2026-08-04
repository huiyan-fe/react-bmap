/**
 * useBusLineSearch — 公交线路搜索 Hook（手写）。
 * SDK：getBusList(keyword) / getBusLine(item) / clearResults / enableAutoViewport / disableAutoViewport / setLocation / getStatus
 * 回调：setGetBusListCompleteCallback / setGetBusLineCompleteCallback
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';

export interface BusLineSearchOptions {
  location?: unknown;
  renderOptions?: { map?: unknown; panel?: string | HTMLElement; autoViewport?: boolean };
  onGetBusListComplete?: (results: unknown) => void;
  onGetBusLineComplete?: (results: unknown) => void;
}

export interface BusLineSearchHookResult {
  data: unknown;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  getBusList: (keyword: string) => void;
  getBusLine: (item: unknown) => void;
  clearResults: () => void;
  cancel: () => void;
}

export function useBusLineSearch(opts: BusLineSearchOptions = {}): BusLineSearchHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);
  const callbacksRef = useRef(opts);
  callbacksRef.current = opts;
  const cbRef = useRef<((results: unknown) => void) | null>(null);

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
      if (opts.renderOptions.map && (opts.renderOptions.map as any).__brand) ro.map = (opts.renderOptions.map as any).raw;
    }
    const searchOpts: Record<string, unknown> = {};
    if (opts.location !== undefined) {
      let loc: unknown = opts.location;
      if (loc && (loc as any).__brand) loc = (loc as any).raw;
      searchOpts.location = loc;
    }
    if (Object.keys(ro).length > 0) searchOpts.renderOptions = ro;
    // 构造时注册回调 — 通过 ref 调用最新回调
    searchOpts.onGetBusListComplete = (results: unknown) => { cbRef.current?.(results); callbacksRef.current.onGetBusListComplete?.(results); };
    searchOpts.onGetBusLineComplete = (results: unknown) => { cbRef.current?.(results); callbacksRef.current.onGetBusLineComplete?.(results); };

    const handle = driver.createBusLineSearch(Object.keys(searchOpts).length > 0 ? searchOpts : undefined);
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('BusLineSearch', driver.version), supported: false });
      return;
    }
    rawRef.current = (handle as any).raw;
    const raw = rawRef.current;
    if (typeof raw.setGetBusListCompleteCallback === 'function') {
      raw.setGetBusListCompleteCallback((results: unknown) => { cbRef.current?.(results); callbacksRef.current.onGetBusListComplete?.(results); });
    }
    if (typeof raw.setGetBusLineCompleteCallback === 'function') {
      raw.setGetBusLineCompleteCallback((results: unknown) => { cbRef.current?.(results); callbacksRef.current.onGetBusLineComplete?.(results); });
    }
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; cbRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, locKey, optKey]);

  const getBusList = useCallback((keyword: string) => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    const raw = rawRef.current;
    cbRef.current = (results: unknown) => {
      if (requestId !== requestIdRef.current) return;
      setState({ data: results, loading: false, error: null, supported: true });
    };
    try { raw.getBusList?.(keyword); }
    catch (e) { if (requestId === requestIdRef.current) setState(s => ({ ...s, loading: false, error: e as Error })); }
  }, []);

  const getBusLine = useCallback((item: unknown) => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    const raw = rawRef.current;
    cbRef.current = (results: unknown) => {
      if (requestId !== requestIdRef.current) return;
      setState({ data: results, loading: false, error: null, supported: true });
    };
    try { raw.getBusLine?.(item); }
    catch (e) { if (requestId === requestIdRef.current) setState(s => ({ ...s, loading: false, error: e as Error })); }
  }, []);

  const clearResults = useCallback(() => { rawRef.current?.clearResults?.(); setState(s => ({ ...s, data: undefined, loading: false })); }, []);
  const cancel = useCallback(() => { requestIdRef.current++; setState(s => ({ ...s, loading: false })); }, []);

  return { ...state, getBusList, getBusLine, clearResults, cancel };
}
