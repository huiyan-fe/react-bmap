/**
 * useBoundary — 行政区划边界 Hook（手写）。
 * SDK 方法：get(name, callback)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { useServiceTimeout, serviceTimeoutError } from './useServiceTimeout';
import type { BoundaryResult } from '../../types/results';

export interface BoundaryHookResult {
  data: BoundaryResult | undefined;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  get: (name: string) => void;
  /** 把 SDK 返回的边界字符串（"lng,lat;lng,lat;…"）解析成点集，对应 SDK parsebdStr，2.0.4 新增 */
  parsebdStr: (boundaryStr: string) => unknown;
  cancel: () => void;
}

export function useBoundary(): BoundaryHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);
  const { arm, clear } = useServiceTimeout();

  const [state, setState] = useState<{ data: BoundaryResult | undefined; loading: boolean; error: Error | null; supported: boolean }>({
    data: undefined, loading: false, error: null, supported: true,
  });

  useEffect(() => {
    if (!driver) return;
    const handle = driver.createBoundary();
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('Boundary', driver.version), supported: false });
      return;
    }
    rawRef.current = handle.raw;
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; };
  }, [driver]);

  const get = useCallback((name: string) => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    arm(() => {
      if (requestId !== requestIdRef.current) return;
      setState(s => ({ ...s, loading: false, error: serviceTimeoutError() }));
    });
    try {
      rawRef.current.get?.(name, (result: any) => {
        if (requestId !== requestIdRef.current) return;
        clear();
        setState({ data: result, loading: false, error: null, supported: true });
      });
    } catch (e) {
      clear();
      if (requestId === requestIdRef.current) {
        setState(s => ({ ...s, loading: false, error: e as Error }));
      }
    }
  }, [arm, clear]);

  const parsebdStr = useCallback((boundaryStr: string): unknown => rawRef.current?.parsebdStr?.(boundaryStr), []);

  const cancel = useCallback(() => {
    requestIdRef.current++;
    clear();
    setState(s => ({ ...s, loading: false }));
  }, [clear]);

  return { ...state, get, parsebdStr, cancel };
}
