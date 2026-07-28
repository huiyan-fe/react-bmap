import { useCallback, useEffect, useRef, useState } from 'react';
import { useMapContext } from '../../context/MapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';
import type { Point } from '../../types';

export interface UseLocalSearchParams {
  location?: string | Point;
  renderOptions?: unknown;
  /** 自动重跑开关 */
  enabled?: boolean;
}

export interface UseLocalSearchResult<T = unknown> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  run: (keyword: string | string[]) => void;
  cancel: () => void;
}

/**
 * useLocalSearch — 服务 Hook 示例（DESIGN.md §6.3）。
 *
 * - service 在 effect 中创建，render 阶段纯净。
 * - requestIdRef 防过期请求覆盖。
 * - 不支持时 supported=false，error=UnsupportedCapabilityError（生产/开发一致）。
 * - 卸载后 setState 由 React 吞掉。
 */
export function useLocalSearch<T = unknown>(params: UseLocalSearchParams = {}): UseLocalSearchResult<T> {
  const { map, driver } = useMapContext();
  const { location, renderOptions, enabled = true } = params;

  const svcRef = useRef<ReturnType<typeof driver.createLocalSearch> | null>(null);
  const requestIdRef = useRef(0);
  const cancelFnRef = useRef<(() => void) | null>(null);

  const [state, setState] = useState<{
    data: T | undefined; loading: boolean; error: Error | null; supported: boolean;
  }>({ data: undefined, loading: false, error: null, supported: true });

  // service 在 effect 中创建
  useEffect(() => {
    if (!driver) return;
    const loc = location ?? map;
    const svc = driver.createLocalSearch(loc, renderOptions);
    svcRef.current = svc;

    if (svc.isNull) {
      setState({
        data: undefined,
        loading: false,
        error: new UnsupportedCapabilityError('localSearch', driver.version),
        supported: false,
      });
      return;
    }
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { svcRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, location, stableStringify(renderOptions)]);

  const run = useCallback((keyword: string | string[]) => {
    if (!svcRef.current || svcRef.current.isNull || !enabled) return;

    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));

    // 取消上一次
    cancelFnRef.current?.();
    cancelFnRef.current = driver!.searchService(svcRef.current, keyword, {
      onSuccess: (data) => {
        if (requestId !== requestIdRef.current) return;
        setState({ data: data as T, loading: false, error: null, supported: true });
      },
      onError: (err) => {
        if (requestId !== requestIdRef.current) return;
        setState(s => ({ ...s, loading: false, error: err }));
      },
    });
  }, [driver, enabled]);

  const cancel = useCallback(() => {
    requestIdRef.current++;
    cancelFnRef.current?.();
    cancelFnRef.current = null;
    setState(s => ({ ...s, loading: false }));
  }, []);

  return { ...state, run, cancel };
}
