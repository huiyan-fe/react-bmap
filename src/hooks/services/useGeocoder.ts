/**
 * useGeocoder — 地理编码 Hook（手写）。
 * SDK 方法：getPoint(address, cb, city?) / getLocation(point, cb, opts?)
 *
 * 单发 vs 批量：
 *   getPoint/getLocation 是「单发」——结果落到单值 data，同一实例上连发多次只保留最后一个
 *   （requestId 防竞态），适合搜索框这类「只关心最新一次」的场景。
 *   getPoints/getLocations 是「并发批量」——直接返回 Promise（不经过 data/loading/error），
 *   内部对每个地址/坐标各发一次请求、Promise.all 汇总，结果按入参顺序返回、失败位为 null。
 *   底层 Geocoder 实例并发安全（每次调用各自回调），一个实例即可，无需建多个。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';
import { getSDK } from '../../utils/sdk';
import { useServiceTimeout, serviceTimeoutError, SERVICE_TIMEOUT_MS } from './useServiceTimeout';
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
  /** 并发批量地址转坐标；按入参顺序返回，失败位为 null。直接返回 Promise，不经过 data/loading/error */
  getPoints: (addresses: string[], city?: string) => Promise<(Point | null)[]>;
  /** 并发批量坐标转地址；按入参顺序返回，失败位为 null。直接返回 Promise，不经过 data/loading/error */
  getLocations: (points: Point[], options?: unknown) => Promise<(GeocoderResult | null)[]>;
  cancel: () => void;
}

export function useGeocoder(): GeocoderHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);
  const { arm, clear } = useServiceTimeout();

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
    rawRef.current = handle.raw;
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; };
  }, [driver]);

  const doAction = useCallback((fn: (raw: any) => void) => {
    if (!rawRef.current) return;
    const myRequestId = requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    // 兜底：SDK 在鉴权失败等场景下可能不触发回调，超时后把 loading 收回并抛错
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

  const getPoint = useCallback((address: string, city?: string) => {
    const myRequestId = ++requestIdRef.current;
    doAction((raw) => {
      const cb = (result: any) => {
        if (myRequestId !== requestIdRef.current) return;
        clear();
        setState({ data: result, loading: false, error: null, supported: true });
      };
      if (city !== undefined) raw.getPoint?.(address, cb, city);
      else raw.getPoint?.(address, cb);
    });
  }, [doAction, clear]);

  const getLocation = useCallback((point: Point, options?: unknown) => {
    const myRequestId = ++requestIdRef.current;
    doAction((raw) => {
      const SDK = getSDK();
      const pt = new SDK.Point(point.lng, point.lat);
      const cb = (result: any) => {
        if (myRequestId !== requestIdRef.current) return;
        clear();
        setState({ data: result, loading: false, error: null, supported: true });
      };
      if (options !== undefined) raw.getLocation?.(pt, cb, options);
      else raw.getLocation?.(pt, cb);
    });
  }, [doAction, clear]);

  const cancel = useCallback(() => {
    requestIdRef.current++;
    clear();
    setState(s => ({ ...s, loading: false }));
  }, [clear]);

  // 并发批量：每项各发一次请求、各自回调 + 超时兜底，Promise.all 保序汇总；
  // 不动 data/loading/error（单值状态表达不了 N 个结果），失败/超时位为 null
  const getPoints = useCallback((addresses: string[], city?: string): Promise<(Point | null)[]> => {
    return Promise.all(addresses.map(address => new Promise<Point | null>((resolve) => {
      const raw = rawRef.current;
      if (!raw) return resolve(null);
      let done = false;
      const timer = setTimeout(() => { if (!done) { done = true; resolve(null); } }, SERVICE_TIMEOUT_MS);
      const cb = (result: Point | null) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(result ?? null);
      };
      if (city !== undefined) raw.getPoint?.(address, cb, city);
      else raw.getPoint?.(address, cb);
    })));
  }, []);

  const getLocations = useCallback((points: Point[], options?: unknown): Promise<(GeocoderResult | null)[]> => {
    return Promise.all(points.map(point => new Promise<GeocoderResult | null>((resolve) => {
      const raw = rawRef.current;
      if (!raw) return resolve(null);
      const SDK = getSDK();
      const pt = new SDK.Point(point.lng, point.lat);
      let done = false;
      const timer = setTimeout(() => { if (!done) { done = true; resolve(null); } }, SERVICE_TIMEOUT_MS);
      const cb = (result: GeocoderResult | null) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(result ?? null);
      };
      if (options !== undefined) raw.getLocation?.(pt, cb, options);
      else raw.getLocation?.(pt, cb);
    })));
  }, []);

  return { ...state, getPoint, getLocation, getPoints, getLocations, cancel };
}
