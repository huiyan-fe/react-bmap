import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  BMapVersion,
  LoadKeyComponents,
  UnsupportedBehavior,
} from '../types';
import type { BMapContextValue } from '../context/BMapContext';
import { BMapContext } from '../context/BMapContext';
import { createDriver } from '../drivers/createDriver';
import { loadJSAPI } from '../loader';
import { stableStringify } from '../utils/stableStringify';

export interface BMapProviderProps {
  ak: string;
  version?: BMapVersion;
  protocol?: 'http' | 'https';
  serviceHost?: string;
  language?: string;
  plugins?: string[];
  timeout?: number;
  globalConfig?: Record<string, unknown>;
  unsupportedBehavior?: UnsupportedBehavior;
  onError?: (err: Error) => void;
  onLoadConflict?: (current: LoadKeyComponents, requested: LoadKeyComponents) => void;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * 加载 JSAPI 并创建 driver，把 driver 写入 Context。
 *
 * 设计要点（DESIGN.md §4）：
 * - loadKey 含 version/ak/serviceHost/language/plugins，去重缓存。
 * - generation token 防超时后到达的脚本覆盖。
 * - SSR：window 访问全 guard，status 保持 loading。
 * - 不修改 SDK 原型。
 */
export function BMapProvider({
  ak,
  version = '4.0',
  protocol,
  serviceHost,
  language,
  plugins,
  timeout,
  globalConfig,
  unsupportedBehavior = 'warn',
  onError,
  onLoadConflict,
  fallback = null,
  errorFallback = null,
  children,
}: BMapProviderProps) {
  const [state, setState] = useState<BMapContextValue>({
    status: 'loading',
    driver: null,
    version,
    error: null,
  });

  const generationRef = useRef(0);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  // onLoadConflict 用 ref 持有，避免内联函数进依赖数组导致 driver 反复重建
  const onLoadConflictRef = useRef(onLoadConflict);
  onLoadConflictRef.current = onLoadConflict;

  const components: LoadKeyComponents = useMemo(
    () => ({ version, ak, serviceHost, language, plugins }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, ak, serviceHost, language, (plugins ?? []).join('|')],
  );

  // globalConfig 是内容型配置：按值（而非引用）决定是否需要重新加载，
  // 避免用户传内联对象 globalConfig={{...}} 时每次渲染都重建 driver。
  const globalConfigKey = stableStringify(globalConfig);

  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR

    let cancelled = false;
    const my = ++generationRef.current;

    loadJSAPI(components, {
      protocol,
      timeout,
      globalConfig,
      onLoadConflict: (current, requested) => onLoadConflictRef.current?.(current, requested),
    })
      .then(({ rawSDK, version: real }) => {
        if (cancelled || my !== generationRef.current) return;
        const driver = createDriver(real, rawSDK, { unsupportedBehavior });
        setState({ status: 'ready', driver, version: real, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled || my !== generationRef.current) return;
        const error = err instanceof Error ? err : new Error(String(err));
        setState(s => ({ ...s, status: 'error', error }));
        if (onErrorRef.current) {
          onErrorRef.current(error);
        } else if (typeof console !== 'undefined') {
          // 兜底日志：加载失败时下方会渲染 errorFallback（默认 null），整棵子树消失。
          // 用户没传 onError 时若连日志都没有，看到的就只是白屏，最常见的 ak / 白名单
          // 问题无从排查。这里不走 debugWarn：production 也必须能看到。
          console.error(
            '[react-bmap] 地图脚本加载失败，<BMapProvider> 的子树不会渲染。' +
            '请检查 ak 是否有效、是否配置了域名白名单、网络能否访问百度地图服务。' +
            '可传入 onError 自行处理该错误，或用 errorFallback 指定降级 UI。',
            error,
          );
        }
      });

    return () => {
      cancelled = true;
      generationRef.current++; // 让旧 promise 失效
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, protocol, timeout, globalConfigKey, unsupportedBehavior]);

  if (state.status === 'loading') return <>{fallback}</>;
  if (state.status === 'error') return <>{errorFallback}</>;

  return <BMapContext.Provider value={state}>{children}</BMapContext.Provider>;
}
