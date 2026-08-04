/**
 * useLocalSearch — 本地搜索 Hook（手写，完整实现 SDK dts 全部功能）。
 *
 * React 设计规范：
 * - 参数用 options 对象，状态变化触发 service 重建
 * - action 方法用 useCallback，稳定引用
 * - 回调用 useEffect 注册/注销
 * - requestId 防过期请求
 *
 * 用法：
 * ```tsx
 * const {
 *   data, loading, error, supported,
 *   search, searchNearby, searchInBounds, gotoPage, clearResults, cancel,
 * } = useLocalSearch({
 *   location: '北京',
 *   pageCapacity: 10,
 *   renderOptions: { map, autoViewport: true },
 *   onSearchComplete: (results) => { ... },
 *   onMarkersSet: (pois) => { ... },
 * });
 * ```
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';
import type { BMapDriver } from '../../drivers/types';
import type { ServiceHandle, Point, Bounds } from '../../types';

// ─── 类型 ───

export interface LocalSearchRenderOptions {
  map?: { __brand: string; raw: unknown };
  panel?: string | HTMLElement;
  selectFirstResult?: boolean;
  autoViewport?: boolean;
  viewportOptions?: { noAnimation?: boolean; margins?: number[]; zoomFactor?: number };
}

export interface LocalSearchOptions {
  /** 搜索城市/区域，可为字符串、Point 或 Map */
  location?: string | Point | { __brand: string; raw: unknown };
  /** 每页结果数（1-100） */
  pageCapacity?: number;
  /** 页码（v4+） */
  pageNum?: number;
  /** 渲染选项 */
  renderOptions?: LocalSearchRenderOptions;
  /** 搜索完成回调 */
  onSearchComplete?: (results: unknown) => void;
  /** 标注设置回调 */
  onMarkersSet?: (pois: unknown[]) => void;
  /** 信息窗回调 */
  onInfoHtmlSet?: (poi: unknown, html: HTMLElement) => void;
  /** 结果面板回调 */
  onResultsHtmlSet?: (container: HTMLElement) => void;
}

export interface LocalSearchHookResult<T = unknown> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  /** 搜索（支持多关键词数组） */
  search: (keyword: string | string[], option?: { forceLocal?: boolean }) => void;
  /** 周边搜索 */
  searchNearby: (keyword: string | string[], center: string | Point, radius: number) => void;
  /** 范围搜索 */
  searchInBounds: (keyword: string | string[], bounds: Bounds) => void;
  /** 翻页 */
  gotoPage: (page: number) => void;
  /** 清空结果 */
  clearResults: () => void;
  /** 取消当前请求 */
  cancel: () => void;
}

// ─── Hook ───

export function useLocalSearch<T = unknown>(opts: LocalSearchOptions = {}): LocalSearchHookResult<T> {
  const { driver } = useBMapContext();
  const svcRef = useRef<ServiceHandle | null>(null);
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);
  const cancelFnRef = useRef<(() => void) | null>(null);

  const [state, setState] = useState<{
    data: T | undefined; loading: boolean; error: Error | null; supported: boolean;
  }>({ data: undefined, loading: false, error: null, supported: true });

  // 回调 ref（保持引用稳定，避免 service 重建）
  const callbacksRef = useRef(opts);
  callbacksRef.current = opts;

  // 构造参数 key（location/pageCapacity/pageNum/renderOptions 变化时重建）
  const locKey = stableStringify(opts.location);
  const optKey = stableStringify({ pc: opts.pageCapacity, pn: opts.pageNum, ro: opts.renderOptions });

  // create service
  useEffect(() => {
    if (!driver) return;

    // 构造 renderOptions，把 MapRef 解包成 raw
    const ro: Record<string, unknown> = {};
    if (opts.renderOptions) {
      Object.assign(ro, opts.renderOptions);
      if (opts.renderOptions.map && (opts.renderOptions.map as any).__brand) {
        ro.map = (opts.renderOptions.map as any).raw;
      }
    }

    const searchOpts: Record<string, unknown> = {};
    if (opts.pageCapacity !== undefined) searchOpts.pageCapacity = opts.pageCapacity;
    if (opts.pageNum !== undefined) searchOpts.pageNum = opts.pageNum;
    if (Object.keys(ro).length > 0) searchOpts.renderOptions = ro;

    // 解包 location
    let loc: unknown = opts.location ?? '';
    if (loc && (loc as any).__brand) loc = (loc as any).raw;

    const handle = driver.createLocalSearch(loc, Object.keys(searchOpts).length > 0 ? searchOpts : undefined);
    svcRef.current = handle;
    rawRef.current = (handle as any).raw;

    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('LocalSearch', driver.version), supported: false });
      return;
    }

    // 注册回调
    const raw = (handle as any).raw;
    if (typeof raw.setSearchCompleteCallback === 'function') {
      raw.setSearchCompleteCallback((results: unknown) => {
        callbacksRef.current.onSearchComplete?.(results);
      });
    }
    if (typeof raw.setMarkersSetCallback === 'function' && callbacksRef.current.onMarkersSet) {
      raw.setMarkersSetCallback((pois: unknown[]) => {
        callbacksRef.current.onMarkersSet?.(pois);
      });
    }
    if (typeof raw.setInfoHtmlSetCallback === 'function' && callbacksRef.current.onInfoHtmlSet) {
      raw.setInfoHtmlSetCallback((poi: unknown, html: HTMLElement) => {
        callbacksRef.current.onInfoHtmlSet?.(poi, html);
      });
    }
    if (typeof raw.setResultsHtmlSetCallback === 'function' && callbacksRef.current.onResultsHtmlSet) {
      raw.setResultsHtmlSetCallback((container: HTMLElement) => {
        callbacksRef.current.onResultsHtmlSet?.(container);
      });
    }

    setState(s => ({ ...s, supported: true, error: null }));

    return () => {
      svcRef.current = null;
      rawRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, locKey, optKey]);

  // 内部：执行搜索 + 请求保护
  const doSearch = useCallback((action: () => void) => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    cancelFnRef.current?.();
    // 先注册回调，再调搜索（SDK 要求回调在 search 之前注册）
    const raw = rawRef.current;
    if (raw && typeof raw.setSearchCompleteCallback === 'function') {
      raw.setSearchCompleteCallback((results: unknown) => {
        if (requestId !== requestIdRef.current) return;
        callbacksRef.current.onSearchComplete?.(results);
        setState({ data: results as T, loading: false, error: null, supported: true });
      });
    }
    try {
      action();
    } catch (e) {
      if (requestId === requestIdRef.current) {
        setState(s => ({ ...s, loading: false, error: e as Error }));
      }
    }
  }, []);

  const search = useCallback((keyword: string | string[], option?: { forceLocal?: boolean }) => {
    if (!rawRef.current) return;
    doSearch(() => {
      if (option?.forceLocal !== undefined) {
        rawRef.current.search?.(keyword, option);
      } else {
        rawRef.current.search?.(keyword);
      }
    });
  }, [doSearch]);

  const searchNearby = useCallback((keyword: string | string[], center: string | Point, radius: number) => {
    if (!rawRef.current) return;
    doSearch(() => {
      let c: unknown = center;
      if (c && (c as any).__brand) {
        c = (c as any).raw;
      } else if (c && typeof c === 'object' && 'lng' in (c as any)) {
        // 纯 { lng, lat } 对象 → SDK Point 实例
        const SDK = (globalThis as any).BMap || (globalThis as any).BMapGL;
        c = new SDK.Point((c as any).lng, (c as any).lat);
      }
      rawRef.current.searchNearby?.(keyword, c, radius);
    });
  }, [doSearch]);

  const searchInBounds = useCallback((keyword: string | string[], bounds: Bounds) => {
    if (!rawRef.current) return;
    doSearch(() => {
      let b: unknown = bounds;
      if (b && (b as any).__brand) {
        b = (b as any).raw;
      } else if (b && typeof b === 'object' && 'sw' in (b as any)) {
        // 纯 { sw: {lng,lat}, ne: {lng,lat} } → SDK Bounds 实例
        const SDK = (globalThis as any).BMap || (globalThis as any).BMapGL;
        const sw = (b as any).sw;
        const ne = (b as any).ne;
        b = new SDK.Bounds(new SDK.Point(sw.lng, sw.lat), new SDK.Point(ne.lng, ne.lat));
      }
      rawRef.current.searchInBounds?.(keyword, b);
    });
  }, [doSearch]);

  const gotoPage = useCallback((page: number) => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      rawRef.current.gotoPage?.(page);
    } catch (e) {
      if (requestId === requestIdRef.current) {
        setState(s => ({ ...s, loading: false, error: e as Error }));
      }
    }
    const raw = rawRef.current;
    if (raw && typeof raw.setSearchCompleteCallback === 'function') {
      raw.setSearchCompleteCallback((results: unknown) => {
        if (requestId !== requestIdRef.current) return;
        callbacksRef.current.onSearchComplete?.(results);
        setState({ data: results as T, loading: false, error: null, supported: true });
      });
    }
  }, []);

  const clearResults = useCallback(() => {
    if (!rawRef.current) return;
    try { rawRef.current.clearResults?.(); } catch { /* noop */ }
    setState(s => ({ ...s, data: undefined, loading: false }));
  }, []);

  const cancel = useCallback(() => {
    requestIdRef.current++;
    cancelFnRef.current?.();
    cancelFnRef.current = null;
    setState(s => ({ ...s, loading: false }));
  }, []);

  return { ...state, search, searchNearby, searchInBounds, gotoPage, clearResults, cancel };
}
