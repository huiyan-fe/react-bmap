/**
 * useBoundary — 行政区划边界 Hook（手写）。
 * SDK 方法：get(name, callback)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';

export interface BoundaryHookResult {
  data: unknown;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  get: (name: string) => void;
  cancel: () => void;
}

export function useBoundary(): BoundaryHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);

  const [state, setState] = useState<{ data: unknown; loading: boolean; error: Error | null; supported: boolean }>({
    data: undefined, loading: false, error: null, supported: true,
  });

  useEffect(() => {
    if (!driver) return;
    const handle = driver.createBoundary();
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('Boundary', driver.version), supported: false });
      return;
    }
    rawRef.current = (handle as any).raw;
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; };
  }, [driver]);

  const get = useCallback((name: string) => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      rawRef.current.get?.(name, (result: any) => {
        if (requestId !== requestIdRef.current) return;
        setState({ data: result, loading: false, error: null, supported: true });
      });
    } catch (e) {
      if (requestId === requestIdRef.current) {
        setState(s => ({ ...s, loading: false, error: e as Error }));
      }
    }
  }, []);

  const cancel = useCallback(() => {
    requestIdRef.current++;
    setState(s => ({ ...s, loading: false }));
  }, []);

  return { ...state, get, cancel };
}
