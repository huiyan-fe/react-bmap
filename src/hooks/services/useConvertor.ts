/**
 * useConvertor — 坐标转换 Hook（手写）。
 * SDK 方法：translate(points, from?, to?, callback?)
 * 注意：百度 translate 单次上限 100 个点；本 hook 内部自动按 100 分批、串行请求再合并，
 * 对外仍是一次 translate(points) 调用（2.0.3 起）。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { getSDK } from '../../utils/sdk';
import { useServiceTimeout, serviceTimeoutError } from './useServiceTimeout';
import type { Point } from '../../types';
import type { TranslateResults } from '../../types/results';

/** 百度坐标转换接口单次请求上限。 */
const TRANSLATE_MAX_POINTS = 100;

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
  const { arm, clear } = useServiceTimeout();

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
      // 按 100 个点分批（translate 单次上限），串行请求避免同一实例并发回调串扰
      const chunks: Point[][] = [];
      for (let i = 0; i < points.length; i += TRANSLATE_MAX_POINTS) {
        chunks.push(points.slice(i, i + TRANSLATE_MAX_POINTS));
      }
      if (chunks.length === 0) {
        clear();
        setState({ data: { status: 0, points: [] }, loading: false, error: null, supported: true });
        return;
      }
      const mergedPoints: Point[] = [];
      let badStatus: number | undefined;
      let lastResult: any;
      const runChunk = (idx: number) => {
        if (requestId !== requestIdRef.current) return;
        if (idx >= chunks.length) {
          clear();
          // 单批时原样回填 SDK 结果（保留 size() 等）；多批时合并为 { status, points }
          const data = chunks.length === 1 ? lastResult : { status: badStatus ?? 0, points: mergedPoints };
          setState({ data, loading: false, error: null, supported: true });
          return;
        }
        // 每批各自挂一个超时兜底：某批卡住时不至于永远转圈
        arm(() => {
          if (requestId !== requestIdRef.current) return;
          setState(s => ({ ...s, loading: false, error: serviceTimeoutError() }));
        });
        const pts = chunks[idx].map(p => new SDK.Point(p.lng, p.lat));
        const cb = (result: any) => {
          if (requestId !== requestIdRef.current) return;
          lastResult = result;
          if (result && result.status !== 0 && result.status !== undefined) badStatus = result.status;
          if (result?.points) mergedPoints.push(...result.points);
          runChunk(idx + 1);
        };
        rawRef.current.translate?.(pts, from, to, cb);
      };
      runChunk(0);
    } catch (e) {
      clear();
      if (requestId === requestIdRef.current) {
        setState(s => ({ ...s, loading: false, error: e as Error }));
      }
    }
  }, [arm, clear]);

  const cancel = useCallback(() => {
    requestIdRef.current++;
    clear();
    setState(s => ({ ...s, loading: false }));
  }, [clear]);

  return { ...state, translate, cancel };
}
