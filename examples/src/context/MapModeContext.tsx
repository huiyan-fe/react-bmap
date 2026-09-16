import React, { createContext, useContext, useState, useCallback } from 'react';
import { BMapProvider } from 'react-bmap';
import type { BMapVersion } from 'react-bmap';

export type MapVersion = BMapVersion;

/**
 * demo 用的公开 ak（BMapProvider 示例里也要用同一个，保证 loadKey 一致、复用已加载的 SDK）。
 * 唯一来源：仓库根目录 .env 的 VITE_BMAP_AK（本地可用 .env.local 覆盖）；不再在源码里散写 ak。
 */
export const EXAMPLE_AK = (import.meta as any).env?.VITE_BMAP_AK as string;

const MapModeContext = createContext<{
  version: MapVersion;
  setVersion: (version: MapVersion) => void;
} | null>(null);

export function MapModeProvider({ children }: { children: React.ReactNode }) {
  // 从 URL 参数读取版本，reload 后不丢失
  const [version, setVersionState] = useState<MapVersion>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('v') as MapVersion) || '4.0';
  });

  const setVersion = useCallback((v: MapVersion) => {
    const url = new URL(window.location.href);
    url.searchParams.set('v', v);
    // 改 URL 触发 reload，加载新版本 SDK
    window.location.href = url.toString();
  }, []);

  return (
    <MapModeContext.Provider value={{ version, setVersion }}>
      <BMapProvider
        ak={EXAMPLE_AK}
        version={version}
      >
        {children}
      </BMapProvider>
    </MapModeContext.Provider>
  );
}

export function useMapVersion() {
  const ctx = useContext(MapModeContext);
  return ctx?.version ?? '4.0';
}

export function useSetMapVersion() {
  const ctx = useContext(MapModeContext);
  return ctx?.setVersion ?? (() => {});
}
