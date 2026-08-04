/**
 * useGeolocation — 浏览器定位 Hook（手写）。
 * SDK 方法：getCurrentPosition(callback, opts?) / getStatus() / enableSDKLocation() / disableSDKLocation()
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';

export interface GeolocationHookResult {
  data: unknown;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  getCurrentPosition: (options?: unknown) => void;
  getStatus: () => number | undefined;
  enableSDKLocation: () => void;
  disableSDKLocation: () => void;
  cancel: () => void;
}

export function useGeolocation(opts?: { enableSDKLocation?: boolean }): GeolocationHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);
  const optKey = JSON.stringify(opts ?? {});

  const [state, setState] = useState<{ data: unknown; loading: boolean; error: Error | null; supported: boolean }>({
    data: undefined, loading: false, error: null, supported: true,
  });

  useEffect(() => {
    if (!driver) return;
    const handle = driver.createGeolocation(opts);
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('Geolocation', driver.version), supported: false });
      return;
    }
    rawRef.current = (handle as any).raw;
    if (opts?.enableSDKLocation) rawRef.current?.enableSDKLocation?.();
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, optKey]);

  const getCurrentPosition = useCallback((options?: unknown) => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const cb = (result: any) => {
        if (requestId !== requestIdRef.current) return;
        setState({ data: result, loading: false, error: null, supported: true });
      };
      if (options !== undefined) rawRef.current.getCurrentPosition?.(cb, options);
      else rawRef.current.getCurrentPosition?.(cb);
    } catch (e) {
      if (requestId === requestIdRef.current) {
        setState(s => ({ ...s, loading: false, error: e as Error }));
      }
    }
  }, []);

  const getStatus = useCallback(() => {
    return rawRef.current?.getStatus?.();
  }, []);

  const enableSDKLocation = useCallback(() => {
    rawRef.current?.enableSDKLocation?.();
  }, []);

  const disableSDKLocation = useCallback(() => {
    rawRef.current?.disableSDKLocation?.();
  }, []);

  const cancel = useCallback(() => {
    requestIdRef.current++;
    setState(s => ({ ...s, loading: false }));
  }, []);

  return { ...state, getCurrentPosition, getStatus, enableSDKLocation, disableSDKLocation, cancel };
}
