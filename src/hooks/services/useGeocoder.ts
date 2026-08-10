/**
 * useGeocoder — 地理编码 Hook（手写）。
 * SDK 方法：getPoint(address, cb, city?) / getLocation(point, cb, opts?)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';
import type { Point } from '../../types';
import type { GeocoderResult } from '../../types/results';

export interface GeocoderHookResult {
  data: GeocoderResult | Point | undefined;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  /** 地址转坐标 */
  getPoint: (address: string, city?: string) => void;
  /** 坐标转地址 */
  getLocation: (point: Point, options?: unknown) => void;
  cancel: () => void;
}

export function useGeocoder(): GeocoderHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);

  const [state, setState] = useState<{ data: GeocoderResult | Point | undefined; loading: boolean; error: Error | null; supported: boolean }>({
    data: undefined, loading: false, error: null, supported: true,
  });

  useEffect(() => {
    if (!driver) return;
    const handle = driver.createGeocoder();
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('Geocoder', driver.version), supported: false });
      return;
    }
    rawRef.current = (handle as any).raw;
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; };
  }, [driver]);

  const doAction = useCallback((fn: (raw: any) => void) => {
    if (!rawRef.current) return;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      fn(rawRef.current);
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e as Error }));
    }
  }, []);

  const getPoint = useCallback((address: string, city?: string) => {
    const myRequestId = ++requestIdRef.current;
    doAction((raw) => {
      const cb = (result: any) => {
        if (myRequestId !== requestIdRef.current) return;
        setState({ data: result, loading: false, error: null, supported: true });
      };
      if (city !== undefined) raw.getPoint?.(address, cb, city);
      else raw.getPoint?.(address, cb);
    });
  }, [doAction]);

  const getLocation = useCallback((point: Point, options?: unknown) => {
    const myRequestId = ++requestIdRef.current;
    doAction((raw) => {
      const SDK = (globalThis as any).BMap;
      const pt = new SDK.Point(point.lng, point.lat);
      const cb = (result: any) => {
        if (myRequestId !== requestIdRef.current) return;
        setState({ data: result, loading: false, error: null, supported: true });
      };
      if (options !== undefined) raw.getLocation?.(pt, cb, options);
      else raw.getLocation?.(pt, cb);
    });
  }, [doAction]);

  const cancel = useCallback(() => {
    requestIdRef.current++;
    setState(s => ({ ...s, loading: false }));
  }, []);

  return { ...state, getPoint, getLocation, cancel };
}
