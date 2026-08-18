/**
 * useLocalCity — 城市定位 Hook（手写）。
 * SDK 方法：get(callback)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import type { LocalCityResult } from '../../types/results';

export interface LocalCityHookResult {
  data: LocalCityResult | undefined;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  get: () => void;
  cancel: () => void;
}

export function useLocalCity(): LocalCityHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);

  const [state, setState] = useState<{ data: LocalCityResult | undefined; loading: boolean; error: Error | null; supported: boolean }>({
    data: undefined, loading: false, error: null, supported: true,
  });

  useEffect(() => {
    if (!driver) return;
    const handle = driver.createLocalCity();
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('LocalCity', driver.version), supported: false });
      return;
    }
    rawRef.current = handle.raw;
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; };
  }, [driver]);

  const get = useCallback(() => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      rawRef.current.get?.((result: any) => {
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
