/**
 * useAutocomplete — 输入提示 Hook（手写）。
 * SDK：search(keywords) / show / hide / setTypes / setLocation / getResults / setInputValue / dispose
 * 回调：onSearchComplete / onConfirm / onHighlight
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';
import { unwrapHandle } from '../../utils/handle';
import { useRenderMap } from './useRenderMap';

export interface AutocompleteOptions {
  location?: unknown;
  types?: string[];
  input?: string | HTMLElement;
  /** renderOptions.map 非必传：`<Map>` 内部自动取当前地图，外层需显式传已就绪 handle；见 `useMap`/`useMapReady`。 */
  renderOptions?: { map?: unknown; panel?: string | HTMLElement };
  onSearchComplete?: (results: unknown) => void;
  /** 用户选中某条建议项时触发（对应 SDK 构造项 onConfirm / 原生 onconfirm 事件） */
  onConfirm?: (item: unknown) => void;
  /** 高亮项变化时触发（current, previous）（对应 SDK 构造项 onHighlight / 原生 onhighlight 事件） */
  onHighlight?: (current: unknown, previous?: unknown) => void;
}

export interface AutocompleteHookResult {
  data: unknown;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  search: (keywords: string) => void;
  show: () => void;
  hide: () => void;
  getResults: () => unknown;
  cancel: () => void;
}

export function useAutocomplete(opts: AutocompleteOptions = {}): AutocompleteHookResult {
  const { driver } = useBMapContext();
  const renderMap = useRenderMap(opts.renderOptions?.map);
  const rawRef = useRef<any>(null);
  const requestIdRef = useRef(0);
  const callbacksRef = useRef(opts);
  callbacksRef.current = opts;
  const cbRef = useRef<((results: unknown) => void) | null>(null);

  const [state, setState] = useState<{ data: unknown; loading: boolean; error: Error | null; supported: boolean }>({
    data: undefined, loading: false, error: null, supported: true,
  });

  const locKey = stableStringify(opts.location);
  const optKey = stableStringify({ types: opts.types, ro: opts.renderOptions, input: opts.input });

  useEffect(() => {
    if (!driver) return;
    const searchOpts: Record<string, unknown> = {};
    // location 缺省时回退到当前 <Map>/renderOptions.map（与原生 new BMap.Autocomplete({location: map}) 一致）
    if (opts.location !== undefined) {
      searchOpts.location = unwrapHandle(opts.location);
    } else if (renderMap) {
      searchOpts.location = unwrapHandle(renderMap);
    }
    if (opts.types !== undefined) searchOpts.types = opts.types;
    if (opts.input !== undefined) searchOpts.input = opts.input;
    if (opts.renderOptions || renderMap) {
      const ro: Record<string, unknown> = {};
      if (opts.renderOptions) Object.assign(ro, opts.renderOptions);
      if (renderMap) ro.map = unwrapHandle(renderMap);
      searchOpts.renderOptions = ro;
    }
    searchOpts.onSearchComplete = (results: unknown) => { cbRef.current?.(results); callbacksRef.current.onSearchComplete?.(results); };
    // onConfirm / onHighlight 走 4.0 推荐的构造项（addEventListener('onconfirm') 已废弃）；
    // 用 callbacksRef 转发最新 handler，换回调无需重建实例。
    searchOpts.onConfirm = (e: unknown) => {
      // 归一化确认事件：构造项 onConfirm 传的是选中项本身（含 value），
      // 而 addEventListener('onconfirm') 传的是 e.item.value。统一补齐成
      // { ...e, value, item: { value } }，让上层始终可用 e.item.value / e.value。
      const ev = (e && typeof e === 'object' ? e : {}) as Record<string, unknown>;
      const value = (ev.item as { value?: unknown } | undefined)?.value ?? ev.value ?? e;
      callbacksRef.current.onConfirm?.({ ...ev, value, item: ev.item ?? { value } });
    };
    searchOpts.onHighlight = (current: unknown, previous?: unknown) => callbacksRef.current.onHighlight?.(current, previous);

    const handle = driver.createAutocomplete(searchOpts);
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('Autocomplete', driver.version), supported: false });
      return;
    }
    rawRef.current = handle.raw;
    // 设置默认回调 — 输入框输入字符时自动触发 onSearchComplete
    cbRef.current = (results: unknown) => {
      setState({ data: results, loading: false, error: null, supported: true });
    };
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; cbRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, locKey, optKey, renderMap]);

  const search = useCallback((keywords: string) => {
    if (!rawRef.current) return;
    const requestId = ++requestIdRef.current;
    setState(s => ({ ...s, loading: true, error: null }));
    const raw = rawRef.current;
    cbRef.current = (results: unknown) => {
      if (requestId !== requestIdRef.current) return;
      setState({ data: results, loading: false, error: null, supported: true });
    };
    if (typeof raw.setSearchCompleteCallback === 'function') raw.setSearchCompleteCallback(cbRef.current);
    try { raw.search?.(keywords); }
    catch (e) { if (requestId === requestIdRef.current) setState(s => ({ ...s, loading: false, error: e as Error })); }
  }, []);

  const show = useCallback(() => { rawRef.current?.show?.(); }, []);
  const hide = useCallback(() => { rawRef.current?.hide?.(); }, []);
  const getResults = useCallback(() => rawRef.current?.getResults?.(), []);
  const cancel = useCallback(() => { requestIdRef.current++; setState(s => ({ ...s, loading: false })); }, []);

  return { ...state, search, show, hide, getResults, cancel };
}
