/**
 * usePlaceDetail — 地点详情 Hook（手写）。
 * SDK：render(uid) / rerender() / setData(data) / dispose()
 * render() 是异步的（SDK 内部发请求获取详情），loading 在 render 后保持 true。
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

  const optKey = stableStringify({ compact: opts.compact, ro: opts.renderOptions, container: opts.container });

  useEffect(() => {
    if (!driver) return;
    const container = opts.container ?? document.createElement('div');

    const searchOpts: Record<string, unknown> = { container };
    if (opts.compact !== undefined) searchOpts.compact = opts.compact;
    if (opts.renderOptions !== undefined) searchOpts.renderOptions = opts.renderOptions;

    const handle = driver.createPlaceDetail(searchOpts);
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('PlaceDetail', driver.version), supported: false });
      return;
    }
    rawRef.current = (handle as any).raw;

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
      // render 接受字符串 uid，SDK 内部异步请求详情数据
      rawRef.current.render?.(uid);
      // SDK 异步渲染，延迟清除 loading
      setTimeout(() => setState(s => ({ ...s, data: { uid }, loading: false })), 500);
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e as Error }));
    }
  }, [opts.container]);

  const rerender = useCallback(() => { rawRef.current?.rerender?.(); }, []);
  const dispose = useCallback(() => { rawRef.current?.dispose?.(); setState(s => ({ ...s, data: undefined })); }, []);

  return { ...state, render, rerender, dispose };
}
