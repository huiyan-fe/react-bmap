/**
 * usePlaceDetail — 地点详情 Hook（手写）。
 * SDK：render(data) / rerender() / setData(data) / dispose()
 * render() 内部需要访问 map.v4aboveExt，构造时必须传 map。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';

export interface PlaceDetailOptions {
  container?: HTMLElement;
  compact?: boolean;
  renderOptions?: unknown;
  map?: unknown;
}

export interface PlaceDetailHookResult {
  data: unknown;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  render: (uid: string) => void;
  rerender: () => void;
  dispose: () => void;
}

export function usePlaceDetail(opts: PlaceDetailOptions = {}): PlaceDetailHookResult {
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);

  const [state, setState] = useState<{ data: unknown; loading: boolean; error: Error | null; supported: boolean }>({
    data: undefined, loading: false, error: null, supported: true,
  });

  const optKey = stableStringify({ compact: opts.compact, ro: opts.renderOptions, container: opts.container, map: opts.map });

  useEffect(() => {
    if (!driver) return;
    const container = opts.container ?? document.createElement('div');
    // 解包 map — 必须是 raw BMapGL.Map 实例
    let rawMap: unknown = undefined;
    if (opts.map) {
      rawMap = (opts.map as any).__brand ? (opts.map as any).raw : opts.map;
    }
    console.log('[usePlaceDetail] rawMap:', rawMap?.constructor?.name, 'has v4aboveExt:', !!(rawMap as any)?.v4aboveExt);

    const searchOpts: Record<string, unknown> = { container };
    if (opts.compact !== undefined) searchOpts.compact = opts.compact;
    if (opts.renderOptions !== undefined) searchOpts.renderOptions = opts.renderOptions;
    if (rawMap) searchOpts.map = rawMap;

    const handle = driver.createPlaceDetail(searchOpts);
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('PlaceDetail', driver.version), supported: false });
      return;
    }
    rawRef.current = (handle as any).raw;

    // 如果 SDK 构造时没设 map，手动设到实例上
    if (rawMap && !rawRef.current._map && !rawRef.current.map) {
      try {
        rawRef.current._map = rawMap;
        rawRef.current.map = rawMap;
        console.log('[usePlaceDetail] set map on instance manually');
      } catch { /* noop */ }
    }

    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current?.dispose?.(); rawRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, optKey]);

  const render = useCallback((uid: string) => {
    if (!rawRef.current) return;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const container = opts.container as HTMLElement | undefined;
      if (container) container.innerHTML = '';
      // render 接受字符串 uid，不是对象
      rawRef.current.render?.(uid);
      setState({ data: { uid }, loading: false, error: null, supported: true });
    } catch (e) {
      console.log('[usePlaceDetail] render error:', e);
      setState(s => ({ ...s, loading: false, error: e as Error }));
    }
  }, [opts.container]);

  const rerender = useCallback(() => { rawRef.current?.rerender?.(); }, []);
  const dispose = useCallback(() => { rawRef.current?.dispose?.(); setState(s => ({ ...s, data: undefined })); }, []);

  return { ...state, render, rerender, dispose };
}
