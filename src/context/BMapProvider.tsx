import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as BMapLoader from '@baidumap/jsapi-loader';
import type {
  BMapProviderProps,
  BMapLoaderContextValue,
  MapApiType,
} from '../types';

const BMapLoaderContext = createContext<BMapLoaderContextValue | null>(null);

/**
 * version → apiType 映射：
 *  - '3.0' / '4.0' → 'default'（命名空间 BMap）
 *  - 'gl'           → 'gl'（命名空间 BMapGL）
 */
function versionToApiType(version: string): MapApiType {
  return version === 'gl' ? 'gl' : 'default';
}

/**
 * 顶层 BMapProvider：通过 @baidumap/jsapi-loader 加载百度地图 JSAPI，
 * ak / version / serviceHost 等通过 props 提供，无需在 HTML 中引入 script。
 *
 * 注意：@baidumap/jsapi-loader 同一页面仅支持加载一个 version，
 * 当 version 变化时会自动 reset 并重新加载。
 */
export const BMapProvider: React.FC<BMapProviderProps> = (props) => {
  const {
    ak,
    version,
    serviceHost,
    protocol = 'https',
    timeout,
    globalConfig,
    fallback,
    errorFallback,
    children,
  } = props;

  const [status, setStatus] = useState<BMapLoaderContextValue['status']>(
    'loading'
  );
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loadedVersion, setLoadedVersion] = useState<string>(version);

  useEffect(() => {
    let cancelled = false;
    let watchdog: number | undefined;
    const targetNs = version === 'gl' ? 'BMapGL' : 'BMap';

    // 注意：BMap JSAPI 的 bootstrap 脚本会先执行 `window.BMap = {}` 占位，
    // 然后异步加载 getscript 才真正填充 BMap.Map / BMapGL.Map 等构造器。
    // 仅检测命名空间存在会过早触发，导致后续 new BMap.Map() 报
    // "B.Map is not a constructor"。因此必须检测 Map 构造器可用。
    const hasGlobal = () => {
      if (typeof window === 'undefined') return false;
      const ns = (window as any)[targetNs];
      return !!(ns && typeof ns.Map === 'function');
    };

    // 统一的"加载完成"出口：幂等，防止 Promise 与 watchdog 重复触发
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      if (watchdog !== undefined) window.clearInterval(watchdog);
      setLoadedVersion(version);
      setStatus('loaded');
    };

    setStatus('loading');
    setError(undefined);

    // version 变化时重置 loader 内部状态，否则会因"不允许混用版本"而 reject
    if (BMapLoader.getStatus() !== 'notload') {
      BMapLoader.reset();
    }

    BMapLoader.load({
      ak,
      version,
      serviceHost,
      protocol,
      timeout,
      globalConfig,
    })
      .then(finish)
      .catch((err: unknown) => {
        if (cancelled) return;
        // loader 可能因内部状态竞态而 reject，但脚本实际已加载成功 ——
        // 只要全局对象可用就按成功处理
        if (hasGlobal()) {
          finish();
          return;
        }
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
      });

    // 看门狗：loader 的 Promise 在 reset/Strict Mode 等 race 下可能既不
    // resolve 也不 reject（JSONP 回调被孤立），但 JSAPI 脚本仍会挂到
    // window 上。一旦检测到目标命名空间就立即转 loaded，避免永久 fallback。
    watchdog = window.setInterval(() => {
      if (hasGlobal()) finish();
    }, 200);

    return () => {
      cancelled = true;
      if (watchdog !== undefined) window.clearInterval(watchdog);
    };
  }, [
    ak,
    version,
    serviceHost,
    protocol,
    timeout,
    // globalConfig 为对象，序列化后作为依赖
    JSON.stringify(globalConfig),
  ]);

  const apiType = versionToApiType(loadedVersion);

  const contextValue = useMemo<BMapLoaderContextValue>(
    () => ({
      api:
        status === 'loaded'
          ? apiType === 'gl'
            ? (window as any).BMapGL
            : (window as any).BMap
          : undefined,
      apiType,
      version: loadedVersion as BMapLoaderContextValue['version'],
      status,
      error,
    }),
    [apiType, loadedVersion, status, error]
  );

  if (status === 'loading') {
    return <>{fallback ?? null}</>;
  }

  if (status === 'error') {
    return <>{errorFallback ?? null}</>;
  }

  return (
    <BMapLoaderContext.Provider value={contextValue}>
      {children}
    </BMapLoaderContext.Provider>
  );
};

/**
 * 读取 BMapProvider 提供的加载器上下文。
 * 未包裹在 BMapProvider 内时返回 null（用于向后兼容 window 全局加载）。
 */
export function useBMapLoader(): BMapLoaderContextValue | null {
  return useContext(BMapLoaderContext);
}

export { BMapLoaderContext };
