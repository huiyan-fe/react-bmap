/**
 * useConvertor — 坐标转换 Hook（手写）。
 * SDK 方法：translate(points, from?, to?, callback?)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { getSDK } from '../../utils/sdk';
import type { Point } from '../../types';
import type { TranslateResults } from '../../types/results';

export interface ConvertorHookResult {
  data: TranslateResults | undefined;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  translate: (points: Point[], from?: number, to?: number) => void;
  cancel: () => void;
}

export function useConvertor(): ConvertorHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);

  const [state, setState] = useState<{ data: TranslateResults | undefined; loading: boolean; error: Error | null; supported: boolean }>({
    data: undefined, loading: false, error: null, supported: true,
  });

  useEffect(() => {
    if (!driver) return;
    const handle = driver.createConvertor();
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('Convertor', driver.version), supported: false });
      return;
    }
    rawRef.current = handle.raw;
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; };
  }, [driver]);

  const translate = useCallback((points: Point[], from?: number, to?: number) => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const SDK = getSDK();
      const pts = points.map(p => new SDK.Point(p.lng, p.lat));
      const cb = (result: any) => {
        if (requestId !== requestIdRef.current) return;
        setState({ data: result, loading: false, error: null, supported: true });
      };
      rawRef.current.translate?.(pts, from, to, cb);
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

  return { ...state, translate, cancel };
}
