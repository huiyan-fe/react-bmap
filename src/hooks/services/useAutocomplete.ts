/**
 * useAutocomplete — 输入提示 Hook（手写）。
 * SDK：search(keywords) / show / hide / setTypes / setLocation / getResults / setInputValue / dispose
 * 回调：onSearchComplete / onConfirm / onHighlight
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { UnsupportedCapabilityError } from '../../drivers/unsupported';
import { stableStringify } from '../../utils/stableStringify';

export interface AutocompleteOptions {
  location?: unknown;
  types?: string[];
  input?: string | HTMLElement;
  renderOptions?: { map?: unknown; panel?: string | HTMLElement };
  onSearchComplete?: (results: unknown) => void;
  onConfirm?: (item: unknown) => void;
  onHighlight?: (item: unknown) => void;
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
    if (opts.location !== undefined) {
      let loc: unknown = opts.location;
      if (loc && (loc as any).__brand) loc = (loc as any).raw;
      searchOpts.location = loc;
    }
    if (opts.types !== undefined) searchOpts.types = opts.types;
    if (opts.input !== undefined) searchOpts.input = opts.input;
    if (opts.renderOptions) {
      const ro: Record<string, unknown> = {};
      Object.assign(ro, opts.renderOptions);
      if (opts.renderOptions.map && (opts.renderOptions.map as any).__brand) ro.map = (opts.renderOptions.map as any).raw;
      searchOpts.renderOptions = ro;
    }
    searchOpts.onSearchComplete = (results: unknown) => { cbRef.current?.(results); callbacksRef.current.onSearchComplete?.(results); };

    const handle = driver.createAutocomplete(searchOpts);
    if (handle.isNull) {
      setState({ data: undefined, loading: false, error: new UnsupportedCapabilityError('Autocomplete', driver.version), supported: false });
      return;
    }
    rawRef.current = (handle as any).raw;
    // 设置默认回调 — 输入框输入字符时自动触发 onSearchComplete
    cbRef.current = (results: unknown) => {
      setState({ data: results, loading: false, error: null, supported: true });
    };
    setState(s => ({ ...s, supported: true, error: null }));
    return () => { rawRef.current = null; cbRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, locKey, optKey]);

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
