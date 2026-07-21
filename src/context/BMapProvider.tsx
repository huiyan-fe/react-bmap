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
 *  - '3.0' / '4.0' → '2d'（命名空间 BMap）
 *  - 'gl'           → 'gl'（命名空间 BMapGL）
 */
function versionToApiType(version: string): MapApiType {
  return version === 'gl' ? 'gl' : '2d';
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
      .then(() => {
        if (cancelled) return;
        setLoadedVersion(version);
        setStatus('loaded');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
      });

    return () => {
      cancelled = true;
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
