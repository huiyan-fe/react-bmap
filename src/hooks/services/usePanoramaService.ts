/**
 * usePanoramaService — 全景服务 Hook（手写）。
 * SDK 方法：getPanoramaById(id, cb) / getPanoramaByLocation(point, radius?, cb) / getPanoramaByPOIId(poiId, cb)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { getSDK } from '../../utils/sdk';
import { useServiceTimeout, serviceTimeoutError } from './useServiceTimeout';
import type { Point } from '../../types';

export interface PanoramaServiceHookResult {
  data: unknown;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  getPanoramaById: (id: string) => void;
  /** radius 可选，缺省走 SDK 默认（约 50 米） */
  getPanoramaByLocation: (point: Point, radius?: number) => void;
  /** 按 POI id 查询全景（部分版本 SDK 支持；运行时不支持时置 error） */
  getPanoramaByPOIId: (poiId: string) => void;
  cancel: () => void;
}

export function usePanoramaService(): PanoramaServiceHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);
  const { arm, clear } = useServiceTimeout();

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
    rawRef.current = handle.raw;
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; };
  }, [driver]);

  const doAction = useCallback((fn: (raw: any) => void) => {
    if (!rawRef.current) return;
    const myRequestId = requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    arm(() => {
      if (myRequestId !== requestIdRef.current) return;
      setState(s => ({ ...s, loading: false, error: serviceTimeoutError() }));
    });
    try {
      fn(rawRef.current);
    } catch (e) {
      clear();
      setState(s => ({ ...s, loading: false, error: e as Error }));
    }
  }, [arm, clear]);

  const getPanoramaById = useCallback((id: string) => {
    const myRequestId = ++requestIdRef.current;
    doAction((raw) => {
      raw.getPanoramaById?.(id, (data: any) => {
        if (myRequestId !== requestIdRef.current) return;
        clear();
        setState({ data, loading: false, error: null, supported: true });
      });
    });
  }, [doAction, clear]);

  const getPanoramaByLocation = useCallback((point: Point, radius?: number) => {
    const myRequestId = ++requestIdRef.current;
    doAction((raw) => {
      const SDK = getSDK();
      const pt = new SDK.Point(point.lng, point.lat);
      const cb = (data: any) => {
        if (myRequestId !== requestIdRef.current) return;
        clear();
        setState({ data, loading: false, error: null, supported: true });
      };
      // radius 缺省时用二参重载，交给 SDK 默认半径
      if (typeof radius === 'number') raw.getPanoramaByLocation?.(pt, radius, cb);
      else raw.getPanoramaByLocation?.(pt, cb);
    });
  }, [doAction, clear]);

  const getPanoramaByPOIId = useCallback((poiId: string) => {
    const myRequestId = ++requestIdRef.current;
    doAction((raw) => {
      if (typeof raw.getPanoramaByPOIId !== 'function') {
        clear();
        setState(s => ({ ...s, loading: false, error: new Error('getPanoramaByPOIId not supported by current SDK') }));
        return;
      }
      raw.getPanoramaByPOIId(poiId, (data: any) => {
        if (myRequestId !== requestIdRef.current) return;
        clear();
        setState({ data, loading: false, error: null, supported: true });
      });
    });
  }, [doAction, clear]);

  const cancel = useCallback(() => {
    requestIdRef.current++;
    clear();
    setState(s => ({ ...s, loading: false }));
  }, [clear]);

  return { ...state, getPanoramaById, getPanoramaByLocation, getPanoramaByPOIId, cancel };
}
