import React, { createContext, useContext, useState, useCallback } from 'react';
import { BMapProvider } from 'react-bmap';
import type { BMapVersion } from 'react-bmap';

export type MapVersion = BMapVersion; // '3.0' | 'gl' | '4.0'

const MapModeContext = createContext<{
  version: MapVersion;
  setVersion: (version: MapVersion) => void;
} | null>(null);

/**
 * 暴露 3.0 / gl / 4.0 版本切换，并驱动 BMapProvider 的 version
 * （@baidumap/jsapi-loader 同一页面仅支持一个 version，切换时 provider
 *  内部会 reset 重新加载）
 */
export function MapModeProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersionState] = useState<MapVersion>('4.0');
  const setVersion = useCallback((v: MapVersion) => setVersionState(v), []);

  return (
    <MapModeContext.Provider value={{ version, setVersion }}>
      <BMapProvider
        ak="mbKnRu5DQqM420lpbt7tbtm7WK6jiQln"
        version={version}
        fallback={<div style={{ padding: 24 }}>加载地图 API 中...</div>}
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
