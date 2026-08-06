/**
 * usePanoramaService — 全景服务 Hook（手写）。
 * SDK 方法：getPanoramaById(id, callback) / getPanoramaByLocation(point, radius, callback)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import type { Point } from '../../types';

export interface PanoramaServiceHookResult {
  data: unknown;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  getPanoramaById: (id: string) => void;
  getPanoramaByLocation: (point: Point, radius: number) => void;
  cancel: () => void;
}

export function usePanoramaService(): PanoramaServiceHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);

  const [state, setState] = useState<{ data: unknown; loading: boolean; error: Error | null; supported: boolean }>({
    data: undefined, loading: false, error: null, supported: true,
  });

  useEffect(() => {
    if (!driver) return;
    const handle = driver.createPanoramaService();
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('PanoramaService', driver.version), supported: false });
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

  const getPanoramaById = useCallback((id: string) => {
    const myRequestId = ++requestIdRef.current;
    doAction((raw) => {
      raw.getPanoramaById?.(id, (data: any) => {
        if (myRequestId !== requestIdRef.current) return;
        setState({ data, loading: false, error: null, supported: true });
      });
    });
  }, [doAction]);

  const getPanoramaByLocation = useCallback((point: Point, radius: number) => {
    const myRequestId = ++requestIdRef.current;
    doAction((raw) => {
      const SDK = (globalThis as any).BMap;
      const pt = new SDK.Point(point.lng, point.lat);
      raw.getPanoramaByLocation?.(pt, radius, (data: any) => {
        if (myRequestId !== requestIdRef.current) return;
        setState({ data, loading: false, error: null, supported: true });
      });
    });
  }, [doAction]);

  const cancel = useCallback(() => {
    requestIdRef.current++;
    setState(s => ({ ...s, loading: false }));
  }, []);

  return { ...state, getPanoramaById, getPanoramaByLocation, cancel };
}
