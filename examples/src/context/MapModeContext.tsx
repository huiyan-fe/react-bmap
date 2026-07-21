import React, { createContext, useContext, useState, useCallback } from 'react';
import { BMapProvider } from 'react-bmap';
import type { BMapVersion } from 'react-bmap';

export type MapMode = '2d' | 'gl';

const MapModeContext = createContext<{
  mode: MapMode;
  setMode: (mode: MapMode) => void;
} | null>(null);

const MODE_TO_VERSION: Record<MapMode, BMapVersion> = {
  '2d': '4.0',
  gl: 'gl',
};

/**
 * 同时承担两件事：
 * 1. 暴露 2d/gl 模式切换
 * 2. 根据当前模式驱动 BMapProvider 的 version（@baidumap/jsapi-loader
 *    同一页面仅支持一个 version，切换模式时 provider 内部会 reset 重新加载）
 */
export function MapModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<MapMode>('2d');
  const setMode = useCallback((m: MapMode) => setModeState(m), []);

  return (
    <MapModeContext.Provider value={{ mode, setMode }}>
      <BMapProvider
        ak="mbKnRu5DQqM420lpbt7tbtm7WK6jiQln"
        version={MODE_TO_VERSION[mode]}
        fallback={<div style={{ padding: 24 }}>加载地图 API 中...</div>}
      >
        {children}
      </BMapProvider>
    </MapModeContext.Provider>
  );
}

export function useMapMode() {
  const ctx = useContext(MapModeContext);
  return ctx?.mode ?? '2d';
}

export function useSetMapMode() {
  const ctx = useContext(MapModeContext);
  return ctx?.setMode ?? (() => {});
}
