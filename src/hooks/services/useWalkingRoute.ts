/**
 * useWalkingRoute — 步行路线规划 Hook（手写，完整实现）。
 * SDK：search(Point, Point) / clearResults / enableAutoViewport / disableAutoViewport / setLocation / getStatus
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';
import { isHandle, unwrapHandle } from '../../utils/handle';
import { useRenderMap } from './useRenderMap';
import { fallbackLocation } from './renderHelpers';
import { useServiceTimeout, serviceTimeoutError } from './useServiceTimeout';
import { getSDK } from '../../utils/sdk';
import type { DrivingRouteOptions, DrivingRouteHookResult } from './useDrivingRoute';
import type { DrivingRouteResult } from '../../types/results';

// 步行不支持 policy / alternatives（SDK WalkingRoute 构造函数不读 alternatives，
// 且强制 this._enableDragging=false，故 renderOptions.enableDragging 对步行无效）。
export type WalkingRouteOptions = Omit<DrivingRouteOptions, 'policy' | 'alternatives'>;
export type WalkingRouteHookResult = Omit<DrivingRouteHookResult, 'setPolicy'> & { setPolicy?: never };

export function useWalkingRoute<T = unknown>(opts: WalkingRouteOptions = {}): WalkingRouteHookResult {
  const { driver } = useBMapContext();
  const renderMap = useRenderMap(opts.renderOptions?.map);
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);
  const { arm, clear } = useServiceTimeout();
  const callbacksRef = useRef(opts);
  callbacksRef.current = opts;
  const searchCbRef = useRef<((results: unknown) => void) | null>(null);
  const autoRenderRef = useRef(false);
  const primedRef = useRef(false);

  const [state, setState] = useState<{ data: unknown; loading: boolean; error: Error | null; supported: boolean }>({
    data: undefined, loading: false, error: null, supported: true,
  });

  const locKey = stableStringify(opts.location);
  const optKey = stableStringify({ ar: opts.autoRender, ro: opts.renderOptions });

  useEffect(() => {
    if (!driver) return;
    const dataOnly = opts.autoRender === false;
    const ro: Record<string, unknown> = {};
    if (opts.renderOptions) Object.assign(ro, opts.renderOptions);
    if (dataOnly) delete ro.map;
    else if (renderMap) ro.map = unwrapHandle(renderMap);
    const searchOpts: Record<string, unknown> = {};
    // location 缺省时回退到当前 <Map>（dataOnly 用中心点而非 Map，避免自动渲染）
    if (opts.location !== undefined) {
      searchOpts.location = unwrapHandle(opts.location);
    } else {
      const loc = fallbackLocation(driver, renderMap, dataOnly);
      if (loc !== '') searchOpts.location = loc;
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
    autoRenderRef.current = ro.map != null;
    primedRef.current = false;
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
  }, [driver, locKey, optKey, renderMap]);

  const search = useCallback((start: unknown, end: unknown, _options?: { waypoints?: unknown[] }) => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    arm(() => {
      if (requestId !== requestIdRef.current) return;
      setState(s => ({ ...s, loading: false, error: serviceTimeoutError() }));
    });
    const raw = rawRef.current;
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
    const s = toPoint(start);
    const e = toPoint(end);
    const cb = (results: unknown) => {
      if (requestId !== requestIdRef.current) return;
      clear();
      let actual = results;
      if (!actual || (typeof actual === 'object' && Object.keys(actual as object).length === 0)) {
        try { actual = raw.getResults?.(); } catch { /* noop */ }
      }
      callbacksRef.current.onSearchComplete?.(actual as DrivingRouteResult);
      setState({ data: actual ?? results, loading: false, error: null, supported: true });
      // 首搜渲染竞态兜底：自动渲染实例首次完成后同参补搜一次，确保首帧出线（每实例一次）。
      if (autoRenderRef.current && !primedRef.current) {
        primedRef.current = true;
        try { raw.search?.(s, e); } catch { /* noop */ }
      }
    };
    searchCbRef.current = cb;
    if (typeof raw.setSearchCompleteCallback === 'function') raw.setSearchCompleteCallback(cb);
    try { raw.search?.(s, e); }
    catch (e) { clear(); if (requestId === requestIdRef.current) setState(s => ({ ...s, loading: false, error: e as Error })); }
  }, [arm, clear]);

  const clearResults = useCallback(() => { try { rawRef.current?.clearResults?.(); } catch { /* noop */ } setState(s => ({ ...s, data: undefined, loading: false })); }, []);
  const enableAutoViewport = useCallback(() => { rawRef.current?.enableAutoViewport?.(); }, []);
  const disableAutoViewport = useCallback(() => { rawRef.current?.disableAutoViewport?.(); }, []);
  const setLocation = useCallback((location: unknown) => {
    rawRef.current?.setLocation?.(unwrapHandle(location));
  }, []);
  const setPolylineStyle = useCallback((style: Record<string, unknown>) => { rawRef.current?.setPolylineStyle?.(style); }, []);
  const getStatus = useCallback(() => rawRef.current?.getStatus?.(), []);
  const cancel = useCallback(() => { requestIdRef.current++; clear(); setState(s => ({ ...s, loading: false })); }, [clear]);

  // setPolicy 不适用于 WalkingRoute
  const setPolicy = useCallback((_p: number) => {}, []);
  return { ...state, search, clearResults, enableAutoViewport, disableAutoViewport, setPolicy, setLocation, setPolylineStyle, getStatus, cancel } as unknown as WalkingRouteHookResult;
}
